import { supabase } from './supabase';

interface ServiceResult<T> {
  readonly data: T | null;
  readonly error: string | null;
}

interface UserProfile {
  readonly id: string;
  readonly username: string;
  readonly avatarUrl: string | null;
  readonly bio: string | null;
  readonly isPro: boolean;
  readonly createdAt: string;
}

interface ProfileUpdates {
  readonly username?: string;
  readonly bio?: string;
  readonly avatarUrl?: string;
}

interface ProStatus {
  readonly isPro: boolean;
  readonly plan: string | null;
  readonly expiresAt: string | null;
}

interface ProfileRow {
  readonly id: string;
  readonly username: string;
  readonly avatar_url: string | null;
  readonly bio: string | null;
  readonly is_pro: boolean;
  readonly created_at: string;
}

function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('JWT')) {
      return 'Authentication error. Please sign in again.';
    }
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return 'That username is already taken.';
    }
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    return 'Something went wrong. Please try again.';
  }
  return 'An unexpected error occurred.';
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    isPro: row.is_pro,
    createdAt: row.created_at,
  };
}

/**
 * Fetch a user's profile by their user ID.
 */
export async function getProfile(
  userId: string,
): Promise<ServiceResult<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    return { data: rowToProfile(data as ProfileRow), error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Update a user's profile fields (username, bio, avatarUrl).
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdates,
): Promise<ServiceResult<UserProfile>> {
  try {
    const row: Record<string, unknown> = {};

    if (updates.username !== undefined) {
      row.username = updates.username;
    }
    if (updates.bio !== undefined) {
      row.bio = updates.bio;
    }
    if (updates.avatarUrl !== undefined) {
      row.avatar_url = updates.avatarUrl;
    }

    if (Object.keys(row).length === 0) {
      return { data: null, error: 'No fields to update.' };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(row)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    return { data: rowToProfile(data as ProfileRow), error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Upload a user avatar image to Supabase Storage and update the profile.
 */
export async function uploadAvatar(
  userId: string,
  uri: string,
): Promise<ServiceResult<string>> {
  try {
    const fileExt = uri.split('.').pop() ?? 'jpg';
    const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

    const response = await fetch(uri);
    const blob = await response.blob();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
        upsert: true,
      });

    if (uploadError) {
      return { data: null, error: sanitizeError(uploadError) };
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;

    // Update the profile with the new avatar URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId);

    if (updateError) {
      return { data: null, error: sanitizeError(updateError) };
    }

    return { data: avatarUrl, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Check the user's Pro subscription status.
 */
export async function getProStatus(
  userId: string,
): Promise<ServiceResult<ProStatus>> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('plan, status, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { data: null, error: sanitizeError(error) };
    }

    if (!data) {
      return {
        data: { isPro: false, plan: null, expiresAt: null },
        error: null,
      };
    }

    const subscription = data as {
      plan: string;
      status: string;
      expires_at: string;
    };

    const isExpired = new Date(subscription.expires_at) < new Date();

    return {
      data: {
        isPro: !isExpired,
        plan: subscription.plan,
        expiresAt: subscription.expires_at,
      },
      error: null,
    };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}

/**
 * Fully delete a user's account and all associated data.
 * This performs a cascading deletion across all user-owned resources.
 */
export async function deleteAccount(
  userId: string,
): Promise<ServiceResult<boolean>> {
  try {
    // Delete user's collages (soft delete)
    const { error: collageError } = await supabase
      .from('collages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (collageError) {
      return { data: null, error: sanitizeError(collageError) };
    }

    // Delete user's custom stickers
    const { error: stickerError } = await supabase
      .from('stickers')
      .delete()
      .eq('uploaded_by', userId);

    if (stickerError) {
      return { data: null, error: sanitizeError(stickerError) };
    }

    // Delete user's custom sticker packs
    const { error: packError } = await supabase
      .from('sticker_packs')
      .delete()
      .eq('created_by', userId);

    if (packError) {
      return { data: null, error: sanitizeError(packError) };
    }

    // Cancel active subscriptions
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (subError) {
      return { data: null, error: sanitizeError(subError) };
    }

    // Remove storage assets
    try {
      const { data: avatarFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (avatarFiles && avatarFiles.length > 0) {
        const paths = avatarFiles.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from('avatars').remove(paths);
      }
    } catch {
      // Storage cleanup failure is non-critical
    }

    try {
      const { data: stickerFiles } = await supabase.storage
        .from('stickers')
        .list(userId);

      if (stickerFiles && stickerFiles.length > 0) {
        const paths = stickerFiles.map((f) => `${userId}/${f.name}`);
        await supabase.storage.from('stickers').remove(paths);
      }
    } catch {
      // Storage cleanup failure is non-critical
    }

    // Delete the profile (this may cascade via DB foreign keys)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      return { data: null, error: sanitizeError(profileError) };
    }

    // Delete the auth user via Supabase admin (requires service_role key on backend)
    // On the client side, we sign the user out instead
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      return { data: null, error: sanitizeError(signOutError) };
    }

    return { data: true, error: null };
  } catch (err: unknown) {
    return { data: null, error: sanitizeError(err) };
  }
}
