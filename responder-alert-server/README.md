# Responder Alert Server (Tailscale)

This FastAPI service brokers emergency alerts between devices.

## 1) Install dependencies

```bash
pip install -r requirements.txt
```

## 2) Run server

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

Tailscale host used by the app:

`http://100.65.246.114:8000`

## 3) App environment

Set in Expo app environment:

`EXPO_PUBLIC_ALERT_SERVER_URL=http://100.65.246.114:8000`

## Endpoints

- `GET /health`
- `POST /responders/presence`
- `POST /alerts`
- `GET /responders/{device_id}/alerts`
