import { useCallback } from 'react';
import {
  Gesture,
  type GestureType,
  type ComposedGesture,
} from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';
import { useCollageState } from './useCollageState';
import type { CollagePhoto } from '../types/collage';

interface PhotoGestureResult {
  readonly gesture: GestureType | ComposedGesture;
  readonly animatedStyle: ReturnType<typeof useAnimatedStyle>;
  readonly translateX: SharedValue<number>;
  readonly translateY: SharedValue<number>;
  readonly scale: SharedValue<number>;
  readonly rotation: SharedValue<number>;
}

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
} as const;

const MIN_SCALE = 0.2;
const MAX_SCALE = 5;

function clampScale(value: number): number {
  'worklet';
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

export function usePhotoGestures(photo: CollagePhoto): PhotoGestureResult {
  const updatePhoto = useCollageState((s) => s.updatePhoto);
  const selectPhoto = useCollageState((s) => s.selectPhoto);

  // Current animated values
  const translateX = useSharedValue(photo.position.x);
  const translateY = useSharedValue(photo.position.y);
  const scale = useSharedValue(photo.scale);
  const rotation = useSharedValue(photo.rotation);

  // Saved values for gesture continuity (where the gesture started from)
  const savedTranslateX = useSharedValue(photo.position.x);
  const savedTranslateY = useSharedValue(photo.position.y);
  const savedScale = useSharedValue(photo.scale);
  const savedRotation = useSharedValue(photo.rotation);

  const commitToStore = useCallback(
    (x: number, y: number, s: number, r: number) => {
      updatePhoto(photo.id, {
        position: { x, y },
        scale: s,
        rotation: r,
      });
    },
    [photo.id, updatePhoto],
  );

  const handleSelect = useCallback(() => {
    selectPhoto(photo.id);
  }, [photo.id, selectPhoto]);

  // --- Tap gesture to select ---
  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onStart(() => {
      runOnJS(handleSelect)();
    });

  // --- Pan gesture for translation ---
  const panGesture = Gesture.Pan()
    .minDistance(5)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      runOnJS(handleSelect)();
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      runOnJS(commitToStore)(
        translateX.value,
        translateY.value,
        scale.value,
        rotation.value,
      );
    });

  // --- Pinch gesture for scale ---
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      scale.value = clampScale(savedScale.value * event.scale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(commitToStore)(
        translateX.value,
        translateY.value,
        scale.value,
        rotation.value,
      );
    });

  // --- Rotation gesture ---
  const rotationGesture = Gesture.Rotation()
    .onStart(() => {
      savedRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      rotation.value = savedRotation.value + event.rotation;
    })
    .onEnd(() => {
      savedRotation.value = rotation.value;
      runOnJS(commitToStore)(
        translateX.value,
        translateY.value,
        scale.value,
        rotation.value,
      );
    });

  // Combine pan + pinch + rotation as simultaneous gestures,
  // then race with tap so taps are recognized independently
  const simultaneousGestures = Gesture.Simultaneous(
    panGesture,
    pinchGesture,
    rotationGesture,
  );

  const composedGesture = Gesture.Race(tapGesture, simultaneousGestures);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}rad` },
      { scale: scale.value },
    ],
  }));

  return {
    gesture: composedGesture,
    animatedStyle,
    translateX,
    translateY,
    scale,
    rotation,
  };
}
