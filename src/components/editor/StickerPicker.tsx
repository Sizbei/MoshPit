import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
  TextInput,
  type ListRenderItemInfo,
} from 'react-native';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { useCollageState } from '../../hooks/useCollageState';

interface PlaceholderSticker {
  readonly id: string;
  readonly packId: string;
  readonly emoji: string;
  readonly label: string;
  readonly tags: readonly string[];
}

const PACKS = [
  { id: 'neon-basics', name: 'Neon Basics', category: 'rave-art' as const },
  { id: 'bass-culture', name: 'Bass Culture', category: 'genre' as const },
  { id: 'festival-essentials', name: 'Festival Essentials', category: 'festival' as const },
  { id: 'rave-faces', name: 'Rave Faces', category: 'rave-art' as const },
  { id: 'text-stickers', name: 'Text Stickers', category: 'text' as const },
] as const;

const STICKER_DATA: readonly PlaceholderSticker[] = [
  // Neon Basics
  { id: 'nb-1', packId: 'neon-basics', emoji: '⚡', label: 'Lightning', tags: ['lightning', 'energy', 'neon'] },
  { id: 'nb-2', packId: 'neon-basics', emoji: '⭐', label: 'Star', tags: ['star', 'sparkle', 'neon'] },
  { id: 'nb-3', packId: 'neon-basics', emoji: '❤️', label: 'Heart', tags: ['heart', 'love', 'neon'] },
  { id: 'nb-4', packId: 'neon-basics', emoji: '🔥', label: 'Fire', tags: ['fire', 'hot', 'neon'] },
  { id: 'nb-5', packId: 'neon-basics', emoji: '✨', label: 'Sparkles', tags: ['sparkles', 'magic', 'neon'] },
  { id: 'nb-6', packId: 'neon-basics', emoji: '🌙', label: 'Moon', tags: ['moon', 'night', 'neon'] },
  { id: 'nb-7', packId: 'neon-basics', emoji: '☀️', label: 'Sun', tags: ['sun', 'day', 'neon'] },
  { id: 'nb-8', packId: 'neon-basics', emoji: '🌈', label: 'Rainbow', tags: ['rainbow', 'color', 'neon'] },
  { id: 'nb-9', packId: 'neon-basics', emoji: '💎', label: 'Diamond', tags: ['diamond', 'gem', 'neon'] },
  { id: 'nb-10', packId: 'neon-basics', emoji: '❄️', label: 'Snowflake', tags: ['snowflake', 'ice', 'neon'] },

  // Bass Culture
  { id: 'bc-1', packId: 'bass-culture', emoji: '🎵', label: 'Music Note', tags: ['music', 'note', 'bass'] },
  { id: 'bc-2', packId: 'bass-culture', emoji: '🎧', label: 'Headphones', tags: ['headphone', 'audio', 'bass'] },
  { id: 'bc-3', packId: 'bass-culture', emoji: '🎤', label: 'Microphone', tags: ['microphone', 'sing', 'bass'] },
  { id: 'bc-4', packId: 'bass-culture', emoji: '🔊', label: 'Speaker', tags: ['speaker', 'loud', 'bass'] },
  { id: 'bc-5', packId: 'bass-culture', emoji: '🥁', label: 'Drum', tags: ['drum', 'beat', 'bass'] },
  { id: 'bc-6', packId: 'bass-culture', emoji: '🎸', label: 'Guitar', tags: ['guitar', 'string', 'bass'] },
  { id: 'bc-7', packId: 'bass-culture', emoji: '🎺', label: 'Trumpet', tags: ['trumpet', 'horn', 'bass'] },
  { id: 'bc-8', packId: 'bass-culture', emoji: '🎻', label: 'Violin', tags: ['violin', 'string', 'bass'] },
  { id: 'bc-9', packId: 'bass-culture', emoji: '🎶', label: 'DJ Notes', tags: ['dj', 'music', 'bass'] },
  { id: 'bc-10', packId: 'bass-culture', emoji: '📻', label: 'Radio', tags: ['radio', 'broadcast', 'bass'] },

  // Festival Essentials
  { id: 'fe-1', packId: 'festival-essentials', emoji: '⛺', label: 'Tent', tags: ['tent', 'camp', 'festival'] },
  { id: 'fe-2', packId: 'festival-essentials', emoji: '🎡', label: 'Ferris Wheel', tags: ['ferris', 'wheel', 'festival'] },
  { id: 'fe-3', packId: 'festival-essentials', emoji: '🎈', label: 'Balloon', tags: ['balloon', 'party', 'festival'] },
  { id: 'fe-4', packId: 'festival-essentials', emoji: '🎊', label: 'Confetti', tags: ['confetti', 'celebration', 'festival'] },
  { id: 'fe-5', packId: 'festival-essentials', emoji: '🏆', label: 'Trophy', tags: ['trophy', 'winner', 'festival'] },
  { id: 'fe-6', packId: 'festival-essentials', emoji: '🏅', label: 'Medal', tags: ['medal', 'award', 'festival'] },
  { id: 'fe-7', packId: 'festival-essentials', emoji: '🎀', label: 'Ribbon', tags: ['ribbon', 'bow', 'festival'] },
  { id: 'fe-8', packId: 'festival-essentials', emoji: '🚩', label: 'Flag', tags: ['flag', 'banner', 'festival'] },
  { id: 'fe-9', packId: 'festival-essentials', emoji: '👑', label: 'Crown', tags: ['crown', 'king', 'festival'] },
  { id: 'fe-10', packId: 'festival-essentials', emoji: '💎', label: 'Gem', tags: ['gem', 'jewel', 'festival'] },

  // Rave Faces
  { id: 'rf-1', packId: 'rave-faces', emoji: '😀', label: 'Grinning', tags: ['smiley', 'happy', 'face'] },
  { id: 'rf-2', packId: 'rave-faces', emoji: '🤩', label: 'Star Eyes', tags: ['smiley', 'star', 'face'] },
  { id: 'rf-3', packId: 'rave-faces', emoji: '😜', label: 'Winking', tags: ['smiley', 'wink', 'face'] },
  { id: 'rf-4', packId: 'rave-faces', emoji: '👽', label: 'Alien', tags: ['alien', 'space', 'face'] },
  { id: 'rf-5', packId: 'rave-faces', emoji: '🤖', label: 'Robot', tags: ['robot', 'tech', 'face'] },
  { id: 'rf-6', packId: 'rave-faces', emoji: '💀', label: 'Skull', tags: ['skull', 'death', 'face'] },
  { id: 'rf-7', packId: 'rave-faces', emoji: '👻', label: 'Ghost', tags: ['ghost', 'spooky', 'face'] },
  { id: 'rf-8', packId: 'rave-faces', emoji: '😈', label: 'Devil', tags: ['devil', 'evil', 'face'] },
  { id: 'rf-9', packId: 'rave-faces', emoji: '😇', label: 'Angel', tags: ['angel', 'halo', 'face'] },
  { id: 'rf-10', packId: 'rave-faces', emoji: '🤡', label: 'Clown', tags: ['clown', 'circus', 'face'] },
  { id: 'rf-11', packId: 'rave-faces', emoji: '😎', label: 'Sunglasses', tags: ['sunglasses', 'cool', 'face'] },
  { id: 'rf-12', packId: 'rave-faces', emoji: '🤯', label: 'Mind Blown', tags: ['mind', 'blown', 'face'] },

  // Text Stickers
  { id: 'ts-1', packId: 'text-stickers', emoji: 'PLUR', label: 'PLUR', tags: ['plur', 'peace', 'rave', 'text'] },
  { id: 'ts-2', packId: 'text-stickers', emoji: 'BASS FACE', label: 'BASS FACE', tags: ['bass', 'face', 'text'] },
  { id: 'ts-3', packId: 'text-stickers', emoji: 'SEND IT', label: 'SEND IT', tags: ['send', 'hype', 'text'] },
  { id: 'ts-4', packId: 'text-stickers', emoji: 'ONE MORE SONG', label: 'ONE MORE SONG', tags: ['song', 'encore', 'text'] },
  { id: 'ts-5', packId: 'text-stickers', emoji: 'RAVE FAM', label: 'RAVE FAM', tags: ['rave', 'family', 'text'] },
  { id: 'ts-6', packId: 'text-stickers', emoji: 'GOOD VIBES', label: 'GOOD VIBES', tags: ['good', 'vibes', 'text'] },
  { id: 'ts-7', packId: 'text-stickers', emoji: "LET'S GO", label: "LET'S GO", tags: ['lets', 'go', 'hype', 'text'] },
  { id: 'ts-8', packId: 'text-stickers', emoji: 'HEADLINER', label: 'HEADLINER', tags: ['headliner', 'main', 'text'] },
  { id: 'ts-9', packId: 'text-stickers', emoji: 'AFTER PARTY', label: 'AFTER PARTY', tags: ['after', 'party', 'text'] },
  { id: 'ts-10', packId: 'text-stickers', emoji: 'SUNRISE SET', label: 'SUNRISE SET', tags: ['sunrise', 'set', 'text'] },
];

