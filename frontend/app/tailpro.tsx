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
import UnlockPaywall from '../components/UnlockPaywall';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.xl * 2;

interface Service {
  id: number;
  service: string;
  provider: string;
  rating: string;
  price: string;
  priceValue: number;
  photo_url: string;
  verified: boolean;
  description?: string;
}

const MOCK_SERVICES: Service[] = [
  {
    id: 201,
    service: 'Dog Grooming ✂️',
    provider: 'Happy Paws Spa',
    rating: '4.8',
    price: '₹799',
    priceValue: 799,
    photo_url: 'https://images.dog.ceo/breeds/poodle-standard/n02113799_2280.jpg',
    verified: true,
    description: 'Professional grooming with premium products, bath, haircut, nail trimming',
  },
  {
    id: 202,
    service: 'Dog Walking 🚶‍♂️🐾',
    provider: 'Daily Walks Co.',
    rating: '4.6',
    price: '₹299',
    priceValue: 299,
    photo_url: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_5761.jpg',
    verified: true,
    description: '30-min walks, experienced handlers, GPS tracking included',
  },
  {
    id: 203,
    service: 'Pet Training 🎓',
    provider: 'SmartPaws Academy',
    rating: '4.9',
    price: '₹1,499',
    priceValue: 1499,
    photo_url: 'https://images.dog.ceo/breeds/germanshepherd/n02106662_10083.jpg',
    verified: true,
    description: 'Basic obedience training, 5 sessions, certified trainers',
  },
  {
    id: 204,
    service: 'Veterinary Care 🏥',
    provider: 'PetCare Clinic',
    rating: '4.7',
    price: '₹599',
    priceValue: 599,
    photo_url: 'https://images.dog.ceo/breeds/labrador/n02099712_3503.jpg',
    verified: true,
    description: 'General checkup, vaccinations, emergency care available',
  },
];

export default function TailPro() {
  const router = useRouter();
  const { userId } = useAuth();
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [userCoins, setUserCoins] = useState(100); // Mock TailCoins
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const handleBookNow = (serviceId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const service = services.find(s => s.id === serviceId);
    if (!service) return;
    
    setSelectedService(service);
    setShowPaywall(true);
  };

  const handlePayWithMoney = () => {
    if (!selectedService) return;
    
    setShowPaywall(false);
    setTimeout(() => {
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your ${selectedService.service} with ${selectedService.provider} has been booked!\n\nPayment: ${selectedService.price}\n\nYou will receive a confirmation SMS shortly.`,
        [{ text: 'OK' }]
      );
    }, 300);
  };

  const handlePayWithCoins = () => {
    if (!selectedService) return;
    
    if (userCoins < 15) {
      Alert.alert('Insufficient TailCoins', 'You need 15 TailCoins to book this service.');
      return;
    }

    setUserCoins(prev => prev - 15);
    setShowPaywall(false);
    
    setTimeout(() => {
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your ${selectedService.service} with ${selectedService.provider} has been booked!\n\nPaid with: 15 TailCoins\n\nYou will receive a confirmation SMS shortly.`,
        [{ text: 'OK' }]
      );
    }, 300);
  };

  return (
    <LinearGradient colors={[COLORS.cream, COLORS.peach]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TailPro 💼</Text>
        <View style={styles.coinsContainer}>
          <Text style={styles.coinsText}>💰 {userCoins}</Text>
        </View>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Premium Pet Services 🐾</Text>

      {/* List Service Button */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/post-service');
        }}
        style={styles.listServiceButton}
      >
        <LinearGradient
          colors={COLORS.gradientPawPink}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.listServiceGradient}
        >
          <Text style={styles.listServiceText}>List Service ➕</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Services List */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.servicesContainer}
        showsVerticalScrollIndicator={false}
      >
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            service={service}
            index={index}
            onBookNow={() => handleBookNow(service.id)}
          />
        ))}
      </ScrollView>

      {/* Paywall Modal */}
      {selectedService && (
        <UnlockPaywall
          visible={showPaywall}
          headline="Book Service 🐾"
          subtext={`Confirm your booking with ${selectedService.provider}`}
          priceInr={selectedService.priceValue}
          priceCoins={15}
          currentCoins={userCoins}
          onPayWithMoney={handlePayWithMoney}
          onPayWithCoins={handlePayWithCoins}
          onCancel={() => setShowPaywall(false)}
        />
      )}
    </LinearGradient>
  );
}

interface ServiceCardProps {
  service: Service;
  index: number;
  onBookNow: () => void;
}

function ServiceCard({ service, index, onBookNow }: ServiceCardProps) {
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

  const renderStars = (rating: string) => {
    const ratingNum = parseFloat(rating);
    const fullStars = Math.floor(ratingNum);
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i < fullStars ? '🦴' : '☆'}
        </Text>
      );
    }
    
    return stars;
  };

  return (
    <Animated.View
      style={[
        styles.serviceCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Image */}
      <Image source={{ uri: service.photo_url }} style={styles.serviceImage} />

      {/* Verified Badge */}
      {service.verified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>{service.service}</Text>
        <Text style={styles.serviceProvider}>by {service.provider}</Text>
        
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>
            {renderStars(service.rating)}
          </View>
          <Text style={styles.ratingText}>{service.rating}</Text>
        </View>

        <Text style={styles.servicePrice}>{service.price} / session</Text>
        
        {service.description && (
          <Text style={styles.serviceDescription} numberOfLines={2}>
            {service.description}
          </Text>
        )}

        {/* Book Now Button */}
        <TouchableOpacity
          onPress={onBookNow}
          style={styles.bookButton}
        >
          <LinearGradient
            colors={[COLORS.crimson, COLORS.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>📅 Book Now</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  listServiceButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  listServiceGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  listServiceText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  servicesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  serviceCard: {
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
  serviceImage: {
    width: '100%',
    height: 200,
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
  serviceContent: {
    padding: SPACING.lg,
  },
  serviceName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
    marginBottom: SPACING.xs,
  },
  serviceProvider: {
    fontSize: FONT_SIZES.md,
    color: COLORS.peach,
    marginBottom: SPACING.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: SPACING.xs,
  },
  star: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  servicePrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.crimson,
    marginBottom: SPACING.sm,
  },
  serviceDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warmBrown,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  bookButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});
