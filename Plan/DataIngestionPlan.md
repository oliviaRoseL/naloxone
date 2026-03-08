# Data Ingestion Plan - ArcGIS Feature Layer to Supabase

## Overview
This plan defines a deterministic, retry-safe ETL that pulls naloxone kit locations
from the Ontario ArcGIS Feature Layer and loads them into Supabase Postgres using
the provided schema. It uses direct Postgres connections for bulk upsert and PostGIS
geometry handling.

## Runtime Contract
- Language: Python 3.11+
- Libraries: requests, psycopg (binary), optional python-dotenv, tenacity
- Required environment variables:
  - SUPABASE_DB_URL
  - ARCGIS_LAYER_URL
  - BATCH_SIZE (default 200)
  - REQUEST_TIMEOUT_SECONDS (default 30)
  - MAX_RETRIES (default 5)
  - RETRY_BACKOFF_BASE_SECONDS (default 1.5)
  - FORCE_SYNC (default false)

## Source Endpoints
- Metadata: {ARCGIS_LAYER_URL}?f=pjson
- IDs: {ARCGIS_LAYER_URL}/query (POST)
  - where=1=1
  - returnIdsOnly=true
  - f=json
- Features: {ARCGIS_LAYER_URL}/query (POST)
  - objectIds=<csv>
  - outFields=*
  - returnGeometry=true
  - outSR=4326
  - f=json

## Execution Steps
1) Acquire single-run lock
- SELECT pg_try_advisory_lock(hashtext('arcgis_locations_sync'))
- If false, exit with non-error code and log "already running".

2) Upsert source row and create sync run
- Upsert sources row:
  - name = arcgis_locations
  - source_type = arcgis_feature_layer
  - source_url = ARCGIS_LAYER_URL
- Insert sync_runs row with status=running and keep run_id.

3) Delta gate
- GET metadata, read editingInfo.dataLastEditDate.
- If unchanged vs last successful run and FORCE_SYNC=false:
  - Mark sync_runs as success with zero counts, store source_last_edit_ms.
  - Release lock and exit.

4) Fetch all IDs
- POST returnIdsOnly query.
- Sort IDs ascending for deterministic order.
- Chunk IDs by BATCH_SIZE.

5) Fetch features per chunk
- POST query with objectIds.
- Retry on timeout, 429, or 5xx, exponential backoff with jitter.
- Fail fast on ArcGIS "error" payloads.

6) Transform and normalize
- source_record_id = string(FID2)
- Coordinates:
  - Primary: geometry.x/y
  - Fallback: attributes Longitude/Latitude
- Reject rows with missing/invalid coordinates.
- Map EN fields to canonical columns:
  - EN_LocationType -> location_type
  - EN_LocationName -> location_name
  - EN_Address -> address
  - EN_City -> city
  - EN_PostalCode -> postal_code
  - EN_PublicHealthUnitRegion -> public_health_region
  - EN_Telephone -> telephone
  - EN_AdditionalInformation -> additional_information
- Build i18n payloads for en and fr from EN_* and FR_* fields.
- content_hash = SHA-256 of normalized JSON (EN+FR+lat+lon).
- raw_json = full ArcGIS feature JSON.

7) Load using staging + merge (single transaction)
- Create temp table tmp_arcgis_locations.
- Bulk insert transformed rows into temp.
- Compute counts for inserted, updated, deactivated.
- Upsert into kit_locations:
  - Use ON CONFLICT (source_id, source_record_id).
  - Update last_changed_at only if content_hash differs or was inactive.
  - Always update last_seen_at.
- Upsert kit_location_i18n for both languages using location_id join.
- Deactivate missing rows:
  - is_active=false for locations not present in temp for this source.

8) Finalize run
- On success: update sync_runs with counts, status=success, finished_at, source_last_edit_ms.
- On failure: rollback transaction and update sync_runs with status=failed and error_text.
- Release advisory lock in finally.

## SQL Templates
Counts (inserted/updated):
```
-- inserted_count
SELECT count(*)
FROM tmp_arcgis_locations t
LEFT JOIN kit_locations k
  ON k.source_id = %(source_id)s AND k.source_record_id = t.source_record_id
WHERE k.id IS NULL;

-- updated_count
SELECT count(*)
FROM tmp_arcgis_locations t
JOIN kit_locations k
  ON k.source_id = %(source_id)s AND k.source_record_id = t.source_record_id
WHERE k.content_hash IS DISTINCT FROM t.content_hash
   OR k.is_active = false;
```

