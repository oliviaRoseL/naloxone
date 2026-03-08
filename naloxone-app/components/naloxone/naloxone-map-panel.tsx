import React, { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (userLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.12,
          longitudeDelta: 0.12,
        },
        350
      );
      return;
    }

    mapRef.current.animateToRegion(
      {
        latitude: mapCenter.latitude,
        longitude: mapCenter.longitude,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      },
      350
    );
  }, [mapCenter.latitude, mapCenter.longitude, userLocation]);

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
        latitude: userLocation?.latitude ?? mapCenter.latitude,
        longitude: userLocation?.longitude ?? mapCenter.longitude,
        latitudeDelta: userLocation ? 0.12 : 0.2,
        longitudeDelta: userLocation ? 0.12 : 0.2,
      }}
      showsUserLocation
      showsMyLocationButton>
      {markers.map((record) => (
        <Marker
          key={record.source_record_id}
          coordinate={{ latitude: record.latitude, longitude: record.longitude }}
          title={record[locale].location_name}
          description={`${record[locale].address}, ${record[locale].city}`}
          pinColor={record.source_record_id === selectedRecordId ? '#fc6b0f' : '#f58e40'}
          onPress={() => onSelectRecord(record.source_record_id)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});
