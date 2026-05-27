import { useMemo } from 'react';
import { Dimensions } from 'react-native';
import type { AspectRatio } from '../types/collage';

interface CanvasDimensions {
  readonly width: number;
  readonly height: number;
}

const ASPECT_RATIOS: Record<Exclude<AspectRatio, 'custom'>, number> = {
  '1:1': 1,
  '4:5': 4 / 5,
  '9:16': 9 / 16,
  '16:9': 16 / 9,
};

const CANVAS_HORIZONTAL_MARGIN = 32;

export function useCanvasDimensions(aspectRatio: AspectRatio): CanvasDimensions {
  return useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const maxWidth = screenWidth - CANVAS_HORIZONTAL_MARGIN;

    const ratio = aspectRatio === 'custom' ? 1 : ASPECT_RATIOS[aspectRatio];

    if (ratio >= 1) {
      // Landscape or square: width-constrained
      return { width: maxWidth, height: maxWidth / ratio };
    }

    // Portrait: width-constrained, height derived
    return { width: maxWidth, height: maxWidth / ratio };
  }, [aspectRatio]);
}
