import { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import type { CollageType } from '../../types/collage';

// --------------------------------------------------------------------------
// Badge color mapping per collage type
// --------------------------------------------------------------------------

const TYPE_BADGE_COLORS: Record<CollageType, string> = {
  grid: RAVE_COLORS.electricBlue,
  freeform: RAVE_COLORS.hotPink,
  strip: RAVE_COLORS.acidGreen,
  polaroid: RAVE_COLORS.cyberYellow,
  filmstrip: RAVE_COLORS.neonOrange,
  mosaic: RAVE_COLORS.uvPurple,
  shape: RAVE_COLORS.laserRed,
  timeline: RAVE_COLORS.electricBlue,
};

const TYPE_LABELS: Record<CollageType, string> = {
  grid: 'Grid',
  freeform: 'Freeform',
  strip: 'Strip',
  polaroid: 'Polaroid',
  filmstrip: 'Film Strip',
  mosaic: 'Mosaic',
  shape: 'Shape',
  timeline: 'Timeline',
};

// --------------------------------------------------------------------------
// Relative date formatting
// --------------------------------------------------------------------------

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// --------------------------------------------------------------------------
// Props
// --------------------------------------------------------------------------

interface CollageCardProps {
  readonly id: string;
  readonly title: string;
  readonly type: CollageType;
  readonly thumbnailUrl: string | null;
  readonly updatedAt: string;
  readonly photoCount: number;
  readonly onPress: (id: string) => void;
  readonly onLongPress: (id: string) => void;
}

// --------------------------------------------------------------------------
// Component
// --------------------------------------------------------------------------

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CollageCard({
  id,
  title,
  type,
  thumbnailUrl,
  updatedAt,
  photoCount,
  onPress,
  onLongPress,
}: CollageCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const badgeColor = TYPE_BADGE_COLORS[type] ?? RAVE_COLORS.hotPink;
  const displayTitle = title.length > 20 ? `${title.slice(0, 18)}...` : title;

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPress={() => onPress(id)}
      onLongPress={() => onLongPress(id)}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {thumbnailUrl ? (
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderThumb}>
            <Text style={styles.placeholderText}>
              {photoCount > 0 ? `${photoCount} photos` : 'Empty'}
            </Text>
          </View>
        )}

        {/* Type badge */}
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{TYPE_LABELS[type]}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {displayTitle}
        </Text>
        <Text style={styles.date}>{formatRelativeDate(updatedAt)}</Text>
      </View>
    </AnimatedPressable>
  );
}

// --------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: BACKGROUND.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BACKGROUND.border,
    marginBottom: 12,
  },
  thumbnailContainer: {
    aspectRatio: 1,
    backgroundColor: BACKGROUND.surface,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumb: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: RAVE_COLORS.lightGray,
    fontSize: 13,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  info: {
    padding: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  date: {
    color: RAVE_COLORS.lightGray,
    fontSize: 11,
  },
});
