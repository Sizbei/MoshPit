import { Image, useImage, Group } from '@shopify/react-native-skia';
import type { CollageSticker } from '../../types/collage';

interface Props {
  readonly sticker: CollageSticker;
}

export function StickerOverlay({ sticker }: Props) {
  const image = useImage(sticker.uri);

  if (!image) return null;

  return (
    <Group
      transform={[
        { translateX: sticker.position.x },
        { translateY: sticker.position.y },
        { rotate: sticker.rotation },
        { scale: sticker.scale },
      ]}
    >
      <Image image={image} x={0} y={0} width={80} height={80} fit="contain" />
    </Group>
  );
}
