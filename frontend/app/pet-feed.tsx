import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { theme } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface PetCard {
  id: string;
  pet_name: string;
  breed: string;
  sex: string;
  birth_year: number;
  age: number;
  temperaments: string[];
  photos: string[];
  distance_km: number;
  owner_verified: boolean;
  user_id: string;
}

export default function PetFeedScreen() {
  const router = useRouter();
  const [pets, setPets] = useState<PetCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFullProfile, setShowFullProfile] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    fetchPetFeed();
  }, []);

  const fetchPetFeed = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/pets/feed?limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setPets(data);
      } else {
        Alert.alert('Error', 'Failed to load pet feed');
      }
    } catch (error) {
      console.error('Error fetching pet feed:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType: 'like' | 'skip' | 'superlike' | 'boost') => {
    if (currentIndex >= pets.length) return;

    const currentPet = pets[currentIndex];
    
    try {
      setActionLoading(true);
      
      const response = await fetch(`${backendUrl}/api/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pet_id: currentPet.id,
          action_type: actionType,
        }),
      });

      if (response.ok) {
        // Move to next card
        setCurrentIndex(currentIndex + 1);
        
        // If we're running low on cards, fetch more
        if (currentIndex >= pets.length - 2) {
          fetchPetFeed();
        }
      } else {
        Alert.alert('Error', 'Failed to record action');
      }
    } catch (error) {
      console.error('Error recording action:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const openFullProfile = () => {
    setSelectedPhotoIndex(0);
    setShowFullProfile(true);
  };

  const closeFullProfile = () => {
    setShowFullProfile(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.crimson} />
        <Text style={styles.loadingText}>Loading pets...</Text>
      </View>
    );
  }

  if (pets.length === 0 || currentIndex >= pets.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No more pets!</Text>
        <Text style={styles.emptyText}>Check back later for more matches 🐾</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchPetFeed}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentPet = pets[currentIndex];

  return (
    <View style={styles.container}>
      {/* Pet Card */}
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={openFullProfile}
        activeOpacity={0.95}
      >
        {/* Background Image */}
        <Image
          source={{ uri: currentPet.photos[0] }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuButton}>
            <Text style={styles.menuButtonText}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Pet Info Overlay */}
        <View style={styles.infoOverlay}>
          {/* Distance Badge */}
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceBadgeText}>
              📍 {currentPet.distance_km} km away
            </Text>
          </View>

          {/* Pet Name and Age */}
          <View style={styles.nameContainer}>
            <Text style={styles.petName}>{currentPet.pet_name}</Text>
            <Text style={styles.petAge}>, {currentPet.age}</Text>
            {currentPet.owner_verified && (
              <Text style={styles.verifiedBadge}> ✓</Text>
            )}
          </View>

          {/* Breed */}
          <Text style={styles.breed}>{currentPet.breed} • {currentPet.sex}</Text>

          {/* Temperament Tags */}
          <View style={styles.temperamentContainer}>
            {currentPet.temperaments.slice(0, 4).map((temp, index) => (
              <View key={index} style={styles.temperamentTag}>
                <Text style={styles.temperamentText}>{temp}</Text>
              </View>
            ))}
          </View>

          {/* Photo Indicators */}
          <View style={styles.photoIndicators}>
            {currentPet.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoIndicator,
                  index === 0 && styles.photoIndicatorActive,
                ]}
              />
            ))}
          </View>
        </View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.skipButton]}
          onPress={() => handleAction('skip')}
          disabled={actionLoading}
        >
          <Text style={styles.actionIcon}>🥏</Text>
          <Text style={styles.actionLabel}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton]}
          onPress={() => handleAction('like')}
          disabled={actionLoading}
        >
          <Text style={styles.actionIcon}>🎾</Text>
          <Text style={styles.actionLabel}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superlikeButton]}
          onPress={() => handleAction('superlike')}
          disabled={actionLoading}
        >
          <Text style={styles.actionIcon}>🍖</Text>
          <Text style={styles.actionLabel}>Super Like</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.boostButton]}
          onPress={() => handleAction('boost')}
          disabled={actionLoading}
        >
          <Text style={styles.actionIcon}>✨🍖</Text>
          <Text style={styles.actionLabel}>Boost</Text>
        </TouchableOpacity>
      </View>

      {/* Full Profile Modal */}
      <Modal
        visible={showFullProfile}
        animationType="slide"
        onRequestClose={closeFullProfile}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeFullProfile}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{currentPet.pet_name}'s Profile</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Photo Gallery */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const offsetX = e.nativeEvent.contentOffset.x;
                const index = Math.round(offsetX / width);
                setSelectedPhotoIndex(index);
              }}
            >
              {currentPet.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.fullProfileImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {/* Photo Indicators */}
            <View style={styles.modalPhotoIndicators}>
              {currentPet.photos.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.modalPhotoIndicator,
                    index === selectedPhotoIndex && styles.modalPhotoIndicatorActive,
                  ]}
                />
              ))}
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{currentPet.pet_name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Age:</Text>
                <Text style={styles.detailValue}>{currentPet.age} years old</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Breed:</Text>
                <Text style={styles.detailValue}>{currentPet.breed}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sex:</Text>
                <Text style={styles.detailValue}>{currentPet.sex}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance:</Text>
                <Text style={styles.detailValue}>{currentPet.distance_km} km away</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Owner:</Text>
                <Text style={styles.detailValue}>
                  {currentPet.owner_verified ? 'Verified ✓' : 'Not Verified'}
                </Text>
              </View>

              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Temperament:</Text>
                <View style={styles.temperamentContainer}>
                  {currentPet.temperaments.map((temp, index) => (
                    <View key={index} style={styles.temperamentTag}>
                      <Text style={styles.temperamentText}>{temp}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {actionLoading && (
        <View style={styles.actionLoadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.crimson} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.black,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: theme.colors.crimson,
    borderRadius: 24,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
  cardContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.colors.charcoal,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: theme.colors.white,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    color: theme.colors.white,
    fontWeight: 'bold',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
  },
  distanceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  distanceBadgeText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  petName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  petAge: {
    fontSize: 28,
    color: theme.colors.white,
    opacity: 0.9,
  },
  verifiedBadge: {
    fontSize: 24,
    color: theme.colors.gold,
    marginLeft: 8,
  },
  breed: {
    fontSize: 18,
    color: theme.colors.white,
    opacity: 0.8,
    marginBottom: 12,
  },
  temperamentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  temperamentTag: {
    backgroundColor: 'rgba(217, 4, 41, 0.3)',
    borderWidth: 1,
    borderColor: theme.colors.crimson,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  temperamentText: {
    fontSize: 12,
    color: theme.colors.white,
    fontWeight: '600',
  },
  photoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  photoIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 3,
  },
  photoIndicatorActive: {
    backgroundColor: theme.colors.white,
    width: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.black,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  skipButton: {
    backgroundColor: theme.colors.charcoal,
  },
  likeButton: {
    backgroundColor: theme.colors.crimson,
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  superlikeButton: {
    backgroundColor: theme.colors.gold,
  },
  boostButton: {
    backgroundColor: theme.colors.gold,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 10,
    color: theme.colors.white,
    marginTop: 4,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.black,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.charcoal,
  },
  closeButton: {
    fontSize: 28,
    color: theme.colors.white,
    width: 40,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  modalContent: {
    flex: 1,
  },
  fullProfileImage: {
    width: width,
    height: 400,
    backgroundColor: theme.colors.charcoal,
  },
  modalPhotoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  modalPhotoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  modalPhotoIndicatorActive: {
    backgroundColor: theme.colors.crimson,
    width: 24,
  },
  detailsContainer: {
    padding: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.charcoal,
  },
  detailColumn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.charcoal,
  },
  detailLabel: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.6,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: '500',
  },
  actionLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
