import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { NaloxoneLocationList } from '@/components/naloxone/naloxone-location-list';
import { NaloxoneMapPanel } from '@/components/naloxone/naloxone-map-panel';
import type { AppLocale, NaloxoneRecord, SearchMode } from '@/types/naloxone';

type NaloxoneMapListViewProps = {
  filteredRecords: NaloxoneRecord[];
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
  filteredRecords,
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

  const searchPlaceholder =
    searchMode === 'city'
      ? 'Search city (e.g. Brampton)'
      : searchMode === 'postal'
        ? 'Search postal code (e.g. L6T 5P9)'
        : 'Search address, city, or postal code';

  return (
    <View style={styles.mapScreen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Find Naloxone</Text>
          <Text style={styles.headerSubtitle}>Nearby locations with availability</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.secondaryButton} onPress={onBack}>
            <Text style={styles.secondaryButtonLabel}>Back</Text>
          </Pressable>
          <View style={styles.localeRow}>
            <Pressable onPress={() => onLocaleChange('en')} style={[styles.localeButton, locale === 'en' && styles.localeButtonActive]}>
              <Text style={[styles.localeLabel, locale === 'en' && styles.localeLabelActive]}>EN</Text>
            </Pressable>
            <Pressable onPress={() => onLocaleChange('fr')} style={[styles.localeButton, locale === 'fr' && styles.localeButtonActive]}>
              <Text style={[styles.localeLabel, locale === 'fr' && styles.localeLabelActive]}>FR</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.searchCard}>
        <View style={styles.searchInputRow}>
          <Ionicons name="search" size={18} color="#6b7280" />
          <TextInput
            value={query}
            onChangeText={onQueryChange}
            autoCapitalize={searchMode === 'postal' ? 'characters' : 'words'}
            placeholder={searchPlaceholder}
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.searchModeRow}>
          <Pressable
            onPress={() => onSearchModeChange('nearby')}
            style={[styles.modeButton, searchMode === 'nearby' && styles.modeButtonActive]}>
            <Text style={[styles.modeButtonLabel, searchMode === 'nearby' && styles.modeButtonLabelActive]}>Nearby</Text>
          </Pressable>
          <Pressable onPress={() => onSearchModeChange('city')} style={[styles.modeButton, searchMode === 'city' && styles.modeButtonActive]}>
            <Text style={[styles.modeButtonLabel, searchMode === 'city' && styles.modeButtonLabelActive]}>City</Text>
          </Pressable>
          <Pressable onPress={() => onSearchModeChange('postal')} style={[styles.modeButton, searchMode === 'postal' && styles.modeButtonActive]}>
            <Text style={[styles.modeButtonLabel, searchMode === 'postal' && styles.modeButtonLabelActive]}>Postal</Text>
          </Pressable>
        </View>

        <Pressable style={styles.locationButton} onPress={() => onSearchModeChange('nearby')}>
          <Ionicons name="navigate" size={14} color="#ffffff" />
          <Text style={styles.locationButtonLabel}>Use My Location</Text>
        </Pressable>

        {searchMode === 'nearby' && locationDenied ? (
          <Text style={styles.warningText}>
            Location permission is denied. You can still search by city or postal code.
          </Text>
        ) : null}
      </View>

      <View style={styles.mapContainer}>
        <NaloxoneMapPanel
          mapCenter={mapCenter}
          markers={mapMarkers}
          locale={locale}
          selectedRecordId={selectedRecordId}
          onSelectRecord={onSelectRecord}
        />

        <View style={styles.legendCard}>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.legendDotActive]} />
            <Text style={styles.legendLabel}>Selected</Text>
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, styles.legendDotDefault]} />
            <Text style={styles.legendLabel}>Available</Text>
          </View>
          <Text style={styles.markerInfo}>{mapMarkers.length} shown</Text>
        </View>
      </View>

      <NaloxoneLocationList
        selectedRecordId={selectedRecordId}
        records={listRecords}
        locale={locale}
        onSelectRecord={onSelectRecord}
        totalMatches={filteredRecords.length}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapScreen: {
    flex: 1,
    backgroundColor: '#ffdfcc',
    paddingTop: 44,
    paddingHorizontal: 12,
  },
  header: {
    backgroundColor: '#f2a85a',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerTitle: {
    color: '#1f2937',
    fontSize: 21,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#374151',
    fontSize: 13,
    marginTop: 2,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f58e40',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  secondaryButtonLabel: {
    color: '#9a3412',
    fontWeight: '600',
  },
  localeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  localeButton: {
    borderWidth: 1,
    borderColor: '#f58e40',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff7ed',
  },
  localeButtonActive: {
    backgroundColor: '#fc6b0f',
    borderColor: '#fc6b0f',
  },
  localeLabel: {
    color: '#9a3412',
    fontWeight: '600',
    fontSize: 12,
  },
  localeLabelActive: {
    color: '#ffffff',
  },
  searchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#fed7aa',
    padding: 12,
    gap: 8,
    marginBottom: 10,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    minHeight: 44,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    color: '#111827',
  },
  searchModeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#fc6b0f',
    borderColor: '#fc6b0f',
  },
  modeButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9a3412',
  },
  modeButtonLabelActive: {
    color: '#ffffff',
  },
  locationButton: {
    backgroundColor: '#fc6b0f',
    borderRadius: 10,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  locationButtonLabel: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  warningText: {
    color: '#b45309',
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    marginBottom: 10,
  },
  legendCard: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 5,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  legendDotActive: {
    backgroundColor: '#fc6b0f',
  },
  legendDotDefault: {
    backgroundColor: '#f58e40',
  },
  legendLabel: {
    color: '#111827',
    fontSize: 12,
  },
  markerInfo: {
    color: '#4b5563',
    fontSize: 11,
  },
});
