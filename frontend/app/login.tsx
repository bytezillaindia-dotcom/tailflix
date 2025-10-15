import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

type LoginMethod = 'phone' | 'email' | null;

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

  const handleSendOtp = async () => {
    if (!inputValue.trim()) {
      Alert.alert('Error', `Please enter your ${loginMethod}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: loginMethod,
          value: inputValue,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent! Use any 6-digit code to verify.');
      } else {
        Alert.alert('Error', data.detail || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Send OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: loginMethod,
          value: inputValue,
          otp: otp,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Save user_id and token to AuthContext
        await login(data.user_id, data.token);

        // Check if user has pets
        const hasPetsResponse = await fetch(
          `${BACKEND_URL}/api/users/${data.user_id}/has-pets`
        );
        const hasPetsData = await hasPetsResponse.json();

        // Redirect based on whether user has pets
        if (hasPetsData.has_pets) {
          router.replace('/home-premium');
        } else {
          router.replace('/add-pet');
        }
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Verify OTP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetLogin = () => {
    setLoginMethod(null);
    setInputValue('');
    setOtp('');
    setOtpSent(false);
  };

  if (!loginMethod) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to TailFlix</Text>
          <Text style={styles.subtitle}>Choose your login method</Text>

          <TouchableOpacity
            style={styles.methodButton}
            onPress={() => setLoginMethod('phone')}
          >
            <Text style={styles.methodButtonText}>📱 Login with Phone OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodButton}
            onPress={() => setLoginMethod('email')}
          >
            <Text style={styles.methodButtonText}>✉️ Login with Email OTP</Text>
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>TailFlix</Text>
          <Text style={styles.subtitle}>
            {loginMethod === 'phone' ? 'Phone' : 'Email'} Login
          </Text>

          {!otpSent ? (
            <>
              <TextInput
                style={styles.input}
                placeholder={
                  loginMethod === 'phone'
                    ? 'Enter your phone number'
                    : 'Enter your email'
                }
                placeholderTextColor={COLORS.gray}
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType={loginMethod === 'phone' ? 'phone-pad' : 'email-address'}
                autoCapitalize="none"
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.otpInfo}>
                OTP sent to {inputValue}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit OTP"
                placeholderTextColor={COLORS.gray}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.backButton} onPress={resetLogin}>
            <Text style={styles.backText}>← Back to options</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.crimson,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  methodButton: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.crimson,
  },
  methodButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.charcoal,
    color: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    fontSize: FONT_SIZES.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  button: {
    backgroundColor: COLORS.crimson,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  otpInfo: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resendText: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.md,
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  backText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
  },
});
