# MoshPit — Rave Photo Collage App

## Vision
The go-to collage app for ravers. Tag your events, slap on artist-inspired stickers, and build mosaic/freeform/timeline collages that capture the energy of a night out.

## Tech Stack
- **React Native** + **Expo SDK 53** (Expo Go compatible — no dev client needed)
- **@shopify/react-native-skia** — GPU-accelerated 2D canvas for rendering collages
- **react-native-gesture-handler** + **react-native-reanimated** — 60fps pinch/pan/rotate
- **expo-router** — file-based navigation
- **Zustand** — lightweight state management (serializable to JSON for save/load)
- **Supabase** — auth, Postgres DB, file storage, realtime
- **expo-image-picker** + **expo-image-manipulator** — photo selection and preprocessing

## Architecture

```
src/
├── app/                          # expo-router screens
│   ├── (tabs)/
│   │   ├── _layout.tsx           # tab navigator
│   │   ├── index.tsx             # home — saved collages gallery
│   │   ├── create.tsx            # new collage entry point
│   │   ├── events.tsx            # browse/search events
│   │   └── profile.tsx           # user profile + settings
│   ├── editor/
│   │   └── [id].tsx              # main collage editor
│   ├── export/
│   │   └── [id].tsx              # preview + export + share
│   └── _layout.tsx               # root layout
├── components/
│   ├── canvas/
│   │   ├── CollageCanvas.tsx     # Skia <Canvas> root
│   │   ├── CollagePhoto.tsx      # individual photo with transforms
│   │   ├── StickerOverlay.tsx    # sticker layer
│   │   └── TextOverlay.tsx       # text layer
│   ├── editor/
│   │   ├── LayoutPicker.tsx      # template selection carousel
│   │   ├── FilterPicker.tsx      # color matrix presets
│   │   ├── StickerPicker.tsx     # sticker browser/search
│   │   ├── ToolBar.tsx           # bottom editing toolbar
│   │   └── PhotoTray.tsx         # selected photos strip
│   ├── collage-types/
│   │   ├── GridLayout.tsx        # grid collage renderer
│   │   ├── FreeformLayout.tsx    # scatter/freeform renderer
│   │   ├── StripLayout.tsx       # long/strip collage renderer
│   │   ├── PolaroidLayout.tsx    # polaroid-style renderer
│   │   ├── FilmStripLayout.tsx   # film strip renderer
│   │   ├── MosaicLayout.tsx      # photo mosaic renderer
│   │   ├── ShapeLayout.tsx       # shape collage renderer
│   │   └── TimelineLayout.tsx    # calendar/timeline renderer
│   ├── events/
│   │   ├── EventCard.tsx         # event display card
│   │   ├── EventSearch.tsx       # search/filter events
│   │   └── EventTag.tsx          # event tag on collage
│   └── shared/
│       ├── PhotoPicker.tsx       # multi-select photo picker
│       └── GlowText.tsx         # neon text component
├── hooks/
│   ├── useCollageState.ts        # zustand store for collage state
│   ├── usePhotoLoader.ts         # load + downscale images for Skia
│   ├── useExport.ts              # Skia offscreen render + save
│   ├── useGestures.ts            # pan/pinch/rotate gesture setup
│   └── useSupabase.ts            # auth + storage + DB operations
├── services/
│   ├── supabase.ts               # Supabase client init
│   ├── events/
│   │   ├── edmtrain.ts           # EDMTrain API client
│   │   ├── bandsintown.ts        # Bandsintown API client
│   │   └── eventAggregator.ts    # unified event interface
│   └── stickers/
│       └── stickerService.ts     # sticker pack management
├── utils/
│   ├── layouts.ts                # layout template definitions (rect arrays)
│   ├── filters.ts                # Skia color matrix presets
│   ├── imageUtils.ts             # resize, compress, EXIF helpers
│   ├── mosaic.ts                 # photo mosaic algorithm (KD-tree, color matching)
│   └── colors.ts                 # rave color palette constants
└── types/
    ├── collage.ts                # collage, photo, sticker types
    ├── event.ts                  # event data model
    └── sticker.ts                # sticker pack types
```

## Data Models

