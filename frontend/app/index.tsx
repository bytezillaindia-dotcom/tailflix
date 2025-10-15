import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Netflix-style animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startNetflixAnimation();
  }, []);

  const startNetflixAnimation = async () => {
    // Netflix-style: Fade in + Scale + Glow
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Wait 2 seconds then fade out and navigate
    setTimeout(async () => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Check if user is logged in
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      
      setTimeout(() => {
        if (sessionToken) {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      }, 500);
    }, 2000);
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(taglineY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);

    // Fade out entire screen and navigate directly to OTP login
    setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Navigate directly to OTP login - no onboarding choice
        console.log('🚀 Navigating to OTP login...');
        router.replace('/login-premium');
      });
    }, 2500); // 2.5 seconds total duration
  };

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Dark Netflix-style Background */}
      <LinearGradient
        colors={COLORS.gradientDark}
        style={styles.gradientBackground}
      />

      {/* Animated Glow */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Logo with Scale & Fade */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Text style={styles.logoText}>🐾</Text>
        <Text style={styles.appName}>TailFlix</Text>
        <Text style={styles.tagline}>Where Tails Meet Tales</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  glowBackground: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#FFD700',
    opacity: 0.3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 25,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 32,
  },
  rotatingRing: {
    position: 'absolute',
    width: 320,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    width: '100%',
    height: '100%',
    borderRadius: 160,
    borderWidth: 4,
    borderColor: '#FFB6C1',
    borderStyle: 'solid',
    opacity: 0.6,
    shadowColor: '#FFB6C1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 280,
  },
  taglineContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  tagline: {
    fontSize: FONT_SIZES.xl,
    color: '#D2691E',
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 1.2,
    textShadowColor: '#FFB6C1',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  pawsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  paw: {
    fontSize: 28,
    opacity: 0.9,
  },
  heart: {
    fontSize: 32,
  },
});
