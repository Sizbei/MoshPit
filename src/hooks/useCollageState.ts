import { create } from 'zustand';
import type {
  AspectRatio,
  CollagePhoto,
  CollageSticker,
  CollageType,
  TextOverlay,
} from '../types/collage';
import { generateId } from '../utils/imageUtils';

interface CollageState {
  readonly id: string;
  readonly type: CollageType;
  readonly aspectRatio: AspectRatio;
  readonly backgroundColor: string;
  readonly photos: readonly CollagePhoto[];
  readonly stickers: readonly CollageSticker[];
  readonly textOverlays: readonly TextOverlay[];
  readonly selectedPhotoId: string | null;
  readonly selectedStickerId: string | null;
  readonly templateId: string | null;
  readonly eventId: string | null;

  setType: (type: CollageType) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
  setBackgroundColor: (color: string) => void;
  setTemplate: (templateId: string) => void;
  setEvent: (eventId: string | null) => void;

  addPhoto: (uri: string, position?: { x: number; y: number }) => void;
  updatePhoto: (id: string, updates: Partial<CollagePhoto>) => void;
  removePhoto: (id: string) => void;
  selectPhoto: (id: string | null) => void;

  addSticker: (
    packId: string,
    assetId: string,
    uri: string,
    position: { x: number; y: number },
  ) => void;
  updateSticker: (id: string, updates: Partial<CollageSticker>) => void;
  removeSticker: (id: string) => void;
  selectSticker: (id: string | null) => void;

  addText: (text: string, position: { x: number; y: number }) => void;
  updateText: (id: string, updates: Partial<TextOverlay>) => void;
  removeText: (id: string) => void;

  reset: () => void;
}

const initialState = {
  id: generateId(),
  type: 'grid' as CollageType,
  aspectRatio: '1:1' as AspectRatio,
  backgroundColor: '#0A0A0A',
  photos: [] as readonly CollagePhoto[],
  stickers: [] as readonly CollageSticker[],
  textOverlays: [] as readonly TextOverlay[],
  selectedPhotoId: null,
  selectedStickerId: null,
  templateId: null,
  eventId: null,
};

export const useCollageState = create<CollageState>((set) => ({
  ...initialState,

  setType: (type) => set({ type }),
  setAspectRatio: (aspectRatio) => set({ aspectRatio }),
  setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
  setTemplate: (templateId) => set({ templateId }),
  setEvent: (eventId) => set({ eventId }),

  addPhoto: (uri, position) =>
    set((state) => ({
      photos: [
        ...state.photos,
        {
          id: generateId(),
          uri,
          position: position ?? { x: 0, y: 0 },
          size: { width: 200, height: 200 },
          rotation: 0,
          scale: 1,
          zIndex: state.photos.length,
        },
      ],
    })),

  updatePhoto: (id, updates) =>
    set((state) => ({
      photos: state.photos.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    })),

  removePhoto: (id) =>
    set((state) => ({
      photos: state.photos.filter((p) => p.id !== id),
      selectedPhotoId: state.selectedPhotoId === id ? null : state.selectedPhotoId,
    })),

  selectPhoto: (id) => set({ selectedPhotoId: id, selectedStickerId: null }),

  addSticker: (packId, assetId, uri, position) =>
    set((state) => ({
      stickers: [
        ...state.stickers,
        {
          id: generateId(),
          packId,
          assetId,
          uri,
          position,
          scale: 1,
          rotation: 0,
          zIndex: state.photos.length + state.stickers.length,
        },
      ],
    })),

  updateSticker: (id, updates) =>
    set((state) => ({
      stickers: state.stickers.map((s) =>
        s.id === id ? { ...s, ...updates } : s,
      ),
    })),

  removeSticker: (id) =>
    set((state) => ({
      stickers: state.stickers.filter((s) => s.id !== id),
      selectedStickerId:
        state.selectedStickerId === id ? null : state.selectedStickerId,
    })),

  selectSticker: (id) => set({ selectedStickerId: id, selectedPhotoId: null }),

  addText: (text, position) =>
    set((state) => ({
      textOverlays: [
        ...state.textOverlays,
        {
          id: generateId(),
          text,
          position,
          fontSize: 24,
          fontFamily: 'System',
          color: '#FFFFFF',
          rotation: 0,
          glowEnabled: false,
        },
      ],
    })),

  updateText: (id, updates) =>
    set((state) => ({
      textOverlays: state.textOverlays.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    })),

  removeText: (id) =>
    set((state) => ({
      textOverlays: state.textOverlays.filter((t) => t.id !== id),
    })),

  reset: () => set({ ...initialState, id: generateId() }),
}));
