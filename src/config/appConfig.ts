import Constants from 'expo-constants';

const expoConfig = Constants.expoConfig;

/** Semantic version from app.json (e.g. "1.0.0") */
export const APP_VERSION: string = expoConfig?.version ?? '1.0.0';

/** Native build number, incremented by EAS on each production build */
export const BUILD_NUMBER: string =
  (expoConfig?.ios?.buildNumber ?? expoConfig?.android?.versionCode?.toString()) || '1';

/** Minimum OS versions the app targets */
export const MINIMUM_OS_VERSION = {
  ios: '16.0',
  android: 24, // Android 7.0 Nougat
} as const;

/** App Store and Play Store listing URLs (update after first submission) */
export const STORE_URLS = {
  appStore: 'https://apps.apple.com/app/moshpit/id0000000000',
  playStore: 'https://play.google.com/store/apps/details?id=com.moshpit.app',
} as const;

/** Contact and legal URLs */
export const SUPPORT_EMAIL = 'support@moshpit.app';
export const PRIVACY_POLICY_URL = 'https://moshpit.app/privacy';
export const TERMS_OF_SERVICE_URL = 'https://moshpit.app/terms';
export const FEEDBACK_URL = 'https://moshpit.app/feedback';

/** Deep-link scheme registered in app.json */
export const URL_SCHEME = 'moshpit';

/** Supabase environment keys (read from Expo env at build time) */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
