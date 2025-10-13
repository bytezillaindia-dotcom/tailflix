import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - SPACING.xl * 2;

interface Service {
  id: number;
  service: string;
  provider: string;
  rating: number;
  verified: boolean;
  pricing: Record<string, number>;
  addons: string[];
  slots: string[];
  image: string;
  category: string;
}

const MOCK_SERVICES: Service[] = [
  {
    id: 1001,
    service: 'Full Grooming',
    provider: 'Happy Paws Spa',
    rating: 4.8,
    verified: true,
    pricing: {
      Bengaluru: 999,
      Chennai: 899,
      Delhi: 1199,
      Hyderabad: 949,
      Mumbai: 1299,
      Pune: 999,
    },
    addons: ['Nail Trim', 'De-shedding', 'Tick Treatment'],
    slots: ['2025-10-15 10:00', '2025-10-15 12:00', '2025-10-16 15:00'],
    image: 'https://images.dog.ceo/breeds/poodle-standard/n02113799_2280.jpg',
    category: 'grooming',
  },
  {
    id: 1002,
    service: 'Dog Walking (30 min)',
    provider: 'Daily Walks Co.',
    rating: 4.6,
    verified: true,
    pricing: {
      Bengaluru: 299,
      Chennai: 279,
      Delhi: 349,
      Hyderabad: 299,
      Mumbai: 379,
      Pune: 299,
    },
    addons: ['GPS Track', 'Photo Updates'],
    slots: ['2025-10-15 08:00', '2025-10-15 18:00', '2025-10-16 09:00'],
    image: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_5761.jpg',
    category: 'walking',
  },
  {
    id: 1003,
    service: 'Vet Home Visit',
    provider: 'CityCare Vets',
    rating: 4.7,
    verified: true,
    pricing: {
      Bengaluru: 699,
      Chennai: 649,
      Delhi: 799,
      Hyderabad: 699,
      Mumbai: 899,
      Pune: 699,
    },
    addons: ['Blood Test', 'Vaccination'],
    slots: ['2025-10-16 11:00', '2025-10-16 16:30', '2025-10-17 10:00'],
    image: 'https://images.dog.ceo/breeds/labrador/n02099712_3503.jpg',
    category: 'vet',
  },
  {
    id: 1004,
    service: 'Pet Boarding (Per Day)',
    provider: 'Cozy Paws Resort',
    rating: 4.9,
    verified: true,
    pricing: {
      Bengaluru: 799,
      Chennai: 749,
      Delhi: 899,
      Hyderabad: 799,
      Mumbai: 999,
      Pune: 799,
    },
    addons: ['Daily Walks', 'Playtime', 'Special Diet'],
    slots: ['2025-10-20 09:00', '2025-10-22 09:00', '2025-10-25 09:00'],
    image: 'https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg',
    category: 'boarding',
  },
  {
    id: 1005,
    service: 'Basic Obedience Training',
    provider: 'SmartPaws Academy',
    rating: 4.8,
    verified: true,
    pricing: {
      Bengaluru: 1499,
      Chennai: 1399,
      Delhi: 1699,
      Hyderabad: 1499,
      Mumbai: 1799,
      Pune: 1499,
    },
    addons: ['Advanced Training', 'Behavior Assessment'],
    slots: ['2025-10-18 10:00', '2025-10-19 15:00', '2025-10-21 11:00'],
    image: 'https://images.dog.ceo/breeds/germanshepherd/n02106662_10083.jpg',
    category: 'training',
  },
];

