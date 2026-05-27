import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { downscaleImage } from '../../utils/imageUtils';

interface PhotoPickerProps {
  readonly onPhotosSelected: (uris: readonly string[]) => void;
  readonly selectionLimit?: number;
  readonly allowCamera?: boolean;
}

type PickerSource = 'library' | 'camera';

export function PhotoPicker({
  onPhotosSelected,
  selectionLimit = 10,
  allowCamera = true,
}: PhotoPickerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const processAssets = useCallback(
    async (assets: readonly ImagePicker.ImagePickerAsset[]) => {
      setIsProcessing(true);
      setTotalCount(assets.length);
      setProcessedCount(0);

      const processedUris: string[] = [];

      for (const asset of assets) {
        try {
          const uri = await downscaleImage(asset.uri);
          processedUris.push(uri);
        } catch {
          // Skip assets that fail to process
          processedUris.push(asset.uri);
        }
        setProcessedCount((prev) => prev + 1);
      }

      setIsProcessing(false);
      setProcessedCount(0);
      setTotalCount(0);

      if (processedUris.length > 0) {
        onPhotosSelected(processedUris);
      }
    },
    [onPhotosSelected],
  );

  const launchPicker = useCallback(
    async (source: PickerSource) => {
      if (isProcessing) return;

      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: 1,
          allowsEditing: false,
        });

        if (result.canceled || result.assets.length === 0) return;
        await processAssets(result.assets);
      } else {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          quality: 1,
          selectionLimit,
        });

        if (result.canceled || result.assets.length === 0) return;
        await processAssets(result.assets);
      }
    },
    [isProcessing, processAssets, selectionLimit],
  );

  if (isProcessing) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RAVE_COLORS.hotPink} />
          <Text style={styles.loadingText}>
            Processing {processedCount}/{totalCount}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    totalCount > 0
                      ? `${(processedCount / totalCount) * 100}%`
                      : '0%',
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => launchPicker('library')}
      >
        <Text style={styles.buttonIcon}>+</Text>
        <Text style={styles.buttonText}>Add from Library</Text>
      </Pressable>

      {allowCamera && (
        <Pressable
          style={styles.cameraButton}
          onPress={() => launchPicker('camera')}
        >
          <Text style={styles.buttonIcon}>&#x1F4F7;</Text>
          <Text style={styles.buttonText}>Take Photo</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    padding: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: RAVE_COLORS.hotPink,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND.card,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: RAVE_COLORS.hotPink,
    gap: 8,
  },
  buttonIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    color: RAVE_COLORS.lightGray,
    fontSize: 14,
  },
  progressBar: {
    width: '80%',
    height: 4,
    backgroundColor: BACKGROUND.card,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: RAVE_COLORS.hotPink,
    borderRadius: 2,
  },
});
