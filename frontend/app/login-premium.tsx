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
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

const { width, height } = Dimensions.get('window');

type LoginMethod = 'phone' | 'email' | null;

export default function PremiumLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const otpRefs = useRef([...Array(6)].map(() => React.createRef<TextInput>())).current;

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const handleSendOtp = async () => {
    if (!inputValue.trim()) {
      Alert.alert('Error', `Please enter your ${loginMethod}`);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => otpRefs[0].current?.focus(), 100);
      } else {
        Alert.alert('Error', data.detail || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
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

    if (newOtp.every(digit => digit)) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: loginMethod,
          value: inputValue,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await login(data.user_id, data.token);

        setTimeout(async () => {
          const hasPetsResponse = await fetch(
            `${BACKEND_URL}/api/users/${data.user_id}/has-pets`
          );
          const hasPetsData = await hasPetsResponse.json();

          if (hasPetsData.has_pets) {
            router.replace('/home-premium');
          } else {
            router.replace('/add-pet');
          }
        }, 300);
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      setOtp(['', '', '', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const glowInterpolate = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 215, 0, 0.1)', 'rgba(255, 215, 0, 0.3)'],
  });

  if (!loginMethod) {
    return (
      <LinearGradient
        colors={['#000000', '#1a0a00', '#000000']}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.glowCircle,
            { backgroundColor: glowInterpolate },
          ]}
        />

        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/tailflix_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeTitle}>Welcome to</Text>
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.brandGradient}
            >
              <Text style={styles.brandText}>TailFlix</Text>
            </LinearGradient>
            <Text style={styles.tagline}>🐾 Where Tails and Hearts Connect 💕</Text>
          </View>

          {/* Login Methods */}
          <View style={styles.methodsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setLoginMethod('phone');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <LinearGradient
                colors={['#DC143C', '#8B0000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.methodCard}
              >
                <Text style={styles.methodIcon}>📱</Text>
                <Text style={styles.methodTitle}>Phone Number</Text>
                <Text style={styles.methodSubtitle}>Login with OTP</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setLoginMethod('email');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.methodCard}
              >
                <Text style={styles.methodIcon}>✉️</Text>
                <Text style={styles.methodTitle}>Email Address</Text>
                <Text style={styles.methodSubtitle}>Login with OTP</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#000000', '#1a0a00', '#000000']}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.glowCircle,
            { backgroundColor: glowInterpolate },
          ]}
        />

        <View style={styles.innerContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => {
                setLoginMethod(null);
                setInputValue('');
                setOtp(['', '', '', '', '', '']);
                setOtpSent(false);
              }}
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <Image
              source={require('../assets/tailflix_logo.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          {!otpSent ? (
            /* Input Screen */
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {loginMethod === 'phone' ? 'Enter Phone Number' : 'Enter Email'}
              </Text>
              <Text style={styles.formSubtitle}>
                We'll send you a verification code
              </Text>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={loginMethod === 'phone' ? '+1 (555) 000-0000' : 'you@example.com'}
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                  value={inputValue}
                  onChangeText={setInputValue}
                  keyboardType={loginMethod === 'phone' ? 'phone-pad' : 'email-address'}
                  autoCapitalize="none"
                  autoFocus
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleSendOtp}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#DC143C', '#FFD700']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryButton}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Send Code</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            /* OTP Screen */
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Enter Verification Code</Text>
              <Text style={styles.formSubtitle}>
                Sent to {inputValue}
              </Text>

              <View style={styles.otpContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TextInput
                    key={index}
                    ref={otpRefs[index]}
                    style={[
                      styles.otpInput,
                      otp[index] && styles.otpInputFilled,
                      focusedIndex === index && styles.otpInputFocused,
                    ]}
                    value={otp[index]}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.resendLink}
                onPress={handleSendOtp}
              >
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>

              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#FFD700" />
                  <Text style={styles.loadingText}>Verifying...</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowCircle: {
    position: 'absolute',
    top: height * 0.15,
    left: width / 2 - 200,
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  logo: {
    width: 140,
    height: 140,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl * 2,
  },
  welcomeTitle: {
    fontSize: FONT_SIZES.lg,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: SPACING.xs,
    letterSpacing: 2,
  },
  brandGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  brandText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 215, 0, 0.8)',
    marginTop: SPACING.md,
    letterSpacing: 1,
  },
  methodsContainer: {
    gap: SPACING.lg,
  },
  methodCard: {
    padding: SPACING.xl,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  methodIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  methodTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.xs,
  },
  methodSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  innerContainer: {
    flex: 1,
    paddingTop: SPACING.xxl + 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backText: {
    color: '#FFD700',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerLogo: {
    width: 50,
    height: 50,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  formSubtitle: {
    fontSize: FONT_SIZES.md,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: SPACING.xxl,
  },
  inputWrapper: {
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 16,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.lg,
    color: '#FFF',
    fontWeight: '600',
  },
  primaryButton: {
    padding: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  otpInput: {
    width: 52,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 12,
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  otpInputFocused: {
    borderColor: '#DC143C',
    backgroundColor: 'rgba(220, 20, 60, 0.1)',
  },
  resendLink: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  resendText: {
    fontSize: FONT_SIZES.md,
    color: '#FFD700',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: '#FFD700',
    fontWeight: '600',
  },
});

