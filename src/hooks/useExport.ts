import { useCallback, useState } from 'react';
import { Skia } from '@shopify/react-native-skia';
import { Paths, File } from 'expo-file-system';
import { useCollageState } from './useCollageState';

type ExportResolution = '1080p' | '4k';

interface ExportDimensions {
  readonly width: number;
  readonly height: number;
}

const EXPORT_SIZES: Record<ExportResolution, ExportDimensions> = {
  '1080p': { width: 1080, height: 1080 },
  '4k': { width: 3840, height: 3840 },
} as const;

interface ExportResult {
  readonly uri: string;
  readonly width: number;
  readonly height: number;
}

interface UseExportReturn {
  readonly exportCollage: (
    resolution?: ExportResolution,
  ) => Promise<ExportResult>;
  readonly isExporting: boolean;
}

function getAspectMultiplier(
  aspectRatio: string,
): { readonly wFactor: number; readonly hFactor: number } {
  switch (aspectRatio) {
    case '4:5':
      return { wFactor: 4 / 5, hFactor: 1 };
    case '9:16':
      return { wFactor: 9 / 16, hFactor: 1 };
    case '16:9':
      return { wFactor: 1, hFactor: 9 / 16 };
    case '1:1':
    default:
      return { wFactor: 1, hFactor: 1 };
  }
}

export function useExport(): UseExportReturn {
  const [isExporting, setIsExporting] = useState(false);

  const exportCollage = useCallback(
    async (resolution: ExportResolution = '1080p'): Promise<ExportResult> => {
      setIsExporting(true);

      try {
        const state = useCollageState.getState();
        const baseDimensions = EXPORT_SIZES[resolution];
        const { wFactor, hFactor } = getAspectMultiplier(state.aspectRatio);
        const exportWidth = Math.round(baseDimensions.width * wFactor);
        const exportHeight = Math.round(baseDimensions.height * hFactor);

        // Create offscreen surface for rendering
        const surface = Skia.Surface.MakeOffscreen(exportWidth, exportHeight);
        if (!surface) {
          throw new Error('Failed to create offscreen surface');
        }

        const canvas = surface.getCanvas();

        // Draw background
        const bgPaint = Skia.Paint();
        bgPaint.setColor(Skia.Color(state.backgroundColor));
        canvas.drawRect(
          Skia.XYWHRect(0, 0, exportWidth, exportHeight),
          bgPaint,
        );

        // Draw each photo (load image data sequentially since fromURI is async)
        for (const photo of state.photos) {
          const imageData = await Skia.Data.fromURI(photo.uri);
          const skImage = Skia.Image.MakeImageFromEncoded(imageData);

          if (!skImage) continue;

          canvas.save();

          // Apply photo transforms: translate, rotate around center, then scale
          canvas.translate(photo.position.x, photo.position.y);
          canvas.rotate(
            (photo.rotation * 180) / Math.PI,
            photo.size.width / 2,
            photo.size.height / 2,
          );
          canvas.scale(photo.scale, photo.scale);

          // Draw the image into the destination rect
          const srcRect = Skia.XYWHRect(
            0,
            0,
            skImage.width(),
            skImage.height(),
          );
          const dstRect = Skia.XYWHRect(
            0,
            0,
            photo.size.width,
            photo.size.height,
          );
          const imgPaint = Skia.Paint();
          canvas.drawImageRect(skImage, srcRect, dstRect, imgPaint);

          canvas.restore();
        }

        // Flush and capture snapshot
        surface.flush();
        const snapshot = surface.makeImageSnapshot();

        // Encode to PNG bytes
        const encoded = snapshot.encodeToBytes();

        // Write to cache directory using expo-file-system v56 API
        const timestamp = Date.now();
        const fileName = `moshpit-collage-${timestamp}.png`;
        const outputFile = new File(Paths.cache, fileName);
        outputFile.create({ overwrite: true });
        outputFile.write(encoded);

        return {
          uri: outputFile.uri,
          width: exportWidth,
          height: exportHeight,
        };
      } finally {
        setIsExporting(false);
      }
    },
    [],
  );

  return { exportCollage, isExporting };
}
