import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size || 28} color={color} />
          ),
        }}
      />
      
      {/* Quiz Tab */}
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school" size={size || 28} color={color} />
          ),
        }}
      />
      
      {/* Documents Tab */}
      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size || 28} color={color} />
          ),
        }}
      />

      {/* Articles Tab */}
      <Tabs.Screen
        name="articles"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper" size={size || 28} color={color} />
          ),
        }}
      />
      
    </Tabs>
  );
}