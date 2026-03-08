import React from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { AppLocale, NaloxoneRecord } from '@/types/naloxone';

type NaloxoneMapPanelProps = {
  mapCenter: NaloxoneRecord;
  markers: NaloxoneRecord[];
  locale: AppLocale;
  selectedRecordId: string | null;
  onSelectRecord: (recordId: string) => void;
};

export function NaloxoneMapPanel({
  mapCenter,
  markers,
  locale,
  selectedRecordId,
  onSelectRecord,
}: NaloxoneMapPanelProps) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: mapCenter.latitude,
        longitude: mapCenter.longitude,
        latitudeDelta: 0.35,
        longitudeDelta: 0.35,
      }}
      showsUserLocation
      showsMyLocationButton>
      {markers.map((record) => (
        <Marker
          key={record.source_record_id}
          coordinate={{ latitude: record.latitude, longitude: record.longitude }}
          title={record[locale].location_name}
          description={`${record[locale].address}, ${record[locale].city}`}
          pinColor={record.source_record_id === selectedRecordId ? '#d64545' : '#1b4f8c'}
          onPress={() => onSelectRecord(record.source_record_id)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    marginHorizontal: 12,
    borderRadius: 12,
  },
});
