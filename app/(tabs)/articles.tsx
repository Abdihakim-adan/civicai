import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  View,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const LIVE_UPDATES_API_URL = 'https://civicai-kenya-backend-772950697200.us-central1.run.app/api/updates/live';
const CACHE_KEY = 'civicai_gov_updates_cache';

interface Update {
  title: string;
  summary: string;
  source_link: string;
  category: string;
}

interface CachedData {
  updates: Update[];
  fetched_at: string;
  seenLinks: string[];
}

const CATEGORY_COLOR = '#4CAF50';

function formatFetchedAt(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function ArticlesScreen() {
  const insets = useSafeAreaInsets();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [newLinks, setNewLinks] = useState<Set<string>>(new Set());
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backgroundRefreshing, setBackgroundRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Load from AsyncStorage immediately, then quietly refresh from network
  const loadFromCache = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: CachedData = JSON.parse(raw);
        setUpdates(cached.updates || []);
        setFetchedAt(cached.fetched_at || null);
      }
    } catch (err) {
      console.error('Failed to load cached updates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLiveUpdates = useCallback(async (isManualRefresh = false) => {
    try {
      setError(null);
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setBackgroundRefreshing(true);
      }

      const response = await fetch(LIVE_UPDATES_API_URL);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load updates.');
      }

      const freshUpdates: Update[] = data.updates || [];

      // Determine which links are new compared to what was previously cached
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      const previous: CachedData | null = raw ? JSON.parse(raw) : null;
      const previousLinks = new Set(previous?.seenLinks || []);

      const freshLinks = freshUpdates.map((u) => u.source_link);
      const trulyNew = new Set(freshLinks.filter((link) => !previousLinks.has(link)));

      const toCache: CachedData = {
        updates: freshUpdates,
        fetched_at: data.fetched_at,
        seenLinks: freshLinks,
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(toCache));

      setUpdates(freshUpdates);
      setFetchedAt(data.fetched_at);
      setNewLinks(trulyNew);
    } catch (err: any) {
      console.error('Failed to fetch live updates:', err);
      // Only surface an error if we have nothing cached to fall back on
      setError((prev) => (updates.length === 0 ? (err.message || 'Could not load updates.') : prev));
    } finally {
      setRefreshing(false);
      setBackgroundRefreshing(false);
      setLoading(false);
    }
  }, [updates.length]);

  useEffect(() => {
    (async () => {
      await loadFromCache();
      fetchLiveUpdates(false); // quiet background refresh after showing cached data
    })();
  }, []);

  const handleManualRefresh = () => {
    fetchLiveUpdates(true);
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerTitleRow}>
          <View style={styles.headerIconWrap}>
            <Ionicons name="newspaper" size={20} color="#4CAF50" />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.headerTitle}>Government Updates</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {backgroundRefreshing
                ? 'Checking for new updates...'
                : fetchedAt
                ? `Updated ${formatFetchedAt(fetchedAt)}`
                : 'Live summaries from official sources'}
            </ThemedText>
          </View>
          {backgroundRefreshing && (
            <ActivityIndicator size="small" color="#4CAF50" />
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleManualRefresh} tintColor="#4CAF50" />
        }
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.stateText}>Loading updates...</ThemedText>
          </View>
        ) : error && updates.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="cloud-offline-outline" size={40} color="#999" />
            <ThemedText style={styles.stateText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchLiveUpdates(true)}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : updates.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="document-text-outline" size={40} color="#999" />
            <ThemedText style={styles.stateText}>No updates available right now.</ThemedText>
            <ThemedText style={styles.stateSubText}>Pull down to check again.</ThemedText>
          </View>
        ) : (
          updates.map((update, index) => {
            const expanded = expandedIndex === index;
            const isNew = newLinks.has(update.source_link);

            return (
              <TouchableOpacity
                key={update.source_link || index}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => toggleExpand(index)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.badgeRow}>
                    {isNew && (
                      <View style={styles.newBadge}>
                        <LinearGradient
                          colors={['#4CAF50', '#2E7D32']}
                          style={styles.newBadgeGradient}
                        >
                          <ThemedText style={styles.newBadgeText}>NEW UPDATE</ThemedText>
                        </LinearGradient>
                      </View>
                    )}
                    <View style={[styles.categoryBadge, { backgroundColor: `${CATEGORY_COLOR}15` }]}>
                      <ThemedText style={[styles.categoryText, { color: CATEGORY_COLOR }]}>
                        {update.category}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                <ThemedText style={styles.cardTitle}>{update.title}</ThemedText>

                <ThemedText style={styles.cardSummary} numberOfLines={expanded ? undefined : 3}>
                  {update.summary}
                </ThemedText>

                <View style={styles.cardFooter}>
                  <View style={styles.sourceRow}>
                    <Ionicons name="shield-checkmark-outline" size={14} color="#4CAF50" />
                    <ThemedText style={styles.sourceText} numberOfLines={1}>
                      {update.source_link.replace(/^https?:\/\//, '')}
                    </ThemedText>
                  </View>
                  <View style={styles.readMoreRow}>
                    <ThemedText style={styles.readMoreText}>
                      {expanded ? 'Show less' : 'Read more'}
                    </ThemedText>
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={14}
                      color="#4CAF50"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  stateSubText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newBadge: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  newBadgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 6,
    lineHeight: 22,
  },
  cardSummary: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  sourceText: {
    fontSize: 11,
    color: '#666',
    flexShrink: 1,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
});