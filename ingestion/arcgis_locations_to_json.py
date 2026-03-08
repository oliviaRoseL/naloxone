#!/usr/bin/env python3
"""Fetch ArcGIS naloxone locations and write normalized JSON output."""

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
from pathlib import Path
from typing import Any, Iterable, Sequence

import requests


LOGGER = logging.getLogger("arcgis_json_export")


class ExportError(RuntimeError):
    """Raised when an unrecoverable export error occurs."""


@dataclass(slots=True)
class Config:
    arcgis_layer_url: str
    output_json_path: str = "ingestion/output/arcgis_locations.json"
    batch_size: int = 200
    request_timeout_seconds: int = 30
    max_retries: int = 5
    retry_backoff_base_seconds: float = 1.5
    include_raw_json: bool = True

    @classmethod
    def from_env(cls) -> "Config":
        return cls(
            arcgis_layer_url=_required_env("ARCGIS_LAYER_URL").rstrip("/"),
            output_json_path=os.getenv(
                "OUTPUT_JSON_PATH", "ingestion/output/arcgis_locations.json"
            ),
            batch_size=int(os.getenv("BATCH_SIZE", "200")),
            request_timeout_seconds=int(os.getenv("REQUEST_TIMEOUT_SECONDS", "30")),
            max_retries=int(os.getenv("MAX_RETRIES", "5")),
            retry_backoff_base_seconds=float(
                os.getenv("RETRY_BACKOFF_BASE_SECONDS", "1.5")
            ),
            include_raw_json=os.getenv("INCLUDE_RAW_JSON", "true").strip().lower()
            in {"1", "true", "yes", "on"},
        )


def _required_env(name: str) -> str:
    value = os.getenv(name)
    if value is None or not value.strip():
        raise ExportError(f"Missing required environment variable: {name}")
    return value.strip()


def chunks(values: Sequence[int], chunk_size: int) -> Iterable[list[int]]:
    for index in range(0, len(values), chunk_size):
        yield list(values[index : index + chunk_size])


def normalize_text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _first_existing_numeric(values: dict[str, Any], keys: Sequence[str]) -> Any:
    for key in keys:
        if key in values and values[key] not in (None, ""):
            return values[key]
    return None


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
                raise ExportError(f"ArcGIS error payload: {data['error']}")
            return data
        except ExportError:
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

    raise ExportError(
        f"ArcGIS request failed after {max_retries} attempts: {last_exception}"
    )


def get_layer_metadata(session: requests.Session, config: Config) -> dict[str, Any]:
    response = session.get(
        f"{config.arcgis_layer_url}?f=pjson", timeout=config.request_timeout_seconds
    )
    response.raise_for_status()
    data = response.json()
    if isinstance(data, dict) and data.get("error"):
        raise ExportError(f"ArcGIS metadata error: {data['error']}")
    return data


def fetch_all_ids(session: requests.Session, config: Config) -> list[int]:
    data = request_with_retry(
        session=session,
        url=f"{config.arcgis_layer_url}/query",
        payload={"where": "1=1", "returnIdsOnly": "true", "f": "json"},
        timeout_seconds=config.request_timeout_seconds,
        max_retries=config.max_retries,
        backoff_base_seconds=config.retry_backoff_base_seconds,
    )
    object_ids = data.get("objectIds") or []
    if not isinstance(object_ids, list):
        raise ExportError("ArcGIS IDs response is invalid (objectIds must be a list)")
    return sorted(int(v) for v in object_ids)


def fetch_features_for_ids(
    session: requests.Session, config: Config, object_ids: list[int]
) -> list[dict[str, Any]]:
    data = request_with_retry(
        session=session,
        url=f"{config.arcgis_layer_url}/query",
        payload={
            "objectIds": ",".join(str(obj_id) for obj_id in object_ids),
            "outFields": "*",
            "returnGeometry": "true",
            "outSR": "4326",
            "f": "json",
        },
        timeout_seconds=config.request_timeout_seconds,
        max_retries=config.max_retries,
        backoff_base_seconds=config.retry_backoff_base_seconds,
    )
    features = data.get("features") or []
    if not isinstance(features, list):
        raise ExportError(
            "ArcGIS features response is invalid (features must be a list)"
        )
    return features


def transform_feature(
    feature: dict[str, Any], include_raw_json: bool
) -> dict[str, Any] | None:
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

    row = {
        "source_record_id": source_record_id,
        "latitude": latitude,
        "longitude": longitude,
        "en": en_payload,
        "fr": fr_payload,
        "content_hash": content_hash,
    }
    if include_raw_json:
        row["raw_json"] = feature
    return row


def run_export(config: Config) -> dict[str, Any]:
    session = requests.Session()
    metadata = get_layer_metadata(session, config)
    source_last_edit_ms = metadata.get("editingInfo", {}).get("dataLastEditDate")
    source_last_edit_ms = (
        int(source_last_edit_ms) if source_last_edit_ms is not None else None
    )

    object_ids = fetch_all_ids(session, config)
    output_rows: list[dict[str, Any]] = []
    rejected_count = 0
    fetched_count = 0

    for batch_ids in chunks(object_ids, config.batch_size):
        features = fetch_features_for_ids(session, config, batch_ids)
        fetched_count += len(features)
        for feature in features:
            transformed = transform_feature(feature, config.include_raw_json)
            if transformed is None:
                rejected_count += 1
                continue
            output_rows.append(transformed)

    output = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "arcgis_locations",
        "source_url": config.arcgis_layer_url,
        "source_last_edit_ms": source_last_edit_ms,
        "fetched_count": fetched_count,
        "transformed_count": len(output_rows),
        "rejected_count": rejected_count,
        "records": output_rows,
    }

    output_path = Path(config.output_json_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(
        json.dumps(output, indent=2, ensure_ascii=True), encoding="utf-8"
    )

    return {
        "status": "success",
        "output_json_path": str(output_path),
        "source_last_edit_ms": source_last_edit_ms,
        "fetched_count": fetched_count,
        "transformed_count": len(output_rows),
        "rejected_count": rejected_count,
    }


def main() -> int:
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO").upper(),
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )

    started_at = datetime.now(timezone.utc)
    try:
        config = Config.from_env()
        result = run_export(config)
        duration_seconds = (datetime.now(timezone.utc) - started_at).total_seconds()
        LOGGER.info(
            "JSON export finished in %.2fs: %s",
            duration_seconds,
            json.dumps(result, sort_keys=True),
        )
        return 0
    except Exception:
        LOGGER.exception("JSON export failed")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
