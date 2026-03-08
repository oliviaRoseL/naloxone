import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import type { AppLocale, NaloxoneRecord } from '@/types/naloxone';

type NaloxoneLocationListProps = {
  selectedRecordId: string | null;
  records: NaloxoneRecord[];
  locale: AppLocale;
  totalMatches: number;
  onSelectRecord: (recordId: string) => void;
};

export function NaloxoneLocationList({
  selectedRecordId,
  records,
  locale,
  totalMatches,
  onSelectRecord,
}: NaloxoneLocationListProps) {
  const openDirections = async (record: NaloxoneRecord) => {
    const details = record[locale];
    const destination = encodeURIComponent(`${details.address}, ${details.city}, ${details.postal_code}`);
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${destination}`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    await Linking.openURL(url);
  };

  const callLocation = async (phone: string) => {
    const normalized = phone.replace(/[^\d+]/g, '');
    await Linking.openURL(`tel:${normalized}`);
  };

  return (
    <View style={styles.sheetContainer}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>{totalMatches} locations nearby</Text>
        <Text style={styles.sheetMeta}>Showing top {records.length}</Text>
      </View>

      <BottomSheetScrollView style={styles.resultList} contentContainerStyle={styles.resultListContent}>
        {records.map((record) => {
          const details = record[locale];
          const isSelected = record.source_record_id === selectedRecordId;
          const subtitle = details.additional_information ?? details.location_type;

          return (
            <Pressable
              key={record.source_record_id}
              onPress={() => onSelectRecord(record.source_record_id)}
              style={[
                styles.resultCard,
                isSelected && styles.resultCardSelected,
              ]}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTitleWrap}>
                  <View style={[styles.statusDot, isSelected ? styles.statusDotSelected : styles.statusDotDefault]} />
                  <View style={styles.cardTitleTextWrap}>
                    <Text style={styles.resultTitle}>{details.location_name}</Text>
                    <Text style={styles.resultAddress}>{details.address}</Text>
                  </View>
                </View>
                <View style={styles.recordBadge}>
                  <Text style={styles.recordBadgeText}>#{record.source_record_id}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={14} color="#6b7280" />
                <Text style={styles.resultLine}>{subtitle}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text style={styles.resultLine}>
                  {details.city} {details.postal_code}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="business-outline" size={14} color="#6b7280" />
                <Text style={styles.resultLine}>{details.public_health_region}</Text>
              </View>

              <View style={styles.cardActions}>
                <Pressable style={styles.primaryAction} onPress={() => openDirections(record)}>
                  <Ionicons name="navigate" size={14} color="#ffffff" />
                  <Text style={styles.primaryActionLabel}>Directions</Text>
                </Pressable>
                <Pressable style={styles.secondaryAction} onPress={() => callLocation(details.telephone)}>
                  <Ionicons name="call-outline" size={14} color="#fc6b0f" />
                  <Text style={styles.secondaryActionLabel}>Call</Text>
                </Pressable>
              </View>
            </Pressable>
          );
        })}
      </BottomSheetScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  sheetHeader: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  sheetMeta: {
    color: '#ea580c',
    fontSize: 12,
    fontWeight: '600',
  },
  resultList: {
    flex: 1,
  },
  resultListContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 26,
    gap: 10,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    gap: 7,
  },
  resultCardSelected: {
    borderColor: '#fc6b0f',
    backgroundColor: '#fff7ed',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  statusDotSelected: {
    backgroundColor: '#fc6b0f',
  },
  statusDotDefault: {
    backgroundColor: '#f58e40',
  },
  cardTitleTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  recordBadge: {
    borderWidth: 1,
    borderColor: '#fdba74',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#fff7ed',
  },
  recordBadgeText: {
    color: '#b45309',
    fontSize: 11,
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  resultAddress: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultLine: {
    fontSize: 12,
    color: '#374151',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  primaryAction: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    backgroundColor: '#fc6b0f',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  primaryActionLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 36,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fc6b0f',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  secondaryActionLabel: {
    color: '#fc6b0f',
    fontSize: 12,
    fontWeight: '700',
  },
});
