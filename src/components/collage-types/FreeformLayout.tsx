import { useMemo, useCallback } from 'react';
import {
  Canvas,
  Image,
  useImage,
  Group,
  Fill,
  Shadow,
} from '@shopify/react-native-skia';
import { useCollageState } from '../../hooks/useCollageState';
import { BACKGROUND } from '../../utils/colors';
import type { CollagePhoto } from '../../types/collage';

interface FreeformLayoutProps {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
}

interface PhotoItemProps {
  readonly photo: CollagePhoto;
}

function PhotoItem({ photo }: PhotoItemProps) {
  const image = useImage(photo.uri);

  if (!image) return null;

  const scaledWidth = photo.size.width * photo.scale;
  const scaledHeight = photo.size.height * photo.scale;

  return (
    <Group
      transform={[
        { translateX: photo.position.x + scaledWidth / 2 },
        { translateY: photo.position.y + scaledHeight / 2 },
        { rotate: (photo.rotation * Math.PI) / 180 },
        { translateX: -(scaledWidth / 2) },
        { translateY: -(scaledHeight / 2) },
      ]}
    >
      <Group>
        <Shadow dx={4} dy={4} blur={8} color="rgba(0,0,0,0.5)" />
        <Image
          image={image}
          x={0}
          y={0}
          width={scaledWidth}
          height={scaledHeight}
          fit="cover"
        />
      </Group>
    </Group>
  );
}

export function FreeformLayout({ canvasWidth, canvasHeight }: FreeformLayoutProps) {
  const photos = useCollageState((s) => s.photos);
  const updatePhoto = useCollageState((s) => s.updatePhoto);

  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => a.zIndex - b.zIndex),
    [photos],
  );

  const shuffle = useCallback(() => {
    const padding = 40;

    photos.forEach((photo) => {
      const scaledWidth = photo.size.width * photo.scale;
      const scaledHeight = photo.size.height * photo.scale;

      const maxX = Math.max(0, canvasWidth - scaledWidth - padding * 2);
      const maxY = Math.max(0, canvasHeight - scaledHeight - padding * 2);

      const randomX = padding + Math.random() * maxX;
      const randomY = padding + Math.random() * maxY;
      const randomRotation = (Math.random() * 30 - 15);

      updatePhoto(photo.id, {
        position: { x: randomX, y: randomY },
        rotation: randomRotation,
      });
    });
  }, [photos, canvasWidth, canvasHeight, updatePhoto]);

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
      {sortedPhotos.map((photo) => (
        <PhotoItem key={photo.id} photo={photo} />
      ))}
    </Canvas>
  );
}

export { type FreeformLayoutProps };
