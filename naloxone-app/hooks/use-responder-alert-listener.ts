import { useEffect, useRef } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';

import { ALERT_POLL_INTERVAL_MS, ALERT_SERVER_URL } from '@/constants/alerting';
import { RESPONDER_STORAGE_KEY, RESPONDER_STORAGE_VERSION } from '@/constants/responder';
import { getOrCreateAlertDeviceId, pullResponderAlerts, sendResponderPresence } from '@/services/alerting/client';
import { readStorageItem } from '@/services/storage/safe-storage';
import type { ResponderProfileRecord } from '@/types/responder';

function openMaps(latitude: number, longitude: number) {
  const destination = `${latitude},${longitude}`;
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${destination}`
      : `https://www.google.com/maps/search/?api=1&query=${destination}`;

  return Linking.openURL(url);
}

export function useResponderAlertListener() {
  const appStateRef = useRef(AppState.currentState);
  const shownAlertsRef = useRef(new Set<string>());

  useEffect(() => {
    if (!ALERT_SERVER_URL) {
      return;
    }

    const handleTick = async () => {
      if (appStateRef.current !== 'active') {
        return;
      }

      const rawProfile = await readStorageItem(RESPONDER_STORAGE_KEY);
      if (!rawProfile) {
        return;
      }

      let profileRecord: ResponderProfileRecord;

      try {
        profileRecord = JSON.parse(rawProfile) as ResponderProfileRecord;
      } catch {
        return;
      }

      if (profileRecord.version !== RESPONDER_STORAGE_VERSION) {
        return;
      }

      const profile = profileRecord.profile;
      if (
        !profile.responderModeEnabled ||
        profile.serviceArea.approximateLatitude == null ||
        profile.serviceArea.approximateLongitude == null
      ) {
        return;
      }

      const deviceId = await getOrCreateAlertDeviceId();

      await sendResponderPresence({
        deviceId,
        displayName: profile.displayName,
        responderModeEnabled: profile.responderModeEnabled,
        approximateLatitude: profile.serviceArea.approximateLatitude,
        approximateLongitude: profile.serviceArea.approximateLongitude,
        radiusKm: profile.serviceArea.radiusKm,
        updatedAt: profile.updatedAt,
      });

      const alerts = await pullResponderAlerts(deviceId);

      alerts.forEach((alertMessage) => {
        if (shownAlertsRef.current.has(alertMessage.alert_id)) {
          return;
        }

        shownAlertsRef.current.add(alertMessage.alert_id);

        Alert.alert(
          'Nearby overdose alert',
          `A nearby user requested naloxone help.\nLocation: ${alertMessage.requester_location.latitude.toFixed(5)}, ${alertMessage.requester_location.longitude.toFixed(5)}`,
          [
            {
              text: 'Open map',
              onPress: () => {
                void openMaps(
                  alertMessage.requester_location.latitude,
                  alertMessage.requester_location.longitude
                );
              },
            },
            { text: 'Dismiss', style: 'cancel' },
          ]
        );
      });
    };

    const stateSub = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
    });

    void handleTick().catch(() => undefined);
    const interval = setInterval(() => {
      void handleTick().catch(() => undefined);
    }, ALERT_POLL_INTERVAL_MS);

    return () => {
      stateSub.remove();
      clearInterval(interval);
    };
  }, []);
}
