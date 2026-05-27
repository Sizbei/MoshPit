import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, useCanvasRef, Fill } from '@shopify/react-native-skia';
import { useCollageState } from '../../hooks/useCollageState';
import { CollagePhoto } from './CollagePhoto';
import { BACKGROUND } from '../../utils/colors';

export function CollageCanvas() {
  const canvasRef = useCanvasRef();
  const photos = useCollageState((s) => s.photos);
  const backgroundColor = useCollageState((s) => s.backgroundColor);

  return (
    <View style={styles.container}>
      <Canvas ref={canvasRef} style={styles.canvas}>
        <Fill color={backgroundColor} />
        {photos.map((photo) => (
          <CollagePhoto key={photo.id} photo={photo} />
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.card,
    borderRadius: 8,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
  },
});
