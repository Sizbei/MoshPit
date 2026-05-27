import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CollageCanvas } from '../../components/canvas/CollageCanvas';
import { ToolBar } from '../../components/editor/ToolBar';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { useCollageState } from '../../hooks/useCollageState';

export default function EditorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const collageType = useCollageState((s) => s.type);
  const photoCount = useCollageState((s) => s.photos.length);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {collageType.charAt(0).toUpperCase() + collageType.slice(1)} ({photoCount})
        </Text>
        <Pressable
          onPress={() => {
            const id = useCollageState.getState().id;
            router.push(`/export/${id}`);
          }}
          style={styles.exportButton}
        >
          <Text style={styles.exportButtonText}>Export</Text>
        </Pressable>
      </View>

      <View style={styles.canvasContainer}>
        <CollageCanvas />
      </View>

      <ToolBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.editor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    color: RAVE_COLORS.lightGray,
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exportButton: {
    backgroundColor: RAVE_COLORS.hotPink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  canvasContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
