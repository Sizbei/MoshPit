import { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { FILTER_PRESETS, type FilterPreset } from '../../utils/filters';
import { useCollageState } from '../../hooks/useCollageState';

function matrixToPreviewColors(matrix: readonly number[]): {
  readonly tint: string;
  readonly intensity: number;
} {
  // Extract dominant color channel from the matrix for a visual preview
  const rBias = (matrix[0] ?? 1) + (matrix[4] ?? 0) / 255;
  const gBias = (matrix[6] ?? 1) + (matrix[9] ?? 0) / 255;
  const bBias = (matrix[12] ?? 1) + (matrix[14] ?? 0) / 255;

  const maxChannel = Math.max(rBias, gBias, bBias);

  if (maxChannel <= 1.05 && Math.abs(rBias - gBias) < 0.2 && Math.abs(gBias - bBias) < 0.2) {
    return { tint: RAVE_COLORS.mediumGray, intensity: 0 };
  }

  const r = Math.min(255, Math.round((rBias / maxChannel) * 200));
  const g = Math.min(255, Math.round((gBias / maxChannel) * 180));
  const b = Math.min(255, Math.round((bBias / maxChannel) * 220));

  return {
    tint: `rgb(${r}, ${g}, ${b})`,
    intensity: Math.min(1, (maxChannel - 1) * 2),
  };
}

interface FilterItemProps {
  readonly filter: FilterPreset;
  readonly isSelected: boolean;
  readonly onPress: () => void;
}

function FilterItem({ filter, isSelected, onPress }: FilterItemProps) {
  const { tint } = matrixToPreviewColors(filter.matrix);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterItem,
        isSelected && styles.filterItemSelected,
      ]}
    >
      <View style={[styles.filterSwatch, { backgroundColor: tint }]}>
        {filter.id === 'none' && (
          <View style={styles.noneIndicator}>
            <View style={styles.noneLine} />
          </View>
        )}
      </View>
      <Text
        style={[
          styles.filterName,
          isSelected && styles.filterNameSelected,
        ]}
        numberOfLines={1}
      >
        {filter.name}
      </Text>
    </Pressable>
  );
}

interface FilterPickerProps {
  readonly onClose: () => void;
}

export function FilterPicker({ onClose }: FilterPickerProps) {
  const selectedPhotoId = useCollageState((s) => s.selectedPhotoId);
  const photos = useCollageState((s) => s.photos);
  const updatePhoto = useCollageState((s) => s.updatePhoto);

  const selectedPhoto = photos.find((p) => p.id === selectedPhotoId);
  const currentFilterId = selectedPhoto?.filter
    ? FILTER_PRESETS.find(
        (f) =>
          f.matrix.length === selectedPhoto.filter?.length &&
          f.matrix.every((v, i) => v === selectedPhoto.filter?.[i]),
      )?.id ?? 'none'
    : 'none';

  const handleFilterPress = useCallback(
    (filter: FilterPreset) => {
      if (selectedPhotoId === null) return;

      const filterValue = filter.id === 'none' ? undefined : [...filter.matrix];
      updatePhoto(selectedPhotoId, { filter: filterValue });
    },
    [selectedPhotoId, updatePhoto],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter</Text>
        {selectedPhotoId === null && (
          <Text style={styles.hint}>Select a photo first</Text>
        )}
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_PRESETS.map((filter) => (
          <FilterItem
            key={filter.id}
            filter={filter}
            isSelected={currentFilterId === filter.id}
            onPress={() => handleFilterPress(filter)}
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
  hint: {
    color: RAVE_COLORS.mediumGray,
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
    marginLeft: 12,
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
    gap: 10,
    paddingVertical: 8,
  },
  filterItem: {
    alignItems: 'center',
    width: 72,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  filterItemSelected: {
    borderColor: RAVE_COLORS.hotPink,
    backgroundColor: RAVE_COLORS.hotPink + '15',
  },
  filterSwatch: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BACKGROUND.border,
  },
  noneIndicator: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noneLine: {
    width: 36,
    height: 2,
    backgroundColor: RAVE_COLORS.lightGray,
    transform: [{ rotate: '-45deg' }],
  },
  filterName: {
    color: RAVE_COLORS.lightGray,
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  filterNameSelected: {
    color: RAVE_COLORS.hotPink,
  },
});
