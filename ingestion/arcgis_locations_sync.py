#!/usr/bin/env python3
"""ArcGIS feature layer ETL into Supabase Postgres."""

from __future__ import annotations

import hashlib
import json
import logging
import math
import os
import random
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Iterable, Sequence

import psycopg
import requests
from psycopg.rows import dict_row


LOGGER = logging.getLogger("arcgis_sync")
LOCK_NAME = "arcgis_locations_sync"


class SyncError(RuntimeError):
    """Raised when an unrecoverable sync error occurs."""


@dataclass(slots=True)
class Config:
    supabase_db_url: str
    arcgis_layer_url: str
    batch_size: int = 200
    request_timeout_seconds: int = 30
    max_retries: int = 5
    retry_backoff_base_seconds: float = 1.5
    force_sync: bool = False

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            supabase_db_url=_required_env("SUPABASE_DB_URL"),
            arcgis_layer_url=_required_env("ARCGIS_LAYER_URL").rstrip("/"),
            batch_size=int(os.getenv("BATCH_SIZE", "200")),
            request_timeout_seconds=int(os.getenv("REQUEST_TIMEOUT_SECONDS", "30")),
            max_retries=int(os.getenv("MAX_RETRIES", "5")),
            retry_backoff_base_seconds=float(
                os.getenv("RETRY_BACKOFF_BASE_SECONDS", "1.5")
            ),
            force_sync=os.getenv("FORCE_SYNC", "false").strip().lower()
            in {"1", "true", "yes", "on"},
        )


@dataclass(slots=True)
class TransformedFeature:
    source_record_id: str
    latitude: float
    longitude: float
    en_location_type: str | None
    en_location_name: str | None
    en_address: str | None
    en_city: str | None
    en_postal_code: str | None
    en_public_health_region: str | None
    en_telephone: str | None
    en_additional_information: str | None
    fr_location_type: str | None
    fr_location_name: str | None
    fr_address: str | None
    fr_city: str | None
    fr_postal_code: str | None
    fr_public_health_region: str | None
    fr_telephone: str | None
    fr_additional_information: str | None
    content_hash: str
    raw_json: dict[str, Any]

    def as_db_tuple(self) -> tuple[Any, ...]:
        return (
            self.source_record_id,
            self.latitude,
            self.longitude,
            self.en_location_type,
            self.en_location_name,
            self.en_address,
            self.en_city,
            self.en_postal_code,
            self.en_public_health_region,
            self.en_telephone,
            self.en_additional_information,
            self.fr_location_type,
            self.fr_location_name,
            self.fr_address,
            self.fr_city,
            self.fr_postal_code,
            self.fr_public_health_region,
            self.fr_telephone,
            self.fr_additional_information,
            self.content_hash,
            json.dumps(self.raw_json, ensure_ascii=True),
        )


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if value is None or not value.strip():
        raise SyncError(f"Missing required environment variable: {name}")
    return value.strip()


def chunks(values: Sequence[int], chunk_size: int) -> Iterable[list[int]]:
    for index in range(0, len(values), chunk_size):
        yield list(values[index : index + chunk_size])


def normalize_text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def extract_coordinates(feature: dict[str, Any]) -> tuple[float, float] | None:
    geometry = feature.get("geometry") or {}
    x = geometry.get("x")
    y = geometry.get("y")

    attrs = feature.get("attributes") or {}
    if x is None or y is None:
        x = _first_existing_numeric(
            attrs, ["Longitude", "LONGITUDE", "longitude", "lon", "LON"]
        )
        y = _first_existing_numeric(
            attrs, ["Latitude", "LATITUDE", "latitude", "lat", "LAT"]
        )

    if x is None or y is None:
        return None

    try:
        lon = float(x)
        lat = float(y)
    except (TypeError, ValueError):
        return None

    if not (math.isfinite(lat) and math.isfinite(lon)):
        return None
    if lat < -90 or lat > 90 or lon < -180 or lon > 180:
        return None
    return lat, lon


def _first_existing_numeric(values: dict[str, Any], keys: Sequence[str]) -> Any:
    for key in keys:
        if key in values and values[key] not in (None, ""):
            return values[key]
    return None


