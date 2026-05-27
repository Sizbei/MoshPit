-- =============================================================================
-- 001_create_tables.sql
-- MoshPit core schema: tables, indexes, constraints, and triggers
-- =============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- trigram index for text search on event names


-- -----------------------------------------------------------------------------
-- Custom enum types
-- Using native enums rather than CHECK constraints so the allowed values live
-- in one place and foreign tools (PostgREST, Supabase client) can introspect them.
-- -----------------------------------------------------------------------------

create type collage_type as enum (
  'grid',
  'freeform',
  'strip',
  'polaroid',
  'filmstrip',
  'mosaic',
  'shape',
  'timeline'
);

create type aspect_ratio as enum (
  '1:1',
  '4:5',
  '9:16',
  '16:9',
  'custom'
);

create type event_source as enum (
  'edmtrain',
  'bandsintown',
  'manual'
);

create type sticker_category as enum (
  'rave-art',
  'festival',
  'genre',
  'text',
  'user-uploaded'
);

create type report_reason as enum (
  'spam',
  'inappropriate',
  'copyright',
  'harassment',
  'other'
);

create type report_status as enum (
  'pending',
  'reviewed',
  'resolved',
  'dismissed'
);

create type share_permission as enum (
  'view',
  'edit'
);


-- -----------------------------------------------------------------------------
-- Helper: auto-update updated_at timestamp
-- A single trigger function reused by every table that has an updated_at column.
-- -----------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- =============================================================================
-- PROFILES
-- Extends auth.users with app-specific fields.  Created automatically on signup
-- via a trigger (see 004_functions.sql).
-- =============================================================================

create table profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  username    text unique,
  display_name text,
  avatar_url  text,
  bio         text,
  is_pro      boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint username_length check (char_length(username) between 3 and 30),
  constraint username_format check (username ~ '^[a-zA-Z0-9_]+$'),
  constraint bio_length      check (char_length(bio) <= 500)
);

comment on table profiles is
  'Public user profiles. One-to-one with auth.users via matching PK.';

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();


-- =============================================================================
-- EVENTS_CACHE
-- Locally cached event data pulled from third-party APIs (EDMTrain, Bandsintown)
-- or entered manually.  Treated as a read-mostly cache; service role refreshes it.
-- =============================================================================

create table events_cache (
  id           uuid primary key default uuid_generate_v4(),
  source_id    text not null,
  source       event_source not null,
  name         text not null,
  start_date   timestamptz not null,
  end_date     timestamptz,
  venue        jsonb not null default '{}',
  artists      text[] not null default '{}',
  genres       text[] not null default '{}',
  artwork_url  text,
  ticket_url   text,
  is_festival  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- Prevent duplicate imports of the same external event
  constraint events_cache_source_unique unique (source, source_id)
);

comment on table events_cache is
  'Cached event data from external APIs. Refreshed by service role.';
comment on column events_cache.venue is
  'JSONB: { name, city, state?, country, latitude?, longitude? }';

create trigger events_cache_updated_at
  before update on events_cache
  for each row execute function set_updated_at();

create index idx_events_cache_start_date on events_cache (start_date);
create index idx_events_cache_source     on events_cache (source);
create index idx_events_cache_name_trgm  on events_cache using gin (name gin_trgm_ops);
create index idx_events_cache_genres     on events_cache using gin (genres);


-- =============================================================================
-- COLLAGES
-- The central entity. layout_data is a JSONB blob containing photos, stickers,
-- text overlays, and template info so the client can reconstruct the canvas.
-- =============================================================================

create table collages (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references profiles (id) on delete cascade,
  title            text not null default 'Untitled',
  type             collage_type not null default 'grid',
  aspect_ratio     aspect_ratio not null default '1:1',
  background_color text not null default '#000000',
  layout_data      jsonb not null default '{
    "photos": [],
    "stickers": [],
    "textOverlays": [],
    "templateId": null
  }',
  event_id         uuid references events_cache (id) on delete set null,
  thumbnail_url    text,
  is_public        boolean not null default false,
  is_deleted       boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint title_length check (char_length(title) between 1 and 100),
  constraint background_color_hex check (background_color ~ '^#[0-9a-fA-F]{6}$')
);

