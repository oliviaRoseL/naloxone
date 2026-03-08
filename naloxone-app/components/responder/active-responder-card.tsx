import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { ResponderProfile, SyncState } from '@/types/responder';

type ActiveResponderCardProps = {
  profile: ResponderProfile;
  onToggle: (enabled: boolean) => void;
  onEditAvailability: () => void;
};

const syncLabels: Record<SyncState, string> = {
  synced: 'Synced',
  pending: 'Pending sync',
  failed: 'Sync failed',
};

export function ActiveResponderCard({ profile, onToggle, onEditAvailability }: ActiveResponderCardProps) {
  const isEnabled = profile.responderModeEnabled;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleWrap}>
          <View style={[styles.dot, isEnabled ? styles.dotActive : styles.dotMuted]} />
          <Text style={styles.title}>{isEnabled ? 'Active Responder' : 'Responder Offline'}</Text>
        </View>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: '#E4B78F', true: '#D98445' }}
          thumbColor="#ffffff"
        />
      </View>

      <Text style={styles.bodyText}>
        {isEnabled
          ? "You're currently visible to people who need naloxone in your area."
          : 'You are not visible in responder search right now.'}
      </Text>

      <View style={styles.scheduleRow}>
        <Text style={styles.scheduleLabel}>Weekdays {profile.schedule.weekdayStart}-{profile.schedule.weekdayEnd}</Text>
        <Text style={styles.scheduleLabel}>Weekends {profile.schedule.weekendStart}-{profile.schedule.weekendEnd}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerMeta}>{profile.timezone}</Text>
        <Text style={styles.footerMeta}>{syncLabels[profile.syncState]}</Text>
        <Pressable style={styles.editButton} onPress={onEditAvailability}>
          <Feather name="edit-2" size={14} color="#1E2A44" />
          <Text style={styles.editLabel}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#D98A48',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dotActive: {
    backgroundColor: '#88CC91',
  },
  dotMuted: {
    backgroundColor: '#B6BDC8',
  },
  title: {
    color: '#0F1A34',
    fontSize: 36 / 2,
    fontWeight: '700',
  },
  bodyText: {
    color: '#344054',
    fontSize: 28 / 2,
    lineHeight: 20,
  },
  scheduleRow: {
    gap: 4,
  },
  scheduleLabel: {
    color: '#253858',
    fontSize: 12,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerMeta: {
    color: '#51617D',
    fontSize: 11,
    fontWeight: '600',
  },
  editButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B9C0CB',
    backgroundColor: '#FFFFFF',
  },
  editLabel: {
    color: '#1E2A44',
    fontSize: 12,
    fontWeight: '600',
  },
});
