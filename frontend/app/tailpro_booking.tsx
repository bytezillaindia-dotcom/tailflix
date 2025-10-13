import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import UnlockPaywall from '../components/UnlockPaywall';

interface Package {
  id: string;
  title: string;
  desc: string;
  basePrice: number;
}

const PACKAGES: Package[] = [
  { id: 'basic', title: 'Spa Bath', desc: 'Bath, ear clean, nail trim', basePrice: 0 },
  { id: 'full', title: 'Full Service', desc: 'Bath + haircut + styling', basePrice: 300 },
  { id: 'lux', title: 'PAWlux', desc: 'Styling + extras', basePrice: 600 },
];

export default function TailProBooking() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const serviceId = params.serviceId as string;
  const serviceName = params.service as string || 'Service';
  const providerName = params.provider as string || 'Provider';
  const city = params.city as string || 'Bengaluru';
  const basePrice = parseInt(params.price as string) || 999;
  const addonsStr = params.addons as string || '[]';
  const slotsStr = params.slots as string || '[]';
  
  const availableAddons = JSON.parse(addonsStr);
  const availableSlots = JSON.parse(slotsStr);

  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState<Package>(PACKAGES[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [petType, setPetType] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('<10kg');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [userCoins] = useState(100);

  const addonPrice = 150;
  const totalPrice = basePrice + selectedPackage.basePrice + (selectedAddons.length * addonPrice);

  const handlePackageSelect = (pkg: Package) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPackage(pkg);
  };

  const handleSlotSelect = (slot: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSlot(slot);
  };

  const handleAddonToggle = (addon: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedAddons.includes(addon)) {
      setSelectedAddons(selectedAddons.filter((a) => a !== addon));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedSlot) {
        Alert.alert('Select Time Slot', 'Please select a date and time');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      if (!breed || !address) {
        Alert.alert('Required Fields', 'Please fill in breed and address');
        return;
      }
      setStep(5);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleProceedToPayment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPaywall(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaywall(false);
    
    // Save order to AsyncStorage
    const order = {
      id: `ORDER-${Date.now()}`,
      serviceId,
      service: serviceName,
      provider: providerName,
      package: selectedPackage.title,
      slot: selectedSlot,
      addons: selectedAddons,
      petType,
      breed,
      weight,
      address,
      notes,
      total: totalPrice,
      city,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    try {
      const ordersStr = await AsyncStorage.getItem('tailpro_orders');
      const orders = ordersStr ? JSON.parse(ordersStr) : [];
      orders.push(order);
      await AsyncStorage.setItem('tailpro_orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving order:', error);
    }

    setStep(6);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <View
          key={s}
          style={[
            styles.stepDot,
            s === step && styles.stepDotActive,
            s < step && styles.stepDotComplete,
          ]}
        >
          <Text style={[styles.stepDotText, (s === step || s < step) && styles.stepDotTextActive]}>
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
        {/* Step 1: Select Package */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Select Package 🎁</Text>
            <Text style={styles.stepSubtitle}>{serviceName}</Text>

            {PACKAGES.map((pkg) => (
              <TouchableOpacity
                key={pkg.id}
                onPress={() => handlePackageSelect(pkg)}
                style={[
                  styles.packageCard,
                  selectedPackage.id === pkg.id && styles.packageCardSelected,
                ]}
              >
                <View style={styles.packageHeader}>
                  <Text style={styles.packageTitle}>{pkg.title}</Text>
                  <Text style={styles.packagePrice}>
                    {pkg.basePrice === 0 ? 'Base' : `+₹${pkg.basePrice}`}
                  </Text>
                </View>
                <Text style={styles.packageDesc}>{pkg.desc}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Pick Date & Time */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Pick Date & Time 📅</Text>
            <Text style={styles.stepSubtitle}>Choose your preferred slot</Text>

            <View style={styles.slotsContainer}>
              {availableSlots.map((slot: string) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => handleSlotSelect(slot)}
                  style={[
                    styles.slotCard,
                    selectedSlot === slot && styles.slotCardSelected,
                  ]}
                >
                  <Text style={styles.slotText}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setStep(1)} style={styles.backStepButton}>
                <Text style={styles.backStepButtonText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContinue}
                style={[styles.continueButton, styles.continueButtonFlex]}
              >
                <Text style={styles.continueButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Add-ons */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Add-ons ✨</Text>
            <Text style={styles.stepSubtitle}>Enhance your service (₹{addonPrice} each)</Text>

            {availableAddons.map((addon: string) => (
              <TouchableOpacity
                key={addon}
                onPress={() => handleAddonToggle(addon)}
                style={[
                  styles.addonCard,
                  selectedAddons.includes(addon) && styles.addonCardSelected,
                ]}
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      selectedAddons.includes(addon) && styles.checkboxChecked,
                    ]}
                  >
                    {selectedAddons.includes(addon) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.addonTitle}>{addon}</Text>
                </View>
                <Text style={styles.addonPrice}>+₹{addonPrice}</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.priceSummary}>
              <Text style={styles.priceSummaryLabel}>Current Total:</Text>
              <Text style={styles.priceSummaryValue}>₹{totalPrice}</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setStep(2)} style={styles.backStepButton}>
                <Text style={styles.backStepButtonText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContinue}
                style={[styles.continueButton, styles.continueButtonFlex]}
              >
                <Text style={styles.continueButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 4: Pet & Address */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Pet & Address 📦</Text>
            <Text style={styles.stepSubtitle}>Tell us about your pet</Text>

            <Text style={styles.inputLabel}>Pet Type</Text>
            <View style={styles.radioGroup}>
              {['Dog', 'Cat'].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPetType(type);
                  }}
                  style={[
                    styles.radioOption,
                    petType === type && styles.radioOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.radioText,
                      petType === type && styles.radioTextSelected,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Breed *</Text>
            <TextInput
              style={styles.textInput}
              value={breed}
              onChangeText={setBreed}
              placeholder="e.g., Golden Retriever"
              placeholderTextColor="#999"
            />

            <Text style={styles.inputLabel}>Pet Weight</Text>
            <View style={styles.radioGroup}>
              {['<10kg', '10-20kg', '20-30kg', '>30kg'].map((w) => (
                <TouchableOpacity
                  key={w}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setWeight(w);
                  }}
                  style={[
                    styles.weightOption,
                    weight === w && styles.radioOptionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.radioText,
                      weight === w && styles.radioTextSelected,
                    ]}
                  >
                    {w}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Full address with pincode"
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Notes for Pro</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special instructions"
              placeholderTextColor="#999"
              multiline
              numberOfLines={2}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setStep(3)} style={styles.backStepButton}>
                <Text style={styles.backStepButtonText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleContinue}
                style={[styles.continueButton, styles.continueButtonFlex]}
              >
                <Text style={styles.continueButtonText}>Continue →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 5: Review & Pay */}
        {step === 5 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Review & Pay 💳</Text>
            <Text style={styles.stepSubtitle}>Confirm your booking</Text>

            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Service:</Text>
                <Text style={styles.reviewValue}>{serviceName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Provider:</Text>
                <Text style={styles.reviewValue}>{providerName}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Package:</Text>
                <Text style={styles.reviewValue}>{selectedPackage.title}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Date & Time:</Text>
                <Text style={styles.reviewValue}>{selectedSlot}</Text>
              </View>
              {selectedAddons.length > 0 && (
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Add-ons:</Text>
                  <Text style={styles.reviewValue}>{selectedAddons.join(', ')}</Text>
                </View>
              )}
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Pet:</Text>
                <Text style={styles.reviewValue}>{breed} ({weight})</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>City:</Text>
                <Text style={styles.reviewValue}>{city}</Text>
              </View>
              <View style={styles.reviewDivider} />
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabelBold}>Total:</Text>
                <Text style={styles.reviewPrice}>₹{totalPrice}</Text>
              </View>
            </View>

            <TouchableOpacity onPress={handleProceedToPayment} style={styles.payButton}>
              <LinearGradient
                colors={[COLORS.crimson, COLORS.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.payButtonGradient}
              >
                <Text style={styles.payButtonText}>Proceed to Payment 🐾</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(4)} style={styles.backToStepButton}>
              <Text style={styles.backToStepText}>← Edit Details</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 6: Success */}
        {step === 6 && (
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
                  <Text style={styles.successValue}>{selectedSlot}</Text>
                </View>
                <View style={styles.successRow}>
                  <Text style={styles.successLabel}>Total Paid:</Text>
                  <Text style={styles.successValue}>₹{totalPrice}</Text>
                </View>
              </View>

              <Text style={styles.successNote}>
                📧 A confirmation SMS has been sent to your registered number
              </Text>

              <TouchableOpacity
                onPress={() => router.push('/tailpro_orders')}
                style={styles.viewOrdersButton}
              >
                <Text style={styles.viewOrdersButtonText}>View Orders</Text>
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
        headline="Confirm Booking 🐾"
        subtext={`Secure your ${serviceName} appointment`}
        priceInr={totalPrice}
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
    paddingVertical: SPACING.md,
    gap: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.pawPink,
  },
  stepDotComplete: {
    backgroundColor: '#27AE60',
  },
  stepDotText: {
    fontSize: 11,
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
  packageCard: {
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  packageCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.creamLight,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  packageTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  packagePrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.crimson,
  },
  packageDesc: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  slotCard: {
    width: '48%',
    padding: SPACING.md,
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  slotCardSelected: {
    borderColor: COLORS.pawPink,
    backgroundColor: COLORS.pawPinkLight,
  },
  slotText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#2C3E50',
  },
  addonCard: {
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addonCardSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.creamLight,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.pawPink,
    borderColor: COLORS.pawPink,
  },
  checkmark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addonTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#2C3E50',
  },
  addonPrice: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.crimson,
  },
  priceSummary: {
    backgroundColor: COLORS.creamLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  priceSummaryLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  priceSummaryValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.crimson,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  radioOption: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  weightOption: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  radioOptionSelected: {
    borderColor: COLORS.pawPink,
    backgroundColor: COLORS.pawPinkLight,
  },
  radioText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  radioTextSelected: {
    color: COLORS.warmBrown,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: FONT_SIZES.md,
    color: '#2C3E50',
    marginBottom: SPACING.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  reviewCard: {
    backgroundColor: '#FFF',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  reviewLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
  },
  reviewValue: {
    fontSize: FONT_SIZES.sm,
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  reviewLabelBold: {
    fontSize: FONT_SIZES.lg,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  reviewPrice: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.crimson,
    fontWeight: 'bold',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: SPACING.md,
  },
  continueButton: {
    backgroundColor: COLORS.pawPink,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  continueButtonFlex: {
    flex: 1,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  backStepButton: {
    backgroundColor: '#E0E0E0',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    flex: 0.3,
  },
  backStepButtonText: {
    color: '#7F8C8D',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  payButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  payButtonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  backToStepButton: {
    padding: SPACING.sm,
    alignItems: 'center',
  },
  backToStepText: {
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
  viewOrdersButton: {
    backgroundColor: '#27AE60',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    width: '100%',
    alignItems: 'center',
  },
  viewOrdersButtonText: {
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
