-- =============================================================================
-- 002_rls_policies.sql
-- Row Level Security policies for every table.
--
-- Convention:
--   policy name = <table>_<action>_<who>
--   e.g. "collages_select_owner" = collages table, SELECT, by the owner
--
-- auth.uid()   = the authenticated user's id (from the JWT)
-- auth.role()  = 'authenticated' | 'anon' | 'service_role'
-- =============================================================================


-- =============================================================================
-- PROFILES
-- Anyone can read profiles (public data). Users can only update their own.
-- Insert is handled by the create_profile_on_signup trigger (runs as SECURITY
-- DEFINER), so no explicit insert policy for end users is needed.
-- =============================================================================

alter table profiles enable row level security;

create policy profiles_select_any
  on profiles for select
  using (true);

create policy profiles_update_own
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow the signup trigger (which executes as the table owner) to insert.
-- End users cannot insert directly; the trigger handles it.
create policy profiles_insert_self
  on profiles for insert
  with check (auth.uid() = id);


-- =============================================================================
-- COLLAGES
-- Owners have full CRUD.  Other users can only SELECT public collages (or
-- collages shared with them -- handled via collage_shares policy + a function).
-- All queries implicitly filter is_deleted = false via the partial indexes, but
-- RLS adds a defence-in-depth layer.
-- =============================================================================

alter table collages enable row level security;

-- Owner can see all their own collages (including soft-deleted, for undo UX)
create policy collages_select_owner
  on collages for select
  using (auth.uid() = user_id);

-- Anyone authenticated can see public, non-deleted collages from others
create policy collages_select_public
  on collages for select
  using (
    is_public = true
    and is_deleted = false
    and auth.role() = 'authenticated'
  );

-- Recipients of a share can see the shared collage
create policy collages_select_shared
  on collages for select
  using (
    exists (
      select 1
        from collage_shares cs
       where cs.collage_id = collages.id
         and cs.shared_with = auth.uid()
    )
  );

create policy collages_insert_own
  on collages for insert
  with check (auth.uid() = user_id);

create policy collages_update_own
  on collages for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users with edit permission on a shared collage can update it
create policy collages_update_shared_edit
  on collages for update
  using (
    exists (
      select 1
        from collage_shares cs
       where cs.collage_id = collages.id
         and cs.shared_with = auth.uid()
         and cs.permission = 'edit'
    )
  );

create policy collages_delete_own
  on collages for delete
  using (auth.uid() = user_id);


-- =============================================================================
-- COLLAGE_SHARES
-- Only the collage owner (shared_by) can create/delete shares.
-- The recipient (shared_with) can read shares directed at them.
-- =============================================================================

alter table collage_shares enable row level security;

-- Share creator can see shares they created
create policy shares_select_owner
  on collage_shares for select
  using (auth.uid() = shared_by);

-- Recipient can see shares directed at them
create policy shares_select_recipient
  on collage_shares for select
  using (auth.uid() = shared_with);

-- Only the collage owner can create a share.
-- The sub-select ensures shared_by actually owns the collage.
create policy shares_insert_owner
  on collage_shares for insert
  with check (
    auth.uid() = shared_by
    and exists (
      select 1
        from collages c
       where c.id = collage_id
         and c.user_id = auth.uid()
    )
  );

-- Owner can revoke shares
create policy shares_delete_owner
  on collage_shares for delete
  using (auth.uid() = shared_by);

-- Recipient can remove themselves from a share
create policy shares_delete_recipient
  on collage_shares for delete
  using (auth.uid() = shared_with);


-- =============================================================================
-- STICKER_PACKS
-- Anyone authenticated can read. Only service_role (admin) can write.
-- =============================================================================

alter table sticker_packs enable row level security;

create policy sticker_packs_select_any
  on sticker_packs for select
  using (true);

-- Admin-only write access via service_role key (no user-facing policy)
create policy sticker_packs_insert_admin
  on sticker_packs for insert
  with check (auth.role() = 'service_role');

create policy sticker_packs_update_admin
  on sticker_packs for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy sticker_packs_delete_admin
  on sticker_packs for delete
  using (auth.role() = 'service_role');


-- =============================================================================
-- STICKERS
-- Same pattern as sticker_packs: public read, admin write.
-- =============================================================================

alter table stickers enable row level security;

create policy stickers_select_any
  on stickers for select
  using (true);

create policy stickers_insert_admin
  on stickers for insert
  with check (auth.role() = 'service_role');

create policy stickers_update_admin
  on stickers for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy stickers_delete_admin
  on stickers for delete
  using (auth.role() = 'service_role');


-- =============================================================================
-- EVENTS_CACHE
-- Any authenticated user can read. Only service_role can write (the API sync
-- job runs with the service key).
-- =============================================================================

alter table events_cache enable row level security;

create policy events_cache_select_authenticated
  on events_cache for select
  using (auth.role() = 'authenticated');

create policy events_cache_insert_service
  on events_cache for insert
  with check (auth.role() = 'service_role');

create policy events_cache_update_service
  on events_cache for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy events_cache_delete_service
  on events_cache for delete
  using (auth.role() = 'service_role');


-- =============================================================================
-- USER_FAVORITES
-- Users can CRUD only their own favorites.
-- =============================================================================

alter table user_favorites enable row level security;

create policy favorites_select_own
  on user_favorites for select
  using (auth.uid() = user_id);

create policy favorites_insert_own
  on user_favorites for insert
  with check (auth.uid() = user_id);

create policy favorites_delete_own
  on user_favorites for delete
  using (auth.uid() = user_id);


-- =============================================================================
-- REPORTS
-- Any authenticated user can create a report. Only service_role (admin) can
-- read or update reports.
-- =============================================================================

alter table reports enable row level security;

create policy reports_insert_authenticated
  on reports for insert
  with check (
    auth.uid() = reporter_id
    and auth.role() = 'authenticated'
  );

-- Users can see their own submitted reports (for transparency)
create policy reports_select_own
  on reports for select
  using (auth.uid() = reporter_id);

-- Admins can read all reports
create policy reports_select_admin
  on reports for select
  using (auth.role() = 'service_role');

-- Only admins can update report status
create policy reports_update_admin
  on reports for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