### Collage (Supabase + Zustand)
```typescript
type CollageType = 'grid' | 'freeform' | 'strip' | 'polaroid' | 'filmstrip' | 'mosaic' | 'shape' | 'timeline';

interface Collage {
  id: string;
  userId: string;
  title: string;
  type: CollageType;
  aspectRatio: '1:1' | '4:5' | '9:16' | '16:9' | 'custom';
  backgroundColor: string;
  photos: CollagePhoto[];
  stickers: CollageSticker[];
  textOverlays: TextOverlay[];
  eventId?: string;          // tagged event
  templateId?: string;       // layout template used
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface CollagePhoto {
  id: string;
  uri: string;               // local or supabase storage URL
  storagePath?: string;       // supabase storage path
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  scale: number;
  zIndex: number;
  filter?: ColorMatrix;       // Skia color matrix
  cropRect?: { x: number; y: number; width: number; height: number };
}

interface CollageSticker {
  id: string;
  stickerPackId: string;
  stickerAssetId: string;
  uri: string;
  position: { x: number; y: number };
  scale: number;
  rotation: number;
  zIndex: number;
}

interface TextOverlay {
  id: string;
  text: string;
  position: { x: number; y: number };
  fontSize: number;
  fontFamily: string;
  color: string;
  rotation: number;
  glowEnabled: boolean;
  glowColor?: string;
}
```

### Event (unified from multiple sources)
```typescript
interface RaveEvent {
  id: string;
  sourceId: string;
  source: 'edmtrain' | 'bandsintown' | 'manual';
  name: string;
  startDate: string;         // ISO 8601
  endDate?: string;
  venue: {
    name: string;
    city: string;
    state?: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };
  artists: string[];
  genres: string[];
  artworkUrl?: string;
  ticketUrl?: string;
  isFestival: boolean;
}
```

### Sticker Pack
```typescript
interface StickerPack {
  id: string;
  name: string;              // "Neon Basics", "Festival Vibes", "Bass Culture"
  category: 'rave-art' | 'festival' | 'genre' | 'text' | 'user-uploaded';
  thumbnailUrl: string;
  stickerCount: number;
  isPremium: boolean;
}

interface Sticker {
  id: string;
  packId: string;
  name: string;
  uri: string;               // PNG with transparency
  tags: string[];             // searchable tags
}
```

## Supabase Schema

```sql
-- Users extend Supabase auth.users
create table profiles (
  id uuid primary key references auth.users,
  username text unique,
  avatar_url text,
  created_at timestamptz default now()
);

create table collages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles not null,
  title text,
  type text not null,
  layout_data jsonb not null,       -- full CollageState serialized
  aspect_ratio text default '1:1',
  event_id text,                    -- reference to tagged event
  thumbnail_url text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table sticker_packs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  thumbnail_url text,
  sticker_count int default 0,
  is_premium boolean default false,
  created_at timestamptz default now()
);

create table stickers (
  id uuid primary key default gen_random_uuid(),
  pack_id uuid references sticker_packs on delete cascade,
  name text,
  storage_path text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- RLS policies
alter table collages enable row level security;
create policy "Users CRUD own collages" on collages
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Public collages are viewable" on collages
  for select to authenticated
  using (is_public = true);

-- Storage buckets
-- collages: user-uploaded photos and exported collages
-- stickers: sticker pack assets
```

## Collage Types — Implementation Details

### Phase 1: Core (Low complexity, ship first)

**1. Grid Collage**
- Pre-defined layout templates as arrays of normalized rectangles
- 50+ templates: 2x2, 3x3, 1+3, 2+4, L-shape, asymmetric variations
- Tap cell → photo picker opens for that cell
- Drag border between cells to resize proportions
- Skia `<Image>` with `fit="cover"` per cell

**2. Freeform / Scatter Collage**
- Each photo independently draggable, pinchable, rotatable
- `Gesture.Simultaneous(pan, pinch, rotation)` per photo
- Auto-generate initial scatter with random positions/rotations
- "Shuffle" button re-randomizes layout
- Tap to bring photo to front (z-index)
- Snap guides (BeFunky-style) — alignment lines appear at edges/centers

**3. Polaroid Style**
- White border frame (thick bottom for caption)
- Handwriting font for captions (Caveat, Shadows Into Light)
- Random slight rotations for scatter effect
- Background textures: wood table, cork board, dark surface

**4. Film Strip**
- 35mm negative aesthetic with sprocket holes
- 3-6 frames in horizontal or vertical strip
- Frame numbers at bottom
- Optional negative (inverted) effect toggle

### Phase 2: Medium complexity, high value

**5. Long / Strip Collage**
- Vertical or horizontal scrollable strip
- All photos same width (vertical) or height (horizontal)
- Timestamp labels between photos for event timeline
- Perfect for "my night" progression posts

