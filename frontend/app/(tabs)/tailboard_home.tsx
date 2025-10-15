import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Ad {
  id: string;
  title: string;
  description: string;
  image?: string;
  category: string;
}

export default function TailBoardHomeScreen() {
  const router = useRouter();
  const [featuredAd, setFeaturedAd] = useState<Ad | null>(null);
  const [petStories, setPetStories] = useState<Ad[]>([]);
  const [trending, setTrending] = useState<Ad[]>([]);
  const [nearbyPets, setNearbyPets] = useState<Ad[]>([]);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    // Mock data for now
    setFeaturedAd({
      id: '1',
      title: 'Adorable Golden Retriever Puppies',
      description: 'Looking for a loving home',
      category: 'Featured',
    });

    setPetStories([
      { id: '1', title: 'Max finds home', description: 'Happy ending', category: 'Stories' },
      { id: '2', title: 'Bella adventure', description: 'Daily walks', category: 'Stories' },
      { id: '3', title: 'Charlie training', description: 'Learning tricks', category: 'Stories' },
    ]);

    setTrending([
      { id: '1', title: 'Top Dog Breeds 2025', description: 'Popular choices', category: 'Trending' },
      { id: '2', title: 'Pet Care Tips', description: 'Expert advice', category: 'Trending' },
      { id: '3', title: 'Training Guides', description: 'Step by step', category: 'Trending' },
    ]);

    setNearbyPets([
      { id: '1', title: 'Buddy', description: '2km away', category: 'Nearby' },
      { id: '2', title: 'Luna', description: '5km away', category: 'Nearby' },
      { id: '3', title: 'Rocky', description: '8km away', category: 'Nearby' },
    ]);
  };

  const renderHeroCard = () => (
    <TouchableOpacity
      style={styles.heroCard}
      onPress={() => router.push('/tailboard')}
    >
      <LinearGradient
        colors={['rgba(255, 182, 193, 0.8)', 'rgba(255, 212, 125, 0.8)']}
        style={styles.heroGradient}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{featuredAd?.title || 'Featured Content'}</Text>
          <Text style={styles.heroDescription}>
            {featuredAd?.description || 'Explore amazing pet stories'}
          </Text>
          <View style={styles.heroButton}>
            <Text style={styles.heroButtonText}>View Details →</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderCarouselCard = (item: Ad) => (
    <TouchableOpacity
      key={item.id}
      style={styles.carouselCard}
      onPress={() => router.push('/tailboard')}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardImage}>
          <Text style={styles.cardEmoji}>🐾</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={1}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TailBoard 📋</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/post-ad')}
        >
          <Text style={styles.addButtonText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        {featuredAd && renderHeroCard()}

        {/* Pet Stories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Stories 📖</Text>
          <FlatList
            horizontal
            data={petStories}
            renderItem={({ item }) => renderCarouselCard(item)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          />
        </View>

        {/* Trending Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending 🔥</Text>
          <FlatList
            horizontal
            data={trending}
            renderItem={({ item }) => renderCarouselCard(item)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          />
        </View>

        {/* Nearby Pets Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Pets 📍</Text>
          <FlatList
            horizontal
            data={nearbyPets}
            renderItem={({ item }) => renderCarouselCard(item)}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + 10,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
  },
  addButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  heroCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroContent: {
    padding: SPACING.xl,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.xs,
  },
  heroDescription: {
    fontSize: FONT_SIZES.md,
    color: '#FFF',
    marginBottom: SPACING.md,
    opacity: 0.9,
  },
  heroButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },
  heroButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  carousel: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  carouselCard: {
    width: 140,
    marginRight: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardImage: {
    width: '100%',
    height: 100,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255, 182, 193, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  cardEmoji: {
    fontSize: 48,
  },
  cardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
  },
});
