import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { useAuth } from '../../components/AuthContext';
import { useTailCoins } from '../../components/TailCoinsContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { balance } = useTailCoins();
  const [userName, setUserName] = useState('Pet Lover');
  const [userPhone, setUserPhone] = useState('+91 XXXXXXXXXX');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    // Fetch user data from backend
    // For now using mock data
    setUserName('Pet Lover');
    setIsPremium(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('sessionToken');
            router.replace('/login-premium');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        style={styles.header}
      >
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>🐾</Text>
        </View>
        <Text style={styles.profileName}>{userName}</Text>
        <Text style={styles.profilePhone}>{userPhone}</Text>
        {isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>⭐ Premium Member</Text>
          </View>
        )}
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/tailcoins_store')}
          >
            <Text style={styles.statIcon}>💎</Text>
            <Text style={styles.statValue}>{balance}</Text>
            <Text style={styles.statLabel}>TailCoins</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/matches')}
          >
            <Text style={styles.statIcon}>💕</Text>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/premium_upgrade')}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>⭐</Text>
              <Text style={styles.menuItemText}>Upgrade to Premium</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/tailcoins_store')}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>💎</Text>
              <Text style={styles.menuItemText}>Buy TailCoins</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/tailcoins_history')}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>📜</Text>
              <Text style={styles.menuItemText}>Transaction History</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>My Activity</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/matches')}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>💕</Text>
              <Text style={styles.menuItemText}>My Matches</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/likes')}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>❤️</Text>
              <Text style={styles.menuItemText}>Likes Given</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/tailpro_orders')}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>📋</Text>
              <Text style={styles.menuItemText}>My Appointments</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin')}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>⚙️</Text>
              <Text style={styles.menuItemText}>Settings</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xxl + 20,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  profileAvatarText: {
    fontSize: 48,
  },
  profileName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: FONT_SIZES.md,
    color: '#FFF',
    opacity: 0.9,
  },
  premiumBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.xl,
    marginTop: SPACING.md,
  },
  premiumBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
  },
  menuSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '600',
  },
  logoutText: {
    color: COLORS.crimson,
  },
  menuItemArrow: {
    fontSize: 20,
    color: COLORS.gray,
  },
});
