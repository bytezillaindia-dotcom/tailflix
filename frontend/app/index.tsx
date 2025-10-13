import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const ringRotation = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(30)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      console.log('🔍 Checking onboarding status...');
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      console.log('📦 onboarding_completed value:', onboardingCompleted);
      
      if (onboardingCompleted === 'true') {
        // User has completed onboarding, go to login
        console.log('✅ Onboarding completed, navigating to login-premium');
        router.replace('/login-premium');
      } else {
        // First time user, show onboarding
        console.log('🆕 First time user, navigating to onboarding-choice');
        router.replace('/onboarding-choice');
      }
    } catch (error) {
      console.error('❌ Error checking onboarding status:', error);
      // Default to onboarding if error
      console.log('⚠️ Defaulting to onboarding-choice');
      router.replace('/onboarding-choice');
    }
  };

  const startAnimations = () => {
    // Sequence of animations
    Animated.sequence([
      // Logo fade in and scale
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Glow effect (loops in background)
      Animated.timing(glowOpacity, {
        toValue: 0.6,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Ring rotation (continuous)
    Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Glow pulse effect (continuous after initial glow)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 0.8,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.4,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 800);

    // Tagline fade up after delay
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

    // Fade out entire screen and navigate based on onboarding status
    setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        // Check onboarding status and navigate accordingly
        checkOnboardingStatus();
      });
    }, 2500); // 2.5 seconds total duration
  };

  const rotate = ringRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Animated Glow Background */}
      <Animated.View
        style={[
          styles.glowBackground,
          {
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Rotating Ring Effect */}
      <Animated.View
        style={[
          styles.rotatingRing,
          {
            transform: [{ rotate }],
            opacity: logoOpacity,
          },
        ]}
      >
        <View style={styles.ring} />
      </Animated.View>

      {/* Logo - Perfectly Centered */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <Image
          source={require('../assets/tailflix_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Tagline */}
      <Animated.View
        style={[
          styles.taglineContainer,
          {
            opacity: taglineOpacity,
            transform: [{ translateY: taglineY }],
          },
        ]}
      >
        <Text style={styles.tagline}>Where Tails and Hearts Connect</Text>
        <View style={styles.pawsContainer}>
          <Text style={styles.paw}>🐾</Text>
          <Text style={styles.heart}>💕</Text>
          <Text style={styles.paw}>🐾</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowBackground: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: COLORS.gold,
    opacity: 0.2,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 80,
    elevation: 20,
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
    borderWidth: 3,
    borderColor: COLORS.gold,
    borderStyle: 'solid',
    opacity: 0.5,
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
    fontSize: FONT_SIZES.lg,
    color: COLORS.gold,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  pawsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  paw: {
    fontSize: 24,
    opacity: 0.8,
  },
  heart: {
    fontSize: 28,
  },
});
