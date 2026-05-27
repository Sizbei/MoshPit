import { useMemo } from 'react';
import { Group, Image, Rect, useImage } from '@shopify/react-native-skia';
import type { CollagePhoto, LayoutRect, LayoutTemplate } from '../../types/collage';
import { GRID_TEMPLATES } from '../../utils/layouts';
import { useCollageState } from '../../hooks/useCollageState';
import { BACKGROUND } from '../../utils/colors';

interface Props {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
}

interface PixelRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

function normalizedToPixel(
  cell: LayoutRect,
  canvasWidth: number,
  canvasHeight: number,
  gap: number,
): PixelRect {
  const halfGap = gap / 2;
  return {
    x: cell.x * canvasWidth + halfGap,
    y: cell.y * canvasHeight + halfGap,
    width: cell.width * canvasWidth - gap,
    height: cell.height * canvasHeight - gap,
  };
}

interface GridCellProps {
  readonly cell: PixelRect;
  readonly photo: CollagePhoto | undefined;
}

function GridCellImage({ cell, photo }: GridCellProps) {
  const image = useImage(photo?.uri ?? null);

  if (!photo || !image) {
    return (
      <Rect
        x={cell.x}
        y={cell.y}
        width={cell.width}
        height={cell.height}
        color={BACKGROUND.card}
      />
    );
  }

  return (
    <Group
      clip={{ x: cell.x, y: cell.y, width: cell.width, height: cell.height }}
    >
      <Image
        image={image}
        x={cell.x}
        y={cell.y}
        width={cell.width}
        height={cell.height}
        fit="cover"
      />
    </Group>
  );
}

export function GridLayout({ canvasWidth, canvasHeight }: Props) {
  const templateId = useCollageState((s) => s.templateId);
  const photos = useCollageState((s) => s.photos);

  const template = useMemo((): LayoutTemplate | undefined => {
    if (templateId) {
      return GRID_TEMPLATES.find((t) => t.id === templateId);
    }
    // Auto-select best template for photo count
    const count = photos.length;
    if (count === 0) return GRID_TEMPLATES[0];
    return (
      GRID_TEMPLATES.find((t) => t.photoCount === count) ?? GRID_TEMPLATES[0]
    );
  }, [templateId, photos.length]);

  const pixelCells = useMemo((): readonly PixelRect[] => {
    if (!template) return [];
    const gap = template.gap;
    return template.cells.map((cell) =>
      normalizedToPixel(cell, canvasWidth, canvasHeight, gap),
    );
  }, [template, canvasWidth, canvasHeight]);

  if (!template) return null;

  return (
    <Group>
      {pixelCells.map((cell, index) => (
        <GridCellImage
          key={`${template.id}-cell-${index}`}
          cell={cell}
          photo={index < photos.length ? photos[index] : undefined}
        />
      ))}
    </Group>
  );
}
