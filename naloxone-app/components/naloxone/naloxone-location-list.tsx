import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { AppLocale, NaloxoneDataset, NaloxoneRecord } from '@/types/naloxone';

type NaloxoneLocationListProps = {
  dataset: NaloxoneDataset;
  selectedRecord: NaloxoneRecord | null;
  selectedRecordId: string | null;
  records: NaloxoneRecord[];
  locale: AppLocale;
  onSelectRecord: (recordId: string) => void;
};

export function NaloxoneLocationList({
  dataset,
  selectedRecord,
  selectedRecordId,
  records,
  locale,
  onSelectRecord,
}: NaloxoneLocationListProps) {
  return (
    <>
      <View style={styles.metaCard}>
        <Text style={styles.metaText}>Generated: {new Date(dataset.generated_at).toLocaleString()}</Text>
        <Text style={styles.metaText}>Source last edit (ms): {dataset.source_last_edit_ms}</Text>
        {selectedRecord ? (
          <Text style={styles.metaText}>
            Selected source id/hash: {selectedRecord.source_record_id} / {selectedRecord.content_hash.slice(0, 12)}...
          </Text>
        ) : null}
      </View>

      <ScrollView style={styles.resultList} contentContainerStyle={styles.resultListContent}>
        {records.map((record) => {
          const details = record[locale];
          return (
            <Pressable
              key={record.source_record_id}
              onPress={() => onSelectRecord(record.source_record_id)}
              style={[
                styles.resultCard,
                record.source_record_id === selectedRecordId && styles.resultCardSelected,
              ]}>
              <Text style={styles.resultTitle}>{details.location_name}</Text>
              <Text style={styles.resultLine}>{details.location_type}</Text>
              <Text style={styles.resultLine}>{details.address}</Text>
              <Text style={styles.resultLine}>
                {details.city} {details.postal_code}
              </Text>
              <Text style={styles.resultLine}>{details.public_health_region}</Text>
              <Pressable onPress={() => Linking.openURL(`tel:${details.telephone.replace(/\s+/g, '')}`)}>
                <Text style={styles.phoneLink}>{details.telephone}</Text>
              </Pressable>
              {details.additional_information ? <Text style={styles.resultLine}>{details.additional_information}</Text> : null}
              <Text style={styles.hashLine}>Record: {record.source_record_id}</Text>
              <Text style={styles.hashLine}>Hash: {record.content_hash}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  metaCard: {
    marginTop: 8,
    marginHorizontal: 12,
    backgroundColor: '#dfeaf6',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  metaText: {
    color: '#173d63',
    fontSize: 12,
  },
  resultList: {
    maxHeight: 260,
    marginTop: 8,
  },
  resultListContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    gap: 8,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d2dfed',
    gap: 2,
  },
  resultCardSelected: {
    borderColor: '#1b4f8c',
    borderWidth: 2,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f2c4a',
  },
  resultLine: {
    fontSize: 13,
    color: '#1e4368',
  },
  phoneLink: {
    marginTop: 4,
    fontSize: 13,
    color: '#154d86',
    textDecorationLine: 'underline',
  },
  hashLine: {
    marginTop: 4,
    fontSize: 11,
    color: '#5b7691',
  },
});
