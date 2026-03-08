import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TrustIndicators as TrustIndicatorData } from '@/types/responder';

type TrustIndicatorsProps = {
  trust: TrustIndicatorData;
};

export function TrustIndicators({ trust }: TrustIndicatorsProps) {
  return (
    <>
      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{trust.responses}</Text>
          <Text style={styles.metricLabel}>Responses</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{trust.availabilityPercent}%</Text>
          <Text style={styles.metricLabel}>Availability</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{trust.rating.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>Rating</Text>
        </View>
      </View>

      <View style={styles.chipsRow}>
        <View style={[styles.chip, styles.blueChip]}>
          <Text style={[styles.chipText, styles.blueChipText]}>CPR Certified</Text>
        </View>
        <View style={[styles.chip, styles.greenChip]}>
          <Text style={[styles.chipText, styles.greenChipText]}>Narcan Trained</Text>
        </View>
      </View>

      <View style={styles.chipsRow}>
        <View style={[styles.chip, styles.purpleChip]}>
          <Text style={[styles.chipText, styles.purpleChipText]}>{trust.memberForMonths}mo Member</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#E8D7C7',
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    color: '#D86E2C',
    fontSize: 18,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#1F2B45',
    fontSize: 14,
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  blueChip: {
    backgroundColor: '#E7F0FF',
    borderColor: '#8FB4FF',
  },
  blueChipText: {
    color: '#2C4C8F',
  },
  greenChip: {
    backgroundColor: '#E7F8EA',
    borderColor: '#8CCF98',
  },
  greenChipText: {
    color: '#246B34',
  },
  purpleChip: {
    backgroundColor: '#F3EBFF',
    borderColor: '#C5A7FF',
  },
  purpleChipText: {
    color: '#5A34A5',
  },
});
