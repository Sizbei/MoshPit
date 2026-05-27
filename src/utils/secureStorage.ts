/**
 * Secure key/value storage abstraction.
 *
 * Sensitive data (tokens, API keys) is stored via expo-secure-store
 * which uses the iOS Keychain / Android Keystore under the hood.
 *
 * Non-sensitive data falls back to AsyncStorage.
 *
 * On web (where SecureStore is unavailable) everything falls back
 * to AsyncStorage so the app still runs during development.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Typed key registry ──────────────────────────────────────────────

export const SecureKeys = {
  AUTH_TOKEN: 'moshpit_auth_token',
  REFRESH_TOKEN: 'moshpit_refresh_token',
  USER_ID: 'moshpit_user_id',
  PRO_STATUS: 'moshpit_pro_status',
} as const;

export type SecureKey = (typeof SecureKeys)[keyof typeof SecureKeys];

// ── Platform-aware SecureStore access ───────────────────────────────

/**
 * expo-secure-store is only available on native platforms.
 * We dynamically import it and fall back to AsyncStorage on web.
 */
async function getSecureStoreModule(): Promise<{
  setItemAsync: (key: string, value: string) => Promise<void>;
  getItemAsync: (key: string) => Promise<string | null>;
  deleteItemAsync: (key: string) => Promise<void>;
} | null> {
  if (Platform.OS === 'web') return null;

  try {
    const SecureStore = await import('expo-secure-store');
    return SecureStore;
  } catch {
    return null;
  }
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Store a value securely (encrypted on native, AsyncStorage on web).
 *
 * Values are always stored as strings. Callers should JSON.stringify
 * complex values before storing.
 */
export async function setSecure(key: SecureKey, value: string): Promise<void> {
  if (!key || !value) return;

  const store = await getSecureStoreModule();
  if (store) {
    await store.setItemAsync(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

/**
 * Retrieve a securely stored value.
 *
 * Returns `null` if the key does not exist.
 */
export async function getSecure(key: SecureKey): Promise<string | null> {
  if (!key) return null;

  const store = await getSecureStoreModule();
  if (store) {
    return store.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

/**
 * Delete a securely stored value.
 */
export async function removeSecure(key: SecureKey): Promise<void> {
  if (!key) return;

  const store = await getSecureStoreModule();
  if (store) {
    await store.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}

/**
 * Remove all MoshPit secure keys. Useful on sign-out.
 */
export async function clearAllSecure(): Promise<void> {
  const keys = Object.values(SecureKeys);
  await Promise.all(keys.map((key) => removeSecure(key)));
}
