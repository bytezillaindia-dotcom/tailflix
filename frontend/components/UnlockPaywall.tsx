import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.85;

interface UnlockPaywallProps {
  visible: boolean;
  headline: string;
  subtext: string;
  priceInr?: number;
  priceCoins?: number;
  onPayWithMoney?: () => void;
  onPayWithCoins?: () => void;
  onCancel: () => void;
  currentCoins?: number;
}

export default function UnlockPaywall({
  visible,
  headline,
  subtext,
  priceInr,
  priceCoins,
  onPayWithMoney,
  onPayWithCoins,
  onCancel,
  currentCoins,
}: UnlockPaywallProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handlePayWithMoney = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPayWithMoney?.();
  };

  const handlePayWithCoins = () => {
    if (priceCoins && currentCoins !== undefined && currentCoins < priceCoins) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onPayWithCoins?.();
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCancel();
  };

  const insufficientCoins =
    priceCoins && currentCoins !== undefined && currentCoins < priceCoins;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleCancel}
        />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.cream, COLORS.peach]}
            style={styles.modalContent}
          >
            {/* Gold Border */}
            <View style={styles.goldBorder} />

            {/* Headline */}
            <Text style={styles.headline}>{headline}</Text>

            {/* Subtext */}
            <Text style={styles.subtext}>{subtext}</Text>

            {/* Payment Options */}
            <View style={styles.buttonsContainer}>
              {/* Pay with Money */}
              {priceInr && onPayWithMoney && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePayWithMoney}
                  style={styles.paymentButton}
                >
                  <LinearGradient
                    colors={[COLORS.crimson, COLORS.gold]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.paymentButtonGradient}
                  >
                    <Text style={styles.paymentButtonText}>Pay ₹{priceInr}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Pay with Coins */}
              {priceCoins && onPayWithCoins && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePayWithCoins}
                  style={styles.paymentButton}
                  disabled={insufficientCoins}
                >
                  <LinearGradient
                    colors={
                      insufficientCoins
                        ? ['#888', '#666']
                        : [COLORS.pawPink, COLORS.gold]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.paymentButtonGradient}
                  >
                    <Text style={styles.paymentButtonText}>
                      Use {priceCoins} TailCoins 💰
                    </Text>
                    {insufficientCoins && (
                      <Text style={styles.insufficientText}>
                        (Need {priceCoins - (currentCoins || 0)} more)
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {/* Cancel Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleCancel}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: MODAL_WIDTH,
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
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
  headline: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtext: {
    fontSize: FONT_SIZES.md,
    color: COLORS.warmBrown,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: SPACING.md,
  },
  paymentButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  paymentButtonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  insufficientText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  cancelButton: {
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#999',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.warmBrown,
  },
});
