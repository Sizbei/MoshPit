import { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { useCollageState } from '../../hooks/useCollageState';

const SOLID_COLORS: readonly { readonly id: string; readonly color: string; readonly label: string }[] = [
  { id: 'black', color: '#000000', label: 'Black' },
  { id: 'dark-gray', color: RAVE_COLORS.darkGray, label: 'Dark' },
  { id: 'medium-gray', color: RAVE_COLORS.mediumGray, label: 'Gray' },
  { id: 'white', color: RAVE_COLORS.white, label: 'White' },
  { id: 'hot-pink', color: RAVE_COLORS.hotPink, label: 'Pink' },
  { id: 'electric-blue', color: RAVE_COLORS.electricBlue, label: 'Blue' },
  { id: 'acid-green', color: RAVE_COLORS.acidGreen, label: 'Green' },
  { id: 'uv-purple', color: RAVE_COLORS.uvPurple, label: 'Purple' },
  { id: 'laser-red', color: RAVE_COLORS.laserRed, label: 'Red' },
  { id: 'neon-orange', color: RAVE_COLORS.neonOrange, label: 'Orange' },
  { id: 'cyber-yellow', color: RAVE_COLORS.cyberYellow, label: 'Yellow' },
];

interface GradientOption {
  readonly id: string;
  readonly label: string;
  readonly colorStart: string;
  readonly colorEnd: string;
}

const GRADIENT_OPTIONS: readonly GradientOption[] = [
  { id: 'grad-pink-purple', label: 'Pink Purple', colorStart: RAVE_COLORS.hotPink, colorEnd: RAVE_COLORS.uvPurple },
  { id: 'grad-blue-purple', label: 'Blue Purple', colorStart: RAVE_COLORS.electricBlue, colorEnd: RAVE_COLORS.uvPurple },
  { id: 'grad-sunset', label: 'Sunset', colorStart: RAVE_COLORS.neonOrange, colorEnd: RAVE_COLORS.hotPink },
  { id: 'grad-dark', label: 'Dark Fade', colorStart: '#1A1A1A', colorEnd: '#0A0A0A' },
];

interface BackgroundPickerProps {
  readonly onClose: () => void;
}

export function BackgroundPicker({ onClose }: BackgroundPickerProps) {
  const backgroundColor = useCollageState((s) => s.backgroundColor);
  const setBackgroundColor = useCollageState((s) => s.setBackgroundColor);

  const handleSolidPress = useCallback(
    (color: string) => {
      setBackgroundColor(color);
    },
    [setBackgroundColor],
  );

  const handleGradientPress = useCallback(
    (gradient: GradientOption) => {
      // For now, set the start color as background since Skia canvas
      // uses a single Fill color. Gradient support can be added later
      // by storing gradient data in the collage state.
      setBackgroundColor(gradient.colorStart);
    },
    [setBackgroundColor],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Background</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>

      {/* Solid Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Solid Colors</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.swatchRow}
        >
          {SOLID_COLORS.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => handleSolidPress(item.color)}
              style={styles.swatchWrapper}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: item.color },
                  backgroundColor === item.color && styles.swatchSelected,
                  item.color === '#000000' && styles.swatchDarkBorder,
                ]}
              />
              <Text style={styles.swatchLabel}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Gradients */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Gradients</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gradientRow}
        >
          {GRADIENT_OPTIONS.map((gradient) => (
            <Pressable
              key={gradient.id}
              onPress={() => handleGradientPress(gradient)}
              style={[
                styles.gradientWrapper,
                backgroundColor === gradient.colorStart && styles.gradientWrapperSelected,
              ]}
            >
              <View style={styles.gradientPreview}>
                <View
                  style={[
                    styles.gradientHalf,
                    { backgroundColor: gradient.colorStart },
                    styles.gradientHalfLeft,
                  ]}
                />
                <View
                  style={[
                    styles.gradientHalf,
                    { backgroundColor: gradient.colorEnd },
                    styles.gradientHalfRight,
                  ]}
                />
              </View>
              <Text style={styles.gradientLabel}>{gradient.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND.surface,
    borderTopWidth: 1,
    borderTopColor: BACKGROUND.border,
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    color: RAVE_COLORS.hotPink,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    color: RAVE_COLORS.lightGray,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  swatchRow: {
    gap: 8,
    paddingBottom: 4,
  },
  swatchWrapper: {
    alignItems: 'center',
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: BACKGROUND.border,
    marginBottom: 4,
  },
  swatchSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  swatchDarkBorder: {
    borderColor: BACKGROUND.border,
  },
  swatchLabel: {
    color: RAVE_COLORS.lightGray,
    fontSize: 9,
    textAlign: 'center',
  },
  gradientRow: {
    gap: 10,
    paddingBottom: 4,
  },
  gradientWrapper: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 4,
  },
  gradientWrapperSelected: {
    borderColor: RAVE_COLORS.hotPink,
  },
  gradientPreview: {
    width: 56,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 4,
  },
  gradientHalf: {
    flex: 1,
  },
  gradientHalfLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  gradientHalfRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  gradientLabel: {
    color: RAVE_COLORS.lightGray,
    fontSize: 9,
    textAlign: 'center',
  },
});
