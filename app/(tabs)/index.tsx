import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (width - 40 - (CARD_GAP * 2)) / 3;

const QUICK_ACTIONS = [
  {
    id: 'chat',
    icon: 'chatbubble-ellipses',
    title: 'AI Assistant',
    route: '/chatbot',
    color: '#2563EB',
  },
  {
    id: 'resources',
    icon: 'documents',
    title: 'Resources',
    route: '/documents',
    color: '#0891B2',
  },
  {
    id: 'quiz',
    icon: 'trophy',
    title: 'Quiz',
    route: '/quiz',
    color: '#EA580C',
  },
  {
    id: 'documents',
    icon: 'document-scanner',
    title: 'Doc AI',
    route: '/documents',
    color: '#7C3AED',
  },
  {
    id: 'leaders',
    icon: 'people',
    title: 'Leaders',
    route: '/chatbot',
    color: '#DC2626',
  },
  {
    id: 'constitution',
    icon: 'book',
    title: 'Constitution',
    route: '/constitution',
    color: '#059669',
  },
];

const TOPICS = [
  { id: 'rights', icon: 'shield-checkmark', title: 'Your Rights', color: '#2563EB', route: '/rights' },
  { id: 'services', icon: 'business', title: 'Services', color: '#0891B2', route: '/services' },
  { id: 'counties', icon: 'map', title: 'Counties', color: '#059669', route: '/counties' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with proper spacing */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{greeting()} 👋</Text>
              <Text style={styles.title}>CivicAI</Text>
            </View>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>CK</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Chat Card */}
        <Animated.View style={[styles.chatCardWrapper, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            activeOpacity={0.95}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => router.push('/chatbot')}
          >
            <View style={styles.chatCard}>
              <View style={styles.chatCardTop}>
                <View style={styles.chatIcon}>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.chatCardText}>
                  <Text style={styles.chatTitle}>Ask anything</Text>
                  <Text style={styles.chatSubtitle}>
                    Get instant answers about your rights, laws, and government services
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </View>
              
              <View style={styles.chatPrompt}>
                <Text style={styles.promptText}>
                  e.g., "What is Article 35 about?"
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Actions - 3 per row */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What would you like to do?</Text>
          
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '12' }]}>
                  <Ionicons name={action.icon as any} size={20} color={action.color} />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Explore Topics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore topics</Text>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topicsScroll}
          >
            {TOPICS.map((topic) => (
              <TouchableOpacity
                key={topic.id}
                style={styles.topicCard}
                onPress={() => router.push(topic.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.topicIcon, { backgroundColor: topic.color + '10' }]}>
                  <Ionicons name={topic.icon as any} size={24} color={topic.color} />
                </View>
                <Text style={styles.topicTitle}>{topic.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Daily Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconContainer}>
            <Ionicons name="bulb" size={22} color="#EA580C" />
          </View>
          <Text style={styles.tipText}>
            You have the right to access information held by the State under Article 35 of the Constitution.
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Header with proper spacing
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 4,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
  },
  greeting: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Chat Card
  chatCardWrapper: {
    marginTop: 16,
  },
  chatCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chatCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatCardText: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  chatSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },
  chatPrompt: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  promptText: {
    fontSize: 13,
    color: '#94A3B8',
  },

  // Sections
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 14,
    letterSpacing: -0.3,
  },

  // Actions Grid - 3 cards per row
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },

  // Topics
  topicsScroll: {
    gap: 10,
    paddingRight: 20,
  },
  topicCard: {
    width: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },

  // Tip
  tipCard: {
    marginTop: 28,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  tipIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#9A3412',
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 40,
  },
});