Upsert kit_locations:
```
INSERT INTO kit_locations (
  source_id, source_record_id, is_active,
  location_type, location_name, address, city, postal_code, public_health_region,
  telephone, additional_information, latitude, longitude, geom,
  content_hash, raw_json, first_seen_at, last_seen_at, last_changed_at
)
SELECT
  %(source_id)s, t.source_record_id, true,
  t.en_location_type, t.en_location_name, t.en_address, t.en_city, t.en_postal_code, t.en_public_health_region,
  t.en_telephone, t.en_additional_information, t.latitude, t.longitude,
  ST_SetSRID(ST_MakePoint(t.longitude, t.latitude), 4326)::geography,
  t.content_hash, t.raw_json, now(), now(), now()
FROM tmp_arcgis_locations t
ON CONFLICT (source_id, source_record_id)
DO UPDATE SET
  is_active = true,
  location_type = EXCLUDED.location_type,
  location_name = EXCLUDED.location_name,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  postal_code = EXCLUDED.postal_code,
  public_health_region = EXCLUDED.public_health_region,
  telephone = EXCLUDED.telephone,
  additional_information = EXCLUDED.additional_information,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  geom = EXCLUDED.geom,
  content_hash = EXCLUDED.content_hash,
  raw_json = EXCLUDED.raw_json,
  last_seen_at = now(),
  last_changed_at = CASE
    WHEN kit_locations.content_hash IS DISTINCT FROM EXCLUDED.content_hash
      OR kit_locations.is_active = false
    THEN now()
    ELSE kit_locations.last_changed_at
  END;
```

Upsert kit_location_i18n:
```
INSERT INTO kit_location_i18n (
  location_id, lang, location_name, location_type, address, city, postal_code,
  public_health_region, telephone, additional_information
)
SELECT
  k.id, 'en', t.en_location_name, t.en_location_type, t.en_address, t.en_city, t.en_postal_code,
  t.en_public_health_region, t.en_telephone, t.en_additional_information
FROM tmp_arcgis_locations t
JOIN kit_locations k
  ON k.source_id = %(source_id)s AND k.source_record_id = t.source_record_id
UNION ALL
SELECT
  k.id, 'fr', t.fr_location_name, t.fr_location_type, t.fr_address, t.fr_city, t.fr_postal_code,
  t.fr_public_health_region, t.fr_telephone, t.fr_additional_information
FROM tmp_arcgis_locations t
JOIN kit_locations k
  ON k.source_id = %(source_id)s AND k.source_record_id = t.source_record_id
ON CONFLICT (location_id, lang)
DO UPDATE SET
  location_name = EXCLUDED.location_name,
  location_type = EXCLUDED.location_type,
  address = EXCLUDED.address,
  city = EXCLUDED.city,
  postal_code = EXCLUDED.postal_code,
  public_health_region = EXCLUDED.public_health_region,
  telephone = EXCLUDED.telephone,
  additional_information = EXCLUDED.additional_information;
```

Deactivate missing:
```
UPDATE kit_locations k
SET is_active = false
WHERE k.source_id = %(source_id)s
  AND k.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM tmp_arcgis_locations t WHERE t.source_record_id = k.source_record_id
  );
```

## Acceptance Checks
- Active count in kit_locations equals ArcGIS count.
- No active rows with null geometry or invalid coordinates.
- Each active kit location has exactly two i18n rows (en, fr).
- Re-running with unchanged source produces zero insert/update/deactivate.

## Testing Plan (MCP + Supabase Skills)
This plan assumes Supabase MCP and Supabase skills are available for environment
validation, schema checks, and remediation. ETL writes still use direct Postgres.

### Gate 0: MCP Preflight (Blocking)
- Verify Supabase project connectivity and DB auth.
- Verify required tables/columns exist per schema.
- Verify PostGIS extension is installed.
- Verify unique constraint on (source_id, source_record_id).
- Verify no pending migration drift (apply via skills if needed).

### Gate 1: Source Contract Checks
- Metadata endpoint returns editingInfo.dataLastEditDate.
- returnIdsOnly returns non-empty list.
- Feature payload includes FID2, EN/FR fields, and geometry.

### Gate 2: ETL Behavior Tests
- Lock enforcement (second run blocked).
- Full force sync (end-to-end load succeeds).
- Delta gate (unchanged source yields zero mutations).
- Retry/backoff under transient 429/5xx (via fault proxy if available).
- Failpoint rollback (no partial writes on forced failure).

### Gate 3: Data Integrity Tests
- Active count equals ArcGIS count.
- No active row has invalid coordinates or null geom.
- Exactly two i18n rows per active location (en, fr).
- No duplicate (source_id, source_record_id).
- Deactivate/reactivate behavior validated with fixtures.

### Gate 4: Query Readiness
- Nearest-location query returns ordered results by distance.
- Required indexes exist and query plan uses gist geom index.

### Gate 5: Operational Reliability
- sync_runs rows always finalize (finished_at set).
- Failed runs include actionable error_text.
- Stale running runs auto-closed by policy.

### Remediation Strategy (Skills-First)
- Schema drift: apply migrations via Supabase skill, then re-run failing gate.
- Missing PostGIS/constraints/indexes: repair via skills, re-run.
- Count mismatch: reconcile active set + force sync.
- Missing i18n: rebuild from raw_json, re-run integrity checks.
- Invalid geom: backfill from lat/lon, quarantine invalid coords, re-run.

### Evidence Artifacts
- Latest sync_runs snapshot.
- Assertion outputs per gate.
- Remediation actions taken and outcomes.
- Final test suite summary in JSON.

## Operational Notes
- Schedule daily (or every 6-12 hours).
- Alert on two consecutive failed runs.
- Keep raw_json for audit and future schema evolution.