**6. Story Collage**
- Sequential photos + text blocks
- Chapters: Intro → Getting Ready → Arrival → Peak → Friends → Sunrise
- Scroll-triggered fade-in animations
- Choose text styles per section

**7. Timeline / Calendar**
- Chronological arrangement with EXIF date extraction
- Vertical timeline with alternating left/right photo cards
- Horizontal scrollable for multi-day festivals
- Auto-generated date markers

### Phase 3: High complexity, wow factor

**8. Photo Mosaic**
- Target image (artist face, festival logo) composed of hundreds of small photos
- Algorithm: average color per tile → KD-tree nearest neighbor matching
- CIELAB color space for perceptual accuracy
- Adjustable tile density (grid size)
- Post-processing: 15-25% target image overlay for distance readability
- Redundancy prevention: same photo can't appear in adjacent tiles

**9. Shape Collage**
- Photos arranged inside custom shapes (heart, star, music note, headphones)
- SVG clip-path approach for v1 (simpler)
- Shape library: heart, star, lightning bolt, music note, speaker, bass drop symbol
- Custom text shapes ("EDC", "PLUR")

### Phase 4: Specialized

**10. Lineup Poster**
- Festival poster aesthetic with tiered artist names
- Photos integrated with artist names in lineup hierarchy
- Custom fonts, gradient backgrounds
- User enters artist names + assigns tiers

## Rave-Specific Effects

