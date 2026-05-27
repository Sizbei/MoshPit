import { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { useCollageState } from '../../hooks/useCollageState';
import type { AspectRatio } from '../../types/collage';

interface RatioOption {
  readonly ratio: AspectRatio;
  readonly label: string;
  readonly previewWidth: number;
  readonly previewHeight: number;
}

const RATIO_OPTIONS: readonly RatioOption[] = [
  { ratio: '1:1', label: 'Square', previewWidth: 40, previewHeight: 40 },
  { ratio: '4:5', label: 'Portrait', previewWidth: 36, previewHeight: 45 },
  { ratio: '9:16', label: 'Story', previewWidth: 28, previewHeight: 50 },
  { ratio: '16:9', label: 'Landscape', previewWidth: 50, previewHeight: 28 },
];

interface RatioItemProps {
  readonly option: RatioOption;
  readonly isSelected: boolean;
  readonly onPress: () => void;
}

function RatioItem({ option, isSelected, onPress }: RatioItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.ratioItem,
        isSelected && styles.ratioItemSelected,
      ]}
    >
      <View style={styles.previewContainer}>
        <View
          style={[
            styles.previewShape,
            {
              width: option.previewWidth,
              height: option.previewHeight,
            },
            isSelected && styles.previewShapeSelected,
          ]}
        />
      </View>
      <Text style={styles.ratioLabel}>{option.ratio}</Text>
      <Text
        style={[
          styles.ratioName,
          isSelected && styles.ratioNameSelected,
        ]}
      >
        {option.label}
      </Text>
    </Pressable>
  );
}

interface AspectRatioPickerProps {
  readonly onClose: () => void;
}

export function AspectRatioPicker({ onClose }: AspectRatioPickerProps) {
  const aspectRatio = useCollageState((s) => s.aspectRatio);
  const setAspectRatio = useCollageState((s) => s.setAspectRatio);

  const handleSelect = useCallback(
    (ratio: AspectRatio) => {
      setAspectRatio(ratio);
    },
    [setAspectRatio],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Aspect Ratio</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {RATIO_OPTIONS.map((option) => (
          <RatioItem
            key={option.ratio}
            option={option}
            isSelected={aspectRatio === option.ratio}
            onPress={() => handleSelect(option.ratio)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND.surface,
    borderTopWidth: 1,
    borderTopColor: BACKGROUND.border,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    color: RAVE_COLORS.hotPink,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 12,
    paddingVertical: 8,
  },
  ratioItem: {
    alignItems: 'center',
    width: 76,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: BACKGROUND.card,
  },
  ratioItemSelected: {
    borderColor: RAVE_COLORS.hotPink,
    backgroundColor: RAVE_COLORS.hotPink + '15',
  },
  previewContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  previewShape: {
    borderWidth: 2,
    borderColor: RAVE_COLORS.lightGray,
    borderRadius: 4,
    backgroundColor: BACKGROUND.border,
  },
  previewShapeSelected: {
    borderColor: RAVE_COLORS.hotPink,
    backgroundColor: RAVE_COLORS.hotPink + '20',
  },
  ratioLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  ratioName: {
    color: RAVE_COLORS.lightGray,
    fontSize: 10,
    fontWeight: '500',
  },
  ratioNameSelected: {
    color: RAVE_COLORS.hotPink,
  },
});
