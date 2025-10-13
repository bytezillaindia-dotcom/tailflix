import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingChoiceScreen() {
  const router = useRouter();
  
  // Animation values
  const badge1Scale = useRef(new Animated.Value(0)).current;
  const badge2Scale = useRef(new Animated.Value(0)).current;
  const badge1Glow = useRef(new Animated.Value(0)).current;
  const badge2Glow = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Text fades in first
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Badges drop down
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(badge1Scale, {
          toValue: 1,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(badge2Scale, {
          toValue: 1,
          delay: 150,
          tension: 80,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start glowing badges loop
        Animated.loop(
          Animated.sequence([
            Animated.timing(badge1Glow, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(badge1Glow, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: false,
            }),
          ])
        ).start();

        Animated.loop(
          Animated.sequence([
            Animated.timing(badge2Glow, {
              toValue: 1,
              duration: 1500,
              delay: 750,
              useNativeDriver: false,
            }),
            Animated.timing(badge2Glow, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: false,
            }),
          ])
        ).start();
      });
    }, 300);
  };

  const handleChoice = async (mode: 'pet' | 'owner_pet') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log('🎯 User selected mode:', mode);
      
      // Store the chosen mode and mark onboarding as completed
      await AsyncStorage.setItem('onboarding_mode', mode);
      await AsyncStorage.setItem('onboarding_completed', 'true');
      
      console.log('✅ Mode saved to AsyncStorage:', mode);
      console.log('🚀 Navigating to login-premium...');
      
      // Use setTimeout to ensure AsyncStorage completes before navigation
      setTimeout(() => {
        router.replace('/login-premium');
      }, 100);
      
    } catch (error) {
      console.error('❌ Error in handleChoice:', error);
      // Fallback: try to navigate anyway
      router.replace('/login-premium');
    }
  };

  const badge1GlowColor = badge1Glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(220, 20, 60, 0.3)', 'rgba(220, 20, 60, 0.8)'],
  });

  const badge2GlowColor = badge2Glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.8)'],
  });

  return (
    <LinearGradient colors={['#000000', '#1a0a00', '#2a0000']} style={styles.container}>
      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, { opacity: textOpacity }]}>
        <Text style={styles.tagline}>
          Every story starts with a wag.
        </Text>
        <Text style={styles.subtitle}>
          Who's starring today?
        </Text>
      </Animated.View>

      {/* Choice Badges */}
      <View style={styles.choicesContainer}>
        {/* Pet Dating Mode */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleChoice('pet')}
        >
          <Animated.View
            style={[
              styles.badge,
              {
                transform: [{ scale: badge1Scale }],
                shadowColor: badge1GlowColor,
              },
            ]}
          >
            <LinearGradient
              colors={['#DC143C', '#8B0000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgeGradient}
            >
              <Text style={styles.badgeIcon}>🐾</Text>
              <Text style={styles.badgeTitle}>For My Pet</Text>
              <Text style={styles.badgeSubtext}>Find perfect playmates</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {/* Owner + Pet Dating Mode */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleChoice('owner_pet')}
        >
          <Animated.View
            style={[
              styles.badge,
              {
                transform: [{ scale: badge2Scale }],
                shadowColor: badge2GlowColor,
              },
            ]}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgeGradient}
            >
              <Text style={styles.badgeIcon}>💞</Text>
              <Text style={[styles.badgeTitle, styles.goldText]}>
                For Myself & My Pet
              </Text>
              <Text style={[styles.badgeSubtext, styles.goldText]}>
                Connect with pet lovers
              </Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Paw sparkles decoration */}
      <View style={styles.sparklesContainer}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={[styles.sparkle, styles.sparkle2]}>✨</Text>
        <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  taglineContainer: {
    position: 'absolute',
    top: '25%',
    alignItems: 'center',
  },
  tagline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  choicesContainer: {
    width: '100%',
    gap: SPACING.lg,
  },
  badge: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  badgeGradient: {
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  badgeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  badgeSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  goldText: {
    color: '#000',
  },
  sparklesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
    opacity: 0.3,
    top: '20%',
    left: '10%',
  },
  sparkle2: {
    top: '60%',
    left: '80%',
  },
  sparkle3: {
    top: '40%',
    left: '85%',
  },
});
