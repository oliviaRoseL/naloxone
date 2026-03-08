import type { ResponderProfile } from '@/types/responder';
import type { ResponderRepository } from '@/services/responder/repository';

type CreateHttpResponderRepositoryParams = {
  baseUrl: string;
};

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
  return {
    async saveProfile(profile) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/responder/profile`, {
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
      } catch {
        return 'pending';
      } finally {
        clearTimeout(timeoutId);
      }
    },
  };
}
