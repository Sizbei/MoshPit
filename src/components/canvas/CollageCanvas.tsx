import { useCallback, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Canvas, useCanvasRef, Fill } from '@shopify/react-native-skia';
import { useCollageState } from '../../hooks/useCollageState';
import { GridLayout } from '../collage-types/GridLayout';
import { FreeformLayout } from '../collage-types/FreeformLayout';
import { PolaroidLayout } from '../collage-types/PolaroidLayout';
import { FilmStripLayout } from '../collage-types/FilmStripLayout';
import { StripLayout } from '../collage-types/StripLayout';
import { StickerOverlay } from './StickerOverlay';
import { BACKGROUND } from '../../utils/colors';

interface CanvasSize {
  readonly width: number;
  readonly height: number;
}

export function CollageCanvas() {
  const canvasRef = useCanvasRef();
  const collageType = useCollageState((s) => s.type);
  const backgroundColor = useCollageState((s) => s.backgroundColor);
  const stickers = useCollageState((s) => s.stickers);

  const [canvasSize, setCanvasSize] = useState<CanvasSize | null>(null);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setCanvasSize({ width, height });
  }, []);

  function renderCollageType(width: number, height: number) {
    switch (collageType) {
      case 'grid':
        return <GridLayout canvasWidth={width} canvasHeight={height} />;
      case 'freeform':
        return <FreeformLayout canvasWidth={width} canvasHeight={height} />;
      case 'polaroid':
        return <PolaroidLayout canvasWidth={width} canvasHeight={height} />;
      case 'filmstrip':
        return (
          <FilmStripLayout
            canvasWidth={width}
            canvasHeight={height}
            orientation="horizontal"
          />
        );
      case 'strip':
        return (
          <StripLayout
            canvasWidth={width}
            canvasHeight={height}
            orientation="vertical"
          />
        );
      default:
        return <GridLayout canvasWidth={width} canvasHeight={height} />;
    }
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {canvasSize !== null && (
        <Canvas ref={canvasRef} style={styles.canvas}>
          <Fill color={backgroundColor} />

          {renderCollageType(canvasSize.width, canvasSize.height)}

          {stickers.map((sticker) => (
            <StickerOverlay key={sticker.id} sticker={sticker} />
          ))}
        </Canvas>
      )}
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
