import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActiveResponderCard } from '@/components/responder/active-responder-card';
import { ProfileInformationCard } from '@/components/responder/profile-information-card';
import { ServiceAreaCard } from '@/components/responder/service-area-card';
import { useResponderProfile } from '@/hooks/use-responder-profile';

function formatStatusLine(status: 'available' | 'offline') {
  return status === 'available' ? 'Available now' : 'Offline now';
}

async function getBestAvailablePosition() {
  const lastKnown = await Location.getLastKnownPositionAsync();
  if (lastKnown) {
    return lastKnown;
  }

  return Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const {
    profile,
    isLoading,
    confirmation,
    clearConfirmation,
    updateProfileInformation,
    updateServiceArea,
    updateAvailability,
    updateKit,
    updateTraining,
    updateContactMethod,
    toggleResponderMode,
  } = useResponderProfile();

  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [weekdayStart, setWeekdayStart] = useState(profile.schedule.weekdayStart);
  const [weekdayEnd, setWeekdayEnd] = useState(profile.schedule.weekdayEnd);
  const [weekendStart, setWeekendStart] = useState(profile.schedule.weekendStart);
  const [weekendEnd, setWeekendEnd] = useState(profile.schedule.weekendEnd);
  const [timezoneInput, setTimezoneInput] = useState(profile.timezone);

  useEffect(() => {
    setWeekdayStart(profile.schedule.weekdayStart);
    setWeekdayEnd(profile.schedule.weekdayEnd);
    setWeekendStart(profile.schedule.weekendStart);
    setWeekendEnd(profile.schedule.weekendEnd);
    setTimezoneInput(profile.timezone);
  }, [profile.schedule, profile.timezone]);

  useEffect(() => {
    if (!confirmation) {
      return;
    }
    const timeoutId = setTimeout(() => clearConfirmation(), 4500);
    return () => clearTimeout(timeoutId);
  }, [clearConfirmation, confirmation]);

  useEffect(() => {
    if (
      profile.serviceArea.approximateLatitude != null &&
      profile.serviceArea.approximateLongitude != null
    ) {
      return;
    }

    let cancelled = false;

    const bootstrapLocation = async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        return;
      }

      const position = await getBestAvailablePosition();
      if (cancelled || !position) {
        return;
      }

      await updateServiceArea({
        label: profile.serviceArea.label,
        radiusKm: profile.serviceArea.radiusKm,
        approximateLatitude: position.coords.latitude,
        approximateLongitude: position.coords.longitude,
      });
    };

    void bootstrapLocation();

    return () => {
      cancelled = true;
    };
  }, [
    profile.serviceArea.approximateLatitude,
    profile.serviceArea.approximateLongitude,
    profile.serviceArea.label,
    profile.serviceArea.radiusKm,
    updateServiceArea,
  ]);

  const onUseCurrentApproximateLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== 'granted') {
      return;
    }

    const current = await getBestAvailablePosition();
    await updateServiceArea({
      label: profile.serviceArea.label,
      radiusKm: profile.serviceArea.radiusKm,
      approximateLatitude: current.coords.latitude,
      approximateLongitude: current.coords.longitude,
    });
  };

  const onSaveAvailability = async () => {
    await updateAvailability({
      status: profile.availabilityStatus,
      schedule: {
        weekdayStart,
        weekdayEnd,
        weekendStart,
        weekendEnd,
      },
      timezone: timezoneInput.trim() || profile.timezone,
    });
    setIsEditingAvailability(false);
  };

  const scheduleLine = useMemo(
    () =>
      `Mon-Fri ${profile.schedule.weekdayStart}-${profile.schedule.weekdayEnd} | Sat-Sun ${profile.schedule.weekendStart}-${profile.schedule.weekendEnd}`,
    [profile.schedule]
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top + 24 }]}> 
        <ActivityIndicator size="large" color="#D96F2D" />
        <Text style={styles.loadingText}>Loading responder profile...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}> 
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Responder Profile</Text>
        <Text style={styles.headerSubtitle}>Help others in your community</Text>
      </View>

      {confirmation ? (
        <View style={styles.confirmationBanner}>
          <Text style={styles.confirmationTitle}>{confirmation.text}</Text>
          <Text style={styles.confirmationMeta}>{confirmation.timestampLabel}</Text>
        </View>
      ) : null}

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(
              tabBarHeight + (Platform.OS === 'android' ? 30 : 18),
              Platform.OS === 'android' ? 58 : 38
            ),
          },
        ]}>
        <ActiveResponderCard
          profile={profile}
          onToggle={(enabled) => {
            void toggleResponderMode(enabled);
          }}
          onEditAvailability={() => setIsEditingAvailability((value) => !value)}
        />

        {isEditingAvailability ? (
          <View style={styles.availabilityEditorCard}>
            <Text style={styles.availabilityTitle}>Availability schedule</Text>
            <Text style={styles.availabilityStatus}>{formatStatusLine(profile.availabilityStatus)}</Text>
            <Text style={styles.availabilitySummary}>{scheduleLine}</Text>

            <Text style={styles.editorLabel}>Weekday start (24h)</Text>
            <TextInput value={weekdayStart} onChangeText={setWeekdayStart} style={styles.editorInput} />
            <Text style={styles.editorLabel}>Weekday end (24h)</Text>
            <TextInput value={weekdayEnd} onChangeText={setWeekdayEnd} style={styles.editorInput} />

            <Text style={styles.editorLabel}>Weekend start (24h)</Text>
            <TextInput value={weekendStart} onChangeText={setWeekendStart} style={styles.editorInput} />
            <Text style={styles.editorLabel}>Weekend end (24h)</Text>
            <TextInput value={weekendEnd} onChangeText={setWeekendEnd} style={styles.editorInput} />

            <Text style={styles.editorLabel}>Timezone (IANA)</Text>
            <TextInput value={timezoneInput} onChangeText={setTimezoneInput} style={styles.editorInput} />

            <View style={styles.availabilityActions}>
              <Pressable style={styles.secondaryButton} onPress={() => setIsEditingAvailability(false)}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={() => void onSaveAvailability()}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <ProfileInformationCard
          profile={profile}
          onSaveProfile={updateProfileInformation}
          onSaveKit={updateKit}
          onSaveTraining={updateTraining}
          onSaveContactMethod={updateContactMethod}
        />

        <ServiceAreaCard
          profile={profile}
          onSaveServiceArea={updateServiceArea}
          onUseCurrentApproximateLocation={onUseCurrentApproximateLocation}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EDE1D2',
  },
  header: {
    backgroundColor: '#DB7636',
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 38 / 2,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#FFF5ED',
    fontSize: 32 / 2,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 14,
  },
  confirmationBanner: {
    marginHorizontal: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#95C9A0',
    borderRadius: 12,
    backgroundColor: '#ECF8EF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  confirmationTitle: {
    color: '#1F6A33',
    fontSize: 13,
    fontWeight: '700',
  },
  confirmationMeta: {
    color: '#285A37',
    fontSize: 12,
    fontWeight: '500',
  },
  availabilityEditorCard: {
    borderWidth: 1,
    borderColor: '#DBE1E8',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 8,
  },
  availabilityTitle: {
    color: '#0F1A34',
    fontSize: 16,
    fontWeight: '700',
  },
  availabilityStatus: {
    color: '#3B4A63',
    fontSize: 12,
    fontWeight: '600',
  },
  availabilitySummary: {
    color: '#526079',
    fontSize: 12,
    marginBottom: 2,
  },
  editorLabel: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  editorInput: {
    borderWidth: 1,
    borderColor: '#D3D9E2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  availabilityActions: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#C4CBD6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#D86E2C',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EDE1D2',
  },
  loadingText: {
    color: '#3B4A63',
    fontSize: 14,
  },
});
