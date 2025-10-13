import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import UnlockPaywall from '../components/UnlockPaywall';

interface TimeSlot {
  day: string;
  time: string;
  available: boolean;
}

const MOCK_SLOTS: TimeSlot[] = [
  { day: 'Mon', time: '10:00 AM', available: true },
  { day: 'Mon', time: '02:00 PM', available: true },
  { day: 'Tue', time: '12:00 PM', available: true },
  { day: 'Wed', time: '09:00 AM', available: false },
  { day: 'Wed', time: '06:00 PM', available: true },
  { day: 'Fri', time: '03:00 PM', available: true },
  { day: 'Sat', time: '09:00 AM', available: true },
  { day: 'Sat', time: '11:00 AM', available: true },
];

export default function BookingFlow() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const serviceName = params.service as string || 'Pet Service';
  const providerName = params.provider as string || 'Provider';
  const priceStr = params.price as string || '₹799';
  const priceValue = parseInt(priceStr.replace(/[^0-9]/g, '')) || 799;

  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userCoins] = useState(100);

  const handleSlotSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSlot(slot);
  };

  const handleContinue = () => {
    if (!selectedSlot) {
      Alert.alert('Select Time Slot', 'Please select an available time slot');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPaywall(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaywall(false);
    setStep(3);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            s === step && styles.stepDotActive,
            s < step && styles.stepDotComplete,
          ]}
        >
          <Text style={[styles.stepDotText, s === step && styles.stepDotTextActive]}>
            {s < step ? '✓' : s}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Service</Text>
        <View style={{ width: 60 }} />
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Date & Time 📅</Text>
            <Text style={styles.stepSubtitle}>Choose your preferred slot</Text>

            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{serviceName}</Text>
              <Text style={styles.providerName}>by {providerName}</Text>
            </View>

            <View style={styles.slotsContainer}>
              {MOCK_SLOTS.map((slot, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSlotSelect(slot)}
                  disabled={!slot.available}
                  style={[
                    styles.slotCard,
                    selectedSlot === slot && styles.slotCardSelected,
                    !slot.available && styles.slotCardDisabled,
                  ]}
                >
                  <Text style={[styles.slotDay, !slot.available && styles.slotDisabledText]}>
                    {slot.day}
                  </Text>
                  <Text style={[styles.slotTime, !slot.available && styles.slotDisabledText]}>
                    {slot.time}
                  </Text>
                  {!slot.available && (
                    <Text style={styles.slotUnavailable}>Booked</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              style={[styles.continueButton, !selectedSlot && styles.continueButtonDisabled]}
              disabled={!selectedSlot}
            >
              <Text style={styles.continueButtonText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Confirm Booking 📋</Text>
            <Text style={styles.stepSubtitle}>Review your booking details</Text>

            <View style={styles.confirmCard}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Service:</Text>
                <Text style={styles.confirmValue}>{serviceName}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Provider:</Text>
                <Text style={styles.confirmValue}>{providerName}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Date & Time:</Text>
                <Text style={styles.confirmValue}>
                  {selectedSlot?.day} {selectedSlot?.time}
                </Text>
              </View>
              <View style={styles.confirmDivider} />
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabelBold}>Total:</Text>
                <Text style={styles.confirmPrice}>{priceStr}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmButtonText}>Proceed to Payment 💳</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(1)} style={styles.backToSlotsButton}>
              <Text style={styles.backToSlotsText}>← Change Time Slot</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <View style={styles.successContainer}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>Booking Confirmed!</Text>
              <Text style={styles.successSubtitle}>Your appointment is all set</Text>

              <View style={styles.successCard}>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Service:</Text>
                  <Text style={styles.successValue}>{serviceName}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Provider:</Text>
                  <Text style={styles.successValue}>{providerName}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>When:</Text>
                  <Text style={styles.successValue}>
                    {selectedSlot?.day} {selectedSlot?.time}
                  </Text>
                </View>
              </View>

              <Text style={styles.successNote}>
                📧 A confirmation SMS has been sent to your registered number
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/tailpro')}
                style={styles.doneButton}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/home-premium')}
                style={styles.homeButton}
              >
                <Text style={styles.homeButtonText}>← Back to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <UnlockPaywall
        visible={showPaywall}
        headline="Complete Booking 🐾"
        subtext={`Confirm your ${serviceName} appointment`}
        priceInr={priceValue}
        priceCoins={15}
        currentCoins={userCoins}
        onPayWithMoney={handlePaymentSuccess}
        onPayWithCoins={handlePaymentSuccess}
        onCancel={() => setShowPaywall(false)}
      />
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
    color: '#2C3E50',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.md,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: '#FFB6C1',
  },
  stepDotComplete: {
    backgroundColor: '#27AE60',
  },
  stepDotText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#999',
  },
  stepDotTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: SPACING.xs,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.md,
    color: '#7F8C8D',
    marginBottom: SPACING.lg,
  },
  serviceInfo: {
    padding: SPACING.md,
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  serviceName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  providerName: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
    marginTop: 4,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  slotCard: {
    width: '31%',
    padding: SPACING.md,
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  slotCardSelected: {
    borderColor: '#FFB6C1',
    backgroundColor: '#FFF5F7',
  },
  slotCardDisabled: {
    opacity: 0.4,
  },
  slotDay: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#2C3E50',
  },
  slotTime: {
    fontSize: FONT_SIZES.xs,
    color: '#7F8C8D',
    marginTop: 4,
  },
  slotDisabledText: {
    color: '#CCC',
  },
  slotUnavailable: {
    fontSize: 9,
    color: '#E74C3C',
    marginTop: 4,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#FFB6C1',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  confirmCard: {
    backgroundColor: '#FFF',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  confirmLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
  },
  confirmValue: {
    fontSize: FONT_SIZES.sm,
    color: '#2C3E50',
    fontWeight: '600',
  },
  confirmLabelBold: {
    fontSize: FONT_SIZES.md,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  confirmPrice: {
    fontSize: FONT_SIZES.xl,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  confirmDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: SPACING.md,
  },
  confirmButton: {
    backgroundColor: '#FFB6C1',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  backToSlotsButton: {
    padding: SPACING.sm,
    alignItems: 'center',
  },
  backToSlotsText: {
    color: '#7F8C8D',
    fontSize: FONT_SIZES.sm,
  },
  successContainer: {
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: SPACING.xs,
  },
  successSubtitle: {
    fontSize: FONT_SIZES.md,
    color: '#7F8C8D',
    marginBottom: SPACING.xl,
  },
  successCard: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  successLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
  },
  successValue: {
    fontSize: FONT_SIZES.sm,
    color: '#2C3E50',
    fontWeight: '600',
  },
  successNote: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  doneButton: {
    backgroundColor: '#27AE60',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  homeButton: {
    padding: SPACING.sm,
  },
  homeButtonText: {
    color: '#7F8C8D',
    fontSize: FONT_SIZES.sm,
  },
});
