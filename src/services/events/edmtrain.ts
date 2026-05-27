import { supabase } from '../supabase';
import type { RaveEvent, Venue } from '../../types/event';

interface ServiceResult<T> {
  readonly data: T | null;
  readonly error: string | null;
}

interface EdmTrainEvent {
  readonly id: number;
  readonly name: string;
  readonly date: string;
  readonly endDate?: string;
  readonly venue: {
    readonly id: number;
    readonly name: string;
    readonly location: string;
    readonly address: string;
    readonly state: string;
    readonly latitude: number;
    readonly longitude: number;
  };
  readonly artistList: readonly {
    readonly id: number;
    readonly name: string;
  }[];
  readonly festivalInd: boolean;
  readonly link: string;
  readonly ages?: string;
}

interface EdmTrainLocation {
  readonly id: number;
  readonly city: string;
  readonly state: string;
  readonly stateCode: string;
  readonly latitude: number;
  readonly longitude: number;
}

interface EdmTrainApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
}

const BASE_URL = 'https://edmtrain.com/api';
const API_KEY = process.env.EXPO_PUBLIC_EDMTRAIN_API_KEY ?? '';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('429') || error.message.includes('rate')) {
      return 'Too many requests. Please try again in a moment.';
    }
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    return 'Failed to fetch event data. Please try again.';
  }
  return 'An unexpected error occurred.';
}

function normalizeEvent(raw: EdmTrainEvent): RaveEvent {
  const venue: Venue = {
    name: raw.venue.name,
    city: raw.venue.location,
    state: raw.venue.state,
    country: 'US',
    latitude: raw.venue.latitude,
    longitude: raw.venue.longitude,
  };

  return {
    id: `edmtrain_${raw.id}`,
    sourceId: String(raw.id),
    source: 'edmtrain',
    name: raw.name || raw.artistList.map((a) => a.name).join(', '),
    startDate: raw.date,
    endDate: raw.endDate,
    venue,
    artists: raw.artistList.map((a) => a.name),
    genres: [],
    artworkUrl: undefined,
    ticketUrl: raw.link || undefined,
    isFestival: raw.festivalInd,
  };
}

async function fetchFromApi<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('client', API_KEY);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`EDMTrain API error: ${response.status}`);
  }

  const json = (await response.json()) as EdmTrainApiResponse<T>;

  if (!json.success) {
    throw new Error('EDMTrain API returned unsuccessful response');
  }

  return json.data;
}

async function getCachedOrFetch<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const { data: cached } = await supabase
      .from('events_cache')
      .select('data, cached_at')
      .eq('cache_key', cacheKey)
      .single();

    if (cached) {
      const cachedAt = new Date(cached.cached_at as string).getTime();
      const now = Date.now();

      if (now - cachedAt < CACHE_TTL_MS) {
        return cached.data as T;
      }
    }
  } catch {
    // Cache miss or read error — proceed to fetch
  }

  const freshData = await fetcher();

  try {
    await supabase.from('events_cache').upsert(
      {
        cache_key: cacheKey,
        data: freshData,
        cached_at: new Date().toISOString(),
      },
      { onConflict: 'cache_key' },
    );
  } catch {
    // Cache write failure is non-critical
  }

  return freshData;
}

export async function searchEvents(
  query: string,
): Promise<ServiceResult<readonly RaveEvent[]>> {
  try {
    if (!API_KEY) {
      return { data: null, error: 'EDMTrain API key is not configured.' };
    }

    const cacheKey = `edmtrain_search_${query.toLowerCase().trim()}`;

    const rawEvents = await getCachedOrFetch(cacheKey, () =>
      fetchFromApi<readonly EdmTrainEvent[]>('/events', {
        artistName: query,
      }),
    );

    const events = rawEvents.map(normalizeEvent);
    return { data: events, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getEventsByLocation(
  lat: number,
  lng: number,
  radius = 50,
): Promise<ServiceResult<readonly RaveEvent[]>> {
  try {
    if (!API_KEY) {
      return { data: null, error: 'EDMTrain API key is not configured.' };
    }

    const cacheKey = `edmtrain_loc_${lat.toFixed(2)}_${lng.toFixed(2)}_${radius}`;

    const rawEvents = await getCachedOrFetch(cacheKey, () =>
      fetchFromApi<readonly EdmTrainEvent[]>('/events', {
        latitude: String(lat),
        longitude: String(lng),
        radius: String(radius),
      }),
    );

    const events = rawEvents.map(normalizeEvent);
    return { data: events, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getUpcomingEvents(
  locationId: number,
): Promise<ServiceResult<readonly RaveEvent[]>> {
  try {
    if (!API_KEY) {
      return { data: null, error: 'EDMTrain API key is not configured.' };
    }

    const cacheKey = `edmtrain_upcoming_${locationId}`;

    const rawEvents = await getCachedOrFetch(cacheKey, () =>
      fetchFromApi<readonly EdmTrainEvent[]>('/events', {
        locationIds: String(locationId),
      }),
    );

    const events = rawEvents.map(normalizeEvent);
    return { data: events, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getLocations(): Promise<
  ServiceResult<readonly EdmTrainLocation[]>
> {
  try {
    if (!API_KEY) {
      return { data: null, error: 'EDMTrain API key is not configured.' };
    }

    const cacheKey = 'edmtrain_locations';

    const locations = await getCachedOrFetch(cacheKey, () =>
      fetchFromApi<readonly EdmTrainLocation[]>('/locations'),
    );

    return { data: locations, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}
