export type CollageType =
  | 'grid'
  | 'freeform'
  | 'strip'
  | 'polaroid'
  | 'filmstrip'
  | 'mosaic'
  | 'shape'
  | 'timeline';

export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9' | 'custom';

export interface CollagePhoto {
  readonly id: string;
  readonly uri: string;
  readonly storagePath?: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly size: { readonly width: number; readonly height: number };
  readonly rotation: number;
  readonly scale: number;
  readonly zIndex: number;
  readonly filter?: readonly number[];
  readonly cropRect?: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
}

export interface CollageSticker {
  readonly id: string;
  readonly packId: string;
  readonly assetId: string;
  readonly uri: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly scale: number;
  readonly rotation: number;
  readonly zIndex: number;
}

export interface TextOverlay {
  readonly id: string;
  readonly text: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly fontSize: number;
  readonly fontFamily: string;
  readonly color: string;
  readonly rotation: number;
  readonly glowEnabled: boolean;
  readonly glowColor?: string;
}

export interface LayoutRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface LayoutTemplate {
  readonly id: string;
  readonly name: string;
  readonly photoCount: number;
  readonly cells: readonly LayoutRect[];
  readonly gap: number;
}

export interface Collage {
  readonly id: string;
  readonly userId: string;
  readonly title: string;
  readonly type: CollageType;
  readonly aspectRatio: AspectRatio;
  readonly backgroundColor: string;
  readonly photos: readonly CollagePhoto[];
  readonly stickers: readonly CollageSticker[];
  readonly textOverlays: readonly TextOverlay[];
  readonly eventId?: string;
  readonly templateId?: string;
  readonly thumbnailUrl?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
