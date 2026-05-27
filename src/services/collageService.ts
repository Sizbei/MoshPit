import { supabase } from './supabase';
import type { Collage, CollagePhoto, CollageSticker, TextOverlay } from '../types/collage';

interface ServiceResult<T> {
  readonly data: T | null;
  readonly error: string | null;
}

interface CollageRow {
  readonly id: string;
  readonly user_id: string;
  readonly title: string;
  readonly type: Collage['type'];
  readonly aspect_ratio: Collage['aspectRatio'];
  readonly background_color: string;
  readonly photos: readonly CollagePhoto[];
  readonly stickers: readonly CollageSticker[];
  readonly text_overlays: readonly TextOverlay[];
  readonly event_id: string | null;
  readonly template_id: string | null;
  readonly thumbnail_url: string | null;
  readonly is_public: boolean;
  readonly deleted_at: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message.includes('JWT')
      ? 'Authentication error. Please sign in again.'
      : 'Something went wrong. Please try again.';
  }
  return 'An unexpected error occurred.';
}

function rowToCollage(row: CollageRow): Collage {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    type: row.type,
    aspectRatio: row.aspect_ratio,
    backgroundColor: row.background_color,
    photos: row.photos ?? [],
    stickers: row.stickers ?? [],
    textOverlays: row.text_overlays ?? [],
    eventId: row.event_id ?? undefined,
    templateId: row.template_id ?? undefined,
    thumbnailUrl: row.thumbnail_url ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function collageToRow(
  collage: Collage,
): Omit<CollageRow, 'created_at' | 'updated_at' | 'is_public' | 'deleted_at'> {
  return {
    id: collage.id,
    user_id: collage.userId,
    title: collage.title,
    type: collage.type,
    aspect_ratio: collage.aspectRatio,
    background_color: collage.backgroundColor,
    photos: collage.photos,
    stickers: collage.stickers,
    text_overlays: collage.textOverlays,
    event_id: collage.eventId ?? null,
    template_id: collage.templateId ?? null,
    thumbnail_url: collage.thumbnailUrl ?? null,
  };
}

export async function saveCollage(
  collage: Collage,
): Promise<ServiceResult<Collage>> {
  try {
    const row = collageToRow(collage);
    const { data, error } = await supabase
      .from('collages')
      .upsert(row, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    return { data: rowToCollage(data as CollageRow), error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function loadCollage(
  id: string,
): Promise<ServiceResult<Collage>> {
  try {
    const { data, error } = await supabase
      .from('collages')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    return { data: rowToCollage(data as CollageRow), error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function listUserCollages(
  userId: string,
  limit = 20,
  offset = 0,
): Promise<ServiceResult<readonly Collage[]>> {
  try {
    const { data, error } = await supabase
      .from('collages')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    const collages = (data as readonly CollageRow[]).map(rowToCollage);
    return { data: collages, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function deleteCollage(
  id: string,
): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase
      .from('collages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    return { data: true, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function publishCollage(
  id: string,
): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase
      .from('collages')
      .update({ is_public: true })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    return { data: true, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function unpublishCollage(
  id: string,
): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase
      .from('collages')
      .update({ is_public: false })
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    return { data: true, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getPublicFeed(
  limit = 20,
  offset = 0,
): Promise<ServiceResult<readonly Collage[]>> {
  try {
    const { data, error } = await supabase
      .from('collages')
      .select('*')
      .eq('is_public', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    const collages = (data as readonly CollageRow[]).map(rowToCollage);
    return { data: collages, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function getEventCollages(
  eventId: string,
): Promise<ServiceResult<readonly Collage[]>> {
  try {
    const { data, error } = await supabase
      .from('collages')
      .select('*')
      .eq('event_id', eventId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    const collages = (data as readonly CollageRow[]).map(rowToCollage);
    return { data: collages, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function uploadCollagePhotos(
  collageId: string,
  photoUris: readonly string[],
): Promise<ServiceResult<readonly string[]>> {
  try {
    const uploadPromises = photoUris.map(async (uri, index) => {
      const fileExt = uri.split('.').pop() ?? 'jpg';
      const fileName = `${collageId}/${Date.now()}_${index}.${fileExt}`;

      const response = await fetch(uri);
      const blob = await response.blob();

      const { error: uploadError } = await supabase.storage
        .from('collage-photos')
        .upload(fileName, blob, {
          contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('collage-photos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    });

    const urls = await Promise.all(uploadPromises);
    return { data: urls, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

export async function generateThumbnail(
  collageId: string,
): Promise<ServiceResult<string>> {
  try {
    const { data: collageData, error: fetchError } = await supabase
      .from('collages')
      .select('photos')
      .eq('id', collageId)
      .single();

    if (fetchError) {
      return { data: null, error: sanitizeError(fetchError) };
    }

    const photos = (collageData as { photos: readonly CollagePhoto[] }).photos;
    if (!photos || photos.length === 0) {
      return { data: null, error: 'No photos in collage to generate thumbnail.' };
    }

    const firstPhoto = photos[0];
    const sourceUri = firstPhoto.storagePath ?? firstPhoto.uri;

    const thumbnailPath = `thumbnails/${collageId}.jpg`;

    const response = await fetch(sourceUri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('collage-photos')
      .upload(thumbnailPath, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      return { data: null, error: sanitizeError(uploadError) };
    }

    const { data: urlData } = supabase.storage
      .from('collage-photos')
      .getPublicUrl(thumbnailPath);

    const thumbnailUrl = urlData.publicUrl;

    await supabase
      .from('collages')
      .update({ thumbnail_url: thumbnailUrl })
      .eq('id', collageId);

    return { data: thumbnailUrl, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}
