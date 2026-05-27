export type EventSource = 'edmtrain' | 'bandsintown' | 'manual';

export interface Venue {
  readonly name: string;
  readonly city: string;
  readonly state?: string;
  readonly country: string;
  readonly latitude?: number;
  readonly longitude?: number;
}

export interface RaveEvent {
  readonly id: string;
  readonly sourceId: string;
  readonly source: EventSource;
  readonly name: string;
  readonly startDate: string;
  readonly endDate?: string;
  readonly venue: Venue;
  readonly artists: readonly string[];
  readonly genres: readonly string[];
  readonly artworkUrl?: string;
  readonly ticketUrl?: string;
  readonly isFestival: boolean;
}
