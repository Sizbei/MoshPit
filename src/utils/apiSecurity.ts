/**
 * API request security utilities.
 *
 * Provides authentication header injection, response validation,
 * domain whitelisting, parameter sanitization, and user-friendly
 * error mapping. Stack traces are never exposed to the UI.
 */

import { getSecure, SecureKeys } from './secureStorage';

// ── Domain whitelist ────────────────────────────────────────────────

/**
 * Only these domains are allowed for outbound API requests.
 * Add new domains here when integrating additional services.
 */
const ALLOWED_DOMAINS: ReadonlySet<string> = new Set([
  'supabase.co',
  'supabase.com',
  'edmtrain.com',
  'rest.bandsintown.com',
  'www.bandsintown.com',
]);

/**
 * Check whether a URL points to a whitelisted API domain.
 *
 * Rejects non-HTTPS URLs and domains not in the allowlist.
 */
export function isValidApiUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);

    // Require HTTPS
    if (parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname.toLowerCase();

    // Check exact match or subdomain match (e.g. xyz.supabase.co)
    for (const domain of ALLOWED_DOMAINS) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// ── Auth headers ────────────────────────────────────────────────────

/**
 * Inject a Bearer token into request headers from secure storage.
 *
 * Returns a new headers object (does not mutate the input).
 */
export async function addAuthHeaders(
  headers: Record<string, string> = {},
): Promise<Record<string, string>> {
  const token = await getSecure(SecureKeys.AUTH_TOKEN);

  if (!token) return { ...headers };

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

// ── Response validation ─────────────────────────────────────────────

/**
 * Lightweight scan of response data for common injection patterns.
 *
 * This is a defense-in-depth measure; the primary protection is
 * server-side output encoding and CSP headers.
 */
export function validateResponse(data: unknown): boolean {
  if (data === null || data === undefined) return true;

  const serialized = typeof data === 'string' ? data : JSON.stringify(data);

  const dangerousPatterns: readonly RegExp[] = [
    /<script[\s>]/i,
    /javascript\s*:/i,
    /on\w+\s*=/i, // inline event handlers
    /data\s*:\s*text\/html/i,
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(serialized));
}

// ── Parameter sanitization ──────────────────────────────────────────

/**
 * Sanitize query parameters for safe inclusion in URLs.
 *
 * Returns a new object with all values URI-encoded.
 */
export function sanitizeApiParams(
  params: Readonly<Record<string, string | number | boolean>>,
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    const safeKey = encodeURIComponent(key);
    const safeValue = encodeURIComponent(String(value));
    sanitized[safeKey] = safeValue;
  }

  return sanitized;
}

// ── Error mapping ───────────────────────────────────────────────────

interface UserFriendlyError {
  readonly message: string;
  readonly isRetryable: boolean;
}

const HTTP_ERROR_MAP: Readonly<Record<number, UserFriendlyError>> = {
  400: { message: 'The request was invalid. Please check your input.', isRetryable: false },
  401: { message: 'Your session has expired. Please sign in again.', isRetryable: false },
  403: { message: 'You do not have permission to perform this action.', isRetryable: false },
  404: { message: 'The requested resource was not found.', isRetryable: false },
  408: { message: 'The request timed out. Please try again.', isRetryable: true },
  409: { message: 'A conflict occurred. Please refresh and try again.', isRetryable: true },
  413: { message: 'The file is too large. Please use a smaller file.', isRetryable: false },
  429: { message: 'Too many requests. Please wait a moment and try again.', isRetryable: true },
  500: { message: 'Something went wrong on our end. Please try again later.', isRetryable: true },
  502: { message: 'The service is temporarily unavailable. Please try again.', isRetryable: true },
  503: { message: 'The service is under maintenance. Please try again later.', isRetryable: true },
};

/**
 * Map an API error to a user-friendly message.
 *
 * Never exposes stack traces, internal error codes, or server
 * implementation details to the end user.
 */
export function handleApiError(error: unknown): UserFriendlyError {
  // Network error (no response)
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return {
      message: 'Unable to connect. Please check your internet connection.',
      isRetryable: true,
    };
  }

  // HTTP response error
  if (
    error !== null &&
    typeof error === 'object' &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number'
  ) {
    const status = (error as { status: number }).status;
    const mapped = HTTP_ERROR_MAP[status];
    if (mapped) return mapped;
  }

  // Fallback
  return {
    message: 'An unexpected error occurred. Please try again.',
    isRetryable: true,
  };
}
