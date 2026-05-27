import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { useCollageState } from '../../hooks/useCollageState';
import { downscaleImage } from '../../utils/imageUtils';
import { LayoutPicker } from './LayoutPicker';
import { StickerPicker } from './StickerPicker';
import { FilterPicker } from './FilterPicker';
import { TextEditor } from './TextEditor';
import { AspectRatioPicker } from './AspectRatioPicker';
import { BackgroundPicker } from './BackgroundPicker';

const TOOLS = [
  { id: 'photos', label: 'Photos' },
  { id: 'layout', label: 'Layout' },
  { id: 'ratio', label: 'Ratio' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'text', label: 'Text' },
  { id: 'filter', label: 'Filter' },
  { id: 'background', label: 'BG' },
] as const;

type ToolId = (typeof TOOLS)[number]['id'];

export function ToolBar() {
  const addPhoto = useCollageState((s) => s.addPhoto);
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  const handleAddPhotos = useCallback(async () => {
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
  }, [addPhoto]);

  const handleToolPress = useCallback(
    (toolId: ToolId) => {
      if (toolId === 'photos') {
        // Photos tool opens the image picker directly, no panel
        handleAddPhotos();
        return;
      }

      // Toggle: tapping the same tool again hides the panel
      setActiveTool((prev) => (prev === toolId ? null : toolId));
    },
    [handleAddPhotos],
  );

  const handleClosePanel = useCallback(() => {
    setActiveTool(null);
  }, []);

  return (
    <View style={styles.wrapper}>
      {/* Active panel rendered above the toolbar strip */}
      {activeTool === 'layout' && <LayoutPicker />}
      {activeTool === 'ratio' && <AspectRatioPicker onClose={handleClosePanel} />}
      {activeTool === 'stickers' && <StickerPicker onClose={handleClosePanel} />}
      {activeTool === 'text' && <TextEditor onClose={handleClosePanel} />}
      {activeTool === 'filter' && <FilterPicker onClose={handleClosePanel} />}
      {activeTool === 'background' && <BackgroundPicker onClose={handleClosePanel} />}

      {/* Toolbar strip */}
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <Pressable
                key={tool.id}
                style={[
                  styles.tool,
                  isActive && styles.toolActive,
                ]}
                onPress={() => handleToolPress(tool.id)}
              >
                <Text
                  style={[
                    styles.toolLabel,
                    isActive && styles.toolLabelActive,
                  ]}
                >
                  {tool.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: BACKGROUND.surface,
  },
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
  toolActive: {
    borderColor: RAVE_COLORS.hotPink,
    backgroundColor: RAVE_COLORS.hotPink + '20',
  },
  toolLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  toolLabelActive: {
    color: RAVE_COLORS.hotPink,
  },
});
