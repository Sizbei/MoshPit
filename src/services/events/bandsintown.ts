import type { RaveEvent, Venue } from '../../types/event';

interface ServiceResult<T> {
  readonly data: T | null;
  readonly error: string | null;
}

interface BandsintownArtist {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly image_url: string;
  readonly thumb_url: string;
  readonly facebook_page_url: string;
  readonly mbid: string;
  readonly tracker_count: number;
  readonly upcoming_event_count: number;
  readonly support_url: string;
}

interface BandsintownVenue {
  readonly name: string;
  readonly latitude: string;
  readonly longitude: string;
  readonly city: string;
  readonly region: string;
  readonly country: string;
}

interface BandsintownEvent {
  readonly id: string;
  readonly artist_id: string;
  readonly url: string;
  readonly on_sale_datetime: string;
  readonly datetime: string;
  readonly title: string;
  readonly description: string;
  readonly venue: BandsintownVenue;
  readonly offers: readonly {
    readonly type: string;
    readonly url: string;
    readonly status: string;
  }[];
  readonly lineup: readonly string[];
  readonly festival_start_date?: string;
  readonly festival_end_date?: string;
  readonly festival_datetime_display_rule?: string;
}

interface ArtistInfo {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly thumbUrl: string;
  readonly trackerCount: number;
  readonly upcomingEventCount: number;
  readonly url: string;
}

const BASE_URL = 'https://rest.bandsintown.com';
const APP_ID = process.env.EXPO_PUBLIC_BANDSINTOWN_APP_ID ?? '';

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('404')) {
      return 'Artist not found.';
    }
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

function normalizeEvent(
  raw: BandsintownEvent,
  artistName: string,
): RaveEvent {
  const venue: Venue = {
    name: raw.venue.name,
    city: raw.venue.city,
    state: raw.venue.region || undefined,
    country: raw.venue.country,
    latitude: raw.venue.latitude ? parseFloat(raw.venue.latitude) : undefined,
    longitude: raw.venue.longitude ? parseFloat(raw.venue.longitude) : undefined,
  };

  const isFestival = Boolean(raw.festival_start_date);
  const ticketOffer = raw.offers.find((o) => o.status === 'available');

  return {
    id: `bandsintown_${raw.id}`,
    sourceId: raw.id,
    source: 'bandsintown',
    name: raw.title || `${artistName} at ${raw.venue.name}`,
    startDate: raw.datetime,
    endDate: raw.festival_end_date,
    venue,
    artists: [...raw.lineup],
    genres: [],
    artworkUrl: undefined,
    ticketUrl: ticketOffer?.url ?? raw.url,
    isFestival,
  };
}

function normalizeArtist(raw: BandsintownArtist): ArtistInfo {
  return {
    id: raw.id,
    name: raw.name,
    imageUrl: raw.image_url,
    thumbUrl: raw.thumb_url,
    trackerCount: raw.tracker_count,
    upcomingEventCount: raw.upcoming_event_count,
    url: raw.url,
  };
}

async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('app_id', APP_ID);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Bandsintown API error: ${response.status}`);
  }

  return (await response.json()) as T;
}

function encodeArtistName(name: string): string {
  return encodeURIComponent(name.trim());
}

export async function getArtistEvents(
  artistName: string,
): Promise<ServiceResult<readonly RaveEvent[]>> {
  try {
    if (!APP_ID) {
      return { data: null, error: 'Bandsintown API key is not configured.' };
    }

    const encoded = encodeArtistName(artistName);
    const rawEvents = await fetchFromApi<readonly BandsintownEvent[]>(
      `/artists/${encoded}/events`,
    );

    const events = rawEvents.map((e) => normalizeEvent(e, artistName));
    return { data: events, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getArtistInfo(
  artistName: string,
): Promise<ServiceResult<ArtistInfo>> {
  try {
    if (!APP_ID) {
      return { data: null, error: 'Bandsintown API key is not configured.' };
    }

    const encoded = encodeArtistName(artistName);
    const raw = await fetchFromApi<BandsintownArtist>(
      `/artists/${encoded}`,
    );

    return { data: normalizeArtist(raw), error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function searchByArtist(
  query: string,
): Promise<ServiceResult<readonly RaveEvent[]>> {
  try {
    if (!APP_ID) {
      return { data: null, error: 'Bandsintown API key is not configured.' };
    }

    const encoded = encodeArtistName(query);
    const rawEvents = await fetchFromApi<readonly BandsintownEvent[]>(
      `/artists/${encoded}/events`,
    );

    const events = rawEvents.map((e) => normalizeEvent(e, query));
    return { data: events, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}
