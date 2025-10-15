import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function VerifyPendingScreen() {
  const router = useRouter();
  const [shimmerAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Shimmer animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('sessionToken');
    await AsyncStorage.removeItem('userId');
    router.replace('/login-premium');
  };

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.cream, COLORS.goldenBeige, COLORS.cream]}
        style={styles.gradient}
      >
        {/* Shimmer overlay */}
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        />

        <View style={styles.content}>
          {/* Pulsing Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Text style={styles.icon}>⏳</Text>
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>Profile Under Review</Text>

          {/* Message */}
          <View style={styles.messageCard}>
            <Text style={styles.message}>
              Thank you for joining TailFlix! 🎉
            </Text>
            <Text style={styles.subMessage}>
              Our team is reviewing your profile and pet details. This usually takes 24-48 hours.
            </Text>
            <Text style={styles.subMessage}>
              We'll notify you once your account is verified!
            </Text>
          </View>

          {/* Status Card */}
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusIcon}>👤</Text>
              <Text style={styles.statusText}>User Profile</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Pending</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusIcon}>🐾</Text>
              <Text style={styles.statusText}>Pet Profile</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Pending</Text>
              </View>
            </View>
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            In the meantime, make sure your contact details are correct.
          </Text>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={[COLORS.gray, COLORS.darkGray]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutGradient}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 200,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    maxWidth: 400,
  },
  message: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.goldenBeige,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.round,
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '700',
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    maxWidth: 300,
  },
  logoutButton: {
    width: '100%',
    maxWidth: 300,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
});
