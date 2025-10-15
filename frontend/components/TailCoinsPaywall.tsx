import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useTailCoins } from './TailCoinsContext';

interface TailCoinsPaywallProps {
  visible: boolean;
  onClose: () => void;
  requiredAmount?: number;
  actionName?: string;
}

export default function TailCoinsPaywall({ visible, onClose, requiredAmount = 0, actionName = 'this action' }: TailCoinsPaywallProps) {
  const router = useRouter();
  const { balance } = useTailCoins();

  const handleBuyCoins = () => {
    onClose();
    router.push('/tailcoins_store');
  };

  const handleUpgradePremium = () => {
    onClose();
    router.push('/premium_upgrade');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Sparkles */}
          <Text style={styles.sparkle}>✨</Text>
          <Text style={[styles.sparkle, styles.sparkle2]}>🐾</Text>
          <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>

          {/* Content */}
          <Text style={styles.icon}>💎</Text>
          <Text style={styles.title}>Not Enough TailCoins</Text>
          <Text style={styles.subtitle}>
            You need {requiredAmount} coins for {actionName}
          </Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Your Balance:</Text>
            <Text style={styles.balanceAmount}>{balance} 💎</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleBuyCoins}>
            <LinearGradient
              colors={[COLORS.gold, '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.primaryButtonText}>Buy TailCoins 💎</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={handleUpgradePremium}>
            <Text style={styles.secondaryButtonText}>Upgrade to TailPro ⭐</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 30,
    top: 20,
    left: 30,
  },
  sparkle2: {
    top: 30,
    right: 40,
    left: 'auto' as any,
  },
  sparkle3: {
    bottom: 40,
    left: 50,
    top: 'auto' as any,
  },
  icon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: '#CCC',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#CCC',
    marginRight: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  primaryButton: {
    width: '100%',
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  buttonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#000',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFF',
  },
  closeButton: {
    padding: SPACING.sm,
  },
  closeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: '#999',
  },
});
