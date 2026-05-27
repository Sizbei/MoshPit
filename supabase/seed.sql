-- =============================================================================
-- seed.sql
-- Default sticker packs and sample stickers for local development / staging.
--
-- NOTE: sticker_count is maintained by the increment_sticker_count trigger,
-- so we insert packs first (with sticker_count = 0) and the trigger
-- increments automatically as we insert stickers.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Deterministic UUIDs for seed data so we can reference pack IDs in sticker rows.
-- Using uuid_generate_v5 with the DNS namespace and a human-readable name
-- produces the same UUID on every run, making the seed idempotent.
-- -----------------------------------------------------------------------------

do $$
declare
  ns uuid := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';  -- RFC 4122 DNS namespace
  pack_neon      uuid := uuid_generate_v5(ns, 'neon-basics');
  pack_bass      uuid := uuid_generate_v5(ns, 'bass-culture');
  pack_festival  uuid := uuid_generate_v5(ns, 'festival-essentials');
  pack_faces     uuid := uuid_generate_v5(ns, 'rave-faces');
  pack_text      uuid := uuid_generate_v5(ns, 'text-stickers');
begin

  -- ==========================================================================
  -- STICKER PACKS
  -- ==========================================================================

  insert into sticker_packs (id, name, category, thumbnail_url, is_premium)
  values
    (pack_neon,     'Neon Basics',          'rave-art',  'stickers/packs/neon-basics/thumb.png',          false),
    (pack_bass,     'Bass Culture',         'genre',     'stickers/packs/bass-culture/thumb.png',         false),
    (pack_festival, 'Festival Essentials',  'festival',  'stickers/packs/festival-essentials/thumb.png',  false),
    (pack_faces,    'Rave Faces',           'rave-art',  'stickers/packs/rave-faces/thumb.png',           true),
    (pack_text,     'Text Stickers',        'text',      'stickers/packs/text-stickers/thumb.png',        false)
  on conflict (id) do nothing;


  -- ==========================================================================
  -- STICKERS
  -- Each pack gets 4-6 sample stickers.  storage_path follows the convention
  -- stickers/packs/<pack-slug>/<filename>.png
  --
  -- The trigger on stickers will auto-increment sticker_count on each pack.
  -- ==========================================================================

  -- Neon Basics
  insert into stickers (pack_id, name, storage_path, tags) values
    (pack_neon, 'Lightning Bolt',   'stickers/packs/neon-basics/lightning-bolt.png',   array['neon', 'electric', 'energy']),
    (pack_neon, 'Laser Beam',       'stickers/packs/neon-basics/laser-beam.png',       array['neon', 'laser', 'light']),
    (pack_neon, 'Neon Star',        'stickers/packs/neon-basics/neon-star.png',        array['neon', 'star', 'glow']),
    (pack_neon, 'Glow Ring',        'stickers/packs/neon-basics/glow-ring.png',        array['neon', 'ring', 'circle']),
    (pack_neon, 'Electric Heart',   'stickers/packs/neon-basics/electric-heart.png',   array['neon', 'heart', 'love'])
  on conflict do nothing;

  -- Bass Culture
  insert into stickers (pack_id, name, storage_path, tags) values
    (pack_bass, 'Subwoofer',        'stickers/packs/bass-culture/subwoofer.png',       array['bass', 'speaker', 'dubstep']),
    (pack_bass, 'Sound Wave',       'stickers/packs/bass-culture/sound-wave.png',      array['bass', 'wave', 'audio']),
    (pack_bass, 'Bass Drop',        'stickers/packs/bass-culture/bass-drop.png',       array['bass', 'drop', 'dubstep']),
    (pack_bass, 'Headphones',       'stickers/packs/bass-culture/headphones.png',      array['bass', 'headphones', 'dj']),
    (pack_bass, 'Vinyl Record',     'stickers/packs/bass-culture/vinyl-record.png',    array['bass', 'vinyl', 'retro'])
  on conflict do nothing;

  -- Festival Essentials
  insert into stickers (pack_id, name, storage_path, tags) values
    (pack_festival, 'Wristband',    'stickers/packs/festival-essentials/wristband.png',    array['festival', 'wristband', 'ticket']),
    (pack_festival, 'Tent',         'stickers/packs/festival-essentials/tent.png',          array['festival', 'camping', 'tent']),
    (pack_festival, 'Main Stage',   'stickers/packs/festival-essentials/main-stage.png',   array['festival', 'stage', 'concert']),
    (pack_festival, 'Crowd',        'stickers/packs/festival-essentials/crowd.png',         array['festival', 'crowd', 'people']),
    (pack_festival, 'Ferris Wheel', 'stickers/packs/festival-essentials/ferris-wheel.png', array['festival', 'carnival', 'ride']),
    (pack_festival, 'Totem',        'stickers/packs/festival-essentials/totem.png',         array['festival', 'totem', 'flag'])
  on conflict do nothing;

  -- Rave Faces (premium)
  insert into stickers (pack_id, name, storage_path, tags) values
    (pack_faces, 'Smiley',          'stickers/packs/rave-faces/smiley.png',            array['face', 'smiley', 'happy']),
    (pack_faces, 'Alien',           'stickers/packs/rave-faces/alien.png',             array['face', 'alien', 'ufo']),
    (pack_faces, 'Gas Mask',        'stickers/packs/rave-faces/gas-mask.png',          array['face', 'mask', 'industrial']),
    (pack_faces, 'Skull',           'stickers/packs/rave-faces/skull.png',             array['face', 'skull', 'dark'])
  on conflict do nothing;

  -- Text Stickers
  insert into stickers (pack_id, name, storage_path, tags) values
    (pack_text, 'PLUR',             'stickers/packs/text-stickers/plur.png',           array['text', 'plur', 'rave']),
    (pack_text, 'SEND IT',          'stickers/packs/text-stickers/send-it.png',        array['text', 'hype', 'energy']),
    (pack_text, 'HEADLINER',       'stickers/packs/text-stickers/headliner.png',      array['text', 'headliner', 'vip']),
    (pack_text, 'BASS FACE',       'stickers/packs/text-stickers/bass-face.png',      array['text', 'bass', 'face']),
    (pack_text, 'GOOD VIBES',      'stickers/packs/text-stickers/good-vibes.png',     array['text', 'vibes', 'positive'])
  on conflict do nothing;

end;
$$;
