import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

const { width } = Dimensions.get('window');

export default function PremiumLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const otpRefs = useRef([...Array(6)].map(() => React.createRef<TextInput>())).current;

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    startEntryAnimations();
  }, []);

  useEffect(() => {
    if (otpSent && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpSent, timer]);

  const startEntryAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.2,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length < 6) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'phone', value: phoneNumber }),
      });

      if (response.ok) {
        setOtpSent(true);
        setTimer(30);
        setCanResend(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('OTP Sent!', 'Check your phone for the 6-digit code (or use dev code: 123456)');
        setTimeout(() => otpRefs[0].current?.focus(), 300);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'OTP not sent. Please try again or use dev code: 123456');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Connection Error', 'Could not send OTP. Use dev code: 123456 to bypass');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current?.focus();
    }

    if (newOtp.every((digit) => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // DEV BYPASS: Check if OTP is 123456
    if (otpCode === '123456') {
      try {
        // Use the real backend to create/login the user
        const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ method: 'phone', value: phoneNumber, otp: '123456' }),
        });

        const data = await response.json();

        if (response.ok && data.token) {
          await AsyncStorage.setItem('sessionToken', data.token);
          await login(data.user_id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Dev Bypass', 'Logged in successfully!');
          
          // Check if user has completed registration
          try {
            const profileResponse = await fetch(`${BACKEND_URL}/api/users/${data.user_id}/profile`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              // User has profile, go to home
              setTimeout(() => {
                router.replace('/(tabs)/home');
              }, 500);
            } else {
              // No profile found, redirect to registration
              Alert.alert('Welcome!', 'Let\'s set up your TailFlix profile');
              setTimeout(() => {
                router.replace('/register_user' as any);
              }, 500);
            }
          } catch (error) {
            // If profile check fails, assume new user
            setTimeout(() => {
              router.replace('/register_user' as any);
            }, 500);
          }
          
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Dev bypass failed:', error);
        // Fall through to normal verification
      }
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'phone', value: phoneNumber, otp: otpCode }),
      });

      const data = await response.json();
      
      console.log('📥 Verify OTP response:', data);

      if (response.ok && data.success && data.token) {
        await AsyncStorage.setItem('sessionToken', data.token);
        await login(data.user_id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Check if user has completed registration
        try {
          const profileResponse = await fetch(`${BACKEND_URL}/api/users/${data.user_id}/profile`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            // User has profile, go to home
            setTimeout(() => {
              router.replace('/(tabs)/home');
            }, 500);
          } else {
            // No profile found, redirect to registration
            Alert.alert('Welcome!', 'Let\'s set up your TailFlix profile');
            setTimeout(() => {
              router.replace('/register_user' as any);
            }, 500);
          }
        } catch (error) {
          // If profile check fails, assume new user
          setTimeout(() => {
            router.replace('/register_user' as any);
          }, 500);
        }
      } else {
        shakeAnimation();
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Incorrect Code', 'Please try again');
      }
    } catch (error) {
      console.error('❌ OTP Verification Error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      shakeAnimation();
      setOtp(['', '', '', '', '', '']);
      otpRefs[0].current?.focus();
      Alert.alert(
        'Error', 
        `OTP verification failed. ${error?.message || 'Please retry or use dev code: 123456'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (canResend) {
      handleSendOTP();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FFFDF9', '#FFE6EC', '#FFF8F2']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Glow Background */}
        <Animated.View
          style={[
            styles.glowCircle,
            {
              opacity: glowOpacity,
            },
          ]}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Text style={styles.logoEmoji}>🐾</Text>
            <Text style={styles.logoText}>TailFlix</Text>
          </Animated.View>

          {/* Card Container */}
          <View style={styles.card}>
            <Text style={styles.title}>
              {otpSent ? 'Secure Login 🔐' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {otpSent
                ? `Enter the 6-digit code sent to ${phoneNumber}`
                : 'Enter your phone number to continue'}
            </Text>

            {!otpSent ? (
              // Phone Input
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus
                />
              </View>
            ) : (
              // OTP Input
              <Animated.View
                style={[
                  styles.otpContainer,
                  { transform: [{ translateX: shakeAnim }] },
                ]}
              >
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={otpRefs[index]}
                    style={[
                      styles.otpBox,
                      digit && styles.otpBoxFilled,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent: { key } }) =>
                      handleOtpKeyPress(key, index)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </Animated.View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={styles.button}
              onPress={otpSent ? () => handleVerifyOTP(otp.join('')) : handleSendOTP}
              disabled={loading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Please wait...' : otpSent ? 'Verify & Continue →' : 'Send OTP'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend OTP */}
            {otpSent && (
              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendOTP}
                disabled={!canResend}
              >
                <Text style={[styles.resendText, !canResend && styles.resendTextDisabled]}>
                  {canResend ? 'Resend Code' : `Resend in ${timer}s`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footer}>TailFlix 🐾 — Premium Pet Connections</Text>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  glowCircle: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: COLORS.accent,
    top: -100,
    right: -100,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logoEmoji: {
    fontSize: 60,
    marginBottom: SPACING.sm,
  },
  logoText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xxl,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  phoneInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  otpBox: {
    width: 48,
    height: 56,
    backgroundColor: '#F8F8F8',
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFilled: {
    backgroundColor: '#FFF',
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.2,
  },
  button: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#FFF',
  },
  resendButton: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  resendText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    color: COLORS.gray,
    textDecorationLine: 'none',
  },
  footer: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginTop: SPACING.xxl,
    textAlign: 'center',
  },
});
