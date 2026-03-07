# ArcGIS Data Ingestion

Deterministic ETL for loading ArcGIS naloxone kit locations into Supabase Postgres.

## Runtime

- Python 3.11+
- Install deps:

```bash
pip install -r ingestion/requirements.txt
```

## Required environment variables

- `SUPABASE_DB_URL`
- `ARCGIS_LAYER_URL`

## Optional environment variables

- `BATCH_SIZE` (default `200`)
- `REQUEST_TIMEOUT_SECONDS` (default `30`)
- `MAX_RETRIES` (default `5`)
- `RETRY_BACKOFF_BASE_SECONDS` (default `1.5`)
- `FORCE_SYNC` (default `false`)
- `LOG_LEVEL` (default `INFO`)

## Run

```bash
python ingestion/arcgis_locations_sync.py
```

The script exits `0` on success (including no-op when already running) and `1` on failure.
