export type LocaleBlock = {
  location_type: string;
  location_name: string;
  address: string;
  city: string;
  postal_code: string;
  public_health_region: string;
  telephone: string;
  additional_information: string | null;
};

export type NaloxoneRecord = {
  source_record_id: string;
  latitude: number;
  longitude: number;
  en: LocaleBlock;
  fr: LocaleBlock;
  content_hash: string;
};

export type NaloxoneDataset = {
  generated_at: string;
  source_last_edit_ms: number;
  source: string;
  source_url: string;
  records: NaloxoneRecord[];
};

export type SearchMode = 'nearby' | 'city' | 'postal';
export type AppLocale = 'en' | 'fr';
