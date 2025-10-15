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
        <Stack.Screen name="tug-yard" options={{ title: 'Tug Yard' }} />
        <Stack.Screen name="paywall" options={{ headerShown: false }} />
        <Stack.Screen name="match" options={{ title: 'Match' }} />
        <Stack.Screen name="double-fetch" options={{ title: 'Double Fetch' }} />
        <Stack.Screen name="tug-match" options={{ title: 'Tug Match' }} />
        <Stack.Screen name="matches" options={{ title: 'Matches' }} />
        <Stack.Screen name="likes" options={{ title: 'Likes' }} />
        <Stack.Screen name="chat" options={{ title: 'Chat' }} />
        <Stack.Screen name="tailboard" options={{ title: 'TailBoard' }} />
        <Stack.Screen name="post-ad" options={{ title: 'Post Ad' }} />
        <Stack.Screen name="tailmarket" options={{ title: 'TailMarket' }} />
        <Stack.Screen name="post-puppy" options={{ title: 'Post Puppy' }} />
        <Stack.Screen name="tailpro" options={{ title: 'TailPro' }} />
        <Stack.Screen name="post-service" options={{ title: 'Post Service' }} />
        <Stack.Screen name="booking-flow" options={{ title: 'Book Service' }} />
        <Stack.Screen name="tailpro_home" options={{ title: 'TailPro Services' }} />
        <Stack.Screen name="tailpro_list" options={{ title: 'Service Providers' }} />
        <Stack.Screen name="tailpro_booking" options={{ title: 'Book Service' }} />
        <Stack.Screen name="tailpro_orders" options={{ title: 'My Appointments' }} />
        <Stack.Screen name="tailpro_contact" options={{ title: 'Contact Provider' }} />
        <Stack.Screen name="tailpro_partner_signup" options={{ title: 'Become Partner' }} />
        <Stack.Screen name="tailpro_post_service" options={{ title: 'Post Service' }} />
        <Stack.Screen name="vendor_dashboard" options={{ title: 'Vendor Dashboard' }} />
        <Stack.Screen name="tailmarket_post_puppy" options={{ title: 'Post Puppy' }} />
        <Stack.Screen name="tailboard_post_ad" options={{ title: 'Post Ad' }} />
        <Stack.Screen name="tailtales_feed" options={{ headerShown: false }} />
        <Stack.Screen name="tailtales_post" options={{ headerShown: false }} />
        <Stack.Screen name="tailreels_feed" options={{ headerShown: false }} />
        <Stack.Screen name="tailreels_upload" options={{ headerShown: false }} />
        <Stack.Screen name="tailreels_comments" options={{ headerShown: false }} />
        <Stack.Screen name="tailcause_home" options={{ title: 'TailCause' }} />
        <Stack.Screen name="tailcause_pet_profile" options={{ title: 'Pet Profile' }} />
        <Stack.Screen name="admin_content" options={{ title: 'Content Moderation' }} />
        <Stack.Screen name="tailcoins_store" options={{ title: 'Buy TailCoins' }} />
        <Stack.Screen name="tailcoins_history" options={{ title: 'Transaction History' }} />
        <Stack.Screen name="premium_upgrade" options={{ headerShown: false }} />
        <Stack.Screen name="register_user" options={{ headerShown: false }} />
        <Stack.Screen name="register_pet" options={{ headerShown: false }} />
      </Stack>
      </TailCoinsProvider>
    </AuthProvider>
  );
}
