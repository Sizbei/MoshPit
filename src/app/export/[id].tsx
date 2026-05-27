import { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { useExport } from '../../hooks/useExport';
import { useCollageSync } from '../../hooks/useCollageSync';
import { CollageCanvas } from '../../components/canvas/CollageCanvas';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

type Resolution = '1080p' | '4k';

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

export default function ExportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { exportCollage, isExporting } = useExport();
  const { save, isSaving } = useCollageSync();

  const [selectedResolution, setSelectedResolution] = useState<Resolution>('1080p');
  const [exportedUri, setExportedUri] = useState<string | null>(null);
  const [isSavingToPhotos, setIsSavingToPhotos] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ---- Show a brief success toast ----
  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3_000);
  }, []);

  // ---- Export the collage to a local file ----
  const handleExport = useCallback(async (): Promise<string | null> => {
    try {
      const result = await exportCollage(selectedResolution);
      setExportedUri(result.uri);
      return result.uri;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Export failed. Please try again.';
      Alert.alert('Export Error', message, [
        { text: 'Retry', onPress: () => void handleExport() },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return null;
    }
  }, [exportCollage, selectedResolution]);

  // ---- Save to Photos ----
  const handleSaveToPhotos = useCallback(async () => {
    setIsSavingToPhotos(true);

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Allow access to save collages to your photo library.',
        );
        return;
      }

      const uri = exportedUri ?? (await handleExport());
      if (!uri) return;

      await MediaLibrary.saveToLibraryAsync(uri);
      showSuccess('Saved to Photos');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not save to photos.';
      Alert.alert('Save Error', message, [
        { text: 'Retry', onPress: () => void handleSaveToPhotos() },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } finally {
      setIsSavingToPhotos(false);
    }
  }, [exportedUri, handleExport, showSuccess]);

  // ---- Save to Cloud (Supabase) ----
  const handleSaveToCloud = useCallback(async () => {
    const result = await save();
    if (result.error) {
      Alert.alert('Cloud Save Error', result.error, [
        { text: 'Retry', onPress: () => void handleSaveToCloud() },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    showSuccess('Saved to Cloud');
  }, [save, showSuccess]);

  // ---- Share ----
  const handleShare = useCallback(async () => {
    setIsSharing(true);

    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Sharing not available on this device');
        return;
      }

      const uri = exportedUri ?? (await handleExport());
      if (!uri) return;

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Share your MoshPit collage',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Could not share.';
      Alert.alert('Share Error', message);
    } finally {
      setIsSharing(false);
    }
  }, [exportedUri, handleExport]);

  const isBusy = isExporting || isSavingToPhotos || isSaving || isSharing;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 20 },
      ]}
    >
      {/* Preview */}
      <View style={styles.preview}>
        <CollageCanvas />
      </View>

      {/* Success toast */}
      {successMessage ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{successMessage}</Text>
        </View>
      ) : null}

      {/* Resolution selector */}
      <View style={styles.resolutionRow}>
        <Text style={styles.sectionLabel}>Resolution</Text>
        <View style={styles.resolutionOptions}>
          <Pressable
            style={[
              styles.resolutionOption,
              selectedResolution === '1080p' && styles.resolutionSelected,
            ]}
            onPress={() => setSelectedResolution('1080p')}
          >
            <Text
              style={[
                styles.resolutionText,
                selectedResolution === '1080p' && styles.resolutionTextSelected,
              ]}
            >
              1080p
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.resolutionOption,
              selectedResolution === '4k' && styles.resolutionSelected,
            ]}
            onPress={() => setSelectedResolution('4k')}
          >
            <Text
              style={[
                styles.resolutionText,
                selectedResolution === '4k' && styles.resolutionTextSelected,
              ]}
            >
              4K
            </Text>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Save to Photos */}
        <Pressable
          style={[styles.primaryButton, isBusy && styles.buttonDisabled]}
          onPress={handleSaveToPhotos}
          disabled={isBusy}
        >
          {isSavingToPhotos || isExporting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Save to Photos</Text>
          )}
        </Pressable>

        {/* Save to Cloud */}
        <Pressable
          style={[styles.secondaryButton, isBusy && styles.buttonDisabled]}
          onPress={handleSaveToCloud}
          disabled={isBusy}
        >
          {isSaving ? (
            <ActivityIndicator color={RAVE_COLORS.hotPink} size="small" />
          ) : (
            <Text style={styles.secondaryButtonText}>Save to Cloud</Text>
          )}
        </Pressable>

        {/* Share */}
        <Pressable
          style={[styles.secondaryButton, isBusy && styles.buttonDisabled]}
          onPress={handleShare}
          disabled={isBusy}
        >
          {isSharing ? (
            <ActivityIndicator color={RAVE_COLORS.hotPink} size="small" />
          ) : (
            <Text style={styles.secondaryButtonText}>Share</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND.editor,
  },
  content: {
    padding: 20,
  },
  preview: {
    aspectRatio: 1,
    backgroundColor: BACKGROUND.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  toast: {
    backgroundColor: RAVE_COLORS.acidGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 16,
  },
  toastText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionLabel: {
    color: RAVE_COLORS.lightGray,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  resolutionRow: {
    marginBottom: 24,
  },
  resolutionOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  resolutionOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: BACKGROUND.card,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
    gap: 6,
  },
  resolutionSelected: {
    borderColor: RAVE_COLORS.hotPink,
    backgroundColor: 'rgba(255, 16, 240, 0.1)',
  },
  resolutionText: {
    color: RAVE_COLORS.lightGray,
    fontSize: 15,
    fontWeight: '600',
  },
  resolutionTextSelected: {
    color: RAVE_COLORS.hotPink,
  },
  proBadge: {
    backgroundColor: RAVE_COLORS.cyberYellow,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proBadgeText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: RAVE_COLORS.hotPink,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: BACKGROUND.card,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: RAVE_COLORS.hotPink,
    minHeight: 52,
  },
  secondaryButtonText: {
    color: RAVE_COLORS.hotPink,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
