import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../components/AuthContext';
import { ActionIcon } from '../components/ActionIcon';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface Pet {
  id: string;
  pet_name: string;
  breed: string;
  age: number;
  distance_km: number;
  temperaments: string[];
  photos: string[];
  bio?: string;
  owner_verified: boolean;
}

export default function FetchYardScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const parallaxY = useRef(new Animated.Value(0)).current;
  const likeGlow = useRef(new Animated.Value(0)).current;
  const superLikeGlow = useRef(new Animated.Value(0)).current;
  const hyperLikeGlow = useRef(new Animated.Value(0)).current;
  const boostGlow = useRef(new Animated.Value(0)).current;

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    if (pets.length > 0) {
      animateCardEntrance();
    }
  }, [currentIndex, pets]);

  const fetchPets = async () => {
    try {
      const url = userId
        ? `${BACKEND_URL}/api/pets/feed?user_id=${userId}&limit=20`
        : `${BACKEND_URL}/api/pets/feed?limit=20`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        // Sort by distance (nearest first)
        const sortedPets = data.sort((a: Pet, b: Pet) => a.distance_km - b.distance_km);
        setPets(sortedPets);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const animateCardEntrance = () => {
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateButtonGlow = (glowAnim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleAction = async (actionType: string) => {
    if (currentIndex >= pets.length) return;

    const currentPet = pets[currentIndex];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate button glow based on action
    switch (actionType) {
      case 'like':
        animateButtonGlow(likeGlow);
        break;
      case 'super_like':
        animateButtonGlow(superLikeGlow);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'golden_bone':
        animateButtonGlow(boostGlow);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'skip':
        animateButtonGlow(hyperLikeGlow);
        // Just advance for skip
        break;
    }

    try {
      const url = userId
        ? `${BACKEND_URL}/api/likes?user_id=${userId}`
        : `${BACKEND_URL}/api/likes`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pet_id: currentPet.id,
          action_type: actionType,
        }),
      });

      const data = await response.json();

      // Check if this resulted in a match
      if (data.match && data.match.matched) {
        router.push({
          pathname: '/double-fetch',
          params: {
            matchType: data.match.match_type,
            matchId: data.match.match_id,
            myPetName: data.match.my_pet?.name || 'Your pet',
            myPetPhoto: data.match.my_pet?.photo || '',
            theirPetName: data.match.their_pet?.name || currentPet.pet_name,
            theirPetPhoto: data.match.their_pet?.photo || currentPet.photos[0] || '',
          },
        });
        return;
      }

      // Advance to next card
      advanceCard();
    } catch (error) {
      console.error('Error recording action:', error);
      advanceCard();
    }
  };

  const advanceCard = () => {
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentIndex(currentIndex + 1);
      position.setValue({ x: 0, y: 0 });
      cardOpacity.setValue(0);
      cardScale.setValue(0.95);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        
        // Parallax effect on image
        Animated.timing(parallaxY, {
          toValue: gesture.dy * 0.05,
          duration: 0,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderRelease: (_, gesture) => {
        // Swipe right = Like (Fetch)
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => handleAction('like'));
        }
        // Swipe left = Skip
        else if (gesture.dx < -SWIPE_THRESHOLD) {
          Animated.spring(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => handleAction('skip'));
        }
        // Return to center
        else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }).start();
          
          Animated.spring(parallaxY, {
            toValue: 0,
            tension: 40,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const likeGlowColor = likeGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 215, 0, 0)', 'rgba(255, 215, 0, 0.6)'],
  });

  const superLikeGlowColor = superLikeGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(220, 20, 60, 0)', 'rgba(220, 20, 60, 0.6)'],
  });

  const hyperLikeGlowColor = hyperLikeGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 165, 0, 0)', 'rgba(255, 165, 0, 0.6)'],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Fetch Yard...</Text>
      </View>
    );
  }

  if (currentIndex >= pets.length) {
    return (
      <LinearGradient colors={['#000000', '#1a0a00']} style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🐾</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>
            You've seen all available pets in your area
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchPets}>
            <LinearGradient
              colors={['#DC143C', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.refreshButtonGradient}
            >
              <Text style={styles.refreshButtonText}>Refresh Feed</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const currentPet = pets[currentIndex];
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  return (
    <LinearGradient colors={['#000000', '#1a0a00']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fetch Yard 🐾</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Pet Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.cardContainer,
          {
            opacity: cardOpacity,
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
              { scale: cardScale },
            ],
          },
        ]}
      >
        <View style={styles.card}>
          {/* Pet Photo with Parallax */}
          <View style={styles.photoContainer}>
            <Animated.Image
              source={{ uri: currentPet.photos[0] }}
              style={[
                styles.photo,
                {
                  transform: [{ translateY: parallaxY }],
                },
              ]}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.photoGradient}
            />
          </View>

          {/* Pet Info */}
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.petName}>{currentPet.pet_name}</Text>
              {currentPet.owner_verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
            </View>

            <Text style={styles.petBreed}>{currentPet.breed} • {currentPet.age} years</Text>
            <Text style={styles.petDistance}>📍 {currentPet.distance_km.toFixed(1)} km away</Text>

            {currentPet.bio && (
              <Text style={styles.petBio}>{currentPet.bio}</Text>
            )}

            {currentPet.temperaments && currentPet.temperaments.length > 0 && (
              <View style={styles.tagsContainer}>
                {currentPet.temperaments.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Floating Action Dock */}
      <View style={styles.actionDock}>
        {/* Skip Button (Frisbee) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleAction('skip')}
          style={styles.actionButtonWrapper}
        >
          <View style={styles.actionButtonContainer}>
            <ActionIcon
              type="frisbee"
              size={56}
              glowTrigger={hyperLikeGlow}
              accessibilityLabel="Skip (Frisbee)"
            />
            <Text style={styles.actionLabel}>Skip</Text>
          </View>
        </TouchableOpacity>

        {/* Fetch/Like Button (Tennis Ball) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleAction('like')}
          style={styles.actionButtonWrapper}
        >
          <View style={styles.actionButtonContainer}>
            <ActionIcon
              type="tennis-ball"
              size={56}
              glowTrigger={likeGlow}
              accessibilityLabel="Like (Tennis Ball)"
            />
            <Text style={styles.actionLabel}>Fetch</Text>
          </View>
        </TouchableOpacity>

        {/* Super Like Button (Bone) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleAction('super_like')}
          style={styles.actionButtonWrapper}
        >
          <View style={styles.actionButtonContainer}>
            <ActionIcon
              type="bone"
              size={56}
              glowTrigger={superLikeGlow}
              accessibilityLabel="Super Like (Bone)"
            />
            <Text style={styles.actionLabel}>Super</Text>
          </View>
        </TouchableOpacity>

        {/* Boost Button (Golden Bone) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleAction('golden_bone')}
          style={styles.actionButtonWrapper}
        >
          <View style={styles.actionButtonContainer}>
            <ActionIcon
              type="golden-bone"
              size={56}
              glowTrigger={boostGlow}
              accessibilityLabel="Boost (Golden Bone)"
            />
            <Text style={styles.actionLabel}>Boost</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Swipe Hints */}
      <Animated.View
        style={[
          styles.swipeHint,
          styles.swipeHintLeft,
          {
            opacity: position.x.interpolate({
              inputRange: [-SCREEN_WIDTH / 2, -50, 0],
              outputRange: [1, 0.5, 0],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <Text style={styles.swipeHintText}>SKIP</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.swipeHint,
          styles.swipeHintRight,
          {
            opacity: position.x.interpolate({
              inputRange: [0, 50, SCREEN_WIDTH / 2],
              outputRange: [0, 0.5, 1],
              extrapolate: 'clamp',
            }),
          },
        ]}
      >
        <Text style={styles.swipeHintText}>FETCH</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#FFD700',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xxl + 20,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSpacer: {
    width: 60,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: SPACING.lg,
    marginBottom: 120,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  photoContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '110%',
    resizeMode: 'cover',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  petName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: SPACING.sm,
  },
  verifiedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  petBreed: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.xs,
  },
  petDistance: {
    fontSize: 16,
    color: 'rgba(255, 215, 0, 0.9)',
    marginBottom: SPACING.sm,
  },
  petBio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  tagText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  actionDock: {
    position: 'absolute',
    bottom: SPACING.xxl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
  },
  actionButtonWrapper: {
    minWidth: 72,
    minHeight: 72,
  },
  actionButton: {
    width: 70,
    height: 84,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    paddingVertical: SPACING.sm,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: 'rgba(154, 205, 50, 0.5)',
  },
  skipButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 107, 0.5)',
  },
  superLikeButton: {
    borderWidth: 2,
    borderColor: 'rgba(220, 20, 60, 0.5)',
  },
  hyperLikeButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 165, 0, 0.5)',
  },
  boostButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  actionLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: SPACING.xs,
  },
  boostLabel: {
    color: '#FFD700',
  },
  swipeHint: {
    position: 'absolute',
    top: '40%',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  swipeHintLeft: {
    left: SPACING.xl,
    borderWidth: 2,
    borderColor: '#DC143C',
  },
  swipeHintRight: {
    right: SPACING.xl,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  swipeHintText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  refreshButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  refreshButtonGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  refreshButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
