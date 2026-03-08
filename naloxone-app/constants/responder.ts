import type { ResponderContactMethod, ResponderDataMode, ResponderProfile } from '@/types/responder';
import { isDesktopWeb } from '@/constants/runtime';

export const RESPONDER_STORAGE_KEY = 'naloxone.responder.profile';
export const RESPONDER_STORAGE_VERSION = 1;

export const DATA_MODE: ResponderDataMode =
  process.env.EXPO_PUBLIC_RESPONDER_DATA_MODE === 'local' ||
  process.env.EXPO_PUBLIC_RESPONDER_DATA_MODE === 'remote' ||
  process.env.EXPO_PUBLIC_RESPONDER_DATA_MODE === 'auto'
    ? process.env.EXPO_PUBLIC_RESPONDER_DATA_MODE
    : 'local';

const explicitResponderApiUrl = process.env.EXPO_PUBLIC_RESPONDER_API_URL?.trim() ?? '';
const desktopWebResponderApiUrl = 'http://172.29.240.1:8000';

export const RESPONDER_API_URL = explicitResponderApiUrl || (isDesktopWeb() ? desktopWebResponderApiUrl : '');

export const CONTACT_METHOD_LABELS: Record<ResponderContactMethod, string> = {
  chat: 'In-app chat only',
  call: 'In-app call only',
  either: 'Chat or call',
};

export const KIT_TYPE_OPTIONS = ['Nasal spray', 'Injectable kit', 'Both'] as const;

export const defaultResponderProfile: ResponderProfile = {
  displayName: 'Alex K.',
  alias: 'AK',
  responderModeEnabled: true,
  serviceArea: {
    label: 'Downtown & Midtown Area',
    radiusKm: 3.2,
    approximateLatitude: null,
    approximateLongitude: null,
  },
  availabilityStatus: 'available',
  schedule: {
    weekdayStart: '08:00',
    weekdayEnd: '20:00',
    weekendStart: '10:00',
    weekendEnd: '18:00',
  },
  timezone: 'UTC',
  kit: {
    kitType: 'Nasal spray',
    quantity: 2,
  },
  training: {
    cprCertified: true,
    narcanTrained: true,
  },
  preferredContactMethod: 'either',
  trustIndicators: {
    isVerified: true,
    responses: 47,
    availabilityPercent: 98,
    rating: 4.9,
    memberForMonths: 6,
  },
  updatedAt: new Date().toISOString(),
  syncState: 'synced',
};
