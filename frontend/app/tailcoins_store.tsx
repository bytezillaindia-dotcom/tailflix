import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useTailCoins } from '../components/TailCoinsContext';

const COIN_PACKAGES = [
  { id: 1, coins: 50, price: '₹49', popular: false },
  { id: 2, coins: 120, price: '₹99', popular: true },
  { id: 3, coins: 300, price: '₹199', popular: false },
  { id: 4, coins: 750, price: '₹499', popular: false },
];

export default function TailCoinsStore() {
  const router = useRouter();
  const { balance, addCoins } = useTailCoins();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (coins: number, price: string) => {
    setPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Mock purchase - simulate payment
    setTimeout(async () => {
      await addCoins(coins, `Purchase ${price}`);
      setPurchasing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Purchase Successful! 🎉',
        `${coins} TailCoins added to your account!`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A1A1A', '#000']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Get TailCoins 💎</Text>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>Current Balance:</Text>
            <Text style={styles.balanceAmount}>{balance} 💎</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {COIN_PACKAGES.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[styles.packageCard, pkg.popular && styles.popularCard]}
            onPress={() => handlePurchase(pkg.coins, pkg.price)}
            disabled={purchasing}
          >
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>⭐ POPULAR</Text>
              </View>
            )}
            
            <View style={styles.coinIconContainer}>
              <Text style={styles.coinIcon}>💎</Text>
              <Text style={styles.coinAmount}>{pkg.coins}</Text>
              <Text style={styles.coinLabel}>TailCoins</Text>
            </View>

            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => handlePurchase(pkg.coins, pkg.price)}
              disabled={purchasing}
            >
              <LinearGradient
                colors={pkg.popular ? [COLORS.pawPink, COLORS.gold] : [COLORS.gold, '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buyButtonGradient}
              >
                <Text style={styles.buyButtonText}>
                  {purchasing ? 'Processing...' : `Buy ${pkg.price}`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How to use TailCoins</Text>
          <Text style={styles.infoText}>• Super Like: 20 coins</Text>
          <Text style={styles.infoText}>• Golden Bone: 50 coins</Text>
          <Text style={styles.infoText}>• Contact Reveal: 30 coins</Text>
          <Text style={styles.infoText}>• Service Booking: 10 coins</Text>
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push('/tailcoins_history')}
        >
          <Text style={styles.historyButtonText}>View Transaction History 📜</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: SPACING.xxl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.md,
  },
  balanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#CCC',
    marginRight: SPACING.xs,
  },
  balanceAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  packageCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popularCard: {
    borderColor: COLORS.pawPink,
    backgroundColor: '#2A1A1A',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: COLORS.pawPink,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  popularBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: '#FFF',
  },
  coinIconContainer: {
    alignItems: 'center',
  },
  coinIcon: {
    fontSize: 50,
    marginBottom: SPACING.xs,
  },
  coinAmount: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#FFF',
  },
  coinLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#999',
  },
  buyButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  buyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#000',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: '#CCC',
    marginBottom: SPACING.xs,
  },
  historyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  historyButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gold,
  },
});