### Neon Glow
- Skia blur filter + additive blend for glow on text and borders
- Color palette: Hot Pink (#FF10F0), Electric Blue (#00BFFF), Acid Green (#39FF14), UV Purple (#BF00FF), Laser Red (#FF073A)

### Stage Lighting Filters
- Skia ColorMatrix presets simulating stage wash colors:
  - "Main Stage" — pink/purple wash
  - "Techno Tent" — red/orange strobe
  - "Trance Arena" — blue/cyan
  - "Bass Stage" — green/yellow
  - "Sunrise Set" — warm golden

### Festival Wristband Borders
- Striped gradient borders mimicking festival wristbands
- Fabric texture overlay option

### Light Trail Overlays
- Pre-rendered PNG overlays of light trails and laser beams
- Blend mode: screen/lighten for realistic light-on-dark compositing

## Sticker Strategy

### Tier 1: Original Rave Art (launch — no legal risk)
Commission or create original sticker packs:
- **Neon Basics** — lightning bolts, stars, hearts, arrows in neon colors
- **Bass Culture** — speakers, subwoofers, soundwaves, headphones
- **Festival Essentials** — kandi bracelets, PLUR beads, flow toys, totems
- **Rave Faces** — smiley faces, alien heads, third eyes, gas masks
- **Genre Icons** — turntables, CDJs, synths, drum machines
- **Text Stickers** — "PLUR", "BASS FACE", "SEND IT", "ONE MORE SONG", "RAVE FAM"
- **Shapes** — geometric sacred geometry, fractals, mandalas

### Tier 2: User-Uploaded (v2 — moderate risk with DMCA)
- Users upload their own stickers (including artist logos they find)
- DMCA takedown process for copyright claims
- Community voting/curation
- Terms of Service shift liability to uploaders

### Tier 3: Official Partnerships (v3+ — zero risk)
- Approach independent labels first (Monstercat, Dim Mak, mau5trap)
- Offer revenue share or promotional value
- Co-branded sticker packs with official logos
- Start with smaller/accessible artists

## Event Integration

### Data Sources (Priority Order)
1. **EDMTrain API** — free, documented, US EDM events
   - `GET /api/events?client=KEY&locationIds=X&startDate=Y`
   - Filter: `includeElectronicGenreInd=true`
   - Caveat: can't store historical events, data must be <24hrs old

2. **Bandsintown API** — free, global, artist-centric
   - `GET /artists/{name}/events?app_id=KEY`
   - Limitation: must know artist name first (no event search)
   - Good for enriching events found via EDMTrain

3. **Manual entry** — user types event name, date, venue
   - Always available as fallback
   - Community can contribute events others can tag

### Event Feature Flow
1. User creates collage → taps "Tag Event"
2. Search by event name, artist, or city
3. Select event → event name/date/venue badge appears on collage
4. Events serve as community organizing — browse all collages from an event

## Monetization Plan

### Free Tier
- All collage types
- 5 free sticker packs (Neon Basics, Bass Culture, Festival Essentials, Rave Faces, Text Stickers)
- Export up to 1080p
- Watermark on exported collages
- Ads between editing sessions (never during)

### MoshPit Pro ($4.99/month, $29.99/year, $49.99 lifetime)
- All sticker packs (current + future)
- Watermark-free export
- 4K export
- Ad-free
- Cloud sync (save/load collages across devices)
- Premium filters and effects
- Priority access to new collage types
- Custom sticker uploads

### Paywall Strategy
- **"Moment of success" paywall** — let users create freely, show paywall at export
- Free users can remove watermark by watching a short ad (InShot model)
- Never pay-to-save (biggest complaint across competitors)
- Never unskippable ads before save

## Development Phases

### Phase 1: MVP (Weeks 1-3)
- [ ] Expo Router navigation setup (tabs + editor stack)
- [ ] Supabase auth (email + Google + Apple sign-in)
- [ ] Photo picker with multi-select
- [ ] Image preprocessing pipeline (downscale to 1500px max)
- [ ] Skia canvas with single photo rendering
- [ ] Grid collage with 12 templates
- [ ] Basic gestures (pan, pinch, rotate per photo)
- [ ] 1 sticker pack (Neon Basics, 20 stickers)
- [ ] Export to camera roll (1080p)
- [ ] Save/load collages to Supabase

### Phase 2: Core Experience (Weeks 4-6)
- [ ] Freeform collage mode
- [ ] Polaroid and Film Strip modes
- [ ] 3 more sticker packs
- [ ] Neon glow text overlays
- [ ] Stage lighting filter presets
- [ ] Snap/alignment guides in freeform mode
- [ ] Undo/redo history
- [ ] Social sharing (native share sheet)
- [ ] Home gallery with collage thumbnails

### Phase 3: Events + Community (Weeks 7-9)
- [ ] EDMTrain API integration
- [ ] Bandsintown API integration
- [ ] Event search + browse screen
- [ ] Tag collages with events
- [ ] Manual event entry
- [ ] Event-based collage feed (see others' collages from same event)
- [ ] Long/Strip collage mode
- [ ] Story collage mode

### Phase 4: Advanced Collages (Weeks 10-12)
- [ ] Photo Mosaic algorithm (KD-tree + CIELAB matching)
- [ ] Shape collage (clip-path approach)
- [ ] Timeline/Calendar collage with EXIF dates
- [ ] Lineup Poster mode
- [ ] Festival wristband borders
- [ ] Light trail overlays
- [ ] More sticker packs (Genre Icons, Shapes)

### Phase 5: Monetization + Polish (Weeks 13-15)
- [ ] Pro subscription (RevenueCat or expo-in-app-purchases)
- [ ] Watermark system
- [ ] Ad integration (non-intrusive)
- [ ] 4K export for Pro users
- [ ] Cloud sync
- [ ] User-uploaded stickers
- [ ] Onboarding flow
- [ ] App Store listing assets

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Rendering engine | Skia | GPU-accelerated, bundled in Expo Go, supports offscreen high-res export |
| State management | Zustand | Lightweight, serializable to JSON for Supabase persistence |
| Navigation | expo-router | File-based routing, deep linking support |
| Image preprocessing | expo-image-manipulator | Downscale before loading into Skia to prevent OOM |
| Export | Skia `makeImageSnapshot()` | Renders at arbitrary resolution, not limited to screen size |
| Color matching (mosaic) | CIELAB + KD-tree | Perceptually accurate, O(log n) lookup |
| Auth | Supabase Auth | Built-in, supports email/Google/Apple |
| Storage | Supabase Storage | Upload via ArrayBuffer from base64 (RN requirement) |
| Gestures | Simultaneous pan+pinch+rotate | Industry standard for photo manipulation apps |

## Competitive Advantages
1. **Rave-specific** — no competitor focuses on rave/EDM culture
2. **Event tagging** — connect collages to real events, browse by event
3. **Neon/glow effects** — built-in rave aesthetic, not generic filters
4. **Photo mosaic** — create artist portraits from your rave photos
5. **Free collage creation** — never pay-to-save (biggest competitor mistake)
6. **All works in Expo Go** — fast development iteration

## Anti-Patterns to Avoid (from competitive research)
- Never charge to save/export (PicCollage's biggest mistake)
- Never show unskippable ads before save (Pic Stitch)
- Never remove features that were previously free (piZap, Pic Stitch)
- Never require internet for basic operations (Moldiv)
- Always provide undo/redo (piZap lacks this)
- Never let drafts depend on source files (InShot's data loss)
- Never trigger accidental subscriptions via ads (PhotoGrid dark pattern)