comment on table collages is
  'User-created collages. layout_data holds the full canvas state as JSONB.';
comment on column collages.layout_data is
  'JSONB: { photos: CollagePhoto[], stickers: CollageSticker[], textOverlays: TextOverlay[], templateId?: string }';
comment on column collages.is_deleted is
  'Soft-delete flag. Queries should filter is_deleted = false unless doing admin work.';

create trigger collages_updated_at
  before update on collages
  for each row execute function set_updated_at();

-- Primary access pattern: "my collages" list
create index idx_collages_user_id    on collages (user_id) where is_deleted = false;
-- Public feed
create index idx_collages_public     on collages (created_at desc) where is_public = true and is_deleted = false;
-- Event page
create index idx_collages_event_id   on collages (event_id) where event_id is not null and is_deleted = false;
-- Type filter on profile
create index idx_collages_type       on collages (type);


-- =============================================================================
-- COLLAGE_SHARES
-- Junction table allowing a collage owner to share with other users.
-- =============================================================================

create table collage_shares (
  id          uuid primary key default uuid_generate_v4(),
  collage_id  uuid not null references collages (id) on delete cascade,
  shared_by   uuid not null references profiles (id) on delete cascade,
  shared_with uuid not null references profiles (id) on delete cascade,
  permission  share_permission not null default 'view',
  created_at  timestamptz not null default now(),

  -- A user should not receive the same share twice
  constraint unique_share unique (collage_id, shared_with),
  -- Cannot share with yourself
  constraint no_self_share check (shared_by <> shared_with)
);

comment on table collage_shares is
  'Grants another user view or edit access to a specific collage.';

create index idx_collage_shares_shared_with on collage_shares (shared_with);
create index idx_collage_shares_collage_id  on collage_shares (collage_id);


-- =============================================================================
-- STICKER_PACKS
-- =============================================================================

create table sticker_packs (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  category       sticker_category not null,
  thumbnail_url  text,
  sticker_count  integer not null default 0,
  is_premium     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint name_length       check (char_length(name) between 1 and 60),
  constraint sticker_count_gte check (sticker_count >= 0)
);

comment on table sticker_packs is
  'Groups of stickers. sticker_count is maintained by a trigger on the stickers table.';

create trigger sticker_packs_updated_at
  before update on sticker_packs
  for each row execute function set_updated_at();


-- =============================================================================
-- STICKERS
-- =============================================================================

create table stickers (
  id           uuid primary key default uuid_generate_v4(),
  pack_id      uuid not null references sticker_packs (id) on delete cascade,
  name         text not null,
  storage_path text not null,
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),

  constraint sticker_name_length check (char_length(name) between 1 and 60)
);

comment on table stickers is
  'Individual sticker assets. storage_path points to the stickers storage bucket.';

create index idx_stickers_pack_id on stickers (pack_id);
create index idx_stickers_tags    on stickers using gin (tags);


-- =============================================================================
-- USER_FAVORITES
-- Bookmarks / likes on public (or shared) collages.
-- =============================================================================

create table user_favorites (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles (id) on delete cascade,
  collage_id  uuid not null references collages (id) on delete cascade,
  created_at  timestamptz not null default now(),

  constraint unique_favorite unique (user_id, collage_id)
);

comment on table user_favorites is
  'User bookmarks / likes on collages.';

create index idx_user_favorites_user_id    on user_favorites (user_id);
create index idx_user_favorites_collage_id on user_favorites (collage_id);


-- =============================================================================
-- REPORTS
-- Content moderation reports filed by users.
-- =============================================================================

create table reports (
  id          uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references profiles (id) on delete cascade,
  collage_id  uuid not null references collages (id) on delete cascade,
  reason      report_reason not null,
  details     text,
  status      report_status not null default 'pending',
  reviewed_by uuid references profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint details_length check (char_length(details) <= 1000),
  -- Prevent the same user from filing duplicate reports on the same collage
  constraint unique_report  unique (reporter_id, collage_id)
);

comment on table reports is
  'User-submitted moderation reports. Only admins can read/update.';

create trigger reports_updated_at
  before update on reports
  for each row execute function set_updated_at();

create index idx_reports_status     on reports (status) where status = 'pending';
create index idx_reports_collage_id on reports (collage_id);
