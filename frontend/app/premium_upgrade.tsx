import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface PricingOption {
  label: string;
  price: string;
  popular?: boolean;
}

const FEATURES: Feature[] = [
  { icon: '💎', title: 'Unlimited Swipes', desc: 'No daily limits in Fetch & Tug Yard' },
  { icon: '⭐', title: 'Golden Bone Boosts', desc: 'Get noticed 5x faster' },
  { icon: '🐾', title: 'See Who Liked You', desc: 'No more guessing games' },
  { icon: '📞', title: 'Unlock Contacts', desc: 'Directly connect in TailMarket' },
  { icon: '🎥', title: 'TailReels Spotlight', desc: 'Boost your videos to top feed' },
  { icon: '❤️', title: 'Support Causes', desc: 'Donate with TailCoins instantly' },
];

const PRICING_OPTIONS: PricingOption[] = [
  { label: 'Monthly', price: '₹299', popular: false },
  { label: '3 Months', price: '₹749', popular: true },
  { label: 'Yearly', price: '₹2499', popular: false },
];

export default function PremiumUpgrade() {
  const router = useRouter();
  const { userId } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(1); // Default to 3 Months (popular)
  const [purchasing, setPurchasing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Sparkle animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleUpgrade = async () => {
    setPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const selectedOption = PRICING_OPTIONS[selectedPlan];

    // Mock purchase - simulate payment processing
    setTimeout(async () => {
      try {
        // In production, this would call the backend API to update user.isPremium
        // For now, we'll use local state (AuthContext would need to be updated)
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPurchasing(false);

        Alert.alert(
          '🎉 Welcome to TailPro Premium!',
          `You're now a premium member with ${selectedOption.label} plan.\n\nAll premium features are now unlocked!`,
          [
            {
              text: 'Start Exploring',
              onPress: () => router.replace('/home-premium'),
            },
          ]
        );
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setPurchasing(false);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }, 2000);
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.cream, COLORS.softPeach, COLORS.goldenBeige]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Sparkles */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <Animated.Text
              style={[
                styles.sparkle,
                {
                  opacity: sparkleOpacity,
                  transform: [{ scale: sparkleScale }],
                },
              ]}
            >
              ✨
            </Animated.Text>
            <Animated.Text
              style={[
                styles.sparkle2,
                {
                  opacity: sparkleOpacity,
                  transform: [{ scale: sparkleScale }],
                },
              ]}
            >
              🐾
            </Animated.Text>
            <Animated.Text
              style={[
                styles.sparkle3,
                {
                  opacity: sparkleOpacity,
                  transform: [{ scale: sparkleScale }],
                },
              ]}
            >
              ✨
            </Animated.Text>

            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.logo}>🐾 TailFlix</Text>
            <Text style={styles.title}>TailPro Premium ⭐</Text>
            <Text style={styles.subtitle}>Unlock the best of TailFlix for you and your pet</Text>
          </Animated.View>

          {/* Features List */}
          <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim }]}>
            {FEATURES.map((feature, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.featureCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDesc}>{feature.desc}</Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

          {/* Pricing Options */}
          <View style={styles.pricingContainer}>
            <Text style={styles.pricingTitle}>Choose Your Plan</Text>
            {PRICING_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.pricingCard,
                  selectedPlan === index && styles.pricingCardSelected,
                  option.popular && styles.pricingCardPopular,
                ]}
                onPress={() => {
                  setSelectedPlan(index);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                {option.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>⭐ MOST POPULAR</Text>
                  </View>
                )}
                <View style={styles.pricingContent}>
                  <View>
                    <Text style={styles.pricingLabel}>{option.label}</Text>
                    <Text style={styles.pricingPrice}>{option.price}</Text>
                  </View>
                  <View style={styles.radioButton}>
                    {selectedPlan === index && <View style={styles.radioButtonInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* CTA Buttons */}
          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUpgrade}
              disabled={purchasing}
            >
              <LinearGradient
                colors={[COLORS.gold, '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>
                  {purchasing ? 'Processing...' : 'Upgrade Now ⭐'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleClose}>
              <Text style={styles.secondaryButtonText}>Not now</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Note */}
          <Text style={styles.footerNote}>
            💡 You can cancel anytime. Mock payment for testing.
          </Text>
        </ScrollView>
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
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xxl + 20,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 40,
    top: 60,
    left: 40,
  },
  sparkle2: {
    position: 'absolute',
    fontSize: 35,
    top: 50,
    right: 50,
  },
  sparkle3: {
    position: 'absolute',
    fontSize: 40,
    top: 100,
    right: 30,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.xl,
    right: SPACING.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  logo: {
    fontSize: FONT_SIZES.xl,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: '#666',
    textAlign: 'center',
    maxWidth: '80%',
  },
  featuresContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  featureIcon: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: FONT_SIZES.sm,
    color: '#666',
  },
  pricingContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  pricingTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  pricingCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  pricingCardPopular: {
    borderWidth: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: COLORS.pawPink,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  popularBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pricingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  pricingPrice: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gold,
  },
  ctaContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  primaryButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    color: '#666',
    fontWeight: '600',
  },
  footerNote: {
    fontSize: FONT_SIZES.xs,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
});
