/**
 * Client-side rate limiting using a sliding window algorithm.
 *
 * This is a first line of defense to prevent accidental API abuse
 * from the client. Server-side rate limiting is still essential.
 */

interface RateLimiterConfig {
  readonly maxRequests: number;
  readonly windowMs: number;
}

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private timestamps: number[];

  constructor(config: RateLimiterConfig) {
    this.maxRequests = config.maxRequests;
    this.windowMs = config.windowMs;
    this.timestamps = [];
  }

  /**
   * Try to acquire a rate limit token.
   *
   * Returns `true` if the request is allowed, `false` if rate-limited.
   * Uses a sliding window: only timestamps within the current window
   * count against the limit.
   */
  tryAcquire(): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Slide the window: drop expired timestamps
    this.timestamps = this.timestamps.filter((ts) => ts > windowStart);

    if (this.timestamps.length >= this.maxRequests) {
      return false;
    }

    this.timestamps = [...this.timestamps, now];
    return true;
  }

  /**
   * Number of milliseconds until the next request will be allowed.
   * Returns 0 if a request is currently allowed.
   */
  getRetryAfterMs(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const active = this.timestamps.filter((ts) => ts > windowStart);

    if (active.length < this.maxRequests) return 0;

    // The oldest active timestamp determines when a slot opens
    const oldest = active[0];
    if (oldest === undefined) return 0;

    return Math.max(0, oldest + this.windowMs - now);
  }

  /** Reset all tracked timestamps. */
  reset(): void {
    this.timestamps = [];
  }
}

// ── Factory ─────────────────────────────────────────────────────────

export function createRateLimiter(
  maxRequests: number,
  windowMs: number,
): RateLimiter {
  return new RateLimiter({ maxRequests, windowMs });
}

// ── Pre-configured limiters ─────────────────────────────────────────

const ONE_MINUTE_MS = 60_000;

/** General API calls: 60 requests per minute. */
export const apiLimiter = createRateLimiter(60, ONE_MINUTE_MS);

/** Image uploads: 10 per minute. */
export const uploadLimiter = createRateLimiter(10, ONE_MINUTE_MS);

/** Collage exports: 5 per minute. */
export const exportLimiter = createRateLimiter(5, ONE_MINUTE_MS);

/** Authentication attempts: 5 per minute. */
export const authLimiter = createRateLimiter(5, ONE_MINUTE_MS);
