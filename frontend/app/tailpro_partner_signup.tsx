import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const CATEGORIES = ['Grooming', 'Walking', 'Vet', 'Boarding', 'Training'];
const CITIES = ['Bengaluru', 'Chennai', 'Delhi', 'Hyderabad', 'Mumbai', 'Pune'];

export default function TailProPartnerSignup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [price, setPrice] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!name || !phone || !category || !city || !price || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    if (phone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (!agreeTerms || !agreePrivacy) {
      Alert.alert('Agreement Required', 'Please agree to Terms & Conditions and Privacy Policy');
      return;
    }

    // Generate vendor ID
    const vendorId = `VENDOR${Date.now()}`;
    
    // Save pending vendor data to AsyncStorage
    try {
      const partnerData = {
        vendorId,
        name,
        phone,
        category,
        city,
        price: parseInt(price),
        role: 'pending_vendor',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      const existingPartnersStr = await AsyncStorage.getItem('tailpro_partners');
      const existingPartners = existingPartnersStr ? JSON.parse(existingPartnersStr) : [];
      existingPartners.push(partnerData);
      await AsyncStorage.setItem('tailpro_partners', JSON.stringify(existingPartners));
      
      console.log('Partner application saved:', partnerData);
    } catch (error) {
      console.error('Error saving partner data:', error);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 60 }} />
          <Text style={styles.headerTitle}>TailPro Partner</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>✅</Text>
          <Text style={styles.successTitle}>Application Submitted!</Text>
          <Text style={styles.successMessage}>
            Thank you for your interest in becoming a TailPro partner. Our team will review your
            application and get back to you within 2-3 business days.
          </Text>

          <View style={styles.nextStepsCard}>
            <Text style={styles.nextStepsTitle}>What's Next?</Text>
            <View style={styles.nextStep}>
              <Text style={styles.nextStepIcon}>1️⃣</Text>
              <Text style={styles.nextStepText}>We'll verify your documents</Text>
            </View>
            <View style={styles.nextStep}>
              <Text style={styles.nextStepIcon}>2️⃣</Text>
              <Text style={styles.nextStepText}>Admin will review your profile</Text>
            </View>
            <View style={styles.nextStep}>
              <Text style={styles.nextStepIcon}>3️⃣</Text>
              <Text style={styles.nextStepText}>You'll receive approval notification</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/home-premium')}
            style={styles.doneButton}
          >
            <LinearGradient
              colors={[COLORS.pawPink, COLORS.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.doneButtonGradient}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Partner Signup</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Headline */}
        <View style={styles.headlineCard}>
          <Text style={styles.headlineEmoji}>💼</Text>
          <Text style={styles.headline}>Become a TailPro Partner</Text>
          <Text style={styles.subheadline}>
            List your services and get bookings from TailFlix users
          </Text>
        </View>

        {/* Form */}
        <Text style={styles.inputLabel}>Your Name *</Text>
        <TextInput
          style={styles.textInput}
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor="#999"
        />

        <Text style={styles.inputLabel}>Phone (10 digits) *</Text>
        <TextInput
          style={styles.textInput}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.inputLabel}>Service Category *</Text>
        <View style={styles.radioGroup}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCategory(cat);
              }}
              style={[
                styles.radioOption,
                category === cat && styles.radioOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.radioText,
                  category === cat && styles.radioTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>City *</Text>
        <View style={styles.radioGroup}>
          {CITIES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCity(c);
              }}
              style={[
                styles.cityOption,
                city === c && styles.radioOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.radioText,
                  city === c && styles.radioTextSelected,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Starting Price (₹) *</Text>
        <TextInput
          style={styles.textInput}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g., 999"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>Create Password *</Text>
        <TextInput
          style={styles.textInput}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <Text style={styles.inputLabel}>Confirm Password *</Text>
        <TextInput
          style={styles.textInput}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          placeholderTextColor="#999"
          secureTextEntry
        />

        {/* Document Upload Notice */}
        <View style={styles.uploadNotice}>
          <Text style={styles.uploadNoticeIcon}>📄</Text>
          <Text style={styles.uploadNoticeText}>
            Document upload (Govt ID / License) will be enabled in admin verification after signup
          </Text>
        </View>

        {/* Consent Checkboxes */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setAgreeTerms(!agreeTerms);
          }}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
            {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>I agree to Terms & Conditions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setAgreePrivacy(!agreePrivacy);
          }}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, agreePrivacy && styles.checkboxChecked]}>
            {agreePrivacy && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>I agree to Privacy Policy</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <LinearGradient
            colors={[COLORS.warmBrown, COLORS.chocolateBrown]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButtonGradient}
          >
            <Text style={styles.submitButtonText}>Create Partner Account</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  headlineCard: {
    backgroundColor: '#FFF',
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headlineEmoji: {
    fontSize: 56,
    marginBottom: SPACING.sm,
  },
  headline: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subheadline: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
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
  cityOption: {
    paddingHorizontal: SPACING.sm + 2,
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
  uploadNotice: {
    flexDirection: 'row',
    backgroundColor: COLORS.creamLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.goldenBeige,
  },
  uploadNoticeIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  uploadNoticeText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: '#5A6C7D',
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
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
  checkboxLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#2C3E50',
  },
  submitButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.lg,
  },
  submitButtonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  successContainer: {
    flex: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successEmoji: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: FONT_SIZES.md,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  nextStepsCard: {
    width: '100%',
    backgroundColor: '#FFF',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  nextStepsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: SPACING.md,
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  nextStepIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  nextStepText: {
    fontSize: FONT_SIZES.sm,
    color: '#5A6C7D',
  },
  doneButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    width: '100%',
  },
  doneButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
