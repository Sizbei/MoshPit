import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { useCollageState } from '../../hooks/useCollageState';
import { downscaleImage } from '../../utils/imageUtils';

const TOOLS = [
  { id: 'photos', label: 'Photos' },
  { id: 'layout', label: 'Layout' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'text', label: 'Text' },
  { id: 'filter', label: 'Filter' },
  { id: 'background', label: 'BG' },
] as const;

export function ToolBar() {
  const addPhoto = useCollageState((s) => s.addPhoto);

  async function handleAddPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10,
    });

    if (result.canceled) return;

    for (const asset of result.assets) {
      const uri = await downscaleImage(asset.uri);
      addPhoto(uri);
    }
  }

  function handleToolPress(toolId: string) {
    switch (toolId) {
      case 'photos':
        handleAddPhotos();
        break;
      default:
        break;
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TOOLS.map((tool) => (
          <Pressable
            key={tool.id}
            style={styles.tool}
            onPress={() => handleToolPress(tool.id)}
          >
            <Text style={styles.toolLabel}>{tool.label}</Text>
          </Pressable>
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
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tool: {
    backgroundColor: BACKGROUND.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
  },
  toolLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
