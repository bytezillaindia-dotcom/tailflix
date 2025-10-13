import React, { useState, useRef, useEffect } from 'react';
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
  Animated,
  Easing,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

type LoginMethod = 'phone' | 'email' | null;

export default function PremiumLoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
  const [inputValue, setInputValue] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation refs
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const inputY = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pawBounce = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const otpBoxes = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const successScale = useRef(new Animated.Value(0)).current;

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    startInitialAnimations();
    startGlowPulse();
  }, []);

  const startInitialAnimations = () => {
    Animated.stagger(150, [
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(titleY, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(inputY, {
        toValue: 0,
        tension: 35,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startGlowPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateOtpBoxes = () => {
    Animated.stagger(
      80,
      otpBoxes.map(box =>
        Animated.spring(box, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        })
      )
    ).start();
  };

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Button scale animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 100,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Paw bounce animation
    Animated.sequence([
      Animated.timing(pawBounce, {
        toValue: -20,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(pawBounce, {
        toValue: 0,
        tension: 100,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSendOtp = async () => {
    if (!inputValue.trim()) {
      Alert.alert('Error', `Please enter your ${loginMethod}`);
      return;
    }

    handleButtonPress();
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
        animateOtpBoxes();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

    handleButtonPress();
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
        // Success animation
        Animated.spring(successScale, {
          toValue: 1,
          tension: 40,
          friction: 5,
          useNativeDriver: true,
        }).start();

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Save user_id and token to AuthContext
        await login(data.user_id, data.token);

        // Small delay for animation
        setTimeout(async () => {
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
        }, 600);
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

  const glowOpacity = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (!loginMethod) {
    return (
      <View style={styles.container}>
        {/* Background Glow */}
        <Animated.View style={[styles.backgroundGlow, { opacity: glowOpacity }]} />

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
          <Image
            source={require('../assets/tailflix_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.View style={{ transform: [{ translateY: titleY }] }}>
          <LinearGradient
            colors={[COLORS.gold, '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.titleGradient}
          >
            <Text style={styles.title}>Welcome to TailFlix</Text>
          </LinearGradient>
          <Text style={styles.subtitle}>Where Tails and Hearts Connect 🐾</Text>
        </Animated.View>

        {/* Method Selection Buttons */}
        <Animated.View style={[styles.methodsContainer, { transform: [{ translateY: inputY }] }]}>
          <TouchableOpacity
            style={styles.methodButton}
            onPress={() => {
              setLoginMethod('phone');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <LinearGradient
              colors={[COLORS.crimson, '#8B0000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.methodGradient}
            >
              <Text style={styles.methodIcon}>📱</Text>
              <Text style={styles.methodText}>Login with Phone</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodButton}
            onPress={() => {
              setLoginMethod('email');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <LinearGradient
              colors={[COLORS.gold, '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.methodGradient}
            >
              <Text style={styles.methodIcon}>✉️</Text>
              <Text style={styles.methodText}>Login with Email</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background Glow */}
      <Animated.View style={[styles.backgroundGlow, { opacity: glowOpacity }]} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
          <Image
            source={require('../assets/tailflix_logo.png')}
            style={styles.logoSmall}
            resizeMode="contain"
          />
        </Animated.View>

        {!otpSent ? (
          /* Phone/Email Input Screen */
          <Animated.View style={{ transform: [{ translateY: inputY }] }}>
            <Text style={styles.screenTitle}>
              {loginMethod === 'phone' ? '📱 Phone Login' : '✉️ Email Login'}
            </Text>

            <View style={styles.inputContainer}>
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
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.gradientButtonContainer}
                onPress={handleSendOtp}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.crimson, COLORS.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Send OTP</Text>
                      <Animated.Text
                        style={[
                          styles.pawIcon,
                          { transform: [{ translateY: pawBounce }] },
                        ]}
                      >
                        🐾
                      </Animated.Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.backLink}
              onPress={() => {
                setLoginMethod(null);
                setInputValue('');
              }}
            >
              <Text style={styles.backLinkText}>← Choose another method</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          /* OTP Verification Screen */
          <View>
            <LinearGradient
              colors={[COLORS.gold, '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.otpTitleGradient}
            >
              <Text style={styles.otpTitle}>Enter OTP</Text>
            </LinearGradient>
            <Text style={styles.otpSubtext}>
              Code sent to {inputValue}
            </Text>

            {/* OTP Input Boxes */}
            <View style={styles.otpContainer}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.otpBoxContainer,
                    {
                      opacity: otpBoxes[index],
                      transform: [
                        {
                          translateY: otpBoxes[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.otpBox,
                      otp[index] && styles.otpBoxActive,
                    ]}
                  >
                    <Text style={styles.otpDigit}>{otp[index] || ''}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Hidden TextInput for OTP */}
            <TextInput
              style={styles.hiddenInput}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.gradientButtonContainer}
                onPress={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={[COLORS.crimson, COLORS.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.gradientButton,
                    (loading || otp.length !== 6) && styles.buttonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Verify</Text>
                      <Animated.Text
                        style={[
                          styles.pawIcon,
                          { transform: [{ translateY: pawBounce }] },
                        ]}
                      >
                        🐾
                      </Animated.Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.resendButton} onPress={handleSendOtp}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Success Animation */}
        {successScale._value > 0 && (
          <Animated.View
            style={[
              styles.successOverlay,
              {
                opacity: successScale,
                transform: [{ scale: successScale }],
              },
            ]}
          >
            <Text style={styles.successIcon}>🐾✨</Text>
            <Text style={styles.successText}>Success!</Text>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  backgroundGlow: {
    position: 'absolute',
    top: '20%',
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.gold,
    opacity: 0.3,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  logoSmall: {
    width: 80,
    height: 80,
  },
  titleGradient: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: '#D4AF37',
    textAlign: 'center',
    marginTop: SPACING.sm,
    opacity: 0.9,
  },
  methodsContainer: {
    marginTop: SPACING.xxl,
    gap: SPACING.md,
  },
  methodButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  methodGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  methodIcon: {
    fontSize: 28,
  },
  methodText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  screenTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    marginBottom: SPACING.xl,
  },
  input: {
    backgroundColor: COLORS.charcoal,
    borderWidth: 2,
    borderColor: COLORS.darkGray,
    borderRadius: 16,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradientButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  pawIcon: {
    fontSize: 24,
  },
  backLink: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
  },
  otpTitleGradient: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  otpTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  otpSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  otpBoxContainer: {
    width: 48,
    height: 60,
  },
  otpBox: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.charcoal,
    borderWidth: 2,
    borderColor: COLORS.darkGray,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  otpDigit: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
  },
  resendButton: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  resendText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    textDecorationLine: 'underline',
  },
  successOverlay: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 80,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
});
