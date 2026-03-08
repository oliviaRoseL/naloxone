import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

import { NaloxoneMapListView } from '@/components/naloxone/naloxone-map-list-view';
import { useNaloxoneSearch } from '@/hooks/use-naloxone-search';
import type { AppLocale, NaloxoneDataset } from '@/types/naloxone';

type Screen = 'home' | 'guide' | 'map';

const DATASET = require('../../assets/data/arcgis_locations.json') as NaloxoneDataset;
const MARKER_LIMIT = 250;
const LIST_LIMIT = 25;

function detectLocale(): AppLocale {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [initialLocale] = useState<AppLocale>(detectLocale());
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  const {
    locale,
    setLocale,
    searchMode,
    setSearchMode,
    query,
    setQuery,
    selectedRecordId,
    selectRecord,
    filteredRecords,
    selectedRecord,
    mapCenter,
  } = useNaloxoneSearch({
    records: DATASET.records,
    initialLocale,
    listLimit: LIST_LIMIT,
    location,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationDenied(true);
        return;
      }

      setLocationDenied(false);
      const current = await Location.getCurrentPositionAsync({});
      setLocation(current.coords);
    })();
  }, []);

  if (screen === 'guide') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Overdose Response Guide</Text>
        <Text style={styles.step}>1. Check if the person responds.</Text>
        <Text style={styles.step}>2. Call 911 immediately.</Text>
        <Text style={styles.step}>3. Give naloxone if available.</Text>
        <Text style={styles.step}>4. Start rescue breathing.</Text>
        <Text style={styles.step}>5. Stay until emergency help arrives.</Text>
        <Pressable style={styles.secondaryButton} onPress={() => setScreen('home')}>
          <Text style={styles.secondaryButtonLabel}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (screen === 'map') {
    return (
      <NaloxoneMapListView
        dataset={DATASET}
        filteredRecords={filteredRecords}
        selectedRecord={selectedRecord}
        selectedRecordId={selectedRecordId}
        mapCenter={mapCenter}
        locale={locale}
        searchMode={searchMode}
        query={query}
        locationDenied={locationDenied}
        markerLimit={MARKER_LIMIT}
        listLimit={LIST_LIMIT}
        onBack={() => setScreen('home')}
        onLocaleChange={setLocale}
        onSearchModeChange={setSearchMode}
        onQueryChange={setQuery}
        onSelectRecord={selectRecord}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Naloxone Assist</Text>
      <Pressable style={styles.primaryButton} onPress={() => setScreen('guide')}>
        <Text style={styles.primaryButtonLabel}>Emergency Guide</Text>
      </Pressable>
      <Pressable style={styles.primaryButton} onPress={() => setScreen('map')}>
        <Text style={styles.primaryButtonLabel}>Find Naloxone Kits</Text>
      </Pressable>
      <Pressable style={[styles.primaryButton, styles.dangerButton]} onPress={() => Linking.openURL('tel:911')}>
        <Text style={styles.primaryButtonLabel}>Call 911</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 12,
    backgroundColor: '#f4f8fb',
  },
  title: {
    fontSize: 30,
    marginBottom: 16,
    textAlign: 'center',
    color: '#0f2c4a',
    fontWeight: '700',
  },
  step: {
    fontSize: 18,
    marginBottom: 14,
    color: '#173d63',
  },
  primaryButton: {
    backgroundColor: '#1b4f8c',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e3ebf5',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  secondaryButtonLabel: {
    color: '#17406a',
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#b33131',
  },
});