def transform_feature(feature: dict[str, Any]) -> TransformedFeature | None:
    attrs = feature.get("attributes") or {}
    source_record_id = normalize_text(attrs.get("FID2"))
    if source_record_id is None:
        return None

    coordinates = extract_coordinates(feature)
    if coordinates is None:
        return None

    latitude, longitude = coordinates
    en_payload = {
        "location_type": normalize_text(attrs.get("EN_LocationType")),
        "location_name": normalize_text(attrs.get("EN_LocationName")),
        "address": normalize_text(attrs.get("EN_Address")),
        "city": normalize_text(attrs.get("EN_City")),
        "postal_code": normalize_text(attrs.get("EN_PostalCode")),
        "public_health_region": normalize_text(attrs.get("EN_PublicHealthUnitRegion")),
        "telephone": normalize_text(attrs.get("EN_Telephone")),
        "additional_information": normalize_text(attrs.get("EN_AdditionalInformation")),
    }

    fr_payload = {
        "location_type": normalize_text(attrs.get("FR_LocationType")),
        "location_name": normalize_text(attrs.get("FR_LocationName")),
        "address": normalize_text(attrs.get("FR_Address")),
        "city": normalize_text(attrs.get("FR_City")),
        "postal_code": normalize_text(attrs.get("FR_PostalCode")),
        "public_health_region": normalize_text(attrs.get("FR_PublicHealthUnitRegion")),
        "telephone": normalize_text(attrs.get("FR_Telephone")),
        "additional_information": normalize_text(attrs.get("FR_AdditionalInformation")),
    }

    canonical = {
        "en": en_payload,
        "fr": fr_payload,
        "latitude": latitude,
        "longitude": longitude,
    }
    content_hash = hashlib.sha256(
        json.dumps(canonical, sort_keys=True, ensure_ascii=True).encode("utf-8")
    ).hexdigest()

    return TransformedFeature(
        source_record_id=source_record_id,
        latitude=latitude,
        longitude=longitude,
        en_location_type=en_payload["location_type"],
        en_location_name=en_payload["location_name"],
        en_address=en_payload["address"],
        en_city=en_payload["city"],
        en_postal_code=en_payload["postal_code"],
        en_public_health_region=en_payload["public_health_region"],
        en_telephone=en_payload["telephone"],
        en_additional_information=en_payload["additional_information"],
        fr_location_type=fr_payload["location_type"],
        fr_location_name=fr_payload["location_name"],
        fr_address=fr_payload["address"],
        fr_city=fr_payload["city"],
        fr_postal_code=fr_payload["postal_code"],
        fr_public_health_region=fr_payload["public_health_region"],
        fr_telephone=fr_payload["telephone"],
        fr_additional_information=fr_payload["additional_information"],
        content_hash=content_hash,
        raw_json=feature,
    )


def request_with_retry(
    session: requests.Session,
    url: str,
    payload: dict[str, Any],
    timeout_seconds: int,
    max_retries: int,
    backoff_base_seconds: float,
) -> dict[str, Any]:
    last_exception: Exception | None = None
    for attempt in range(1, max_retries + 1):
        try:
            response = session.post(url, data=payload, timeout=timeout_seconds)
            if response.status_code == 429 or response.status_code >= 500:
                raise requests.HTTPError(
                    f"Retryable status {response.status_code}", response=response
                )
            response.raise_for_status()
            data = response.json()
            if isinstance(data, dict) and data.get("error"):
                raise SyncError(f"ArcGIS error payload: {data['error']}")
            return data
        except SyncError:
            raise
        except (
            requests.Timeout,
            requests.ConnectionError,
            requests.HTTPError,
            ValueError,
        ) as error:
            last_exception = error
            if attempt >= max_retries:
                break
            delay = backoff_base_seconds * (2 ** (attempt - 1))
            jitter = random.uniform(0, backoff_base_seconds)
            sleep_for = delay + jitter
            LOGGER.warning(
                "Request attempt %s/%s failed (%s), retrying in %.2fs",
                attempt,
                max_retries,
                error,
                sleep_for,
            )
            time.sleep(sleep_for)

    raise SyncError(
        f"ArcGIS request failed after {max_retries} attempts: {last_exception}"
    )


def get_layer_metadata(session: requests.Session, config: Config) -> dict[str, Any]:
    response = session.get(
        f"{config.arcgis_layer_url}?f=pjson", timeout=config.request_timeout_seconds
    )
    response.raise_for_status()
    data = response.json()
    if isinstance(data, dict) and data.get("error"):
        raise SyncError(f"ArcGIS metadata error: {data['error']}")
    return data


