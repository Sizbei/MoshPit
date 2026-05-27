import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '../services/supabase';
import { useCollageState } from './useCollageState';
import type { Collage, CollageType, AspectRatio } from '../types/collage';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface CollageSummary {
  readonly id: string;
  readonly title: string;
  readonly type: CollageType;
  readonly thumbnailUrl: string | null;
  readonly updatedAt: string;
  readonly photoCount: number;
}

interface SyncResult<T> {
  readonly data: T | null;
  readonly error: string | null;
}

interface UseCollageSyncReturn {
  readonly save: () => Promise<SyncResult<Collage>>;
  readonly load: (id: string) => Promise<SyncResult<Collage>>;
  readonly list: () => Promise<SyncResult<readonly CollageSummary[]>>;
  readonly remove: (id: string) => Promise<SyncResult<boolean>>;
  readonly isSaving: boolean;
  readonly lastSaved: Date | null;
}

// --------------------------------------------------------------------------
// DB row shape (matches 001_create_tables.sql exactly)
// --------------------------------------------------------------------------

interface CollageRow {
  readonly id: string;
  readonly user_id: string;
  readonly title: string;
  readonly type: CollageType;
  readonly aspect_ratio: AspectRatio;
  readonly background_color: string;
  readonly layout_data: {
    readonly photos: readonly unknown[];
    readonly stickers: readonly unknown[];
    readonly textOverlays: readonly unknown[];
    readonly templateId: string | null;
  };
  readonly event_id: string | null;
  readonly thumbnail_url: string | null;
  readonly is_public: boolean;
  readonly is_deleted: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

// --------------------------------------------------------------------------
// Offline save queue
// --------------------------------------------------------------------------

interface QueuedSave {
  readonly id: string;
  readonly payload: Record<string, unknown>;
  readonly timestamp: number;
}

const offlineQueue: QueuedSave[] = [];

function isOnline(): boolean {
  // AppState gives us background/inactive/active, but not connectivity.
  // A simple heuristic: if the app is active, assume online.
  // Failed requests will be caught and queued.
  return AppState.currentState === 'active';
}

async function flushQueue(userId: string): Promise<void> {
  while (offlineQueue.length > 0) {
    const item = offlineQueue[0];
    const { error } = await supabase
      .from('collages')
      .upsert({ ...item.payload, user_id: userId }, { onConflict: 'id' });

    if (error) {
      // Still offline or other issue -- stop flushing
      break;
    }
    offlineQueue.shift();
  }
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('JWT') || error.message.includes('token')) {
      return 'Authentication error. Please sign in again.';
    }
    return error.message;
  }
  return 'An unexpected error occurred.';
}