const NUM_COLUMNS = 4;

function isTextSticker(packId: string): boolean {
  return packId === 'text-stickers';
}

interface StickerPickerProps {
  readonly onClose: () => void;
}

export function StickerPicker({ onClose }: StickerPickerProps) {
  const [selectedPackId, setSelectedPackId] = useState<string>(PACKS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const addSticker = useCollageState((s) => s.addSticker);

  const filteredStickers = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();

    return STICKER_DATA.filter((sticker) => {
      const matchesPack = lowerQuery.length > 0 || sticker.packId === selectedPackId;
      const matchesSearch =
        lowerQuery.length === 0 ||
        sticker.label.toLowerCase().includes(lowerQuery) ||
        sticker.tags.some((tag) => tag.includes(lowerQuery));
      return matchesPack && matchesSearch;
    });
  }, [selectedPackId, searchQuery]);

  const handleStickerPress = useCallback(
    (sticker: PlaceholderSticker) => {
      const centerPosition = { x: 150, y: 150 };
      addSticker(sticker.packId, sticker.id, sticker.emoji, centerPosition);
    },
    [addSticker],
  );

  const renderSticker = useCallback(
    ({ item }: ListRenderItemInfo<PlaceholderSticker>) => {
      const isText = isTextSticker(item.packId);
      return (
        <Pressable
          style={styles.stickerItem}
          onPress={() => handleStickerPress(item)}
        >
          {isText ? (
            <View style={styles.textStickerBadge}>
              <Text style={styles.textStickerLabel} numberOfLines={2} adjustsFontSizeToFit>
                {item.emoji}
              </Text>
            </View>
          ) : (
            <Text style={styles.stickerEmoji}>{item.emoji}</Text>
          )}
          <Text style={styles.stickerLabel} numberOfLines={1}>
            {item.label}
          </Text>
        </Pressable>
      );
    },
    [handleStickerPress],
  );

  const keyExtractor = useCallback((item: PlaceholderSticker) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stickers</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Done</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stickers..."
          placeholderTextColor={RAVE_COLORS.mediumGray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {searchQuery.length === 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.packTabs}
        >
          {PACKS.map((pack) => (
            <Pressable
              key={pack.id}
              style={[
                styles.packTab,
                selectedPackId === pack.id && styles.packTabSelected,
              ]}
              onPress={() => setSelectedPackId(pack.id)}
            >
              <Text
                style={[
                  styles.packTabText,
                  selectedPackId === pack.id && styles.packTabTextSelected,
                ]}
              >
                {pack.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={filteredStickers}
        renderItem={renderSticker}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        style={styles.grid}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND.surface,
    borderTopWidth: 1,
    borderTopColor: BACKGROUND.border,
    maxHeight: 360,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    backgroundColor: BACKGROUND.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
  },
  packTabs: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 6,
  },
  packTab: {
    backgroundColor: BACKGROUND.card,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BACKGROUND.border,
  },
  packTabSelected: {
    backgroundColor: RAVE_COLORS.hotPink + '20',
    borderColor: RAVE_COLORS.hotPink,
  },
  packTabText: {
    color: RAVE_COLORS.lightGray,
    fontSize: 13,
    fontWeight: '500',
  },
  packTabTextSelected: {
    color: RAVE_COLORS.hotPink,
  },
  grid: {
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  gridRow: {
    gap: 4,
  },
  stickerItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  stickerEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  textStickerBadge: {
    backgroundColor: RAVE_COLORS.hotPink + '30',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginBottom: 4,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  textStickerLabel: {
    color: RAVE_COLORS.hotPink,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  stickerLabel: {
    color: RAVE_COLORS.lightGray,
    fontSize: 10,
    textAlign: 'center',
  },
});
