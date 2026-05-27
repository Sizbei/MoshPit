import { supabase } from '../supabase';
import type { RaveEvent } from '../../types/event';
import * as edmtrain from './edmtrain';
import * as bandsintown from './bandsintown';

interface ServiceResult<T> {
  readonly data: T | null;
  readonly error: string | null;
}

interface SearchOptions {
  readonly sources?: readonly ('edmtrain' | 'bandsintown')[];
  readonly limit?: number;
}

interface LocationQuery {
  readonly city?: string;
  readonly locationId?: number;
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return 'Failed to search events. Please try again.';
  }
  return 'An unexpected error occurred.';
}

/**
 * Compute similarity between two strings using a simple token-overlap ratio.
 * Returns a value between 0 and 1.
 */
function similarityScore(a: string, b: string): number {
  const normalize = (s: string): readonly string[] =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);

  const tokensA = normalize(a);
  const tokensB = normalize(b);

  if (tokensA.length === 0 || tokensB.length === 0) {
    return 0;
  }

  const setB = new Set(tokensB);
  const overlap = tokensA.filter((t) => setB.has(t)).length;

  return (2 * overlap) / (tokensA.length + tokensB.length);
}

/**
 * Check if two dates are on the same day (ignoring time).
 */
function isSameDay(dateA: string, dateB: string): boolean {
  try {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  } catch {
    return false;
  }
}

/**
 * Deduplicate events using fuzzy matching on name, date, and venue.
 * When duplicates are found, the first occurrence is kept.
 */
export function deduplicateEvents(
  events: readonly RaveEvent[],
): readonly RaveEvent[] {
  const result: RaveEvent[] = [];

  for (const event of events) {
    const isDuplicate = result.some((existing) => {
      const nameSimilarity = similarityScore(existing.name, event.name);
      const sameDate = isSameDay(existing.startDate, event.startDate);
      const venueSimilarity = similarityScore(
        existing.venue.name,
        event.venue.name,
      );

      // High name similarity + same date = likely duplicate
      if (nameSimilarity > 0.6 && sameDate) {
        return true;
      }

      // Same venue + same date + moderate name similarity
      if (venueSimilarity > 0.7 && sameDate && nameSimilarity > 0.3) {
        return true;
      }

      // Check artist overlap for same-date, same-venue events
      if (sameDate && venueSimilarity > 0.5) {
        const existingArtists = new Set(
          existing.artists.map((a) => a.toLowerCase()),
        );
        const matchingArtists = event.artists.filter((a) =>
          existingArtists.has(a.toLowerCase()),
        );
        if (
          matchingArtists.length > 0 &&
          matchingArtists.length >=
            Math.min(existing.artists.length, event.artists.length) * 0.5
        ) {
          return true;
        }
      }

      return false;
    });

    if (!isDuplicate) {
      result.push(event);
    }
  }

  return result;
}

/**
 * Cache an event in the Supabase events_cache table.
 */
export async function cacheEvent(
  event: RaveEvent,
): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase.from('events_cache').upsert(
      {
        cache_key: `event_${event.source}_${event.sourceId}`,
        data: event,
        cached_at: new Date().toISOString(),
      },
      { onConflict: 'cache_key' },
    );

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    return { data: true, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Search events across all configured sources, deduplicate, and return
 * a unified list of RaveEvent objects.
 */
export async function searchEvents(
  query: string,
  options: SearchOptions = {},
): Promise<ServiceResult<readonly RaveEvent[]>> {
  try {
    const sources = options.sources ?? ['edmtrain', 'bandsintown'];
    const limit = options.limit ?? 50;
    const allEvents: RaveEvent[] = [];
    const errors: string[] = [];

    const fetchPromises: Promise<void>[] = [];

    if (sources.includes('edmtrain')) {
      fetchPromises.push(
        edmtrain.searchEvents(query).then((result) => {
          if (result.data) {
            allEvents.push(...result.data);
          }
          if (result.error) {
            errors.push(`EDMTrain: ${result.error}`);
          }
        }),
      );
    }

    if (sources.includes('bandsintown')) {
      fetchPromises.push(
        bandsintown.searchByArtist(query).then((result) => {
          if (result.data) {
            allEvents.push(...result.data);
          }
          if (result.error) {
            errors.push(`Bandsintown: ${result.error}`);
          }
        }),
      );
    }

    await Promise.all(fetchPromises);

    // If all sources failed, return an error
    if (allEvents.length === 0 && errors.length > 0) {
      return { data: null, error: errors.join('; ') };
    }

    const deduplicated = deduplicateEvents(allEvents);
    const limited = deduplicated.slice(0, limit);

    return { data: limited, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Get upcoming events for a given location from all sources.
 */
export async function getUpcomingEvents(
  location: LocationQuery,
): Promise<ServiceResult<readonly RaveEvent[]>> {
  try {
    const allEvents: RaveEvent[] = [];
    const errors: string[] = [];

    const fetchPromises: Promise<void>[] = [];

    if (location.locationId !== undefined) {
      fetchPromises.push(
        edmtrain.getUpcomingEvents(location.locationId).then((result) => {
          if (result.data) {
            allEvents.push(...result.data);
          }
          if (result.error) {
            errors.push(`EDMTrain: ${result.error}`);
          }
        }),
      );
    }

    await Promise.all(fetchPromises);

    if (allEvents.length === 0 && errors.length > 0) {
      return { data: null, error: errors.join('; ') };
    }

    const deduplicated = deduplicateEvents(allEvents);
    return { data: deduplicated, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Get nearby events using latitude/longitude coordinates.
 */
export async function getNearbyEvents(
  lat: number,
  lng: number,
  radius = 50,
): Promise<ServiceResult<readonly RaveEvent[]>> {
  try {
    const allEvents: RaveEvent[] = [];
    const errors: string[] = [];

    const result = await edmtrain.getEventsByLocation(lat, lng, radius);

    if (result.data) {
      allEvents.push(...result.data);
    }
    if (result.error) {
      errors.push(result.error);
    }

    if (allEvents.length === 0 && errors.length > 0) {
      return { data: null, error: errors.join('; ') };
    }

    const deduplicated = deduplicateEvents(allEvents);
    return { data: deduplicated, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}
