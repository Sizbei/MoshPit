import { useMemo } from 'react';
import {
  Canvas,
  Image,
  useImage,
  Group,
  Rect,
  Fill,
  Text,
  Shadow,
  matchFont,
} from '@shopify/react-native-skia';
import { useCollageState } from '../../hooks/useCollageState';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import type { CollagePhoto } from '../../types/collage';

interface PolaroidLayoutProps {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
}

const POLAROID_BORDER = {
  top: 12,
  left: 12,
  right: 12,
  bottom: 48,
} as const;

const captionFont = matchFont({
  fontFamily: 'Courier',
  fontSize: 14,
  fontStyle: 'italic',
  fontWeight: 'normal',
});

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

function getStableRotation(index: number): number {
  return seededRandom(index + 42) * 16 - 8;
}

interface PolaroidItemProps {
  readonly photo: CollagePhoto;
  readonly index: number;
}

function PolaroidItem({ photo, index }: PolaroidItemProps) {
  const image = useImage(photo.uri);

  if (!image) return null;

  const photoWidth = photo.size.width * photo.scale;
  const photoHeight = photo.size.height * photo.scale;

  const frameWidth = photoWidth + POLAROID_BORDER.left + POLAROID_BORDER.right;
  const frameHeight = photoHeight + POLAROID_BORDER.top + POLAROID_BORDER.bottom;

  const rotation = getStableRotation(index);
  const rotationRad = (rotation * Math.PI) / 180;

  const centerX = photo.position.x + frameWidth / 2;
  const centerY = photo.position.y + frameHeight / 2;

  const captionText = `#${String(index + 1).padStart(2, '0')}`;
  const captionX = POLAROID_BORDER.left + 4;
  const captionY = POLAROID_BORDER.top + photoHeight + POLAROID_BORDER.bottom - 12;

  return (
    <Group
      transform={[
        { translateX: centerX },
        { translateY: centerY },
        { rotate: rotationRad },
        { translateX: -centerX },
        { translateY: -centerY },
      ]}
    >
      <Group>
        <Shadow dx={3} dy={4} blur={10} color="rgba(0,0,0,0.6)" />
        <Rect
          x={photo.position.x}
          y={photo.position.y}
          width={frameWidth}
          height={frameHeight}
          color={RAVE_COLORS.white}
        />
      </Group>
      <Image
        image={image}
        x={photo.position.x + POLAROID_BORDER.left}
        y={photo.position.y + POLAROID_BORDER.top}
        width={photoWidth}
        height={photoHeight}
        fit="cover"
      />
      <Text
        x={photo.position.x + captionX}
        y={photo.position.y + captionY}
        text={captionText}
        font={captionFont}
        color={RAVE_COLORS.mediumGray}
      />
    </Group>
  );
}

export function PolaroidLayout({ canvasWidth, canvasHeight }: PolaroidLayoutProps) {
  const photos = useCollageState((s) => s.photos);

  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => a.zIndex - b.zIndex),
    [photos],
  );

  if (photos.length === 0) {
    return (
      <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
        <Fill color={BACKGROUND.editor} />
      </Canvas>
    );
  }

  return (
    <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
      <Fill color={BACKGROUND.editor} />
      {sortedPhotos.map((photo, index) => (
        <PolaroidItem key={photo.id} photo={photo} index={index} />
      ))}
    </Canvas>
  );
}

export { type PolaroidLayoutProps };
