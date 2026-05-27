import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { useCollageState } from '../../hooks/useCollageState';
import { downscaleImage, generateId } from '../../utils/imageUtils';
import type { CollageType } from '../../types/collage';

const COLLAGE_TYPES: readonly { type: CollageType; label: string; description: string }[] = [
  { type: 'grid', label: 'Grid', description: 'Classic grid layouts' },
  { type: 'freeform', label: 'Freeform', description: 'Scatter and overlap freely' },
  { type: 'polaroid', label: 'Polaroid', description: 'Instant photo style' },
  { type: 'filmstrip', label: 'Film Strip', description: '35mm negative aesthetic' },
  { type: 'strip', label: 'Long Strip', description: 'Scrollable timeline' },
  { type: 'mosaic', label: 'Mosaic', description: 'Photos form a larger image' },
  { type: 'shape', label: 'Shape', description: 'Fill a custom shape' },
  { type: 'timeline', label: 'Timeline', description: 'Chronological layout' },
];

export default function CreateScreen() {
  const router = useRouter();
  const { reset, setType, addPhoto } = useCollageState();

  async function handleCreate(type: CollageType) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 20,
    });

    if (result.canceled || result.assets.length === 0) return;

    reset();
    setType(type);

    for (const asset of result.assets) {
      const uri = await downscaleImage(asset.uri);
      addPhoto(uri);
    }

    const collageId = useCollageState.getState().id;
    router.push(`/editor/${collageId}`);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Choose a style</Text>
      <Text style={styles.subheading}>Pick photos after</Text>

      <View style={styles.grid}>
        {COLLAGE_TYPES.map(({ type, label, description }) => (
          <Pressable
            key={type}
            style={styles.card}
            onPress={() => handleCreate(type)}
          >
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardDesc}>{description}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.editor,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: RAVE_COLORS.lightGray,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: BACKGROUND.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: RAVE_COLORS.lightGray,
  },
});
