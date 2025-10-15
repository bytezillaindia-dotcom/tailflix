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
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

interface Pet {
  id: string;
  name: string;
  breed: string;
  price: string;
  age: string;
  image?: string;
}

export default function TailMarketHomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [pets, setPets] = useState<Pet[]>([]);

  const categories = ['All', 'Puppies', 'Adults', 'Kittens', 'Accessories'];

  useEffect(() => {
    fetchPets();
  }, [selectedCategory]);

  const fetchPets = async () => {
    // Mock data
    const mockPets: Pet[] = [
      { id: '1', name: 'Golden Puppy', breed: 'Golden Retriever', price: '₹25,000', age: '3 months' },
      { id: '2', name: 'Husky Baby', breed: 'Siberian Husky', price: '₹35,000', age: '2 months' },
      { id: '3', name: 'Labrador Pup', breed: 'Labrador', price: '₹20,000', age: '4 months' },
      { id: '4', name: 'German Shepherd', breed: 'GSD', price: '₹30,000', age: '3 months' },
      { id: '5', name: 'Beagle Pup', breed: 'Beagle', price: '₹18,000', age: '2 months' },
      { id: '6', name: 'Poodle Baby', breed: 'Poodle', price: '₹22,000', age: '3 months' },
    ];
    setPets(mockPets);
  };

  const renderCategoryPill = (category: string) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryPill,
        selectedCategory === category && styles.categoryPillActive,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === category && styles.categoryTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderPetCard = (pet: Pet) => (
    <TouchableOpacity
      key={pet.id}
      style={styles.petCard}
      onPress={() => router.push('/tailmarket')}
    >
      <View style={styles.petImageContainer}>
        {pet.image ? (
          <Image source={{ uri: pet.image }} style={styles.petImage} />
        ) : (
          <View style={styles.petImagePlaceholder}>
            <Text style={styles.petEmoji}>🐕</Text>
          </View>
        )}
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>{pet.price}</Text>
        </View>
      </View>
      <View style={styles.petInfo}>
        <Text style={styles.petName} numberOfLines={1}>
          {pet.name}
        </Text>
        <Text style={styles.petBreed} numberOfLines={1}>
          {pet.breed}
        </Text>
        <View style={styles.petMeta}>
          <Text style={styles.petAge}>🎂 {pet.age}</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TailMarket 🐶</Text>
          <Text style={styles.headerSubtitle}>Find your perfect companion</Text>
        </View>
        <TouchableOpacity
          style={styles.postButton}
          onPress={() => router.push('/tailmarket_post_puppy')}
        >
          <Text style={styles.postButtonText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => renderCategoryPill(category))}
      </ScrollView>

      {/* Pets Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {pets.map((pet) => renderPetCard(pet))}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <LinearGradient
            colors={['rgba(255, 182, 193, 0.2)', 'rgba(255, 212, 125, 0.2)']}
            style={styles.infoBannerGradient}
          >
            <Text style={styles.infoBannerIcon}>💡</Text>
            <Text style={styles.infoBannerTitle}>Contact Reveal</Text>
            <Text style={styles.infoBannerText}>
              Spend 30 TailCoins to unlock seller contact information
            </Text>
          </LinearGradient>
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
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
  },
  postButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#FFF',
  },
  categoriesContainer: {
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  categoryPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: SPACING.sm,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  petCard: {
    width: CARD_WIDTH,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  petImageContainer: {
    position: 'relative',
  },
  petImage: {
    width: '100%',
    height: CARD_WIDTH,
  },
  petImagePlaceholder: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: 'rgba(255, 182, 193, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petEmoji: {
    fontSize: 60,
  },
  priceTag: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  priceText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: '#333',
  },
  petInfo: {
    padding: SPACING.sm,
  },
  petName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  petMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petAge: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: '#FFF',
  },
  infoBanner: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  infoBannerGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  infoBannerIcon: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  infoBannerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  infoBannerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
    opacity: 0.8,
  },
});
