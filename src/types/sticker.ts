export type StickerCategory =
  | 'rave-art'
  | 'festival'
  | 'genre'
  | 'text'
  | 'user-uploaded';

export interface StickerPack {
  readonly id: string;
  readonly name: string;
  readonly category: StickerCategory;
  readonly thumbnailUrl: string;
  readonly stickerCount: number;
  readonly isPremium: boolean;
}

export interface Sticker {
  readonly id: string;
  readonly packId: string;
  readonly name: string;
  readonly uri: string;
  readonly tags: readonly string[];
}
