import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';
import { AuthProvider } from '../components/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={COLORS.black} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.black },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="home" />
        <Stack.Screen name="add-pet" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="verification-success" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="pet-feed" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="match" />
      </Stack>
    </AuthProvider>
  );
}
