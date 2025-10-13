import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.xl * 3) / 2;

interface Poster {
  id: number;
  category: 'Lost' | 'Found' | 'Service' | 'Event';
  title: string;
  description: string;
  photo_url: string;
  contact_hidden: boolean;
  is_boosted?: boolean;
  contact_info?: string;
}

const MOCK_POSTERS: Poster[] = [
  {
    id: 1,
    category: 'Lost',
    title: 'Missing Labrador 🐕',
    description: 'Lost near Central Park, last seen 2 days ago 😢',
    photo_url: 'https://images.dog.ceo/breeds/labrador/n02099712_3503.jpg',
    contact_hidden: true,
    contact_info: '555-0123',
  },
  {
    id: 2,
    category: 'Service',
    title: 'Dog Walking Service 🚶‍♂️🐾',
    description: 'Reliable daily walks, verified TailPro provider 💼',
    photo_url: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_5761.jpg',
    contact_hidden: true,
    contact_info: 'walker@tailflix.com',
  },
  {
    id: 3,
    category: 'Found',
    title: 'Found Beagle 🎉',
    description: 'Found near downtown area, very friendly! 🤗',
    photo_url: 'https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg',
    contact_hidden: true,
    contact_info: '555-0456',
  },
  {
    id: 4,
    category: 'Event',
    title: 'Puppy Playdate 🎈',
    description: 'Join us this Saturday at Dog Park for fun! 🎊',
    photo_url: 'https://images.dog.ceo/breeds/pug/n02110958_14032.jpg',
    contact_hidden: true,
    contact_info: 'events@tailflix.com',
  },
];

const CATEGORIES = ['All', 'Lost', 'Found', 'Service', 'Event'];

const CATEGORY_COLORS = {
  Lost: '#DC143C',
  Found: '#32CD32',
  Service: '#FFB6C1',
  Event: '#FFA500',
};

export default function TailBoard() {
  const router = useRouter();
  const { userId } = useAuth();
  const [posters, setPosters] = useState<Poster[]>(MOCK_POSTERS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userCoins, setUserCoins] = useState(100); // Mock TailCoins

  const filteredPosters = selectedCategory === 'All' 
    ? posters 
    : posters.filter(p => p.category === selectedCategory);

  const handleBoost = (posterId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (userCoins < 10) {
      Alert.alert('Insufficient TailCoins', 'You need 10 TailCoins to boost a poster.');
      return;
    }

    setUserCoins(prev => prev - 10);
    setPosters(prev => prev.map(p => 
      p.id === posterId ? { ...p, is_boosted: true } : p
    ));
    
    Alert.alert('Success! ⭐', 'Your poster is now boosted for 24 hours!');
  };

  const handleContactReveal = (posterId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (userCoins < 20) {
      Alert.alert('Insufficient TailCoins', 'You need 20 TailCoins to reveal contact info.');
      return;
    }

    const poster = posters.find(p => p.id === posterId);
    if (!poster) return;

    setUserCoins(prev => prev - 20);
    setPosters(prev => prev.map(p => 
      p.id === posterId ? { ...p, contact_hidden: false } : p
    ));
    
    Alert.alert('Contact Revealed! 📞', `Contact: ${poster.contact_info}`);
  };

  return (
    <LinearGradient colors={COLORS.gradientPeach} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TailBoard 📋</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>💰 {userCoins}</Text>
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(category);
            }}
            style={[
              styles.filterChip,
              selectedCategory === category && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedCategory === category && styles.filterChipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Post Ad Button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/post-ad');
        }}
        style={styles.postAdButton}
      >
        <LinearGradient
          colors={COLORS.gradientPawPink}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.postAdGradient}
        >
          <Text style={styles.postAdText}>Post Ad ➕</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Poster Wall */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.postersGrid}
        showsVerticalScrollIndicator={false}
      >
        {filteredPosters.map((poster, index) => (
          <PosterCard
            key={poster.id}
            poster={poster}
            index={index}
            onBoost={() => handleBoost(poster.id)}
            onContactReveal={() => handleContactReveal(poster.id)}
          />
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

interface PosterCardProps {
  poster: Poster;
  index: number;
  onBoost: () => void;
  onContactReveal: () => void;
}

function PosterCard({ poster, index, onBoost, onContactReveal }: PosterCardProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay: index * 50,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        delay: index * 50,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.posterCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        poster.is_boosted && styles.posterCardBoosted,
      ]}
    >
      {/* Image Background */}
      <Image source={{ uri: poster.photo_url }} style={styles.posterImage} />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
        style={styles.posterOverlay}
      />

      {/* Boosted Badge */}
      {poster.is_boosted && (
        <View style={styles.boostedBadge}>
          <Text style={styles.boostedBadgeText}>⭐ Boosted</Text>
        </View>
      )}

      {/* Category Badge */}
      <View
        style={[
          styles.categoryBadge,
          { backgroundColor: CATEGORY_COLORS[poster.category] },
        ]}
      >
        <Text style={styles.categoryBadgeText}>{poster.category}</Text>
      </View>

      {/* Content */}
      <View style={styles.posterContent}>
        <Text style={styles.posterTitle} numberOfLines={2}>{poster.title}</Text>
        <Text style={styles.posterDescription} numberOfLines={2}>
          {poster.description}
        </Text>

        {/* Actions */}
        <View style={styles.posterActions}>
          <TouchableOpacity
            onPress={onBoost}
            style={styles.actionButton}
            disabled={poster.is_boosted}
          >
            <Text style={styles.actionButtonText}>
              {poster.is_boosted ? '✅ Boosted' : '⭐ Boost (10)'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onContactReveal}
            style={styles.actionButton}
            disabled={!poster.contact_hidden}
          >
            <Text style={styles.actionButtonText}>
              {poster.contact_hidden ? '📞 Reveal (20)' : '✅ Revealed'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.chocolateBrown,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
  },
  coinsContainer: {
    backgroundColor: COLORS.pawPink,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
  },
  coinsText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  filtersContainer: {
    maxHeight: 50,
    marginBottom: SPACING.md,
  },
  filtersContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: COLORS.pawPink,
    borderColor: COLORS.gold,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.warmBrown,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  postAdButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  postAdGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  postAdText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  postersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  posterCard: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  posterCardBoosted: {
    borderWidth: 3,
    borderColor: COLORS.gold,
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  posterImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  posterOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  boostedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  boostedBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.lg,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  posterContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  posterTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: SPACING.xs,
  },
  posterDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  posterActions: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 182, 193, 0.9)',
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
