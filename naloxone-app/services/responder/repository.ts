import type { ResponderProfile } from '@/types/responder';

export type ResponderRepository = {
  saveProfile: (profile: ResponderProfile) => Promise<'synced' | 'pending'>;
};