function rowToCollage(row: CollageRow): Collage {
  const layout = row.layout_data ?? {
    photos: [],
    stickers: [],
    textOverlays: [],
    templateId: null,
  };

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    type: row.type,
    aspectRatio: row.aspect_ratio,
    backgroundColor: row.background_color,
    photos: (layout.photos ?? []) as Collage['photos'],
    stickers: (layout.stickers ?? []) as Collage['stickers'],
    textOverlays: (layout.textOverlays ?? []) as Collage['textOverlays'],
    templateId: layout.templateId ?? undefined,
    eventId: row.event_id ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// --------------------------------------------------------------------------
// Hook
// --------------------------------------------------------------------------

export function useCollageSync(): UseCollageSyncReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const savingRef = useRef(false);

  // ---- Save current Zustand state to Supabase ----
  const save = useCallback(async (): Promise<SyncResult<Collage>> => {
    if (savingRef.current) {
      return { data: null, error: null };
    }

    try {
      savingRef.current = true;
      setIsSaving(true);

      const userId = await getCurrentUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to save.' };
      }

      // Flush any queued offline saves first
      if (offlineQueue.length > 0) {
        await flushQueue(userId);
      }

      const state = useCollageState.getState();

      const payload = {
        id: state.id,
        user_id: userId,
        title: 'Untitled',
        type: state.type,
        aspect_ratio: state.aspectRatio,
        background_color: state.backgroundColor,
        layout_data: {
          photos: state.photos,
          stickers: state.stickers,
          textOverlays: state.textOverlays,
          templateId: state.templateId,
        },
        event_id: state.eventId ?? null,
      };

      const { data, error } = await supabase
        .from('collages')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        // If network error, queue for later
        if (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError')
        ) {
          offlineQueue.push({
            id: state.id,
            payload,
            timestamp: Date.now(),
          });
          return { data: null, error: 'Offline. Changes will sync when you reconnect.' };
        }
        return { data: null, error: sanitizeError(error) };
      }

      const collage = rowToCollage(data as CollageRow);
      setLastSaved(new Date());
      return { data: collage, error: null };
    } catch (err: unknown) {
      // Queue on network failure
      const state = useCollageState.getState();
      const userId = await getCurrentUserId();
      if (userId) {
        offlineQueue.push({
          id: state.id,
          payload: {
            id: state.id,
            user_id: userId,
            title: 'Untitled',
            type: state.type,
            aspect_ratio: state.aspectRatio,
            background_color: state.backgroundColor,
            layout_data: {
              photos: state.photos,
              stickers: state.stickers,
              textOverlays: state.textOverlays,
              templateId: state.templateId,
            },
            event_id: state.eventId ?? null,
          },
          timestamp: Date.now(),
        });
      }
      return { data: null, error: sanitizeError(err) };
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  // ---- Load a collage by ID and hydrate the Zustand store ----
  const load = useCallback(async (id: string): Promise<SyncResult<Collage>> => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to load collages.' };
      }

      const { data, error } = await supabase
        .from('collages')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

      if (error) {
        return { data: null, error: sanitizeError(error) };
      }

      const row = data as CollageRow;
      const collage = rowToCollage(row);
      const layout = row.layout_data;

      // Hydrate the Zustand store
      useCollageState.setState({
        id: collage.id,
        type: collage.type,
        aspectRatio: collage.aspectRatio,
        backgroundColor: collage.backgroundColor,
        photos: (layout.photos ?? []) as Collage['photos'],
        stickers: (layout.stickers ?? []) as Collage['stickers'],
        textOverlays: (layout.textOverlays ?? []) as Collage['textOverlays'],
        templateId: layout.templateId ?? null,
        eventId: collage.eventId ?? null,
        selectedPhotoId: null,
        selectedStickerId: null,
      });

      return { data: collage, error: null };
    } catch (err: unknown) {
      return { data: null, error: sanitizeError(err) };
    }
  }, []);

  // ---- List the current user's collages ----
  const list = useCallback(async (): Promise<SyncResult<readonly CollageSummary[]>> => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to view collages.' };
      }

      const { data, error } = await supabase
        .from('collages')
        .select('id, title, type, thumbnail_url, updated_at, layout_data')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (error) {
        return { data: null, error: sanitizeError(error) };
      }

      const summaries: readonly CollageSummary[] = (
        data as readonly {
          id: string;
          title: string;
          type: CollageType;
          thumbnail_url: string | null;
          updated_at: string;
          layout_data: { photos?: readonly unknown[] };
        }[]
      ).map((row) => ({
        id: row.id,
        title: row.title,
        type: row.type,
        thumbnailUrl: row.thumbnail_url,
        updatedAt: row.updated_at,
        photoCount: (row.layout_data?.photos ?? []).length,
      }));

      return { data: summaries, error: null };
    } catch (err: unknown) {
      return { data: null, error: sanitizeError(err) };
    }
  }, []);

  // ---- Soft-delete a collage ----
  const remove = useCallback(async (id: string): Promise<SyncResult<boolean>> => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        return { data: null, error: 'You must be signed in to delete collages.' };
      }

      const { error } = await supabase
        .from('collages')
        .update({ is_deleted: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return { data: null, error: sanitizeError(error) };
      }

      return { data: true, error: null };
    } catch (err: unknown) {
      return { data: null, error: sanitizeError(err) };
    }
  }, []);

  return { save, load, list, remove, isSaving, lastSaved };
}

export type { CollageSummary, SyncResult };
