import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { NaloxoneLocationList } from '@/components/naloxone/naloxone-location-list';
import { NaloxoneMapPanel } from '@/components/naloxone/naloxone-map-panel';
import type { AppLocale, NaloxoneDataset, NaloxoneRecord, SearchMode } from '@/types/naloxone';

type NaloxoneMapListViewProps = {
  dataset: NaloxoneDataset;
  filteredRecords: NaloxoneRecord[];
  selectedRecord: NaloxoneRecord | null;
  selectedRecordId: string | null;
  mapCenter: NaloxoneRecord;
  locale: AppLocale;
  searchMode: SearchMode;
  query: string;
  locationDenied: boolean;
  markerLimit: number;
  listLimit: number;
  onBack: () => void;
  onLocaleChange: (locale: AppLocale) => void;
  onSearchModeChange: (mode: SearchMode) => void;
  onQueryChange: (query: string) => void;
  onSelectRecord: (recordId: string) => void;
};

export function NaloxoneMapListView({
  dataset,
  filteredRecords,
  selectedRecord,
  selectedRecordId,
  mapCenter,
  locale,
  searchMode,
  query,
  locationDenied,
  markerLimit,
  listLimit,
  onBack,
  onLocaleChange,
  onSearchModeChange,
  onQueryChange,
  onSelectRecord,
}: NaloxoneMapListViewProps) {
  const syncedVisibleRecords = useMemo(
    () => filteredRecords.slice(0, Math.max(markerLimit, listLimit)),
    [filteredRecords, listLimit, markerLimit]
  );

  const mapMarkers = syncedVisibleRecords.slice(0, markerLimit);
  const listRecords = syncedVisibleRecords.slice(0, listLimit);

  return (
    <View style={styles.mapScreen}>
      <View style={styles.topControls}>
        <Pressable style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonLabel}>Back</Text>
        </Pressable>
        <View style={styles.localeRow}>
          <Pressable onPress={() => onLocaleChange('en')} style={[styles.localeButton, locale === 'en' && styles.localeButtonActive]}>
            <Text style={styles.localeLabel}>EN</Text>
          </Pressable>
          <Pressable onPress={() => onLocaleChange('fr')} style={[styles.localeButton, locale === 'fr' && styles.localeButtonActive]}>
            <Text style={styles.localeLabel}>FR</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.searchModeRow}>
        <Pressable onPress={() => onSearchModeChange('nearby')} style={[styles.modeButton, searchMode === 'nearby' && styles.modeButtonActive]}>
          <Text style={styles.modeButtonLabel}>Current Location</Text>
        </Pressable>
        <Pressable onPress={() => onSearchModeChange('city')} style={[styles.modeButton, searchMode === 'city' && styles.modeButtonActive]}>
          <Text style={styles.modeButtonLabel}>City</Text>
        </Pressable>
        <Pressable onPress={() => onSearchModeChange('postal')} style={[styles.modeButton, searchMode === 'postal' && styles.modeButtonActive]}>
          <Text style={styles.modeButtonLabel}>Postal Code</Text>
        </Pressable>
      </View>

      {searchMode !== 'nearby' ? (
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          autoCapitalize={searchMode === 'postal' ? 'characters' : 'words'}
          placeholder={searchMode === 'city' ? 'Search city (e.g. Brampton)' : 'Search postal code (e.g. L6T 5P9)'}
          style={styles.searchInput}
        />
      ) : null}

      {searchMode === 'nearby' && locationDenied ? (
        <Text style={styles.infoText}>
          Location is denied. Nearby ranking is disabled, but you can still search by city or postal code.
        </Text>
      ) : null}

      <Text style={styles.infoText}>
        Showing {mapMarkers.length} map markers from {filteredRecords.length} matching records.
      </Text>

      <NaloxoneMapPanel
        mapCenter={mapCenter}
        markers={mapMarkers}
        locale={locale}
        selectedRecordId={selectedRecordId}
        onSelectRecord={onSelectRecord}
      />

      <NaloxoneLocationList
        dataset={dataset}
        selectedRecord={selectedRecord}
        selectedRecordId={selectedRecordId}
        records={listRecords}
        locale={locale}
        onSelectRecord={onSelectRecord}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapScreen: {
    flex: 1,
    backgroundColor: '#f4f8fb',
    paddingTop: 44,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
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
  localeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  localeButton: {
    borderWidth: 1,
    borderColor: '#99afc8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  localeButtonActive: {
    backgroundColor: '#1b4f8c',
    borderColor: '#1b4f8c',
  },
  localeLabel: {
    color: '#10263f',
    fontWeight: '600',
  },
  searchModeRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#e3ebf5',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#1b4f8c',
  },
  modeButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10263f',
  },
  searchInput: {
    marginHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#a5b8cd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  infoText: {
    marginHorizontal: 12,
    marginBottom: 8,
    color: '#274c73',
    fontSize: 12,
  },
});
