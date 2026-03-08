import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  DATA_MODE,
  defaultResponderProfile,
  RESPONDER_API_URL,
  RESPONDER_STORAGE_KEY,
  RESPONDER_STORAGE_VERSION,
} from '@/constants/responder';
import { createHttpResponderRepository } from '@/services/responder/http-repository';
import { createLocalResponderRepository } from '@/services/responder/local-repository';
import type { ResponderRepository } from '@/services/responder/repository';
import { readStorageItem, writeStorageItem } from '@/services/storage/safe-storage';
import type {
  ResponderContactMethod,
  ResponderProfile,
  ResponderProfileRecord,
  ResponderSchedule,
  ToggleConfirmation,
  TrainingStatus,
} from '@/types/responder';

type ProfileInformationInput = {
  displayName: string;
  alias: string;
};

type ServiceAreaInput = {
  label: string;
  radiusKm: number;
  approximateLatitude: number | null;
  approximateLongitude: number | null;
};

type AvailabilityInput = {
  status: 'available' | 'offline';
  schedule: ResponderSchedule;
  timezone: string;
};

type KitInput = {
  kitType: string;
  quantity: number;
};

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

function formatTimestamp(timezone: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(new Date());
  } catch {
    return new Date().toISOString();
  }
}

function coarsenCoordinate(value: number | null) {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return Math.round(value * 100) / 100;
}

function resolveRepository(): ResponderRepository {
  if (DATA_MODE === 'local') {
    return createLocalResponderRepository();
  }

  if (DATA_MODE === 'remote') {
    if (!RESPONDER_API_URL) {
      return {
        async saveProfile() {
          return 'pending';
        },
      };
    }
    return createHttpResponderRepository({ baseUrl: RESPONDER_API_URL });
  }

  if (RESPONDER_API_URL) {
    return createHttpResponderRepository({ baseUrl: RESPONDER_API_URL });
  }

  return createLocalResponderRepository();
}

function withUpdatedAt(profile: ResponderProfile): ResponderProfile {
  return {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
}

export function useResponderProfile() {
  const [profile, setProfile] = useState<ResponderProfile>({
    ...defaultResponderProfile,
    timezone: detectTimezone(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [confirmation, setConfirmation] = useState<ToggleConfirmation | null>(null);

  const repository = useMemo(() => resolveRepository(), []);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await readStorageItem(RESPONDER_STORAGE_KEY);
        if (!raw) {
          setProfile((current) => ({
            ...current,
            timezone: detectTimezone(),
          }));
          return;
        }

        const parsed = JSON.parse(raw) as ResponderProfileRecord;
        if (parsed.version !== RESPONDER_STORAGE_VERSION) {
          return;
        }

        setProfile({
          ...defaultResponderProfile,
          ...parsed.profile,
          timezone: parsed.profile.timezone || detectTimezone(),
        });
      } catch {
        setProfile((current) => ({ ...current, timezone: detectTimezone() }));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const persistProfile = useCallback(
    async (nextProfile: ResponderProfile) => {
      const syncResult = await repository.saveProfile(nextProfile);
      const profileWithSync: ResponderProfile = {
        ...nextProfile,
        syncState: syncResult,
      };

      const record: ResponderProfileRecord = {
        version: RESPONDER_STORAGE_VERSION,
        profile: profileWithSync,
      };

      await writeStorageItem(RESPONDER_STORAGE_KEY, JSON.stringify(record));
      setProfile(profileWithSync);
      return profileWithSync;
    },
    [repository]
  );

  const updateProfileInformation = useCallback(
    async ({ displayName, alias }: ProfileInformationInput) => {
      const next = withUpdatedAt({
        ...profile,
        displayName: displayName.trim() || profile.displayName,
        alias: alias.trim() || profile.alias,
      });
      await persistProfile(next);
    },
    [persistProfile, profile]
  );

  const updateServiceArea = useCallback(
    async ({ label, radiusKm, approximateLatitude, approximateLongitude }: ServiceAreaInput) => {
      const next = withUpdatedAt({
        ...profile,
        serviceArea: {
          label: label.trim() || profile.serviceArea.label,
          radiusKm: Number.isFinite(radiusKm) ? Math.max(0.5, radiusKm) : profile.serviceArea.radiusKm,
          approximateLatitude: coarsenCoordinate(approximateLatitude),
          approximateLongitude: coarsenCoordinate(approximateLongitude),
        },
      });
      await persistProfile(next);
    },
    [persistProfile, profile]
  );

  const updateAvailability = useCallback(
    async ({ status, schedule, timezone }: AvailabilityInput) => {
      const next = withUpdatedAt({
        ...profile,
        availabilityStatus: status,
        schedule,
        timezone: timezone || detectTimezone(),
      });
      await persistProfile(next);
    },
    [persistProfile, profile]
  );

  const updateKit = useCallback(
    async ({ kitType, quantity }: KitInput) => {
      const next = withUpdatedAt({
        ...profile,
        kit: {
          kitType: kitType.trim() || profile.kit.kitType,
          quantity: Math.max(0, Math.floor(quantity)),
        },
      });
      await persistProfile(next);
    },
    [persistProfile, profile]
  );

  const updateTraining = useCallback(
    async (training: TrainingStatus) => {
      const next = withUpdatedAt({
        ...profile,
        training,
      });
      await persistProfile(next);
    },
    [persistProfile, profile]
  );

  const updateContactMethod = useCallback(
    async (preferredContactMethod: ResponderContactMethod) => {
      const next = withUpdatedAt({
        ...profile,
        preferredContactMethod,
      });
      await persistProfile(next);
    },
    [persistProfile, profile]
  );

  const toggleResponderMode = useCallback(
    async (enabled: boolean) => {
      const next = withUpdatedAt({
        ...profile,
        responderModeEnabled: enabled,
        availabilityStatus: enabled ? 'available' : 'offline',
      });

      const persisted = await persistProfile(next);
      const actionWord = enabled ? 'enabled' : 'disabled';

      setConfirmation({
        text: `Responder mode ${actionWord}.`,
        timestampLabel: `${formatTimestamp(persisted.timezone)} (${persisted.timezone})`,
      });
    },
    [persistProfile, profile]
  );

  return {
    profile,
    isLoading,
    confirmation,
    clearConfirmation: () => setConfirmation(null),
    updateProfileInformation,
    updateServiceArea,
    updateAvailability,
    updateKit,
    updateTraining,
    updateContactMethod,
    toggleResponderMode,
  };
}
