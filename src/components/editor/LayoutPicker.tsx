import { useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable, ScrollView, Text } from 'react-native';
import { Canvas, Rect, Fill } from '@shopify/react-native-skia';
import type { LayoutTemplate } from '../../types/collage';
import { GRID_TEMPLATES, getClosestTemplates } from '../../utils/layouts';
import { useCollageState } from '../../hooks/useCollageState';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';

const THUMBNAIL_SIZE = 56;
const THUMBNAIL_PADDING = 4;

interface LayoutThumbnailProps {
  readonly template: LayoutTemplate;
  readonly isSelected: boolean;
  readonly onPress: () => void;
}

function LayoutThumbnail({ template, isSelected, onPress }: LayoutThumbnailProps) {
  const innerSize = THUMBNAIL_SIZE - THUMBNAIL_PADDING * 2;
  const gap = 1;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.thumbnailWrapper,
        isSelected && styles.thumbnailSelected,
      ]}
    >
      <Canvas style={styles.thumbnailCanvas}>
        <Fill color={BACKGROUND.editor} />
        {template.cells.map((cell, index) => {
          const halfGap = gap / 2;
          return (
            <Rect
              key={index}
              x={cell.x * innerSize + THUMBNAIL_PADDING + halfGap}
              y={cell.y * innerSize + THUMBNAIL_PADDING + halfGap}
              width={cell.width * innerSize - gap}
              height={cell.height * innerSize - gap}
              color={RAVE_COLORS.mediumGray}
            />
          );
        })}
      </Canvas>
      <Text style={styles.thumbnailLabel} numberOfLines={1}>
        {template.photoCount}
      </Text>
    </Pressable>
  );
}

export function LayoutPicker() {
  const photoCount = useCollageState((s) => s.photos.length);
  const templateId = useCollageState((s) => s.templateId);
  const setTemplate = useCollageState((s) => s.setTemplate);

  const templates = useMemo((): readonly LayoutTemplate[] => {
    if (photoCount === 0) return GRID_TEMPLATES;
    const closest = getClosestTemplates(photoCount);
    // Always show all templates, but sorted with closest matches first
    const closestIds = new Set(closest.map((t) => t.id));
    const remaining = GRID_TEMPLATES.filter((t) => !closestIds.has(t.id));
    return [...closest, ...remaining];
  }, [photoCount]);

  const handleSelect = useCallback(
    (id: string) => {
      setTemplate(id);
    },
    [setTemplate],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grid Layout</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {templates.map((template) => (
          <LayoutThumbnail
            key={template.id}
            template={template}
            isSelected={templateId === template.id}
            onPress={() => handleSelect(template.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND.surface,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: BACKGROUND.border,
  },
  title: {
    color: RAVE_COLORS.lightGray,
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 16,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  thumbnailWrapper: {
    width: THUMBNAIL_SIZE,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailSelected: {
    borderColor: RAVE_COLORS.hotPink,
  },
  thumbnailCanvas: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
  },
  thumbnailLabel: {
    color: RAVE_COLORS.lightGray,
    fontSize: 10,
    fontWeight: '500',
    paddingVertical: 2,
  },
});
