import { useCallback } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { Canvas, Image, useImage, Fill } from '@shopify/react-native-skia';
import type { CollagePhoto as CollagePhotoType } from '../../types/collage';
import { usePhotoGestures } from '../../hooks/useGestures';
import { useCollageState } from '../../hooks/useCollageState';
import { RAVE_COLORS } from '../../utils/colors';

interface Props {
  readonly photo: CollagePhotoType;
  readonly isSelected: boolean;
}

const SELECTION_BORDER_WIDTH = 2;

export function InteractivePhoto({ photo, isSelected }: Props) {
  const image = useImage(photo.uri);
  const removePhoto = useCollageState((s) => s.removePhoto);
  const selectPhoto = useCollageState((s) => s.selectPhoto);
  const { gesture, animatedStyle } = usePhotoGestures(photo);

  const handleDelete = useCallback(() => {
    Alert.alert('Remove Photo', 'Remove this photo from the collage?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removePhoto(photo.id),
      },
    ]);
  }, [photo.id, removePhoto]);

  const handleLongPressSelect = useCallback(() => {
    selectPhoto(photo.id);
  }, [photo.id, selectPhoto]);

  // Long press gesture to trigger delete confirmation
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      runOnJS(handleLongPressSelect)();
      runOnJS(handleDelete)();
    });

  // Combine the photo gestures with long press using exclusive detection:
  // long press takes priority when held, otherwise falls through to pan/pinch/rotate
  const composedGesture = Gesture.Exclusive(longPressGesture, gesture);

  const containerWidth = photo.size.width + SELECTION_BORDER_WIDTH * 2;
  const containerHeight = photo.size.height + SELECTION_BORDER_WIDTH * 2;

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View
        style={[
          styles.container,
          {
            width: containerWidth,
            height: containerHeight,
            zIndex: photo.zIndex,
          },
          isSelected && styles.selected,
          animatedStyle,
        ]}
      >
        <Canvas
          style={{
            width: photo.size.width,
            height: photo.size.height,
          }}
        >
          {image ? (
            <Image
              image={image}
              x={0}
              y={0}
              width={photo.size.width}
              height={photo.size.height}
              fit="cover"
            />
          ) : (
            <Fill color="#333333" />
          )}
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: SELECTION_BORDER_WIDTH,
    borderWidth: SELECTION_BORDER_WIDTH,
    borderColor: 'transparent',
    borderRadius: 4,
  },
  selected: {
    borderColor: RAVE_COLORS.hotPink,
    shadowColor: RAVE_COLORS.hotPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
});
