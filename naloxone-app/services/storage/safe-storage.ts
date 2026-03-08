import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStorage = new Map<string, string>();

function getWebLocalStorage() {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export async function readStorageItem(key: string) {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    const webStorage = getWebLocalStorage();
    if (webStorage) {
      return webStorage.getItem(key);
    }
    return memoryStorage.get(key) ?? null;
  }
}

export async function writeStorageItem(key: string, value: string) {
  try {
    await AsyncStorage.setItem(key, value);
    return;
  } catch {
    const webStorage = getWebLocalStorage();
    if (webStorage) {
      webStorage.setItem(key, value);
      return;
    }
    memoryStorage.set(key, value);
  }
}
