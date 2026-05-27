import { Paths, Directory, File } from 'expo-file-system';
import { supabase } from '../supabase';
import type { Sticker, StickerPack } from '../../types/sticker';

interface ServiceResult<T> {
  readonly data: T | null;
  readonly error: string | null;
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('JWT')) {
      return 'Authentication error. Please sign in again.';
    }
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    return 'Failed to load stickers. Please try again.';
  }
  return 'An unexpected error occurred.';
}

/**
 * List all available sticker packs. Premium packs are included with a flag.
 */
export async function getStickerPacks(): Promise<
  ServiceResult<readonly StickerPack[]>
> {
  try {
    const { data, error } = await supabase
      .from('sticker_packs')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    const packs: readonly StickerPack[] = (
      data as readonly {
        id: string;
        name: string;
        category: StickerPack['category'];
        thumbnail_url: string;
        sticker_count: number;
        is_premium: boolean;
      }[]
    ).map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      thumbnailUrl: row.thumbnail_url,
      stickerCount: row.sticker_count,
      isPremium: row.is_premium,
    }));

    return { data: packs, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Get all stickers in a given pack.
 */
export async function getStickers(
  packId: string,
): Promise<ServiceResult<readonly Sticker[]>> {
  try {
    const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .eq('pack_id', packId)
      .order('name', { ascending: true });

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    const stickers: readonly Sticker[] = (
      data as readonly {
        id: string;
        pack_id: string;
        name: string;
        uri: string;
        tags: readonly string[];
      }[]
    ).map((row) => ({
      id: row.id,
      packId: row.pack_id,
      name: row.name,
      uri: row.uri,
      tags: row.tags ?? [],
    }));

    return { data: stickers, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Search stickers across all packs by tag keywords.
 */
export async function searchStickers(
  query: string,
): Promise<ServiceResult<readonly Sticker[]>> {
  try {
    const searchTerm = query.toLowerCase().trim();

    if (!searchTerm) {
      return { data: [], error: null };
    }

    // Use Supabase text search on name and tags array
    const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`);

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    const stickers: readonly Sticker[] = (
      data as readonly {
        id: string;
        pack_id: string;
        name: string;
        uri: string;
        tags: readonly string[];
      }[]
    ).map((row) => ({
      id: row.id,
      packId: row.pack_id,
      name: row.name,
      uri: row.uri,
      tags: row.tags ?? [],
    }));

    return { data: stickers, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Download an entire sticker pack's assets to local filesystem cache.
 * Returns the local directory path where assets are stored.
 */
export async function downloadStickerPack(
  packId: string,
): Promise<ServiceResult<string>> {
  try {
    const stickersResult = await getStickers(packId);

    if (stickersResult.error || !stickersResult.data) {
      return {
        data: null,
        error: stickersResult.error ?? 'Failed to fetch stickers.',
      };
    }

    const stickersDir = new Directory(Paths.cache, 'stickers');
    const packDir = new Directory(stickersDir, packId);
    packDir.create();

    const downloadPromises = stickersResult.data.map(async (sticker) => {
      const fileExt = sticker.uri.split('.').pop() ?? 'png';
      const localFile = new File(packDir, `${sticker.id}.${fileExt}`);

      if (localFile.exists) {
        return;
      }

      const response = await fetch(sticker.uri);
      const blob = await response.arrayBuffer();
      localFile.write(new Uint8Array(blob));
    });

    await Promise.all(downloadPromises);

    return { data: packDir.uri, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Get all custom stickers uploaded by a specific user.
 */
export async function getUserUploadedStickers(
  userId: string,
): Promise<ServiceResult<readonly Sticker[]>> {
  try {
    const { data, error } = await supabase
      .from('stickers')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    const stickers: readonly Sticker[] = (
      data as readonly {
        id: string;
        pack_id: string;
        name: string;
        uri: string;
        tags: readonly string[];
      }[]
    ).map((row) => ({
      id: row.id,
      packId: row.pack_id,
      name: row.name,
      uri: row.uri,
      tags: row.tags ?? [],
    }));

    return { data: stickers, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Upload a custom sticker image to Supabase Storage and create a sticker record.
 */
export async function uploadCustomSticker(
  userId: string,
  uri: string,
  name: string,
  tags: readonly string[],
): Promise<ServiceResult<Sticker>> {
  try {
    const fileExt = uri.split('.').pop() ?? 'png';
    const fileName = `${userId}/${Date.now()}_${name.replace(/\s+/g, '_')}.${fileExt}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('stickers')
      .upload(fileName, blob, {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
        upsert: false,
      });

    if (uploadError) {
      return { data: null, error: sanitizeError(uploadError) };
    }

    const { data: urlData } = supabase.storage
      .from('stickers')
      .getPublicUrl(fileName);

    const stickerUri = urlData.publicUrl;

    // Find or create the user's custom sticker pack
    const { data: existingPack } = await supabase
      .from('sticker_packs')
      .select('id')
      .eq('category', 'user-uploaded')
      .eq('created_by', userId)
      .single();

    let packId: string;

    if (existingPack) {
      packId = (existingPack as { id: string }).id;
    } else {
      const { data: newPack, error: packError } = await supabase
        .from('sticker_packs')
        .insert({
          name: 'My Stickers',
          category: 'user-uploaded',
          thumbnail_url: stickerUri,
          sticker_count: 0,
          is_premium: false,
          created_by: userId,
        })
        .select('id')
        .single();

      if (packError || !newPack) {
        return { data: null, error: sanitizeError(packError) };
      }

      packId = (newPack as { id: string }).id;
    }

    const { data: stickerRow, error: insertError } = await supabase
      .from('stickers')
      .insert({
        pack_id: packId,
        name,
        uri: stickerUri,
        tags: [...tags],
        uploaded_by: userId,
      })
      .select()
      .single();

    if (insertError || !stickerRow) {
      return { data: null, error: sanitizeError(insertError) };
    }

    const row = stickerRow as {
      id: string;
      pack_id: string;
      name: string;
      uri: string;
      tags: readonly string[];
    };

    // Increment the pack's sticker count
    await supabase.rpc('increment_sticker_count', { pack_id_input: packId });

    const sticker: Sticker = {
      id: row.id,
      packId: row.pack_id,
      name: row.name,
      uri: row.uri,
      tags: row.tags ?? [],
    };

    return { data: sticker, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}
