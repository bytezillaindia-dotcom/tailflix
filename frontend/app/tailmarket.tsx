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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.xl * 2;

interface Puppy {
  id: number;
  breed: string;
  age: string;
  price: string;
  photo_url: string;
  verified: boolean;
  contact_hidden: boolean;
  is_boosted?: boolean;
  contact_info?: string;
  description?: string;
}

const MOCK_PUPPIES: Puppy[] = [
  {
    id: 101,
    breed: 'Golden Retriever 🐕✨',
    age: '3 months',
    price: '₹25,000',
    photo_url: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_100.jpg',
    verified: true,
    contact_hidden: true,
    contact_info: '+91 98765 43210',
    description: 'Vaccinated, friendly, playful puppy with pedigree papers',
  },
  {
    id: 102,
    breed: 'German Shepherd 🐾',
    age: '2 months',
    price: '₹22,000',
    photo_url: 'https://images.dog.ceo/breeds/germanshepherd/n02106662_10083.jpg',
    verified: true,
    contact_hidden: true,
    contact_info: '+91 98765 43211',
    description: 'Pure breed with health certificate, very active',
  },
  {
    id: 103,
    breed: 'Labrador Retriever 🦴',
    age: '4 months',
    price: '₹20,000',
    photo_url: 'https://images.dog.ceo/breeds/labrador/n02099712_2155.jpg',
    verified: true,
    contact_hidden: true,
    contact_info: '+91 98765 43212',
    description: 'Trained, obedient, great with kids',
  },
  {
    id: 104,
    breed: 'Beagle 🐶',
    age: '3 months',
    price: '₹18,000',
    photo_url: 'https://images.dog.ceo/breeds/beagle/n02088364_10108.jpg',
    verified: false,
    contact_hidden: true,
    contact_info: '+91 98765 43213',
    description: 'Energetic, loves to play, very friendly',
  },
];

export default function TailMarket() {
  const router = useRouter();
  const { userId } = useAuth();
  const [puppies, setPuppies] = useState<Puppy[]>(MOCK_PUPPIES);
  const [userCoins, setUserCoins] = useState(100); // Mock TailCoins
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);

  const handleBoost = (puppyId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (userCoins < 10) {
      Alert.alert('Insufficient TailCoins', 'You need 10 TailCoins to boost a listing.');
      return;
    }

    setUserCoins(prev => prev - 10);
    setPuppies(prev => prev.map(p => 
      p.id === puppyId ? { ...p, is_boosted: true } : p
    ));
    
    Alert.alert('Success! ⭐', 'Your listing is now boosted for 24 hours!');
  };

  const handleContactReveal = (puppyId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const puppy = puppies.find(p => p.id === puppyId);
    if (!puppy) return;

    Alert.alert(
      'Contact Breeder',
      'Pay ₹499 or use 20 TailCoins to reveal contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use TailCoins (20)',
          onPress: () => {
            if (userCoins < 20) {
              Alert.alert('Insufficient TailCoins', 'You need 20 TailCoins.');
              return;
            }
            setUserCoins(prev => prev - 20);
            setPuppies(prev => prev.map(p => 
              p.id === puppyId ? { ...p, contact_hidden: false } : p
            ));
            Alert.alert('Contact Revealed! 📞', `Contact: ${puppy.contact_info}`);
          },
        },
        {
          text: 'Pay ₹499',
          onPress: () => {
            setPuppies(prev => prev.map(p => 
              p.id === puppyId ? { ...p, contact_hidden: false } : p
            ));
            Alert.alert('Contact Revealed! 📞', `Contact: ${puppy.contact_info}\n\n(Mock payment: ₹499 processed)`);
          },
        },
      ]
    );
  };

  return (
    <LinearGradient colors={[COLORS.cream, COLORS.goldenBeige]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TailMarket 🐶</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>💰 {userCoins}</Text>
        </View>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Find Your Perfect Puppy 🐾</Text>

      {/* List Puppy Button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/post-puppy');
        }}
        style={styles.listPuppyButton}
      >
        <LinearGradient
          colors={COLORS.gradientPawPink}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.listPuppyGradient}
        >
          <Text style={styles.listPuppyText}>List Puppy ➕</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Puppies List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.puppiesContainer}
        showsVerticalScrollIndicator={false}
      >
        {puppies.map((puppy, index) => (
          <PuppyCard
            key={puppy.id}
            puppy={puppy}
            index={index}
            onBoost={() => handleBoost(puppy.id)}
            onContactReveal={() => handleContactReveal(puppy.id)}
          />
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

interface PuppyCardProps {
  puppy: Puppy;
  index: number;
  onBoost: () => void;
  onContactReveal: () => void;
}

function PuppyCard({ puppy, index, onBoost, onContactReveal }: PuppyCardProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  return (
    <Animated.View
      style={[
        styles.puppyCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        puppy.is_boosted && styles.puppyCardBoosted,
      ]}
    >
      {/* Image */}
      <Image source={{ uri: puppy.photo_url }} style={styles.puppyImage} />

      {/* Boosted Badge */}
      {puppy.is_boosted && (
        <View style={styles.boostedBadge}>
          <Text style={styles.boostedBadgeText}>⭐ Boosted</Text>
        </View>
      )}

      {/* Verified Badge */}
      {puppy.verified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedBadgeText}>✓ Verified Breeder</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.puppyContent}>
        <Text style={styles.puppyBreed}>{puppy.breed}</Text>
        <Text style={styles.puppyAge}>Age: {puppy.age}</Text>
        <Text style={styles.puppyPrice}>{puppy.price}</Text>
        {puppy.description && (
          <Text style={styles.puppyDescription} numberOfLines={2}>
            {puppy.description}
          </Text>
        )}

        {/* Actions */}
        <View style={styles.puppyActions}>
          <TouchableOpacity
            onPress={onBoost}
            style={[styles.actionButton, styles.boostButton]}
            disabled={puppy.is_boosted}
          >
            <Text style={styles.actionButtonText}>
              {puppy.is_boosted ? '✅ Boosted' : '⭐ Boost (10)'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onContactReveal}
            style={[styles.actionButton, styles.contactButton]}
            disabled={!puppy.contact_hidden}
          >
            <Text style={styles.actionButtonText}>
              {puppy.contact_hidden ? '📞 Contact' : '✅ Revealed'}
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
    paddingBottom: SPACING.sm,
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
  subtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.warmBrown,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  listPuppyButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  listPuppyGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  listPuppyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  puppiesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  puppyCard: {
    width: CARD_WIDTH,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  puppyCardBoosted: {
    borderWidth: 3,
    borderColor: COLORS.gold,
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  puppyImage: {
    width: '100%',
    height: 280,
  },
  boostedBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.lg,
  },
  boostedBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  verifiedBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.lg,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  puppyContent: {
    padding: SPACING.lg,
  },
  puppyBreed: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
    marginBottom: SPACING.xs,
  },
  puppyAge: {
    fontSize: FONT_SIZES.md,
    color: COLORS.peach,
    marginBottom: SPACING.xs,
  },
  puppyPrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.crimson,
    marginBottom: SPACING.sm,
  },
  puppyDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warmBrown,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  puppyActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  boostButton: {
    backgroundColor: COLORS.pawPink,
  },
  contactButton: {
    backgroundColor: COLORS.gold,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
