import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function PaywallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const customMessage = params.message as string;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Unlock TailFlix Premium ✨</Text>
          <Text style={styles.subtitle}>
            More wags, more matches, more love ❤️🐶
          </Text>
        </View>

        {/* Custom Message (if coming from premium feature) */}
        {customMessage && (
          <View style={styles.customMessageContainer}>
            <Text style={styles.customMessage}>{customMessage}</Text>
          </View>
        )}

        {/* Plans Comparison */}
        <View style={styles.plansContainer}>
          {/* Free Plan */}
          <View style={[styles.planCard, styles.freePlan]}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Free Plan</Text>
              <Text style={styles.planSubtitle}>(current)</Text>
            </View>
            <View style={styles.planFeatures}>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>🎾</Text>
                <Text style={styles.featureText}>10 Likes/day</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>👀</Text>
                <Text style={styles.featureText}>View profiles</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>💬</Text>
                <Text style={styles.featureText}>Basic chat</Text>
              </View>
            </View>
            <View style={styles.planPrice}>
              <Text style={styles.priceAmount}>$0</Text>
              <Text style={styles.pricePeriod}>forever</Text>
            </View>
          </View>

          {/* Premium Plan */}
          <View style={[styles.planCard, styles.premiumPlan]}>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumBadgeText}>⭐ BEST VALUE</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={[styles.planTitle, styles.premiumText]}>Premium Plan</Text>
              <Text style={[styles.planSubtitle, styles.premiumText]}>recommended</Text>
            </View>
            <View style={styles.planFeatures}>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>♾️</Text>
                <Text style={[styles.featureText, styles.premiumText]}>Unlimited Likes</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>🦴</Text>
                <Text style={[styles.featureText, styles.premiumText]}>Super Likes</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>✨🍖</Text>
                <Text style={[styles.featureText, styles.premiumText]}>Golden Bones (5/month)</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>🚀</Text>
                <Text style={[styles.featureText, styles.premiumText]}>Boosted visibility</Text>
              </View>
              <View style={styles.featureRow}>
                <Text style={styles.featureIcon}>💎</Text>
                <Text style={[styles.featureText, styles.premiumText]}>Premium badge</Text>
              </View>
            </View>
            <View style={styles.planPrice}>
              <Text style={[styles.priceAmount, styles.premiumText]}>$9.99</Text>
              <Text style={[styles.pricePeriod, styles.premiumText]}>per month</Text>
            </View>
          </View>
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => {
            alert('Payments coming soon. Premium is mock-enabled in Admin.');
          }}
        >
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          <Text style={styles.upgradeButtonSubtext}>✨ Unlock all features</Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 How to Enable Premium (Testing)</Text>
          <Text style={styles.infoText}>
            For testing purposes, admins can toggle Premium status in the Admin screen under the Users tab.
          </Text>
        </View>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Maybe Later</Text>
        </TouchableOpacity>
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
