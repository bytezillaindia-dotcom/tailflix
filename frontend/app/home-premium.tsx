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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.xl * 2;

interface DashboardCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  colors: string[];
  route: string;
  adminOnly?: boolean;
}

const DASHBOARD_CARDS: DashboardCard[] = [
  {
    id: '1',
    title: 'Fetch Yard',
    icon: '🎾',
    description: 'Find perfect playmates for your pet',
    colors: [COLORS.crimson, '#8B0000'],
    route: '/fetch-yard',
  },
  {
    id: '2',
    title: 'Tug Yard',
    icon: '🪢',
    description: 'Connect with pet owners for dating',
    colors: ['#DC143C', '#8B0000'],
    route: '/tug-yard',
  },
  {
    id: '3',
    title: 'Matches',
    icon: '💌',
    description: 'See who likes you back',
    colors: ['#FF1493', '#C71585'],
    route: '/likes',
  },
  {
    id: '4',
    title: 'Chat',
    icon: '💬',
    description: 'Message your matches',
    colors: ['#FFD700', '#FFA500'],
    route: '/chat',
  },
  {
    id: '5',
    title: 'Admin',
    icon: '⚙️',
    description: 'Manage verifications and settings',
    colors: ['#4B0082', '#8B008B'],
    route: '/admin',
    adminOnly: true,
  },
];

export default function PremiumHome() {
  const router = useRouter();
  const { logout, userId } = useAuth();
  const [isAdmin] = useState(true); // For now, show admin to all users
  
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

      {/* Dashboard Cards */}
      <ScrollView
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {DASHBOARD_CARDS.filter(card => !card.adminOnly || isAdmin).map((card, index) => (
          <AnimatedCard
            key={card.id}
            card={card}
            index={index}
            onPress={() => router.push(card.route as any)}
          />
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
          colors={card.colors}
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
