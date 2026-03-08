import {
  ALERT_DEVICE_ID_STORAGE_KEY,
  ALERT_REQUEST_TIMEOUT_MS,
  ALERT_SERVER_URL,
} from '@/constants/alerting';
import { readStorageItem, writeStorageItem } from '@/services/storage/safe-storage';
import type {
  EmergencyAlertPayload,
  EmergencyAlertResponse,
  ResponderAlertMessage,
  ResponderPresencePayload,
} from '@/types/alerting';

const shouldLogNetworkDebug =
  (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production';
const loggedBaseUrls = new Set<string>();

function assertAlertServerConfigured() {
  if (!ALERT_SERVER_URL) {
    throw new Error('Alert server URL is not configured.');
  }

  return ALERT_SERVER_URL.replace(/\/$/, '');
}

function createDeviceId() {
  return `device-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export async function getOrCreateAlertDeviceId() {
  const existing = await readStorageItem(ALERT_DEVICE_ID_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const created = createDeviceId();
  await writeStorageItem(ALERT_DEVICE_ID_STORAGE_KEY, created);
  return created;
}

async function requestJson<T>(path: string, init: RequestInit) {
  const baseUrl = assertAlertServerConfigured();
  if (shouldLogNetworkDebug && !loggedBaseUrls.has(baseUrl)) {
    console.info(`[network] Alert base URL: ${baseUrl}`);
    loggedBaseUrls.add(baseUrl);
  }

  const controller = new AbortController();
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, ALERT_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (shouldLogNetworkDebug) {
      const reason = didTimeout
        ? `timed out after ${ALERT_REQUEST_TIMEOUT_MS}ms`
        : error instanceof Error
          ? error.message
          : 'unknown network error';
      console.warn(`[network] Alert request failed for ${baseUrl}${path}: ${reason}`);
    }

    if (didTimeout) {
      throw new Error(`Alert request timed out after ${ALERT_REQUEST_TIMEOUT_MS}ms.`);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendResponderPresence(payload: ResponderPresencePayload) {
  await requestJson('/responders/presence', {
    method: 'POST',
    body: JSON.stringify({
      device_id: payload.deviceId,
      display_name: payload.displayName,
      responder_mode_enabled: payload.responderModeEnabled,
      approximate_latitude: payload.approximateLatitude,
      approximate_longitude: payload.approximateLongitude,
      radius_km: payload.radiusKm,
      updated_at: payload.updatedAt,
    }),
  });
}

export async function sendEmergencyAlert(payload: EmergencyAlertPayload) {
  return requestJson<EmergencyAlertResponse>('/alerts', {
    method: 'POST',
    body: JSON.stringify({
      sender_device_id: payload.senderDeviceId,
      requester_latitude: payload.latitude,
      requester_longitude: payload.longitude,
      radius_km: payload.radiusKm ?? 5,
    }),
  });
}

export async function pullResponderAlerts(deviceId: string) {
  const response = await requestJson<{ alerts: ResponderAlertMessage[] }>(
    `/responders/${encodeURIComponent(deviceId)}/alerts`,
    {
      method: 'GET',
    }
  );

  return response.alerts;
}
