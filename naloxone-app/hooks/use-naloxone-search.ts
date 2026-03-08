import { useEffect, useMemo, useState } from 'react';

import type { AppLocale, NaloxoneRecord, SearchMode } from '@/types/naloxone';

type LocationCoords = {
  latitude: number;
  longitude: number;
};

type UseNaloxoneSearchParams = {
  records: NaloxoneRecord[];
  initialLocale: AppLocale;
  initialSearchMode?: SearchMode;
  listLimit: number;
  location: LocationCoords | null;
};

type UseNaloxoneSearchResult = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  searchMode: SearchMode;
  setSearchMode: (mode: SearchMode) => void;
  query: string;
  setQuery: (query: string) => void;
  selectedRecordId: string | null;
  selectRecord: (recordId: string | null) => void;
  filteredRecords: NaloxoneRecord[];
  selectedRecord: NaloxoneRecord | null;
  mapCenter: NaloxoneRecord;
};

function normalizePostalCode(input: string) {
  return input.replace(/\s+/g, '').toUpperCase().trim();
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(fromLat: number, fromLon: number, toLat: number, toLon: number) {
  const radiusKm = 6371;
  const dLat = toRad(toLat - fromLat);
  const dLon = toRad(toLon - fromLon);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radiusKm * c;
}

export function useNaloxoneSearch({
  records,
  initialLocale,
  initialSearchMode = 'nearby',
  listLimit,
  location,
}: UseNaloxoneSearchParams): UseNaloxoneSearchResult {
  const [searchMode, setSearchMode] = useState<SearchMode>(initialSearchMode);
  const [query, setQuery] = useState('');
  const [locale, setLocale] = useState<AppLocale>(initialLocale);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  const filteredRecords = useMemo(() => {
    const trimmedQuery = query.trim();
    const normalizedPostal = normalizePostalCode(trimmedQuery);

    let matched = records.filter((record) => {
      if (searchMode === 'city') {
        if (!trimmedQuery) {
          return false;
        }

        const enCity = record.en.city.toLowerCase();
        const frCity = record.fr.city.toLowerCase();
        const lowered = trimmedQuery.toLowerCase();
        return enCity.includes(lowered) || frCity.includes(lowered);
      }

      if (searchMode === 'postal') {
        if (!normalizedPostal) {
          return false;
        }

        const enPostal = normalizePostalCode(record.en.postal_code);
        const frPostal = normalizePostalCode(record.fr.postal_code);
        return enPostal.includes(normalizedPostal) || frPostal.includes(normalizedPostal);
      }

      return true;
    });

    matched = matched
      .map((record) => {
        const distance =
          location == null
            ? null
            : distanceKm(location.latitude, location.longitude, record.latitude, record.longitude);
        return { record, distance };
      })
      .sort((a, b) => {
        if (a.distance != null && b.distance != null) {
          return a.distance - b.distance;
        }

        return a.record[locale].location_name.localeCompare(b.record[locale].location_name);
      })
      .map((item) => item.record);

    if (searchMode === 'nearby' && location == null) {
      return matched.slice(0, listLimit);
    }

    return matched;
  }, [listLimit, locale, location, query, records, searchMode]);

  useEffect(() => {
    if (filteredRecords.length === 0) {
      setSelectedRecordId(null);
      return;
    }

    setSelectedRecordId((current) => {
      if (current && filteredRecords.some((entry) => entry.source_record_id === current)) {
        return current;
      }
      return filteredRecords[0].source_record_id;
    });
  }, [filteredRecords]);

  const selectedRecord = filteredRecords.find((entry) => entry.source_record_id === selectedRecordId) ?? null;
  const mapCenter = selectedRecord ?? filteredRecords[0] ?? records[0];

  return {
    locale,
    setLocale,
    searchMode,
    setSearchMode,
    query,
    setQuery,
    selectedRecordId,
    selectRecord: setSelectedRecordId,
    filteredRecords,
    selectedRecord,
    mapCenter,
  };
}
