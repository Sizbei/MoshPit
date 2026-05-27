import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BACKGROUND, RAVE_COLORS } from '../../utils/colors';
import { CollageCard } from '../../components/shared/CollageCard';
import { useCollageSync } from '../../hooks/useCollageSync';
import type { CollageSummary } from '../../hooks/useCollageSync';
import { useAuth } from '../../hooks/useAuth';
import { useCollageState } from '../../hooks/useCollageState';
import { generateId } from '../../utils/imageUtils';

// --------------------------------------------------------------------------
// Skeleton placeholder for loading state
// --------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.thumb} />
      <View style={skeletonStyles.info}>
        <View style={skeletonStyles.titleBar} />
        <View style={skeletonStyles.dateBar} />
      </View>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View style={skeletonStyles.grid}>
      {[1, 2, 3, 4].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

// --------------------------------------------------------------------------
// Empty state component
// --------------------------------------------------------------------------

function EmptyState({ onCreatePress }: { readonly onCreatePress: () => void }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{'<>'}</Text>
      <Text style={styles.emptyTitle}>No collages yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first rave collage
      </Text>
      <Pressable style={styles.createButton} onPress={onCreatePress}>
        <Text style={styles.createButtonText}>Create Collage</Text>
      </Pressable>
    </View>
  );
}

// --------------------------------------------------------------------------
// Main screen
// --------------------------------------------------------------------------

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { list, load, remove } = useCollageSync();

  const [collages, setCollages] = useState<readonly CollageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ---- Fetch collages ----
  const fetchCollages = useCallback(async () => {
    if (!user) {
      setCollages([]);
      setIsLoading(false);
      return;
    }

    const result = await list();
    if (result.data) {
      setCollages(result.data);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, [user, list]);

  useEffect(() => {
    void fetchCollages();
  }, [fetchCollages]);

  // ---- Pull to refresh ----
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    void fetchCollages();
  }, [fetchCollages]);

  // ---- Tap to open ----
  const handlePress = useCallback(
    async (id: string) => {
      const result = await load(id);
      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }
      router.push(`/editor/${id}`);
    },
    [load, router],
  );

  // ---- Long press context menu ----
  const handleLongPress = useCallback(
    (id: string) => {
      const collage = collages.find((c) => c.id === id);
      if (!collage) return;

      Alert.alert(collage.title, undefined, [
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await remove(id);
            if (result.error) {
              Alert.alert('Error', result.error);
              return;
            }
            setCollages((prev) => prev.filter((c) => c.id !== id));
          },
        },
        {
          text: 'Duplicate',
          onPress: () => {
            void load(id).then((result) => {
              if (result.error) {
                Alert.alert('Error', result.error);
                return;
              }
              // Generate fresh ID so it saves as a new copy
              const newId = generateId();
              useCollageState.setState({ id: newId });
              router.push(`/editor/${newId}`);
            });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [collages, remove, load, router],
  );

  // ---- Render collage card ----
  const renderItem = useCallback(
    ({ item }: { readonly item: CollageSummary }) => (
      <View style={styles.cardWrapper}>
        <CollageCard
          id={item.id}
          title={item.title}
          type={item.type}
          thumbnailUrl={item.thumbnailUrl}
          updatedAt={item.updatedAt}
          photoCount={item.photoCount}
          onPress={handlePress}
          onLongPress={handleLongPress}
        />
      </View>
    ),
    [handlePress, handleLongPress],
  );

  const keyExtractor = useCallback((item: CollageSummary) => item.id, []);

  // ---- Not signed in ----
  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Sign in to get started</Text>
          <Text style={styles.emptySubtitle}>
            Save and sync your collages across devices
          </Text>
          <Pressable
            style={styles.createButton}
            onPress={() => router.push('/auth/sign-in')}
          >
            <Text style={styles.createButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---- Loading state ----
  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSkeleton />
      </View>
    );
  }

  // ---- Empty state ----
  if (collages.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState onCreatePress={() => router.push('/create')} />
        <FAB onPress={() => router.push('/create')} />
      </View>
    );
  }

  // ---- Collage grid ----
  return (
    <View style={styles.container}>
      <FlatList
        data={collages}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={RAVE_COLORS.hotPink}
          />
        }
      />
      <FAB onPress={() => router.push('/create')} />
    </View>
  );
}

// --------------------------------------------------------------------------
// FAB (Floating Action Button)
// --------------------------------------------------------------------------

function FAB({ onPress }: { readonly onPress: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={[styles.fab, { bottom: insets.bottom + 20 }]}
      onPress={onPress}
    >
      <Text style={styles.fabText}>+</Text>
    </Pressable>
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
  listContent: {
    padding: 12,
  },
  row: {
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: '50%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    color: RAVE_COLORS.hotPink,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: RAVE_COLORS.lightGray,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: RAVE_COLORS.hotPink,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: RAVE_COLORS.hotPink,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: RAVE_COLORS.hotPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});

const skeletonStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: BACKGROUND.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BACKGROUND.border,
  },
  thumb: {
    aspectRatio: 1,
    backgroundColor: BACKGROUND.surface,
    opacity: 0.6,
  },
  info: {
    padding: 10,
    gap: 6,
  },
  titleBar: {
    height: 12,
    width: '70%',
    backgroundColor: BACKGROUND.surface,
    borderRadius: 4,
  },
  dateBar: {
    height: 10,
    width: '40%',
    backgroundColor: BACKGROUND.surface,
    borderRadius: 4,
  },
});
