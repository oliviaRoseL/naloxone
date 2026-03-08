import type { ResponderRepository } from '@/services/responder/repository';

export function createLocalResponderRepository(): ResponderRepository {
  return {
    async saveProfile() {
      return 'synced';
    },
  };
}
