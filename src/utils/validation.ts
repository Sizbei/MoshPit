/**
 * Input validation utilities for the MoshPit app.
 *
 * All user input must pass through these validators before
 * being sent to Supabase, rendered, or persisted.
 */

// ── Collage limits ──────────────────────────────────────────────────

export const MAX_PHOTOS_PER_COLLAGE = 20;
export const MAX_STICKERS_PER_COLLAGE = 50;
export const MAX_TEXT_OVERLAYS = 10;

// ── Result types ────────────────────────────────────────────────────

interface ValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

// ── Email ───────────────────────────────────────────────────────────

/**
 * RFC 5322 compliant email validation.
 *
 * Rejects obviously invalid addresses while accepting the vast
 * majority of real-world addresses. Length is capped at 254 chars
 * (the maximum length of an email address per RFC 5321).
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

// ── Password ────────────────────────────────────────────────────────

/**
 * Password requirements:
 *   - at least 8 characters
 *   - at least one uppercase letter
 *   - at least one digit
 *   - no more than 128 characters (prevent DoS via bcrypt)
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    return { valid: false, errors: ['Password is required'] };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { valid: errors.length === 0, errors };
}

// ── Username ────────────────────────────────────────────────────────

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  'admin',
  'administrator',
  'root',
  'system',
  'moshpit',
  'support',
  'help',
  'info',
  'moderator',
  'mod',
  'staff',
  'official',
  'api',
  'null',
  'undefined',
  'test',
]);

/**
 * Username rules:
 *   - 3-20 characters
 *   - alphanumeric and underscore only
 *   - not a reserved word
 */
export function validateUsername(username: string): ValidationResult {
  const errors: string[] = [];

  if (!username || typeof username !== 'string') {
    return { valid: false, errors: ['Username is required'] };
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    errors.push('Username must be at least 3 characters');
  }
  if (trimmed.length > 20) {
    errors.push('Username must be no more than 20 characters');
  }
  if (!USERNAME_REGEX.test(trimmed)) {
    errors.push('Username may only contain letters, numbers, and underscores');
  }
  if (RESERVED_USERNAMES.has(trimmed.toLowerCase())) {
    errors.push('This username is reserved');
  }

  return { valid: errors.length === 0, errors };
}

// ── Text sanitization ───────────────────────────────────────────────

const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;

/**
 * Strip HTML/script tags, trim whitespace, and enforce a max length.
 *
 * Default max length is 500 characters.
 */
export function sanitizeText(text: string, maxLength = 500): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(HTML_TAG_REGEX, '')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/<\/?[^>]+(>|$)/g, '') // second pass after entity decode
    .trim()
    .slice(0, maxLength);
}

// ── Filename sanitization ───────────────────────────────────────────

/**
 * Remove path traversal sequences, special characters, and enforce
 * a safe filename for storage operations.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'untitled';

  return filename
    .replace(/\.\./g, '')           // path traversal
    .replace(/[/\\]/g, '')          // directory separators
    .replace(/[<>:"|?*\x00-\x1F]/g, '') // OS-reserved chars + control chars
    .replace(/^\.+/, '')            // leading dots (hidden files)
    .trim()
    .slice(0, 255)                  // max filename length
    || 'untitled';
}

// ── Image URI ───────────────────────────────────────────────────────

/**
 * Validate that a URI is either a local `file://` or secure `https://` resource.
 * Rejects `http://`, `javascript:`, `data:`, and other potentially dangerous schemes.
 */
export function validateImageUri(uri: string): boolean {
  if (!uri || typeof uri !== 'string') return false;

  const trimmed = uri.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return false;

  return (
    trimmed.startsWith('file://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('ph://') // iOS Photo Library reference
  );
}

// ── Collage title ───────────────────────────────────────────────────

/**
 * Title requirements:
 *   - 1-100 characters after sanitization
 *   - no HTML tags
 */
export function validateCollageTitle(title: string): ValidationResult {
  if (!title || typeof title !== 'string') {
    return { valid: false, errors: ['Title is required'] };
  }

  const sanitized = sanitizeText(title, 100);
  const errors: string[] = [];

  if (sanitized.length === 0) {
    errors.push('Title must not be empty');
  }
  if (sanitized.length > 100) {
    errors.push('Title must be no more than 100 characters');
  }
  if (sanitized !== title.trim()) {
    errors.push('Title must not contain HTML');
  }

  return { valid: errors.length === 0, errors };
}

// ── Collage state ───────────────────────────────────────────────────

interface CollageStateCounts {
  readonly photoCount: number;
  readonly stickerCount: number;
  readonly textOverlayCount: number;
}

/**
 * Validate that a collage does not exceed resource limits.
 */
export function validateCollageState(
  state: CollageStateCounts,
): ValidationResult {
  const errors: string[] = [];

  if (state.photoCount > MAX_PHOTOS_PER_COLLAGE) {
    errors.push(
      `Maximum ${MAX_PHOTOS_PER_COLLAGE} photos per collage (current: ${state.photoCount})`,
    );
  }
  if (state.stickerCount > MAX_STICKERS_PER_COLLAGE) {
    errors.push(
      `Maximum ${MAX_STICKERS_PER_COLLAGE} stickers per collage (current: ${state.stickerCount})`,
    );
  }
  if (state.textOverlayCount > MAX_TEXT_OVERLAYS) {
    errors.push(
      `Maximum ${MAX_TEXT_OVERLAYS} text overlays per collage (current: ${state.textOverlayCount})`,
    );
  }

  return { valid: errors.length === 0, errors };
}
