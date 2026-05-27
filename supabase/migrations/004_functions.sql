-- =============================================================================
-- 004_functions.sql
-- Database functions and triggers for business logic that must run server-side.
-- =============================================================================


-- =============================================================================
-- 1. create_profile_on_signup()
-- Trigger function on auth.users AFTER INSERT.  Creates a matching profiles
-- row so every user always has a profile.  Runs as SECURITY DEFINER so it
-- bypasses RLS (the new user's JWT is not yet available at insert time).
-- =============================================================================

create or replace function create_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    -- Derive a default username from email (before @), falling back to a
    -- uuid fragment if email is null.  Users can change it later.
    coalesce(
      split_part(new.email, '@', 1),
      'user_' || substr(new.id::text, 1, 8)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  );
  return new;
end;
$$;

comment on function create_profile_on_signup() is
  'Auto-creates a profiles row when a new user signs up via auth.users.';

-- Attach trigger to auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function create_profile_on_signup();


-- =============================================================================
-- 2. increment_sticker_count() / decrement_sticker_count()
-- Keep sticker_packs.sticker_count in sync whenever stickers are added/removed.
-- Using two separate functions avoids branching on TG_OP and is easier to test.
-- =============================================================================

create or replace function increment_sticker_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update sticker_packs
     set sticker_count = sticker_count + 1
   where id = new.pack_id;
  return new;
end;
$$;

create or replace function decrement_sticker_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update sticker_packs
     set sticker_count = sticker_count - 1
   where id = old.pack_id;
  return old;
end;
$$;

create trigger stickers_after_insert
  after insert on stickers
  for each row execute function increment_sticker_count();

create trigger stickers_after_delete
  after delete on stickers
  for each row execute function decrement_sticker_count();

comment on function increment_sticker_count() is
  'Bumps sticker_packs.sticker_count when a sticker is added.';
comment on function decrement_sticker_count() is
  'Decrements sticker_packs.sticker_count when a sticker is removed.';


-- =============================================================================
-- 3. get_public_collages(p_limit, p_offset)
-- Paginated public feed.  Returns collages with the creator's profile info
-- joined in.  Ordered newest-first.
-- =============================================================================

create or replace function get_public_collages(
  p_limit  integer default 20,
  p_offset integer default 0
)
returns table (
  id               uuid,
  user_id          uuid,
  title            text,
  type             collage_type,
  aspect_ratio     aspect_ratio,
  background_color text,
  layout_data      jsonb,
  event_id         uuid,
  thumbnail_url    text,
  created_at       timestamptz,
  updated_at       timestamptz,
  -- profile fields
  username         text,
  display_name     text,
  avatar_url       text,
  -- aggregates
  favorite_count   bigint
)
language sql
stable                     -- reads only, safe for replication
security invoker           -- respects caller's RLS
as $$
  select
    c.id,
    c.user_id,
    c.title,
    c.type,
    c.aspect_ratio,
    c.background_color,
    c.layout_data,
    c.event_id,
    c.thumbnail_url,
    c.created_at,
    c.updated_at,
    p.username,
    p.display_name,
    p.avatar_url,
    coalesce(f.cnt, 0) as favorite_count
  from collages c
  join profiles p on p.id = c.user_id
  left join lateral (
    select count(*) as cnt
      from user_favorites uf
     where uf.collage_id = c.id
  ) f on true
  where c.is_public = true
    and c.is_deleted = false
  order by c.created_at desc
  limit p_limit
  offset p_offset;
$$;

comment on function get_public_collages(integer, integer) is
  'Paginated public collage feed with creator profile and favorite count.';


-- =============================================================================
-- 4. get_event_collages(p_event_id)
-- All non-deleted collages for a specific event, newest first.
-- =============================================================================

create or replace function get_event_collages(
  p_event_id uuid
)
returns table (
  id               uuid,
  user_id          uuid,
  title            text,
  type             collage_type,
  aspect_ratio     aspect_ratio,
  background_color text,
  layout_data      jsonb,
  thumbnail_url    text,
  is_public        boolean,
  created_at       timestamptz,
  updated_at       timestamptz,
  username         text,
  display_name     text,
  avatar_url       text
)
language sql
stable
security invoker
as $$
  select
    c.id,
    c.user_id,
    c.title,
    c.type,
    c.aspect_ratio,
    c.background_color,
    c.layout_data,
    c.thumbnail_url,
    c.is_public,
    c.created_at,
    c.updated_at,
    p.username,
    p.display_name,
    p.avatar_url
  from collages c
  join profiles p on p.id = c.user_id
  where c.event_id = p_event_id
    and c.is_deleted = false
  order by c.created_at desc;
$$;

comment on function get_event_collages(uuid) is
  'All collages for a given event. RLS still applies (caller sees only what they have access to).';


-- =============================================================================
-- 5. soft_delete_collage(p_collage_id)
-- Sets is_deleted = true rather than removing the row.  This preserves data
-- for potential undo and lets admins review deleted content.
-- Returns the updated row or raises an exception if not found / not owned.
-- =============================================================================

create or replace function soft_delete_collage(
  p_collage_id uuid
)
returns collages
language plpgsql
security invoker                      -- RLS check on the UPDATE
as $$
declare
  v_collage collages;
begin
  update collages
     set is_deleted = true
   where id = p_collage_id
     and user_id = auth.uid()         -- belt-and-suspenders: explicit ownership check
     and is_deleted = false            -- idempotency guard
  returning * into v_collage;

  if v_collage is null then
    raise exception 'Collage not found or not owned by current user'
      using errcode = 'P0002';        -- no_data_found
  end if;

  return v_collage;
end;
$$;

comment on function soft_delete_collage(uuid) is
  'Soft-deletes a collage. Only the owner can call this (enforced by RLS + explicit check).';


-- =============================================================================
-- 6. restore_collage(p_collage_id)
-- Undo a soft delete.  Provided as a convenience so the client does not need
-- to craft a raw UPDATE.
-- =============================================================================

create or replace function restore_collage(
  p_collage_id uuid
)
returns collages
language plpgsql
security invoker
as $$
declare
  v_collage collages;
begin
  update collages
     set is_deleted = false
   where id = p_collage_id
     and user_id = auth.uid()
     and is_deleted = true
  returning * into v_collage;

  if v_collage is null then
    raise exception 'Collage not found, not deleted, or not owned by current user'
      using errcode = 'P0002';
  end if;

  return v_collage;
end;
$$;

comment on function restore_collage(uuid) is
  'Restores a soft-deleted collage. Only the owner can call this.';