def fetch_all_ids(session: requests.Session, config: Config) -> list[int]:
    payload = {
        "where": "1=1",
        "returnIdsOnly": "true",
        "f": "json",
    }
    data = request_with_retry(
        session=session,
        url=f"{config.arcgis_layer_url}/query",
        payload=payload,
        timeout_seconds=config.request_timeout_seconds,
        max_retries=config.max_retries,
        backoff_base_seconds=config.retry_backoff_base_seconds,
    )
    object_ids = data.get("objectIds") or []
    if not isinstance(object_ids, list):
        raise SyncError("ArcGIS IDs response is invalid (objectIds must be a list)")
    parsed_ids = sorted(int(v) for v in object_ids)
    return parsed_ids


def fetch_features_for_ids(
    session: requests.Session, config: Config, object_ids: list[int]
) -> list[dict[str, Any]]:
    payload = {
        "objectIds": ",".join(str(obj_id) for obj_id in object_ids),
        "outFields": "*",
        "returnGeometry": "true",
        "outSR": "4326",
        "f": "json",
    }
    data = request_with_retry(
        session=session,
        url=f"{config.arcgis_layer_url}/query",
        payload=payload,
        timeout_seconds=config.request_timeout_seconds,
        max_retries=config.max_retries,
        backoff_base_seconds=config.retry_backoff_base_seconds,
    )
    features = data.get("features") or []
    if not isinstance(features, list):
        raise SyncError("ArcGIS features response is invalid (features must be a list)")
    return features


def upsert_source(cursor: psycopg.Cursor[Any], source_url: str) -> int:
    cursor.execute(
        """
        INSERT INTO sources (name, source_type, source_url, updated_at)
        VALUES ('arcgis_locations', 'arcgis_feature_layer', %(source_url)s, now())
        ON CONFLICT (name)
        DO UPDATE SET
          source_type = EXCLUDED.source_type,
          source_url = EXCLUDED.source_url,
          updated_at = now()
        RETURNING id
        """,
        {"source_url": source_url},
    )
    row = cursor.fetchone()
    if row is None:
        raise SyncError("Could not upsert source record")
    return int(row[0])


def insert_sync_run(cursor: psycopg.Cursor[Any], source_id: int) -> int:
    cursor.execute(
        """
        INSERT INTO sync_runs (source_id, status, started_at)
        VALUES (%(source_id)s, 'running', now())
        RETURNING id
        """,
        {"source_id": source_id},
    )
    row = cursor.fetchone()
    if row is None:
        raise SyncError("Could not create sync run")
    return int(row[0])


def latest_successful_edit_ms(
    cursor: psycopg.Cursor[Any], source_id: int
) -> int | None:
    cursor.execute(
        """
        SELECT source_last_edit_ms
        FROM sync_runs
        WHERE source_id = %(source_id)s
          AND status = 'success'
        ORDER BY finished_at DESC NULLS LAST
        LIMIT 1
        """,
        {"source_id": source_id},
    )
    row = cursor.fetchone()
    if row is None:
        return None
    return row[0]


def mark_sync_success(
    cursor: psycopg.Cursor[Any],
    run_id: int,
    *,
    fetched_count: int,
    transformed_count: int,
    inserted_count: int,
    updated_count: int,
    deactivated_count: int,
    source_last_edit_ms: int | None,
) -> None:
    cursor.execute(
        """
        UPDATE sync_runs
        SET status = 'success',
            finished_at = now(),
            fetched_count = %(fetched_count)s,
            transformed_count = %(transformed_count)s,
            inserted_count = %(inserted_count)s,
            updated_count = %(updated_count)s,
            deactivated_count = %(deactivated_count)s,
            source_last_edit_ms = %(source_last_edit_ms)s,
            error_text = NULL
        WHERE id = %(run_id)s
        """,
        {
            "run_id": run_id,
            "fetched_count": fetched_count,
            "transformed_count": transformed_count,
            "inserted_count": inserted_count,
            "updated_count": updated_count,
            "deactivated_count": deactivated_count,
            "source_last_edit_ms": source_last_edit_ms,
        },
    )


