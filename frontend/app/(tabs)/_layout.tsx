import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,0,0,0.1)',
        },
        tabBarActiveTintColor: COLORS.tabBarActive,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="tailboard_home"
        options={{
          title: 'TailBoard',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: 24 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="tailpro_home"
        options={{
          title: 'TailPro',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: 24 }}>💼</Text>,
        }}
      />
      <Tabs.Screen
        name="tailmarket_home"
        options={{
          title: 'Market',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: 24 }}>🛒</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
