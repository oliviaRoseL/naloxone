from __future__ import annotations

import math
import time
import uuid
from threading import Lock
from typing import Dict, List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

PRESENCE_TTL_SECONDS = 90


class ResponderPresenceRequest(BaseModel):
    device_id: str = Field(min_length=3)
    display_name: str = Field(min_length=1)
    responder_mode_enabled: bool
    approximate_latitude: float
    approximate_longitude: float
    radius_km: float = Field(default=5, gt=0)
    updated_at: str


class EmergencyAlertRequest(BaseModel):
    sender_device_id: str = Field(min_length=3)
    requester_latitude: float
    requester_longitude: float
    radius_km: float = Field(default=5, gt=0)


class ResponderAlertMessage(BaseModel):
    alert_id: str
    created_at: str
    sender_device_id: str
    requester_location: dict
    distance_km: float


class ResponderPresenceState(BaseModel):
    device_id: str
    display_name: str
    responder_mode_enabled: bool
    approximate_latitude: float
    approximate_longitude: float
    radius_km: float
    updated_at: str
    last_seen_epoch: float


app = FastAPI(title="Naloxone Responder Alert API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_presence_by_device: Dict[str, ResponderPresenceState] = {}
_pending_alerts_by_device: Dict[str, List[ResponderAlertMessage]] = {}
_state_lock = Lock()


def _now_epoch() -> float:
    return time.time()


def _iso_now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius_km = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c


def _prune_stale_presence() -> None:
    now = _now_epoch()
    stale_ids = [
        device_id
        for device_id, presence in _presence_by_device.items()
        if (now - presence.last_seen_epoch) > PRESENCE_TTL_SECONDS
    ]

    for device_id in stale_ids:
        _presence_by_device.pop(device_id, None)


@app.get("/health")
def health() -> dict:
    with _state_lock:
        _prune_stale_presence()
        active_responders = len(_presence_by_device)

    return {
        "status": "ok",
        "active_responders": active_responders,
        "server_time": _iso_now(),
    }


@app.post("/responders/presence")
def upsert_presence(payload: ResponderPresenceRequest) -> dict:
    state = ResponderPresenceState(
        device_id=payload.device_id,
        display_name=payload.display_name,
        responder_mode_enabled=payload.responder_mode_enabled,
        approximate_latitude=payload.approximate_latitude,
        approximate_longitude=payload.approximate_longitude,
        radius_km=payload.radius_km,
        updated_at=payload.updated_at,
        last_seen_epoch=_now_epoch(),
    )

    with _state_lock:
        _presence_by_device[payload.device_id] = state
        _prune_stale_presence()

    return {"ok": True}


@app.post("/alerts")
def create_alert(payload: EmergencyAlertRequest) -> dict:
    alert_id = str(uuid.uuid4())
    created_at = _iso_now()
    matched_count = 0

    with _state_lock:
        _prune_stale_presence()

        for responder_device_id, presence in _presence_by_device.items():
            if not presence.responder_mode_enabled:
                continue

            if responder_device_id == payload.sender_device_id:
                continue

            distance_km = _haversine_km(
                payload.requester_latitude,
                payload.requester_longitude,
                presence.approximate_latitude,
                presence.approximate_longitude,
            )

            effective_radius_km = min(payload.radius_km, presence.radius_km)
            if distance_km > effective_radius_km:
                continue

            matched_count += 1
            _pending_alerts_by_device.setdefault(responder_device_id, []).append(
                ResponderAlertMessage(
                    alert_id=alert_id,
                    created_at=created_at,
                    sender_device_id=payload.sender_device_id,
                    requester_location={
                        "latitude": payload.requester_latitude,
                        "longitude": payload.requester_longitude,
                    },
                    distance_km=round(distance_km, 3),
                )
            )

    return {
        "alert_id": alert_id,
        "matched_count": matched_count,
        "created_at": created_at,
    }


@app.get("/responders/{device_id}/alerts")
def pull_alerts(device_id: str) -> dict:
    with _state_lock:
        alerts = _pending_alerts_by_device.pop(device_id, [])

    return {"alerts": [entry.model_dump() for entry in alerts]}
