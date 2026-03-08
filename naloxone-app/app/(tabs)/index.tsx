import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { NaloxoneMapListView } from '@/components/naloxone/naloxone-map-list-view';
import { useNaloxoneSearch } from '@/hooks/use-naloxone-search';
import type { AppLocale, NaloxoneDataset } from '@/types/naloxone';

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

export default function MapScreen() {
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

  return (
    <NaloxoneMapListView
      filteredRecords={filteredRecords}
      selectedRecordId={selectedRecordId}
      mapCenter={mapCenter}
      locale={locale}
      searchMode={searchMode}
      query={query}
      locationDenied={locationDenied}
      markerLimit={MARKER_LIMIT}
      listLimit={LIST_LIMIT}
      onLocaleChange={setLocale}
      onSearchModeChange={setSearchMode}
      onQueryChange={setQuery}
      onSelectRecord={selectRecord}
    />
  );
}

