import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useCollageState } from '../../hooks/useCollageState';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import type { CollagePhoto } from '../../types/collage';

const THUMBNAIL_SIZE = 56;

interface PhotoTrayProps {
  readonly onAddPhotos: () => void;
}

interface ThumbnailProps {
  readonly photo: CollagePhoto;
  readonly isSelected: boolean;
  readonly onSelect: (id: string) => void;
  readonly onRemove: (id: string) => void;
}

function Thumbnail({ photo, isSelected, onSelect, onRemove }: ThumbnailProps) {
  const handleLongPress = useCallback(() => {
    Alert.alert('Remove Photo', 'Remove this photo from the collage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => onRemove(photo.id),
      },
    ]);
  }, [photo.id, onRemove]);

  return (
    <Pressable
      onPress={() => onSelect(photo.id)}
      onLongPress={handleLongPress}
      style={[
        styles.thumbnail,
        isSelected && styles.thumbnailSelected,
      ]}
    >
      <Image
        source={{ uri: photo.uri }}
        style={styles.thumbnailImage}
        resizeMode="cover"
      />
    </Pressable>
  );
}

export function PhotoTray({ onAddPhotos }: PhotoTrayProps) {
  const photos = useCollageState((s) => s.photos);
  const selectedPhotoId = useCollageState((s) => s.selectedPhotoId);
  const selectPhoto = useCollageState((s) => s.selectPhoto);
  const removePhoto = useCollageState((s) => s.removePhoto);

  const handleSelect = useCallback(
    (id: string) => {
      selectPhoto(selectedPhotoId === id ? null : id);
    },
    [selectPhoto, selectedPhotoId],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removePhoto(id);
    },
    [removePhoto],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          Photos ({photos.length})
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.map((photo) => (
          <Thumbnail
            key={photo.id}
            photo={photo}
            isSelected={selectedPhotoId === photo.id}
            onSelect={handleSelect}
            onRemove={handleRemove}
          />
        ))}
        <Pressable style={styles.addButton} onPress={onAddPhotos}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND.surface,
    borderTopWidth: 1,
    borderTopColor: BACKGROUND.border,
    paddingVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  label: {
    color: RAVE_COLORS.lightGray,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: RAVE_COLORS.hotPink,
    shadowColor: RAVE_COLORS.hotPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  addButton: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: RAVE_COLORS.hotPink,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BACKGROUND.card,
  },
  addButtonText: {
    color: RAVE_COLORS.hotPink,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
});
