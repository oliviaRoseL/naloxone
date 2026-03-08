export type ResponderContactMethod = 'chat' | 'call' | 'either';

export type ResponderDataMode = 'local' | 'remote' | 'auto';

export type TrainingStatus = {
  cprCertified: boolean;
  narcanTrained: boolean;
  notes?: string;
};

export type ResponderSchedule = {
  weekdayStart: string;
  weekdayEnd: string;
  weekendStart: string;
  weekendEnd: string;
};

export type ServiceArea = {
  label: string;
  radiusKm: number;
  approximateLatitude: number | null;
  approximateLongitude: number | null;
};

export type KitInventory = {
  kitType: string;
  quantity: number;
};

export type TrustIndicators = {
  isVerified: boolean;
  responses: number;
  availabilityPercent: number;
  rating: number;
  memberForMonths: number;
};

export type SyncState = 'synced' | 'pending' | 'failed';

export type ResponderProfile = {
  displayName: string;
  alias: string;
  responderModeEnabled: boolean;
  serviceArea: ServiceArea;
  availabilityStatus: 'available' | 'offline';
  schedule: ResponderSchedule;
  timezone: string;
  kit: KitInventory;
  training: TrainingStatus;
  preferredContactMethod: ResponderContactMethod;
  trustIndicators: TrustIndicators;
  updatedAt: string;
  syncState: SyncState;
};

export type ResponderProfileRecord = {
  version: number;
  profile: ResponderProfile;
};

export type ToggleConfirmation = {
  text: string;
  timestampLabel: string;
};
