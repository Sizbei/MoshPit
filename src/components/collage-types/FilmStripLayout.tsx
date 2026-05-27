import { useMemo } from 'react';
import {
  Canvas,
  Image,
  useImage,
  Group,
  Rect,
  RoundedRect,
  Fill,
  Text,
  matchFont,
} from '@shopify/react-native-skia';
import { useCollageState } from '../../hooks/useCollageState';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import type { CollagePhoto } from '../../types/collage';

interface FilmStripLayoutProps {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly orientation: 'horizontal' | 'vertical';
}

const SPROCKET_SIZE = { width: 10, height: 7, radius: 2 } as const;
const SPROCKET_SPACING = 18;
const STRIP_PADDING = 20;
const FRAME_GAP = 2;
const FRAME_NUMBER_HEIGHT = 16;

const frameNumberFont = matchFont({
  fontFamily: 'Courier',
  fontSize: 10,
  fontStyle: 'normal',
  fontWeight: 'bold',
});

interface FilmFrameProps {
  readonly photo: CollagePhoto;
  readonly index: number;
  readonly frameX: number;
  readonly frameY: number;
  readonly frameWidth: number;
  readonly frameHeight: number;
}

function FilmFrame({ photo, index, frameX, frameY, frameWidth, frameHeight }: FilmFrameProps) {
  const image = useImage(photo.uri);

  if (!image) return null;

  const frameNumber = String(index + 1).padStart(2, '0');

  return (
    <Group>
      <Image
        image={image}
        x={frameX}
        y={frameY}
        width={frameWidth}
        height={frameHeight}
        fit="cover"
      />
      <Text
        x={frameX + frameWidth / 2 - 6}
        y={frameY + frameHeight + FRAME_NUMBER_HEIGHT - 3}
        text={frameNumber}
        font={frameNumberFont}
        color={RAVE_COLORS.lightGray}
      />
    </Group>
  );
}

interface SprocketHolesProps {
  readonly orientation: 'horizontal' | 'vertical';
  readonly stripLength: number;
  readonly stripWidth: number;
}

function SprocketHoles({ orientation, stripLength, stripWidth }: SprocketHolesProps) {
  const holes: Array<{ readonly x: number; readonly y: number }> = [];

  if (orientation === 'horizontal') {
    const count = Math.floor(stripLength / SPROCKET_SPACING);
    for (let i = 0; i < count; i++) {
      const hx = i * SPROCKET_SPACING + (SPROCKET_SPACING - SPROCKET_SIZE.width) / 2;
      holes.push({ x: hx, y: 4 });
      holes.push({ x: hx, y: stripWidth - SPROCKET_SIZE.height - 4 });
    }
  } else {
    const count = Math.floor(stripLength / SPROCKET_SPACING);
    for (let i = 0; i < count; i++) {
      const hy = i * SPROCKET_SPACING + (SPROCKET_SPACING - SPROCKET_SIZE.height) / 2;
      holes.push({ x: 4, y: hy });
      holes.push({ x: stripWidth - SPROCKET_SIZE.width - 4, y: hy });
    }
  }

  return (
    <Group>
      {holes.map((hole, i) => (
        <RoundedRect
          key={i}
          x={hole.x}
          y={hole.y}
          width={SPROCKET_SIZE.width}
          height={SPROCKET_SIZE.height}
          r={SPROCKET_SIZE.radius}
          color={RAVE_COLORS.lightGray}
        />
      ))}
    </Group>
  );
}

export function FilmStripLayout({
  canvasWidth,
  canvasHeight,
  orientation,
}: FilmStripLayoutProps) {
  const photos = useCollageState((s) => s.photos);

  const layout = useMemo(() => {
    const photoCount = photos.length;
    if (photoCount === 0) return { frames: [], stripLength: 0, stripWidth: 0 };

    if (orientation === 'horizontal') {
      const stripWidth = canvasHeight;
      const imageAreaHeight = stripWidth - STRIP_PADDING * 2 - FRAME_NUMBER_HEIGHT;
      const frameHeight = Math.max(imageAreaHeight, 40);
      const frameWidth = frameHeight * 0.75;
      const totalWidth = photoCount * (frameWidth + FRAME_GAP) - FRAME_GAP + STRIP_PADDING * 2;
      const stripLength = Math.max(totalWidth, canvasWidth);

      const frames = photos.map((photo, index) => ({
        photo,
        index,
        frameX: STRIP_PADDING + index * (frameWidth + FRAME_GAP),
        frameY: STRIP_PADDING,
        frameWidth,
        frameHeight,
      }));

      return { frames, stripLength, stripWidth };
    }

    const stripWidth = canvasWidth;
    const imageAreaWidth = stripWidth - STRIP_PADDING * 2;
    const frameWidth = Math.max(imageAreaWidth, 40);
    const frameHeight = frameWidth * 0.75;
    const totalHeight =
      photoCount * (frameHeight + FRAME_NUMBER_HEIGHT + FRAME_GAP) -
      FRAME_GAP +
      STRIP_PADDING * 2;
    const stripLength = Math.max(totalHeight, canvasHeight);

    const frames = photos.map((photo, index) => ({
      photo,
      index,
      frameX: STRIP_PADDING,
      frameY: STRIP_PADDING + index * (frameHeight + FRAME_NUMBER_HEIGHT + FRAME_GAP),
      frameWidth,
      frameHeight,
    }));

    return { frames, stripLength, stripWidth };
  }, [photos, canvasWidth, canvasHeight, orientation]);

  if (photos.length === 0) {
    return (
      <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
        <Fill color={BACKGROUND.editor} />
      </Canvas>
    );
  }

  const { frames, stripLength, stripWidth } = layout;

  const canvasStyle =
    orientation === 'horizontal'
      ? { width: Math.max(stripLength, canvasWidth), height: canvasHeight }
      : { width: canvasWidth, height: Math.max(stripLength, canvasHeight) };

  return (
    <Canvas style={canvasStyle}>
      <Fill color={RAVE_COLORS.deepBlack} />
      <SprocketHoles
        orientation={orientation}
        stripLength={orientation === 'horizontal' ? stripLength : stripLength}
        stripWidth={stripWidth}
      />
      {frames.map(({ photo, index, frameX, frameY, frameWidth, frameHeight }) => (
        <Group key={photo.id}>
          <Rect
            x={frameX - 1}
            y={frameY - 1}
            width={frameWidth + 2}
            height={frameHeight + 2}
            color={RAVE_COLORS.darkGray}
          />
          <FilmFrame
            photo={photo}
            index={index}
            frameX={frameX}
            frameY={frameY}
            frameWidth={frameWidth}
            frameHeight={frameHeight}
          />
        </Group>
      ))}
    </Canvas>
  );
}

export { type FilmStripLayoutProps };
