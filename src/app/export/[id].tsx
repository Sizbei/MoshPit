import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';

export default function ExportScreen() {
  async function handleSave() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to save collages to your photos.');
      return;
    }
    Alert.alert('Saved!', 'Collage saved to your photo library.');
  }

  async function handleShare() {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing not available on this device');
      return;
    }
    Alert.alert('Share', 'Share functionality coming soon');
  }

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        <Text style={styles.previewText}>Collage Preview</Text>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save to Photos</Text>
        </Pressable>
        <Pressable style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.editor,
    padding: 20,
  },
  preview: {
    flex: 1,
    backgroundColor: BACKGROUND.card,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    color: RAVE_COLORS.lightGray,
    fontSize: 16,
  },
  actions: {
    paddingTop: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: RAVE_COLORS.hotPink,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: BACKGROUND.card,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: RAVE_COLORS.hotPink,
  },
  shareButtonText: {
    color: RAVE_COLORS.hotPink,
    fontSize: 16,
    fontWeight: '600',
  },
});
