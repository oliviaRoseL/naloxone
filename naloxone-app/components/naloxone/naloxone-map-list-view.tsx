import React, { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';

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
  onLocaleChange,
  onSearchModeChange,
  onQueryChange,
  onSelectRecord,
}: NaloxoneMapListViewProps) {
  const syncedVisibleRecords = useMemo(
    () => filteredRecords.slice(0, Math.max(markerLimit, listLimit)),
    [filteredRecords, listLimit, markerLimit]
  );

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['15%', '50%', '90%'], []);

  const mapMarkers = syncedVisibleRecords.slice(0, markerLimit);
  const listRecords = syncedVisibleRecords.slice(0, listLimit);

  const searchPlaceholder = 'Search address, city, or postal code';

  return (
    <View style={styles.mapScreen}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Find Naloxone</Text>
          <Text style={styles.headerSubtitle}>Nearby locations with availability</Text>
        </View>
        <View style={styles.headerActions}>
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
            onChangeText={(text) => {
              onQueryChange(text);
              onSearchModeChange(text.trim() === '' ? 'nearby' : 'city'); // Using 'city' as a general search mode to trigger the all-fields filter
            }}
            placeholder={searchPlaceholder}
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
          />
          <Pressable style={styles.locationIconBtn} onPress={() => { onQueryChange(''); onSearchModeChange('nearby'); }}>
            <Ionicons name="navigate" size={18} color="#fc6b0f" />
          </Pressable>
        </View>

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

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <NaloxoneLocationList
          selectedRecordId={selectedRecordId}
          records={listRecords}
          locale={locale}
          onSelectRecord={onSelectRecord}
          totalMatches={filteredRecords.length}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  mapScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 44,
  },
  header: {
    backgroundColor: '#f2a85a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#1f2937',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#374151',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f58e40',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  secondaryButtonLabel: {
    color: '#9a3412',
    fontWeight: '600',
    fontSize: 12,
  },
  localeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  localeButton: {
    borderWidth: 1,
    borderColor: '#f58e40',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#fff7ed',
  },
  localeButtonActive: {
    backgroundColor: '#fc6b0f',
    borderColor: '#fc6b0f',
  },
  localeLabel: {
    color: '#9a3412',
    fontWeight: '600',
    fontSize: 11,
  },
  localeLabelActive: {
    color: '#ffffff',
  },
  searchCard: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    paddingHorizontal: 10,
    minHeight: 40,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: '#111827',
    fontSize: 14,
  },
  locationIconBtn: {
    padding: 6,
    backgroundColor: '#fff7ed',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  warningText: {
    color: '#b45309',
    fontSize: 11,
    marginTop: 6,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  legendCard: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendDotActive: {
    backgroundColor: '#fc6b0f',
  },
  legendDotDefault: {
    backgroundColor: '#f58e40',
  },
  legendLabel: {
    color: '#111827',
    fontSize: 11,
  },
  markerInfo: {
    color: '#6b7280',
    fontSize: 10,
    marginTop: 2,
  },
  bottomSheetBackground: {
    backgroundColor: '#ffffff',
    borderTopWidth: 2,
    borderTopColor: '#f2a85a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetIndicator: {
    backgroundColor: '#d1d5db',
    width: 40,
  },
});
