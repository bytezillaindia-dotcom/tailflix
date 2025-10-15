import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';
import { useAuth } from '../../components/AuthContext';
import { useTailCoins } from '../../components/TailCoinsContext';

interface CarouselItem {
  id: string;
  title: string;
  image?: string;
  route?: string;
  icon?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const { balance } = useTailCoins();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState('Friend');

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;
    // Fetch user data here
    setUserName('Pet Lover');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const renderCarouselItem = (item: CarouselItem, type: string) => (
    <TouchableOpacity
      key={item.id}
      style={styles.carouselCard}
      onPress={() => item.route && router.push(item.route as any)}
    >
      <LinearGradient
        colors={['rgba(255, 182, 193, 0.2)', 'rgba(255, 212, 125, 0.2)']}
        style={styles.cardGradient}
      >
        {item.icon ? (
          <Text style={styles.cardIcon}>{item.icon}</Text>
        ) : item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardPlaceholder}>
            <Text style={styles.placeholderText}>🐾</Text>
          </View>
        )}
        <Text style={styles.cardTitle}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const datingItems: CarouselItem[] = [
    { id: '1', title: 'Fetch Yard', icon: '🎾', route: '/fetch-yard' },
    { id: '2', title: 'Tug Yard', icon: '🦴', route: '/tug-yard' },
    { id: '3', title: 'Matches', icon: '💕', route: '/matches' },
  ];

  const socialItems: CarouselItem[] = [
    { id: '1', title: 'TailTales', icon: '📸', route: '/tailtales_feed' },
    { id: '2', title: 'TailReels', icon: '🎥', route: '/tailreels_feed' },
    { id: '3', title: 'TailCause', icon: '❤️', route: '/tailcause_home' },
  ];

  const marketplaceItems: CarouselItem[] = [
    { id: '1', title: 'TailBoard', icon: '📋', route: '/tailboard' },
    { id: '2', title: 'TailMarket', icon: '🐶', route: '/tailmarket' },
    { id: '3', title: 'TailPro', icon: '💼', route: '/tailpro_home' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.background, COLORS.background]} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.logo}>🐾 TailFlix</Text>
            <Text style={styles.greeting}>Welcome, {userName}!</Text>
          </View>
          <TouchableOpacity
            style={styles.coinsButton}
            onPress={() => router.push('/tailcoins_store')}
          >
            <Text style={styles.coinsText}>💎 {balance}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Dating Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dating 🎾</Text>
            <TouchableOpacity onPress={() => router.push('/fetch-yard' as any)}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={datingItems}
            renderItem={({ item }) => renderCarouselItem(item, 'dating')}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          />
        </View>

        {/* Social Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Social 📱</Text>
            <TouchableOpacity onPress={() => router.push('/tailtales_feed' as any)}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={socialItems}
            renderItem={({ item }) => renderCarouselItem(item, 'social')}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          />
        </View>

        {/* Marketplace Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Marketplace 🛒</Text>
            <TouchableOpacity onPress={() => router.push('/tailboard')}>
              <Text style={styles.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={marketplaceItems}
            renderItem={({ item }) => renderCarouselItem(item, 'marketplace')}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          />
        </View>

        {/* Premium Card */}
        <TouchableOpacity
          style={styles.premiumCard}
          onPress={() => router.push('/premium_upgrade')}
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.premiumGradient}
          >
            <Text style={styles.premiumIcon}>⭐</Text>
            <Text style={styles.premiumTitle}>Upgrade to TailPro Premium</Text>
            <Text style={styles.premiumSubtitle}>Unlock unlimited swipes & exclusive features</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: SPACING.xxl + 10,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    marginTop: 4,
  },
  coinsButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  coinsText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  carousel: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  carouselCard: {
    width: 160,
    height: 200,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  cardIcon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  cardImage: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  cardPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255, 182, 193, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  placeholderText: {
    fontSize: 48,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  premiumCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  premiumGradient: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  premiumIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  premiumTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.xs,
  },
  premiumSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: '#FFF',
    opacity: 0.9,
    textAlign: 'center',
  },
});
