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
        <Stack.Screen name="onboarding-choice" />
        <Stack.Screen name="login" />
        <Stack.Screen name="login-premium" />
        <Stack.Screen name="home" />
        <Stack.Screen name="home-premium" />
        <Stack.Screen name="add-pet" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="verification-gate" />
        <Stack.Screen name="verification-success" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="pet-feed" />
        <Stack.Screen name="fetch-yard" />
        <Stack.Screen name="tug-yard" />
        <Stack.Screen name="paywall" />
        <Stack.Screen name="match" />
        <Stack.Screen name="double-fetch" />
        <Stack.Screen name="tug-match" />
        <Stack.Screen name="matches" />
        <Stack.Screen name="likes" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="tailboard" />
        <Stack.Screen name="post-ad" />
        <Stack.Screen name="tailmarket" />
        <Stack.Screen name="post-puppy" />
        <Stack.Screen name="tailpro" />
        <Stack.Screen name="post-service" />
        <Stack.Screen name="booking-flow" />
        <Stack.Screen name="tailpro_home" />
        <Stack.Screen name="tailpro_list" />
        <Stack.Screen name="tailpro_booking" />
        <Stack.Screen name="tailpro_orders" />
        <Stack.Screen name="tailpro_contact" />
        <Stack.Screen name="tailpro_partner_signup" />
        <Stack.Screen name="tailpro_post_service" />
        <Stack.Screen name="vendor_dashboard" />
      </Stack>
    </AuthProvider>
  );
}
