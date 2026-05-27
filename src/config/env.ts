/**
 * Centralized environment configuration.
 *
 * All environment variables are accessed through this module so we
 * get type safety, fail-fast validation, and a single place to audit
 * what config the app depends on.
 *
 * IMPORTANT: API keys are read from process.env at startup.
 * They must NEVER be logged, serialized to disk, or included
 * in error reports.
 */

import Constants from 'expo-constants';

// ── Helpers ─────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        'Check your .env file or app config.',
    );
  }
  return value.trim();
}

function optionalEnv(name: string, fallback: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) return fallback;
  return value.trim();
}

function validateHttpsUrl(url: string, name: string, isDev: boolean): void {
  if (!isDev && !url.startsWith('https://')) {
    throw new Error(
      `${name} must use HTTPS in production. Got: ${url.slice(0, 30)}...`,
    );
  }
}

// ── Config object ───────────────────────────────────────────────────

export interface AppConfig {
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
  readonly edmtrainApiKey: string;
  readonly bandsintownAppId: string;
  readonly isDev: boolean;
  readonly appVersion: string;
}

function buildConfig(): AppConfig {
  const isDev = __DEV__;
  const appVersion =
    Constants.expoConfig?.version ?? Constants.manifest?.version ?? '0.0.0';

  const supabaseUrl = requireEnv('EXPO_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = requireEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  const edmtrainApiKey = optionalEnv('EXPO_PUBLIC_EDMTRAIN_API_KEY', '');
  const bandsintownAppId = optionalEnv('EXPO_PUBLIC_BANDSINTOWN_APP_ID', '');

  // Validate URLs are HTTPS in production
  validateHttpsUrl(supabaseUrl, 'EXPO_PUBLIC_SUPABASE_URL', isDev);

  return Object.freeze({
    supabaseUrl,
    supabaseAnonKey,
    edmtrainApiKey,
    bandsintownAppId,
    isDev,
    appVersion,
  });
}

/**
 * The validated, frozen app configuration.
 *
 * Access this instead of reading process.env directly.
 */
export const config: AppConfig = buildConfig();