def mark_sync_failed(cursor: psycopg.Cursor[Any], run_id: int, error_text: str) -> None:
    cursor.execute(
        """
        UPDATE sync_runs
        SET status = 'failed',
            finished_at = now(),
            error_text = %(error_text)s
        WHERE id = %(run_id)s
        """,
        {"run_id": run_id, "error_text": error_text[:4000]},
    )


def create_temp_table(cursor: psycopg.Cursor[Any]) -> None:
    cursor.execute(
        """
        CREATE TEMP TABLE tmp_arcgis_locations (
          source_record_id text PRIMARY KEY,
          latitude double precision NOT NULL,
          longitude double precision NOT NULL,
          en_location_type text,
          en_location_name text,
          en_address text,
          en_city text,
          en_postal_code text,
          en_public_health_region text,
          en_telephone text,
          en_additional_information text,
          fr_location_type text,
          fr_location_name text,
          fr_address text,
          fr_city text,
          fr_postal_code text,
          fr_public_health_region text,
          fr_telephone text,
          fr_additional_information text,
          content_hash text NOT NULL,
          raw_json jsonb NOT NULL
        ) ON COMMIT DROP
        """
    )


def insert_temp_rows(
    cursor: psycopg.Cursor[Any], rows: list[TransformedFeature]
) -> None:
    if not rows:
        return
    cursor.executemany(
        """
        INSERT INTO tmp_arcgis_locations (
          source_record_id,
          latitude,
          longitude,
          en_location_type,
          en_location_name,
          en_address,
          en_city,
          en_postal_code,
          en_public_health_region,
          en_telephone,
          en_additional_information,
          fr_location_type,
          fr_location_name,
          fr_address,
          fr_city,
          fr_postal_code,
          fr_public_health_region,
          fr_telephone,
          fr_additional_information,
          content_hash,
          raw_json
        ) VALUES (
          %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
          %s, %s, %s, %s, %s, %s, %s, %s,
          %s, %s::jsonb
        )
        """,
        [row.as_db_tuple() for row in rows],
    )


def count_inserted(cursor: psycopg.Cursor[Any], source_id: int) -> int:
    cursor.execute(
        """
        SELECT count(*)
        FROM tmp_arcgis_locations t
        LEFT JOIN kit_locations k
          ON k.source_id = %(source_id)s AND k.source_record_id = t.source_record_id
        WHERE k.id IS NULL
        """,
        {"source_id": source_id},
    )
    return int(cursor.fetchone()[0])


def count_updated(cursor: psycopg.Cursor[Any], source_id: int) -> int:
    cursor.execute(
        """
        SELECT count(*)
        FROM tmp_arcgis_locations t
        JOIN kit_locations k
          ON k.source_id = %(source_id)s AND k.source_record_id = t.source_record_id
        WHERE k.content_hash IS DISTINCT FROM t.content_hash
           OR k.is_active = false
        """,
        {"source_id": source_id},
    )
    return int(cursor.fetchone()[0])


def count_deactivated(cursor: psycopg.Cursor[Any], source_id: int) -> int:
    cursor.execute(
        """
        SELECT count(*)
        FROM kit_locations k
        WHERE k.source_id = %(source_id)s
          AND k.is_active = true
          AND NOT EXISTS (
            SELECT 1 FROM tmp_arcgis_locations t WHERE t.source_record_id = k.source_record_id
          )
        """,
        {"source_id": source_id},
    )
    return int(cursor.fetchone()[0])


def merge_locations(cursor: psycopg.Cursor[Any], source_id: int) -> None:
    cursor.execute(
        """
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
          END
        """,
        {"source_id": source_id},
    )


def merge_i18n(cursor: psycopg.Cursor[Any], source_id: int) -> None:
    cursor.execute(
        """
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
          additional_information = EXCLUDED.additional_information
        """,
        {"source_id": source_id},
    )


def deactivate_missing(cursor: psycopg.Cursor[Any], source_id: int) -> None:
    cursor.execute(
        """
        UPDATE kit_locations k
        SET is_active = false
        WHERE k.source_id = %(source_id)s
          AND k.is_active = true
          AND NOT EXISTS (
            SELECT 1 FROM tmp_arcgis_locations t WHERE t.source_record_id = k.source_record_id
          )
        """,
        {"source_id": source_id},
    )