export default function TailProList() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const category = params.category as string;
  const cityParam = params.city as string;
  
  const [selectedCity, setSelectedCity] = useState(cityParam || 'Bengaluru');
  const [services, setServices] = useState<Service[]>([]);
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterHighRating, setFilterHighRating] = useState(false);

  useEffect(() => {
    loadCity();
    filterServices();
  }, [category, filterVerified, filterHighRating]);

  const loadCity = async () => {
    try {
      const city = await AsyncStorage.getItem('tailpro_city');
      if (city) setSelectedCity(city);
    } catch (error) {
      console.error('Error loading city:', error);
    }
  };

  const filterServices = () => {
    let filtered = MOCK_SERVICES.filter((s) => s.category === category);
    
    if (filterVerified) {
      filtered = filtered.filter((s) => s.verified);
    }
    
    if (filterHighRating) {
      filtered = filtered.filter((s) => s.rating >= 4.5);
    }
    
    setServices(filtered);
  };

  const handleBookNow = (service: Service) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/tailpro_booking',
      params: {
        serviceId: service.id,
        service: service.service,
        provider: service.provider,
        city: selectedCity,
        price: service.pricing[selectedCity] || 0,
        addons: JSON.stringify(service.addons),
        slots: JSON.stringify(service.slots),
      },
    });
  };

  const handleContactProvider = (service: Service) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/tailpro_contact',
      params: {
        provider: service.provider,
        service: service.service,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* City Badge */}
      <View style={styles.cityBadgeContainer}>
        <View style={styles.cityBadge}>
          <Text style={styles.cityBadgeText}>📍 {selectedCity}</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterHighRating(!filterHighRating);
          }}
          style={[
            styles.filterChip,
            filterHighRating && styles.filterChipActive,
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              filterHighRating && styles.filterChipTextActive,
            ]}
          >
            Rating 4.5+
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFilterVerified(!filterVerified);
          }}
          style={[
            styles.filterChip,
            filterVerified && styles.filterChipActive,
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              filterVerified && styles.filterChipTextActive,
            ]}
          >
            ✓ Verified
          </Text>
        </TouchableOpacity>
      </View>

      {/* Services List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.servicesContainer}
        showsVerticalScrollIndicator={false}
      >
        {services.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>😔</Text>
            <Text style={styles.emptyText}>No services found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        ) : (
          services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              city={selectedCity}
              index={index}
              onBookNow={() => handleBookNow(service)}
              onContact={() => handleContactProvider(service)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface ServiceCardProps {
  service: Service;
  city: string;
  index: number;
  onBookNow: () => void;
  onContact: () => void;
}

function ServiceCard({ service, city, index, onBookNow, onContact }: ServiceCardProps) {
  const price = service.pricing[city] || 0;
  const scaleAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
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
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: service.image }} style={styles.serviceImage} />
        
        {/* Dark Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
          style={styles.imageOverlay}
        >
          <Text style={styles.serviceNameOnImage}>{service.service}</Text>
          <Text style={styles.providerOnImage}>by {service.provider}</Text>
        </LinearGradient>

        {/* Verified Badge */}
        {service.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.serviceContent}>
        {/* Rating */}
        <View style={styles.ratingContainer}>
          <View style={styles.starsContainer}>{renderStars(service.rating)}</View>
          <Text style={styles.ratingText}>{service.rating}</Text>
        </View>

        {/* Price */}
        <Text style={styles.servicePrice}>₹{price}</Text>

        {/* Add-ons */}
        <View style={styles.addonsContainer}>
          {service.addons.slice(0, 2).map((addon) => (
            <View key={addon} style={styles.addonChip}>
              <Text style={styles.addonText}>{addon}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onBookNow} style={styles.bookButton}>
            <LinearGradient
              colors={[COLORS.pawPink, COLORS.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bookButtonGradient}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onContact} style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Chat 💬</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: '#2C3E50',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  cityBadgeContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  cityBadge: {
    backgroundColor: COLORS.pawPinkLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignSelf: 'flex-start',
  },
  cityBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.warmBrown,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  filterChipActive: {
    backgroundColor: COLORS.pawPink,
    borderColor: COLORS.gold,
  },
  filterChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  servicesContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
  },
  serviceCard: {
    width: CARD_WIDTH,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: 220,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.xl,
  },
  serviceNameOnImage: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  providerOnImage: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  verifiedBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  serviceContent: {
    padding: SPACING.md,
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
    color: '#2C3E50',
  },
  servicePrice: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.crimson,
    marginBottom: SPACING.sm,
  },
  addonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  addonChip: {
    backgroundColor: COLORS.creamLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.goldenBeige,
  },
  addonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warmBrown,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  bookButton: {
    flex: 2,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.pawPink,
  },
  contactButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#2C3E50',
  },
});
