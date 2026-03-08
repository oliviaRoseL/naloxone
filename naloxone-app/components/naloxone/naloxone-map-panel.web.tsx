import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AppLocale, NaloxoneRecord } from '@/types/naloxone';

type NaloxoneMapPanelProps = {
  mapCenter: NaloxoneRecord;
  userLocation: { latitude: number; longitude: number } | null;
  markers: NaloxoneRecord[];
  locale: AppLocale;
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
};

export function NaloxoneMapPanel({
  mapCenter,
  userLocation,
  markers,
  locale,
  selectedRecordId,
  onSelectRecord,
}: NaloxoneMapPanelProps) {
  const centerLat = userLocation?.latitude ?? mapCenter.latitude;
  const centerLon = userLocation?.longitude ?? mapCenter.longitude;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map preview (web)</Text>
      <Text style={styles.subtitle}>
        Center: {centerLat.toFixed(4)}, {centerLon.toFixed(4)}
      </Text>

      <ScrollView contentContainerStyle={styles.list}>
        {markers.slice(0, 20).map((record) => {
          const selected = record.source_record_id === selectedRecordId;

          return (
            <Pressable
              key={record.source_record_id}
              style={[styles.item, selected && styles.itemSelected]}
              onPress={() => onSelectRecord(record.source_record_id)}>
              <Text style={styles.itemTitle}>{record[locale].location_name}</Text>
              <Text style={styles.itemSubtitle}>{record[locale].address}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#4b5563',
  },
  list: {
    marginTop: 10,
    gap: 8,
    paddingBottom: 12,
  },
  item: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 10,
  },
  itemSelected: {
    borderColor: '#fc6b0f',
    backgroundColor: '#fff7ed',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  itemSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#6b7280',
  },
});