def run_sync(config: Config) -> dict[str, Any]:
    result: dict[str, Any] = {
        "status": "unknown",
        "fetched_count": 0,
        "transformed_count": 0,
        "inserted_count": 0,
        "updated_count": 0,
        "deactivated_count": 0,
    }

    with psycopg.connect(config.supabase_db_url, row_factory=dict_row) as conn:
        conn.autocommit = False
        run_id: int | None = None
        lock_acquired = False
        source_id: int | None = None

        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT pg_try_advisory_lock(hashtext(%(lock_name)s))",
                    {"lock_name": LOCK_NAME},
                )
                lock_acquired = bool(cursor.fetchone()[0])
                if not lock_acquired:
                    LOGGER.info("Sync already running; exiting")
                    result["status"] = "already_running"
                    conn.rollback()
                    return result

                source_id = upsert_source(cursor, config.arcgis_layer_url)
                run_id = insert_sync_run(cursor, source_id)
                conn.commit()

            session = requests.Session()
            metadata = get_layer_metadata(session, config)
            source_last_edit_ms = (
                metadata.get("editingInfo", {}).get("dataLastEditDate")
                if isinstance(metadata, dict)
                else None
            )
            if source_last_edit_ms is not None:
                source_last_edit_ms = int(source_last_edit_ms)

            with conn.cursor() as cursor:
                previous_edit_ms = latest_successful_edit_ms(cursor, source_id)

            if (
                not config.force_sync
                and previous_edit_ms is not None
                and previous_edit_ms == source_last_edit_ms
            ):
                with conn.cursor() as cursor:
                    mark_sync_success(
                        cursor,
                        run_id,
                        fetched_count=0,
                        transformed_count=0,
                        inserted_count=0,
                        updated_count=0,
                        deactivated_count=0,
                        source_last_edit_ms=source_last_edit_ms,
                    )
                conn.commit()
                result["status"] = "success_noop"
                result["source_last_edit_ms"] = source_last_edit_ms
                return result

            object_ids = fetch_all_ids(session, config)
            transformed_rows: list[TransformedFeature] = []

            for batch_ids in chunks(object_ids, config.batch_size):
                features = fetch_features_for_ids(session, config, batch_ids)
                result["fetched_count"] += len(features)
                for feature in features:
                    transformed = transform_feature(feature)
                    if transformed is None:
                        continue
                    transformed_rows.append(transformed)

            result["transformed_count"] = len(transformed_rows)

            with conn.transaction():
                with conn.cursor() as cursor:
                    create_temp_table(cursor)
                    insert_temp_rows(cursor, transformed_rows)
                    inserted_count = count_inserted(cursor, source_id)
                    updated_count = count_updated(cursor, source_id)
                    deactivated_count = count_deactivated(cursor, source_id)
                    merge_locations(cursor, source_id)
                    merge_i18n(cursor, source_id)
                    deactivate_missing(cursor, source_id)

                result["inserted_count"] = inserted_count
                result["updated_count"] = updated_count
                result["deactivated_count"] = deactivated_count

            with conn.cursor() as cursor:
                mark_sync_success(
                    cursor,
                    run_id,
                    fetched_count=result["fetched_count"],
                    transformed_count=result["transformed_count"],
                    inserted_count=result["inserted_count"],
                    updated_count=result["updated_count"],
                    deactivated_count=result["deactivated_count"],
                    source_last_edit_ms=source_last_edit_ms,
                )
            conn.commit()
            result["status"] = "success"
            result["source_last_edit_ms"] = source_last_edit_ms
            return result
        except Exception as error:
            conn.rollback()
            if run_id is not None:
                with conn.cursor() as cursor:
                    mark_sync_failed(cursor, run_id, str(error))
                conn.commit()
            raise
        finally:
            if lock_acquired:
                try:
                    with conn.cursor() as cursor:
                        cursor.execute(
                            "SELECT pg_advisory_unlock(hashtext(%(lock_name)s))",
                            {"lock_name": LOCK_NAME},
                        )
                    conn.commit()
                except Exception:
                    conn.rollback()
                    LOGGER.exception("Failed to release advisory lock")


def main() -> int:
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )

    started_at = datetime.now(timezone.utc)
    try:
        config = Config.from_env()
        result = run_sync(config)
        duration_seconds = (datetime.now(timezone.utc) - started_at).total_seconds()
        LOGGER.info(
            "Sync finished in %.2fs: %s",
            duration_seconds,
            json.dumps(result, sort_keys=True),
        )
        return 0
    except Exception:
        LOGGER.exception("Sync failed")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
