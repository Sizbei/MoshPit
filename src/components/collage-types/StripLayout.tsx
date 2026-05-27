import { useMemo } from 'react';
import {
  Canvas,
  Image,
  useImage,
  Group,
  Rect,
  Fill,
  Text,
  matchFont,
} from '@shopify/react-native-skia';
import { useCollageState } from '../../hooks/useCollageState';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import type { CollagePhoto } from '../../types/collage';

interface StripLayoutProps {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly orientation: 'horizontal' | 'vertical';
}

const GAP = 4;
const TIMESTAMP_HEIGHT = 20;

const timestampFont = matchFont({
  fontFamily: 'Courier',
  fontSize: 10,
  fontStyle: 'normal',
  fontWeight: 'normal',
});

interface StripPhotoProps {
  readonly photo: CollagePhoto;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

function StripPhoto({ photo, x, y, width, height }: StripPhotoProps) {
  const image = useImage(photo.uri);

  if (!image) return null;

  return (
    <Image
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      fit="cover"
    />
  );
}

interface TimestampLabelProps {
  readonly index: number;
  readonly x: number;
  readonly y: number;
}

function TimestampLabel({ index, x, y }: TimestampLabelProps) {
  const minutes = index * 3;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const label = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

  return (
    <Text
      x={x}
      y={y}
      text={label}
      font={timestampFont}
      color={RAVE_COLORS.mediumGray}
    />
  );
}

export function StripLayout({
  canvasWidth,
  canvasHeight,
  orientation,
}: StripLayoutProps) {
  const photos = useCollageState((s) => s.photos);

  const layout = useMemo(() => {
    const count = photos.length;
    if (count === 0) return { items: [], totalWidth: canvasWidth, totalHeight: canvasHeight };

    if (orientation === 'vertical') {
      const photoWidth = canvasWidth;
      const photoHeight = photoWidth * 0.75;
      const totalHeight =
        count * photoHeight +
        (count - 1) * (GAP + TIMESTAMP_HEIGHT) +
        GAP;

      const items = photos.map((photo, index) => {
        const y = index * (photoHeight + GAP + TIMESTAMP_HEIGHT);
        return {
          photo,
          index,
          x: 0,
          y,
          width: photoWidth,
          height: photoHeight,
          timestampX: photoWidth / 2 - 15,
          timestampY: y + photoHeight + TIMESTAMP_HEIGHT - 5,
          showTimestamp: index < count - 1,
        };
      });

      return { items, totalWidth: canvasWidth, totalHeight: Math.max(totalHeight, canvasHeight) };
    }

    const photoHeight = canvasHeight;
    const photoWidth = photoHeight * 0.75;
    const totalWidth =
      count * photoWidth +
      (count - 1) * (GAP + TIMESTAMP_HEIGHT) +
      GAP;

    const items = photos.map((photo, index) => {
      const x = index * (photoWidth + GAP + TIMESTAMP_HEIGHT);
      return {
        photo,
        index,
        x,
        y: 0,
        width: photoWidth,
        height: photoHeight,
        timestampX: x + photoWidth + 4,
        timestampY: photoHeight / 2,
        showTimestamp: index < count - 1,
      };
    });

    return { items, totalWidth: Math.max(totalWidth, canvasWidth), totalHeight: canvasHeight };
  }, [photos, canvasWidth, canvasHeight, orientation]);

  if (photos.length === 0) {
    return (
      <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
        <Fill color={BACKGROUND.editor} />
      </Canvas>
    );
  }

  const { items, totalWidth, totalHeight } = layout;

  return (
    <Canvas style={{ width: totalWidth, height: totalHeight }}>
      <Fill color={BACKGROUND.editor} />
      {items.map(({ photo, index, x, y, width, height, timestampX, timestampY, showTimestamp }) => (
        <Group key={photo.id}>
          <StripPhoto
            photo={photo}
            x={x}
            y={y}
            width={width}
            height={height}
          />
          {showTimestamp && (
            <Group>
              <Rect
                x={orientation === 'vertical' ? 0 : x + width}
                y={orientation === 'vertical' ? y + height : 0}
                width={orientation === 'vertical' ? canvasWidth : GAP + TIMESTAMP_HEIGHT}
                height={orientation === 'vertical' ? GAP + TIMESTAMP_HEIGHT : canvasHeight}
                color={BACKGROUND.editor}
              />
              <TimestampLabel
                index={index + 1}
                x={timestampX}
                y={timestampY}
              />
            </Group>
          )}
        </Group>
      ))}
    </Canvas>
  );
}

export { type StripLayoutProps };
