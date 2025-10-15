import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../constants/theme';
import { AuthProvider } from '../components/AuthContext';
import { TailCoinsProvider } from '../components/TailCoinsContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TailCoinsProvider>
        <StatusBar style="light" backgroundColor={COLORS.black} />
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.black },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: COLORS.black },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding-choice" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="login-premium" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="home-premium" options={{ headerShown: false }} />
        <Stack.Screen name="add-pet" options={{ title: 'Add Pet' }} />
        <Stack.Screen name="verify" options={{ title: 'Verify' }} />
        <Stack.Screen name="verification-gate" options={{ title: 'Verification' }} />
        <Stack.Screen name="verification-success" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ title: 'Admin Panel' }} />
        <Stack.Screen name="pet-feed" options={{ title: 'Pet Feed' }} />
        <Stack.Screen name="fetch-yard" options={{ title: 'Fetch Yard' }} />
        <Stack.Screen name="tug-yard" options={{ title: 'Tug Yard' }}
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
        <Stack.Screen name="tailmarket_post_puppy" />
        <Stack.Screen name="tailboard_post_ad" />
        <Stack.Screen name="tailtales_feed" />
        <Stack.Screen name="tailtales_post" />
        <Stack.Screen name="tailreels_feed" />
        <Stack.Screen name="tailreels_upload" />
        <Stack.Screen name="tailreels_comments" />
        <Stack.Screen name="tailcause_home" />
        <Stack.Screen name="tailcause_pet_profile" />
        <Stack.Screen name="admin_content" />
        <Stack.Screen name="tailcoins_store" />
        <Stack.Screen name="tailcoins_history" />
        <Stack.Screen name="premium_upgrade" />
      </Stack>
      </TailCoinsProvider>
    </AuthProvider>
  );
}
