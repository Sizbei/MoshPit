import { Image, useImage, Group, Rect } from '@shopify/react-native-skia';
import type { CollagePhoto as CollagePhotoType } from '../../types/collage';

interface Props {
  readonly photo: CollagePhotoType;
}

export function CollagePhoto({ photo }: Props) {
  const image = useImage(photo.uri);

  if (!image) return null;

  return (
    <Group
      transform={[
        { translateX: photo.position.x },
        { translateY: photo.position.y },
        { rotate: photo.rotation },
        { scale: photo.scale },
      ]}
    >
      <Image
        image={image}
        x={0}
        y={0}
        width={photo.size.width}
        height={photo.size.height}
        fit="cover"
      />
    </Group>
  );
}
