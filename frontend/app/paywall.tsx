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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxl + 4,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray,
    textAlign: 'center',
  },
  customMessageContainer: {
    backgroundColor: COLORS.crimson + '20',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.crimson,
    marginBottom: SPACING.lg,
  },
  customMessage: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    fontWeight: '600',
  },
  plansContainer: {
    marginBottom: SPACING.xl,
  },
  planCard: {
    padding: SPACING.lg,
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 2,
  },
  freePlan: {
    backgroundColor: COLORS.charcoal,
    borderColor: COLORS.darkGray,
  },
  premiumPlan: {
    backgroundColor: '#1a1a1a',
    borderColor: '#FFD700',
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: -12,
    right: SPACING.lg,
    backgroundColor: '#FFD700',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  premiumBadgeText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: SPACING.md,
  },
  planTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  planSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  premiumText: {
    color: '#FFD700',
  },
  planFeatures: {
    marginBottom: SPACING.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
    width: 30,
  },
  featureText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    flex: 1,
  },
  planPrice: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGray,
  },
  priceAmount: {
    fontSize: FONT_SIZES.xxl + 8,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  pricePeriod: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginTop: SPACING.xs,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeButtonText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  upgradeButtonSubtext: {
    color: COLORS.black,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
    opacity: 0.8,
  },
  infoSection: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  infoTitle: {
    color: '#FFD700',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  infoText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  backButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
  },
});
