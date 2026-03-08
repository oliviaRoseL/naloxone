import type { ResponderProfile } from '@/types/responder';
import type { ResponderRepository } from '@/services/responder/repository';

type CreateHttpResponderRepositoryParams = {
  baseUrl: string;
};

const RESPONDER_REQUEST_TIMEOUT_MS = 4000;
const shouldLogNetworkDebug =
  (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production';
const loggedBaseUrls = new Set<string>();

function buildPayload(profile: ResponderProfile) {
  return {
    display_name: profile.displayName,
    alias: profile.alias,
    responder_mode_enabled: profile.responderModeEnabled,
    service_area: {
      label: profile.serviceArea.label,
      radius_km: profile.serviceArea.radiusKm,
      approximate_latitude: profile.serviceArea.approximateLatitude,
      approximate_longitude: profile.serviceArea.approximateLongitude,
    },
    availability: {
      status: profile.availabilityStatus,
      schedule: profile.schedule,
      timezone: profile.timezone,
    },
    kit: {
      type: profile.kit.kitType,
      quantity: profile.kit.quantity,
    },
    training: profile.training,
    preferred_contact_method: profile.preferredContactMethod,
    updated_at: profile.updatedAt,
  };
}

export function createHttpResponderRepository({
  baseUrl,
}: CreateHttpResponderRepositoryParams): ResponderRepository {
  const sanitizedBaseUrl = baseUrl.replace(/\/$/, '');

  if (shouldLogNetworkDebug && !loggedBaseUrls.has(sanitizedBaseUrl)) {
    console.info(`[network] Responder base URL: ${sanitizedBaseUrl}`);
    loggedBaseUrls.add(sanitizedBaseUrl);
  }

  return {
    async saveProfile(profile) {
      const controller = new AbortController();
      let didTimeout = false;
      const timeoutId = setTimeout(() => {
        didTimeout = true;
        controller.abort();
      }, RESPONDER_REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(`${sanitizedBaseUrl}/responder/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(buildPayload(profile)),
          signal: controller.signal,
        });

        if (!response.ok) {
          return 'pending';
        }

        return 'synced';
      } catch (error) {
        if (shouldLogNetworkDebug) {
          const reason = didTimeout
            ? `timed out after ${RESPONDER_REQUEST_TIMEOUT_MS}ms`
            : error instanceof Error
              ? error.message
              : 'unknown network error';
          console.warn(`[network] Responder profile request failed for ${sanitizedBaseUrl}: ${reason}`);
        }

        return 'pending';
      } finally {
        clearTimeout(timeoutId);
      }
    },
  };
}
