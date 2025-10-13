import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const message = params.message as string || "You've used all 10 free likes for today";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {params.message ? 'Premium Feature 🐾' : 'Daily Limit Reached! 🐾'}
          </Text>
          <Text style={styles.subtitle}>
            {message}
          </Text>
        </View>

        {/* Premium Features */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Upgrade to Premium:</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✨</Text>
            <Text style={styles.featureText}>Unlimited Likes</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🦴</Text>
            <Text style={styles.featureText}>Unlimited Super Likes</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💎</Text>
            <Text style={styles.featureText}>5 Golden Bones per month</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>👁️</Text>
            <Text style={styles.featureText}>See who liked your pet</Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Priority placement in feed</Text>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingContainer}>
          <View style={styles.priceCard}>
            <Text style={styles.priceAmount}>$9.99</Text>
            <Text style={styles.pricePeriod}>per month</Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <TouchableOpacity
          style={styles.premiumButton}
          onPress={() => {
            // TODO: Implement payment flow
            alert('Payment integration coming soon!');
          }}
        >
          <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Maybe Later</Text>
        </TouchableOpacity>

        {/* Info Text */}
        {!params.message && (
          <Text style={styles.infoText}>
            Your daily likes reset at midnight. Come back tomorrow for 10 more free likes!
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.crimson,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.8,
  },
  featuresContainer: {
    backgroundColor: COLORS.charcoal,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  featuresTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    fontSize: FONT_SIZES.xl,
    marginRight: SPACING.md,
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    flex: 1,
  },
  pricingContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  priceCard: {
    backgroundColor: COLORS.charcoal,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.crimson,
    minWidth: 200,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  pricePeriod: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.7,
  },
  premiumButton: {
    backgroundColor: COLORS.gold,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  premiumButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  backButton: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  backButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.6,
    fontStyle: 'italic',
  },
});
