import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();

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
      
      console.log('🔍 Session Token:', sessionToken ? 'EXISTS' : 'NOT FOUND');
      console.log('🚀 Navigating to:', sessionToken ? '/(tabs)/home' : '/login-premium');
      
      setTimeout(() => {
        if (sessionToken) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/login-premium');
        }
      }, 500);
    }, 2000);
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
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 100,
    elevation: 25,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: '#CCC',
    fontWeight: '500',
  },
});
