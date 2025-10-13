import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

// Routes that don't require verification
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/add-pet',
  '/verify',
  '/verification-success',
];

// Routes that require authentication but not verification
const RESTRICTED_ROUTES = [
  '/home',
  '/admin',
  '/feed',
  '/chats',
  '/paywall',
];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userId, isVerified, verificationStatus, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // If not logged in and trying to access protected routes
    if (!userId && !PUBLIC_ROUTES.includes(pathname) && pathname !== '/login') {
      router.replace('/login');
      return;
    }

    // If logged in but not verified, check if trying to access restricted routes
    if (userId && !isVerified && verificationStatus !== null) {
      const isRestrictedRoute = RESTRICTED_ROUTES.some(route => pathname.startsWith(route));
      
      if (isRestrictedRoute && pathname !== '/verification-success') {
        router.replace('/verification-success');
        return;
      }
    }
  }, [userId, isVerified, verificationStatus, pathname, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.crimson} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.white,
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
});
