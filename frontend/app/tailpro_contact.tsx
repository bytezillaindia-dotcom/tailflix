import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function TailProContact() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const provider = params.provider as string || 'Provider';
  const service = params.service as string || 'Service';

  const handleChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Chat with Provider',
      'Chat feature coming soon! You will be able to message providers directly.',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to chat screen once implemented
            // router.push('/chat');
          },
        },
      ]
    );
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Call Provider',
      'Direct call is available only after booking confirmation. Please complete your booking first.',
      [
        {
          text: 'Got it',
          style: 'cancel',
        },
        {
          text: 'Book Now',
          onPress: () => {
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Provider Card */}
        <LinearGradient
          colors={[COLORS.cream, COLORS.peach]}
          style={styles.providerCard}
        >
          <View style={styles.goldBorder} />
          <Text style={styles.providerEmoji}>💼</Text>
          <Text style={styles.providerName}>{provider}</Text>
          <Text style={styles.serviceName}>{service}</Text>
        </LinearGradient>

        {/* Contact Options */}
        <Text style={styles.sectionTitle}>Contact Options</Text>

        <TouchableOpacity onPress={handleChat} style={styles.optionCard}>
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>💬</Text>
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Chat with Provider</Text>
            <Text style={styles.optionDescription}>Send a message anytime</Text>
          </View>
          <Text style={styles.optionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCall} style={styles.optionCard}>
          <View style={styles.optionIconContainer}>
            <Text style={styles.optionIcon}>📞</Text>
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>Call Provider</Text>
            <Text style={styles.optionDescription}>🔒 Available after booking</Text>
          </View>
          <Text style={styles.optionArrow}>→</Text>
        </TouchableOpacity>

        {/* Notice */}
        <View style={styles.noticeCard}>
          <Text style={styles.noticeEmoji}>💡</Text>
          <Text style={styles.noticeText}>
            <Text style={styles.noticeTextBold}>Direct call</Text> is unlocked only after your
            booking is confirmed. This protects both you and the provider.
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backToBookingButton}
        >
          <LinearGradient
            colors={[COLORS.pawPink, COLORS.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backToBookingGradient}
          >
            <Text style={styles.backToBookingButtonText}>← Back to Booking</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: '#2C3E50',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  providerCard: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  goldBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  providerEmoji: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  providerName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.warmBrown,
    marginBottom: SPACING.xs,
  },
  serviceName: {
    fontSize: FONT_SIZES.md,
    color: '#7F8C8D',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  optionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.creamLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
  },
  optionArrow: {
    fontSize: 24,
    color: COLORS.pawPink,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.creamLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.goldenBeige,
  },
  noticeEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: '#5A6C7D',
    lineHeight: 20,
  },
  noticeTextBold: {
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  backToBookingButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  backToBookingGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  backToBookingButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
