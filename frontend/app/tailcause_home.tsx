import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface AdoptionPet {
  id: number;
  pet_name: string;
  age: string;
  breed: string;
  org: string;
  verified: boolean;
  image_url: string;
}

interface NGO {
  id: number;
  ngo_name: string;
  cause: string;
  logo_url: string;
}

const MOCK_ADOPTIONS: AdoptionPet[] = [
  {
    id: 901,
    pet_name: 'Bruno',
    age: '3 yrs',
    breed: 'Indie',
    org: 'Hope Rescue',
    verified: true,
    image_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300',
  },
  {
    id: 902,
    pet_name: 'Lucy',
    age: '6 months',
    breed: 'Beagle',
    org: 'Private Owner',
    verified: false,
    image_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=300',
  },
  {
    id: 903,
    pet_name: 'Max',
    age: '2 yrs',
    breed: 'Indie',
    org: 'Paws Foundation',
    verified: true,
    image_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300',
  },
];

const MOCK_NGOS: NGO[] = [
  {
    id: 1,
    ngo_name: 'Paws Foundation',
    cause: 'Street dog rescues and rehabilitation',
    logo_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=100&h=100',
  },
  {
    id: 2,
    ngo_name: 'Happy Tails NGO',
    cause: 'Cat sterilization drives and care',
    logo_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100&h=100',
  },
  {
    id: 3,
    ngo_name: 'Second Chance Shelter',
    cause: 'Abandoned pet adoption programs',
    logo_url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=100&h=100',
  },
];

export default function TailCauseHome() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'adopt' | 'donate'>('adopt');

  const handleTabChange = (tab: 'adopt' | 'donate') => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleViewProfile = (petId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/tailcause_pet_profile?petId=${petId}`);
  };

  const handleAdopt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      '💝 Unlock Contact',
      'Unlock this pet\'s adoption contact for 5 TailCoins',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          onPress: () => {
            Alert.alert('Success! 🎉', 'Contact information unlocked! Check your messages.');
          },
        },
      ]
    );
  };

  const handleDonate = (amount: number, ngoName: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '❤️ Thank You!',
      `Your ₹${amount} donation to ${ngoName} makes a difference!`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.cream, COLORS.softPeach]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>TailCause</Text>
          <Text style={styles.headerSubtitle}>Where Hearts Meet Paws ❤️🐾</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'adopt' && styles.activeTab]}
          onPress={() => handleTabChange('adopt')}
        >
          <Text style={[styles.tabText, activeTab === 'adopt' && styles.activeTabText]}>
            Adopt a Friend 🐾
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'donate' && styles.activeTab]}
          onPress={() => handleTabChange('donate')}
        >
          <Text style={[styles.tabText, activeTab === 'donate' && styles.activeTabText]}>
            Donate ❤️
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'adopt' ? (
          <View>
            {MOCK_ADOPTIONS.map((pet) => (
              <AdoptionCard
                key={pet.id}
                pet={pet}
                onViewProfile={() => handleViewProfile(pet.id)}
                onAdopt={handleAdopt}
              />
            ))}
          </View>
        ) : (
          <View>
            {MOCK_NGOS.map((ngo) => (
              <DonationCard key={ngo.id} ngo={ngo} onDonate={handleDonate} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

interface AdoptionCardProps {
  pet: AdoptionPet;
  onViewProfile: () => void;
  onAdopt: () => void;
}

function AdoptionCard({ pet, onViewProfile, onAdopt }: AdoptionCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: pet.image_url }} style={styles.petImage} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.petName}>{pet.pet_name}</Text>
          {pet.verified && <Text style={styles.verifiedBadge}>✅ Verified NGO</Text>}
        </View>
        <Text style={styles.petInfo}>
          {pet.age} • {pet.breed}
        </Text>
        <Text style={styles.petOrg}>📍 {pet.org}</Text>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.outlineButton} onPress={onViewProfile}>
            <Text style={styles.outlineButtonText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.adoptButton} onPress={onAdopt}>
            <LinearGradient
              colors={[COLORS.pawPink, COLORS.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.adoptButtonGradient}
            >
              <Text style={styles.adoptButtonText}>Adopt 💝</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

interface DonationCardProps {
  ngo: NGO;
  onDonate: (amount: number, ngoName: string) => void;
}

function DonationCard({ ngo, onDonate }: DonationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.ngoHeader}>
        <Image source={{ uri: ngo.logo_url }} style={styles.ngoLogo} />
        <View style={styles.ngoInfo}>
          <Text style={styles.ngoName}>{ngo.ngo_name}</Text>
          <Text style={styles.ngoCause}>{ngo.cause}</Text>
        </View>
      </View>

      <View style={styles.donationActions}>
        {[99, 199, 499].map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.donateButton}
            onPress={() => onDonate(amount, ngo.ngo_name)}
          >
            <LinearGradient
              colors={[COLORS.peach, COLORS.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.donateButtonGradient}
            >
              <Text style={styles.donateButtonText}>Donate ₹{amount}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    paddingTop: SPACING.xxl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.chocolateBrown,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.warmBrown,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  activeTab: {
    backgroundColor: COLORS.softPeach,
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.warmBrown,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.chocolateBrown,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  petImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.goldenBeige,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  petName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
  },
  verifiedBadge: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.chocolateBrown,
    backgroundColor: COLORS.softPeach,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  petInfo: {
    fontSize: FONT_SIZES.md,
    color: COLORS.warmBrown,
    marginBottom: SPACING.xs,
  },
  petOrg: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warmBrown,
    marginBottom: SPACING.md,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.warmBrown,
  },
  adoptButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  adoptButtonGradient: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  adoptButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#FFF',
  },
  ngoHeader: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  ngoLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
    backgroundColor: COLORS.goldenBeige,
  },
  ngoInfo: {
    flex: 1,
  },
  ngoName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
    marginBottom: SPACING.xs,
  },
  ngoCause: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warmBrown,
    lineHeight: 20,
  },
  donationActions: {
    flexDirection: 'row',
    padding: SPACING.md,
    paddingTop: 0,
    gap: SPACING.sm,
  },
  donateButton: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  donateButtonGradient: {
    paddingVertical: SPACING.sm,
    alignItems: 'center',
  },
  donateButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
