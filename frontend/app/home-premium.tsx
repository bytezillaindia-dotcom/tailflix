import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_HEIGHT = 200;

interface DashboardCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  gradient: string[];
  route: string;
  image?: string;
  special?: string;
}

const SECTIONS = [
  {
    title: 'For Your Pet 🐾',
    cards: [
      {
        id: '1',
        title: 'Fetch Yard',
        icon: '🎾',
        description: 'Find perfect playmates for your pet',
        gradient: [COLORS.pawPink, COLORS.gold],
        route: '/fetch-yard',
      },
      {
        id: '2',
        title: 'Tug Yard',
        icon: '🪢',
        description: 'Connect with owners for dating',
        gradient: [COLORS.crimson, COLORS.gold],
        route: '/tug-yard',
      },
    ],
  },
  {
    title: 'Connections 💞',
    cards: [
      {
        id: '3',
        title: 'Matches',
        icon: '💌',
        description: 'See who likes you back',
        gradient: [COLORS.pawPinkLight, COLORS.pawPink],
        route: '/matches',
      },
      {
        id: '4',
        title: 'Chat',
        icon: '💬',
        description: 'Message your matches',
        gradient: [COLORS.goldenBeige, COLORS.goldShimmer],
        route: '/chat',
      },
      {
        id: '5',
        title: 'TailBoard',
        icon: '📋',
        description: 'Community poster wall',
        gradient: [COLORS.peach, COLORS.pawPink],
        route: '/tailboard',
      },
      {
        id: '9',
        title: 'TailTales',
        icon: '🐾',
        description: 'Share your pet\'s world',
        gradient: [COLORS.softPeach, COLORS.peach],
        route: '/tailtales_feed',
      },
      {
        id: '10',
        title: 'TailReels',
        icon: '🎥',
        description: 'Laughs, Tricks & Tails',
        gradient: ['#000000', '#330000'],
        route: '/tailreels_feed',
        special: 'neon',
      },
    ],
  },
  {
    title: 'Marketplace 🛒',
    cards: [
      {
        id: '6',
        title: 'TailMarket',
        icon: '🐶',
        description: 'Buy & sell puppies safely',
        gradient: [COLORS.goldenBeige, COLORS.gold],
        route: '/tailmarket',
      },
      {
        id: '7',
        title: 'TailPro',
        icon: '💼',
        description: 'Book premium pet services',
        gradient: [COLORS.pawPinkLight, COLORS.gold],
        route: '/tailpro_home',
      },
      {
        id: '8',
        title: 'My Appointments',
        icon: '📅',
        description: 'View & manage bookings',
        gradient: [COLORS.softPeach, COLORS.peach],
        route: '/tailpro_orders',
      },
    ],
  },
  {
    title: 'Control Center ⚙️',
    cards: [
      {
        id: '5',
        title: 'Admin Panel',
        icon: '⚙️',
        description: 'Manage verifications and settings',
        gradient: [COLORS.warmBrown, COLORS.chocolateBrown],
        route: '/admin',
      },
    ],
  },
];

export default function PremiumHome() {
  const router = useRouter();
  const { logout, userId, role, status } = useAuth();
  const [isAdmin] = useState(true); // For now, show admin to all users
  
  // Check if user is approved vendor
  const isApprovedVendor = role === 'vendor' && status === 'approved';
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>TailFlix</Text>
          <Text style={styles.tagline}>🐾 Where Tails and Hearts Connect 💕</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={async () => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                  await logout();
                  router.replace('/login');
                },
              },
            ]
          );
        }}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Dashboard Sections */}
      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Conditional Vendor Dashboard Card */}
        {isApprovedVendor && (
          <View>
            <Text style={styles.sectionTitle}>Vendor Zone 💼</Text>
            <AnimatedCard
              card={{
                id: 'vendor-dashboard',
                title: 'Vendor Dashboard',
                icon: '💼',
                description: 'Manage services, bookings & earnings',
                gradient: [COLORS.cream, COLORS.goldenBeige],
                route: '/vendor_dashboard',
              }}
              index={0}
              onPress={() => router.push('/vendor_dashboard')}
            />
          </View>
        )}
        
        {SECTIONS.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.cards.map((card, index) => (
              <AnimatedCard
                key={card.id}
                card={card}
                index={index}
                onPress={() => router.push(card.route as any)}
              />
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for pet lovers</Text>
          <Text style={styles.footerPaw}>🐾🐾🐾</Text>
        </View>
      </ScrollView>
    </View>
  );
}

interface AnimatedCardProps {
  card: DashboardCard;
  index: number;
  onPress: () => void;
}

function AnimatedCard({ card, index, onPress }: AnimatedCardProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    // Stagger card animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 100,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 100,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 100,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={card.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            isPressed && styles.cardPressed,
          ]}
        >
          {/* Shine Effect Overlay */}
          {isPressed && (
            <View style={styles.shineOverlay} />
          )}

          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.cardDescription}>{card.description}</Text>
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    paddingTop: SPACING.xxl + 20,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  appTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.gold,
    letterSpacing: 1,
    textShadowColor: COLORS.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tagline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.7,
    marginTop: SPACING.xs,
  },
  logoutButton: {
    backgroundColor: COLORS.charcoal,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.crimson,
  },
  logoutIcon: {
    fontSize: 24,
  },
  cardsContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardWrapper: {
    marginBottom: SPACING.lg,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 140,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardPressed: {
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardContent: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardIcon: {
    fontSize: 40,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.9,
  },
  arrowContainer: {
    position: 'absolute',
    right: SPACING.lg,
    top: '50%',
    marginTop: -15,
  },
  arrow: {
    fontSize: 30,
    color: COLORS.white,
    opacity: 0.7,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  footerPaw: {
    fontSize: 18,
    opacity: 0.5,
  },
});
