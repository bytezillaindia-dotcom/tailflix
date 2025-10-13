import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onBuyCoins: () => void;
  onUpgradePremium: () => void;
  tailCoins?: number;
  dailyLikesUsed?: number;
  dailyLikesLimit?: number;
  errorType?: 'insufficient_coins' | 'daily_limit_reached';
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onBuyCoins,
  onUpgradePremium,
  tailCoins = 0,
  dailyLikesUsed = 0,
  dailyLikesLimit = 10,
  errorType = 'daily_limit_reached',
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(sparkleAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const handleBuyCoins = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBuyCoins();
  };

  const handleUpgradePremium = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpgradePremium();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ translateY }] },
          ]}
        >
          <LinearGradient
            colors={['#1a0000', '#000000']}
            style={styles.modalContent}
          >
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.header}>
              <Text style={styles.emoji}>🐾</Text>
              <Text style={styles.title}>
                {errorType === 'insufficient_coins' 
                  ? 'Need More TailCoins!' 
                  : 'Out of Free Likes!'}
              </Text>
              <Text style={styles.subtitle}>
                {errorType === 'insufficient_coins'
                  ? `You have ${tailCoins} TailCoins`
                  : `You've used ${dailyLikesUsed}/${dailyLikesLimit} free likes today`}
              </Text>
            </View>

            {/* Plans */}
            <View style={styles.plansContainer}>
              {/* Free Plan */}
              <View style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>Free Plan</Text>
                  <Text style={styles.planBadge}>Current</Text>
                </View>
                <Text style={styles.planFeature}>• 10 free Likes per day</Text>
                <Text style={styles.planFeature}>• Skip: Unlimited</Text>
                <Text style={styles.planFeature}>• Super Like: 5 coins</Text>
                <Text style={styles.planFeature}>• Golden Bone: 50 coins</Text>
              </View>

              {/* Premium/Coins Plan */}
              <LinearGradient
                colors={['#FFD700', '#FFA500', '#DAA520']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.premiumCard}
              >
                <Animated.View style={[styles.sparkle, { opacity: sparkleOpacity }]}>
                  <Text style={styles.sparkleText}>✨</Text>
                </Animated.View>
                <View style={styles.planHeader}>
                  <Text style={styles.premiumTitle}>Premium</Text>
                  <Text style={styles.premiumBadge}>⭐ Unlimited</Text>
                </View>
                <Text style={styles.premiumFeature}>• Unlimited Likes</Text>
                <Text style={styles.premiumFeature}>• Free Super Likes</Text>
                <Text style={styles.premiumFeature}>• Free Golden Bones</Text>
                <Text style={styles.premiumFeature}>• Ad-free experience</Text>
              </LinearGradient>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              {/* Buy Coins Button */}
              <TouchableOpacity
                style={styles.buyCoinsButton}
                onPress={handleBuyCoins}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#DC143C', '#8B0000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonEmoji}>🪙</Text>
                  <View>
                    <Text style={styles.buttonTitle}>Buy TailCoins</Text>
                    <Text style={styles.buttonSubtext}>100 coins for ₹99</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Upgrade to Premium Button */}
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={handleUpgradePremium}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonEmoji}>👑</Text>
                  <View>
                    <Text style={[styles.buttonTitle, styles.premiumButtonText]}>
                      Upgrade to Premium
                    </Text>
                    <Text style={[styles.buttonSubtext, styles.premiumButtonText]}>
                      Unlimited everything!
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Paw print */}
            <View style={styles.pawContainer}>
              <Text style={styles.pawText}>🐾</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: SCREEN_WIDTH,
    maxHeight: '85%',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emoji: {
    fontSize: 60,
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  plansContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  planCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.lg,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  planBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  planFeature: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
  },
  premiumCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  sparkle: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  sparkleText: {
    fontSize: 30,
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  premiumBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  premiumFeature: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    marginBottom: 6,
  },
  buttonsContainer: {
    gap: SPACING.md,
  },
  buyCoinsButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  premiumButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  buttonEmoji: {
    fontSize: 32,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  buttonSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  premiumButtonText: {
    color: '#000',
  },
  pawContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  pawText: {
    fontSize: 24,
    opacity: 0.3,
  },
});
