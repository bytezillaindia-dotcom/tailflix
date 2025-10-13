import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.xl * 3) / 2;

const CITIES = ['Bengaluru', 'Chennai', 'Delhi', 'Hyderabad', 'Mumbai', 'Pune'];

const CATEGORIES = [
  { icon: '✂️', title: 'Grooming', category: 'grooming' },
  { icon: '🚶‍♂️', title: 'Walking', category: 'walking' },
  { icon: '🩺', title: 'Vet', category: 'vet' },
  { icon: '🏠', title: 'Boarding', category: 'boarding' },
  { icon: '🎓', title: 'Training', category: 'training' },
];

export default function TailProHome() {
  const router = useRouter();
  const { userId } = useAuth();
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    loadSelectedCity();
  }, []);

  const loadSelectedCity = async () => {
    try {
      const city = await AsyncStorage.getItem('tailpro_city');
      if (city) setSelectedCity(city);
    } catch (error) {
      console.error('Error loading city:', error);
    }
  };

  const handleCitySelect = async (city: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCity(city);
    setShowCityPicker(false);
    try {
      await AsyncStorage.setItem('tailpro_city', city);
    } catch (error) {
      console.error('Error saving city:', error);
    }
  };

  const handleCategoryPress = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/tailpro_list?category=${category}&city=${selectedCity}`);
  };

  const handleBecomePartner = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/tailpro_partner_signup');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TailPro 💼</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>Premium Pet Services 🐾</Text>

        {/* City Selector */}
        <View style={styles.citySelectorContainer}>
          <Text style={styles.cityLabel}>Select City</Text>
          <TouchableOpacity
            onPress={() => setShowCityPicker(!showCityPicker)}
            style={styles.cityButton}
          >
            <LinearGradient
              colors={[COLORS.pawPink, COLORS.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cityButtonGradient}
            >
              <Text style={styles.cityButtonText}>{selectedCity} 📍</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* City Picker Dropdown */}
        {showCityPicker && (
          <View style={styles.cityPickerContainer}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => handleCitySelect(city)}
                style={[
                  styles.cityOption,
                  selectedCity === city && styles.cityOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.cityOptionText,
                    selectedCity === city && styles.cityOptionTextSelected,
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Grid */}
        <Text style={styles.sectionTitle}>Browse Services</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.category}
              onPress={() => handleCategoryPress(cat.category)}
              style={styles.categoryCard}
            >
              <LinearGradient
                colors={[COLORS.cream, COLORS.peach]}
                style={styles.categoryGradient}
              >
                <View style={styles.goldBorder} />
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hero Promos */}
        <Text style={styles.sectionTitle}>Featured Services</Text>
        <TouchableOpacity
          onPress={() => handleCategoryPress('grooming')}
          style={styles.promoCard}
        >
          <LinearGradient
            colors={[COLORS.goldenBeige, COLORS.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>✂️</Text>
            <Text style={styles.promoHeadline}>At-home Grooming</Text>
            <Text style={styles.promoCta}>Book Now →</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleCategoryPress('vet')}
          style={styles.promoCard}
        >
          <LinearGradient
            colors={[COLORS.pawPinkLight, COLORS.pawPink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>🩺</Text>
            <Text style={styles.promoHeadline}>Vet at Home / Online</Text>
            <Text style={styles.promoCta}>Consult →</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Become Partner Button */}
        <TouchableOpacity
          onPress={handleBecomePartner}
          style={styles.partnerButton}
        >
          <LinearGradient
            colors={[COLORS.warmBrown, COLORS.chocolateBrown]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.partnerGradient}
          >
            <Text style={styles.partnerButtonText}>Become a TailPro Partner 💼</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* My Appointments Button */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/tailpro_orders');
          }}
          style={styles.appointmentsButton}
        >
          <Text style={styles.appointmentsButtonText}>My Appointments 📅</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: '#5A6C7D',
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  citySelectorContainer: {
    marginBottom: SPACING.lg,
  },
  cityLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: SPACING.sm,
  },
  cityButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  cityButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  cityButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  cityPickerContainer: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.pawPink,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cityOption: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  cityOptionSelected: {
    backgroundColor: COLORS.pawPinkLight,
  },
  cityOptionText: {
    fontSize: FONT_SIZES.md,
    color: '#2C3E50',
    fontWeight: '600',
  },
  cityOptionTextSelected: {
    color: COLORS.crimson,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryCard: {
    width: CARD_WIDTH,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  categoryGradient: {
    padding: SPACING.lg,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    position: 'relative',
  },
  goldBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  categoryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.warmBrown,
  },
  promoCard: {
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  promoGradient: {
    padding: SPACING.xl,
    minHeight: 140,
    justifyContent: 'center',
  },
  promoEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  promoHeadline: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  promoCta: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  partnerButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  partnerGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  partnerButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  appointmentsButton: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.pawPink,
    marginBottom: SPACING.md,
  },
  appointmentsButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#2C3E50',
  },
});
