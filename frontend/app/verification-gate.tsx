import React, { useRef, useEffect } from 'react';
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
import { SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function VerificationGateScreen() {
  const router = useRouter();
  
  const pawScale = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Paw badge appears with bounce
    Animated.spring(pawScale, {
      toValue: 1,
      tension: 50,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Card slides up
    Animated.spring(cardScale, {
      toValue: 1,
      delay: 200,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Sparkle loop
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleOpacity, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleOpacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 500);
  };

  const handleStartVerification = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/verify');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <LinearGradient colors={['#000000', '#1a0a00', '#2a0000']} style={styles.container}>
      {/* Sparkles */}
      <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkleOpacity }]}>
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkleOpacity }]}>
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkleOpacity }]}>
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>

      {/* Golden Paw Badge */}
      <Animated.View style={[styles.pawContainer, { transform: [{ scale: pawScale }] }]}>
        <View style={styles.pawBadge}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.pawBadgeGradient}
          >
            <Text style={styles.pawIcon}>🐾</Text>
          </LinearGradient>
        </View>
      </Animated.View>

      {/* Content Card */}
      <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
        <Text style={styles.title}>Verify to play in the Fetch Yard 🐾</Text>
        
        <Text style={styles.subtitle}>
          Upload your pet's photo and details so everyone knows you're real.
        </Text>

        <View style={styles.benefitsContainer}>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Get a golden paw badge</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Access the Fetch Yard</Text>
          </View>
          <View style={styles.benefitRow}>
            <Text style={styles.benefitIcon}>✓</Text>
            <Text style={styles.benefitText}>Connect with verified pets only</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleStartVerification}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#DC143C', '#8B0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Start Verification</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Verification typically takes 1-2 business days
        </Text>
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
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: '15%',
    left: '10%',
  },
  sparkle2: {
    top: '20%',
    right: '15%',
  },
  sparkle3: {
    top: '70%',
    left: '85%',
  },
  sparkleText: {
    fontSize: 32,
  },
  pawContainer: {
    marginBottom: SPACING.xxl,
  },
  pawBadge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  pawBadgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pawIcon: {
    fontSize: 64,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    padding: SPACING.xl,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  benefitsContainer: {
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  benefitIcon: {
    fontSize: 20,
    color: '#FFD700',
  },
  benefitText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  verifyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xl,
  },
  footerText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});
