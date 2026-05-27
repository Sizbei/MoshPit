import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { useCollageState } from '../../hooks/useCollageState';

const COLOR_SWATCHES: readonly string[] = [
  RAVE_COLORS.white,
  RAVE_COLORS.hotPink,
  RAVE_COLORS.electricBlue,
  RAVE_COLORS.acidGreen,
  RAVE_COLORS.uvPurple,
  RAVE_COLORS.laserRed,
  RAVE_COLORS.neonOrange,
  RAVE_COLORS.cyberYellow,
  RAVE_COLORS.lightGray,
  RAVE_COLORS.deepBlack,
];

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 72;
const SLIDER_STEPS = MAX_FONT_SIZE - MIN_FONT_SIZE;

interface TextEditorProps {
  readonly onClose: () => void;
  readonly selectedTextId?: string | null;
}

export function TextEditor({ onClose, selectedTextId }: TextEditorProps) {
  const textOverlays = useCollageState((s) => s.textOverlays);
  const addText = useCollageState((s) => s.addText);
  const updateText = useCollageState((s) => s.updateText);
  const removeText = useCollageState((s) => s.removeText);

  const editingOverlay = useMemo(
    () => textOverlays.find((t) => t.id === selectedTextId) ?? null,
    [textOverlays, selectedTextId],
  );

  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState<string>(RAVE_COLORS.white);
  const [glowEnabled, setGlowEnabled] = useState(false);
  const [glowColor, setGlowColor] = useState<string>(RAVE_COLORS.hotPink);

  useEffect(() => {
    if (editingOverlay !== null) {
      setText(editingOverlay.text);
      setFontSize(editingOverlay.fontSize);
      setColor(editingOverlay.color);
      setGlowEnabled(editingOverlay.glowEnabled);
      setGlowColor(editingOverlay.glowColor ?? RAVE_COLORS.hotPink);
    }
  }, [editingOverlay]);

  const handleAddOrUpdate = useCallback(() => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;

    if (editingOverlay !== null) {
      updateText(editingOverlay.id, {
        text: trimmed,
        fontSize,
        color,
        glowEnabled,
        glowColor: glowEnabled ? glowColor : undefined,
      });
    } else {
      addText(trimmed, { x: 100, y: 100 });
      // After adding, immediately update with styled properties
      // The newest overlay is the last in the array
      const state = useCollageState.getState();
      const newest = state.textOverlays[state.textOverlays.length - 1];
      if (newest !== undefined) {
        updateText(newest.id, {
          fontSize,
          color,
          glowEnabled,
          glowColor: glowEnabled ? glowColor : undefined,
        });
      }
    }

    // Reset for next entry
    if (editingOverlay === null) {
      setText('');
    }
    onClose();
  }, [text, fontSize, color, glowEnabled, glowColor, editingOverlay, addText, updateText, onClose]);

  const handleDelete = useCallback(() => {
    if (editingOverlay !== null) {
      removeText(editingOverlay.id);
      onClose();
    }
  }, [editingOverlay, removeText, onClose]);

  const fontSizeProgress = (fontSize - MIN_FONT_SIZE) / SLIDER_STEPS;

  const handleSliderPress = useCallback(
    (locationX: number, layoutWidth: number) => {
      const ratio = Math.max(0, Math.min(1, locationX / layoutWidth));
      const newSize = Math.round(MIN_FONT_SIZE + ratio * SLIDER_STEPS);
      setFontSize(newSize);
    },
    [],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {editingOverlay !== null ? 'Edit Text' : 'Add Text'}
        </Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Cancel</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
        {/* Text Input */}
        <View style={styles.section}>
          <TextInput
            style={[styles.textInput, { fontSize: Math.min(fontSize, 32), color }]}
            placeholder="Type something..."
            placeholderTextColor={RAVE_COLORS.mediumGray}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={100}
          />
        </View>

        {/* Font Size Slider */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Font Size</Text>
            <Text style={styles.sectionValue}>{fontSize}px</Text>
          </View>
          <Pressable
            style={styles.sliderTrack}
            onPress={(e) => {
              const target = e.currentTarget;
              target.measure((_x, _y, width) => {
                handleSliderPress(e.nativeEvent.locationX, width);
              });
            }}
          >
            <View
              style={[
                styles.sliderFill,
                { width: `${fontSizeProgress * 100}%` },
              ]}
            />
            <View
              style={[
                styles.sliderThumb,
                { left: `${fontSizeProgress * 100}%` },
              ]}
            />
          </Pressable>
        </View>

        {/* Color Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Text Color</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.swatchRow}
          >
            {COLOR_SWATCHES.map((swatch) => (
              <Pressable
                key={swatch}
                onPress={() => setColor(swatch)}
                style={[
                  styles.swatch,
                  { backgroundColor: swatch },
                  color === swatch && styles.swatchSelected,
                ]}
              />
            ))}
          </ScrollView>
        </View>

        {/* Glow Toggle */}
        <View style={styles.section}>
          <Pressable
            style={styles.toggleRow}
            onPress={() => setGlowEnabled((prev) => !prev)}
          >
            <Text style={styles.sectionLabel}>Neon Glow</Text>
            <View
              style={[
                styles.toggle,
                glowEnabled && styles.toggleActive,
              ]}
            >
              <View
                style={[
                  styles.toggleThumb,
                  glowEnabled && styles.toggleThumbActive,
                ]}
              />
            </View>
          </Pressable>
        </View>

        {/* Glow Color Picker */}
        {glowEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Glow Color</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.swatchRow}
            >
              {COLOR_SWATCHES.map((swatch) => (
                <Pressable
                  key={`glow-${swatch}`}
                  onPress={() => setGlowColor(swatch)}
                  style={[
                    styles.swatch,
                    { backgroundColor: swatch },
                    glowColor === swatch && styles.swatchSelected,
                  ]}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Preview */}
        {text.trim().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Preview</Text>
            <View style={styles.previewContainer}>
              <Text
                style={[
                  styles.previewText,
                  {
                    fontSize: Math.min(fontSize, 40),
                    color,
                    ...(glowEnabled
                      ? {
                          textShadowColor: glowColor,
                          textShadowRadius: 12,
                          textShadowOffset: { width: 0, height: 0 },
                        }
                      : {}),
                  },
                ]}
              >
                {text}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {editingOverlay !== null && (
          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        )}
        <Pressable
          style={[
            styles.addButton,
            text.trim().length === 0 && styles.addButtonDisabled,
          ]}
          onPress={handleAddOrUpdate}
          disabled={text.trim().length === 0}
        >
          <Text style={styles.addButtonText}>
            {editingOverlay !== null ? 'Update Text' : 'Add Text'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND.surface,
    borderTopWidth: 1,
    borderTopColor: BACKGROUND.border,
    maxHeight: 420,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
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
  scrollArea: {
    paddingHorizontal: 16,
  },
  section: {
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    color: RAVE_COLORS.lightGray,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionValue: {
    color: RAVE_COLORS.hotPink,
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: BACKGROUND.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    minHeight: 50,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
    fontWeight: '600',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: BACKGROUND.card,
    borderRadius: 3,
    justifyContent: 'center',
    marginTop: 4,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: RAVE_COLORS.hotPink,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    marginLeft: -10,
    top: -7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  swatchRow: {
    gap: 8,
    paddingVertical: 4,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BACKGROUND.border,
  },
  swatchSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: BACKGROUND.card,
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
  },
  toggleActive: {
    backgroundColor: RAVE_COLORS.hotPink + '40',
    borderColor: RAVE_COLORS.hotPink,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: RAVE_COLORS.mediumGray,
  },
  toggleThumbActive: {
    backgroundColor: RAVE_COLORS.hotPink,
    alignSelf: 'flex-end',
  },
  previewContainer: {
    backgroundColor: BACKGROUND.card,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
  },
  previewText: {
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: RAVE_COLORS.laserRed,
  },
  deleteButtonText: {
    color: RAVE_COLORS.laserRed,
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: RAVE_COLORS.hotPink,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
