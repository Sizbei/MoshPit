-- =============================================================================
-- 003_storage_policies.sql
-- Storage bucket creation and RLS policies.
--
-- Supabase Storage uses the storage schema. Buckets are rows in
-- storage.buckets; object-level access is controlled via RLS on
-- storage.objects.
--
-- Folder convention:  <bucket>/<user_id>/<filename>
-- This lets us scope access per user with a simple path prefix check.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Create buckets
-- -----------------------------------------------------------------------------

-- Avatars: profile pictures
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,                                          -- publicly readable (no auth needed to view)
  2097152,                                       -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Collages: user-uploaded photos and exported collage images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'collages',
  'collages',
  false,                                         -- access controlled by RLS
  10485760,                                      -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Stickers: pack assets managed by admins
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'stickers',
  'stickers',
  true,                                          -- public read (sticker art is not secret)
  5242880,                                       -- 5 MB
  array['image/png', 'image/webp', 'image/svg+xml']
);

-- Exports: high-res exported images for download
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exports',
  'exports',
  false,                                         -- private per-user
  52428800,                                      -- 50 MB
  array['image/jpeg', 'image/png', 'image/webp']
);


-- =============================================================================
-- AVATARS POLICIES
-- Public read (bucket is public). Users upload/update/delete in their own folder.
-- =============================================================================

-- Upload: user can insert into avatars/<their_uid>/
create policy avatars_insert_own
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update: user can overwrite their own avatar
create policy avatars_update_own
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete: user can remove their own avatar
create policy avatars_delete_own
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: anyone can read (bucket is public, but we add this for completeness
-- in case the bucket is later switched to private)
create policy avatars_select_any
  on storage.objects for select
  using (bucket_id = 'avatars');


-- =============================================================================
-- COLLAGES POLICIES
-- Users upload into collages/<their_uid>/.
-- Read access mirrors the collages table: own, public, or shared.
-- =============================================================================

-- Upload
create policy collages_storage_insert_own
  on storage.objects for insert
  with check (
    bucket_id = 'collages'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update own files (e.g., re-upload a thumbnail)
create policy collages_storage_update_own
  on storage.objects for update
  using (
    bucket_id = 'collages'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Delete own files
create policy collages_storage_delete_own
  on storage.objects for delete
  using (
    bucket_id = 'collages'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: owner can always read their own files
create policy collages_storage_select_own
  on storage.objects for select
  using (
    bucket_id = 'collages'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read: any authenticated user can read files belonging to a public collage.
-- We match the folder owner (first path segment) to a collage row that is
-- public and references a storage path in this folder.
create policy collages_storage_select_public
  on storage.objects for select
  using (
    bucket_id = 'collages'
    and auth.role() = 'authenticated'
    and exists (
      select 1
        from collages c
       where c.user_id::text = (storage.foldername(name))[1]
         and c.is_public = true
         and c.is_deleted = false
    )
  );

-- Read: shared collage recipients can read the owner's collage files
create policy collages_storage_select_shared
  on storage.objects for select
  using (
    bucket_id = 'collages'
    and auth.role() = 'authenticated'
    and exists (
      select 1
        from collage_shares cs
        join collages c on c.id = cs.collage_id
       where cs.shared_with = auth.uid()
         and c.user_id::text = (storage.foldername(name))[1]
    )
  );


-- =============================================================================
-- STICKERS POLICIES
-- Public bucket so anyone can read. Only service_role can write.
-- =============================================================================

create policy stickers_storage_select_any
  on storage.objects for select
  using (bucket_id = 'stickers');

create policy stickers_storage_insert_admin
  on storage.objects for insert
  with check (
    bucket_id = 'stickers'
    and auth.role() = 'service_role'
  );

create policy stickers_storage_update_admin
  on storage.objects for update
  using (
    bucket_id = 'stickers'
    and auth.role() = 'service_role'
  );

create policy stickers_storage_delete_admin
  on storage.objects for delete
  using (
    bucket_id = 'stickers'
    and auth.role() = 'service_role'
  );


-- =============================================================================
-- EXPORTS POLICIES
-- Strictly private. Users can only access their own folder.
-- =============================================================================

create policy exports_insert_own
  on storage.objects for insert
  with check (
    bucket_id = 'exports'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy exports_select_own
  on storage.objects for select
  using (
    bucket_id = 'exports'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy exports_update_own
  on storage.objects for update
  using (
    bucket_id = 'exports'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy exports_delete_own
  on storage.objects for delete
  using (
    bucket_id = 'exports'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
