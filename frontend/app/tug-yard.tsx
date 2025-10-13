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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface OwnerProfile {
  id: string;
  owner_name: string;
  owner_photo: string;
  pet_name: string;
  pet_photo: string;
  bio: string;
  age: number;
  distance_km: number;
  interests: string[];
  is_verified: boolean;
}

export default function TugYardScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [profiles, setProfiles] = useState<OwnerProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const tugGlow = useRef(new Animated.Value(0)).current;
  const strongTugGlow = useRef(new Animated.Value(0)).current;
  const dropGlow = useRef(new Animated.Value(0)).current;
  const leashGlow = useRef(new Animated.Value(0)).current;
  
  // Rope pull animations
  const ropeStretch = useRef(new Animated.Value(0)).current;
  const ropeGlow = useRef(new Animated.Value(0)).current;
  const ropeDrop = useRef(new Animated.Value(0)).current;
  const tugProgress = useRef(new Animated.Value(0)).current;
  const strongTugProgress = useRef(new Animated.Value(0)).current;

  // Long press state
  const [isTugging, setIsTugging] = useState(false);
  const [isStrongTugging, setIsStrongTugging] = useState(false);
  const tugTimer = useRef<NodeJS.Timeout | null>(null);
  const strongTugTimer = useRef<NodeJS.Timeout | null>(null);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchProfiles();
  }, [userId]);

  useEffect(() => {
    if (profiles.length > 0) {
      animateCardEntrance();
    }
  }, [currentIndex, profiles]);

  const fetchProfiles = async () => {
    try {
      // Mock data for now - in production, call backend API
      const mockProfiles: OwnerProfile[] = [
        {
          id: '1',
          owner_name: 'Sarah Chen',
          owner_photo: 'https://i.pravatar.cc/400?img=47',
          pet_name: 'Luna',
          pet_photo: 'https://images.dog.ceo/breeds/husky/n02110185_10047.jpg',
          bio: 'Dog mom who loves hiking trails and weekend adventures. Luna is my adventure buddy!',
          age: 28,
          distance_km: 2.5,
          interests: ['Hiking', 'Dog Parks', 'Photography'],
          is_verified: true,
        },
        {
          id: '2',
          owner_name: 'Michael Rodriguez',
          owner_photo: 'https://i.pravatar.cc/400?img=12',
          pet_name: 'Max',
          pet_photo: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg',
          bio: 'Rescue parent and coffee enthusiast. Max loves making new friends at the beach!',
          age: 32,
          distance_km: 4.2,
          interests: ['Beach walks', 'Rescue advocacy', 'Coffee'],
          is_verified: true,
        },
      ];
      
      setProfiles(mockProfiles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
    }
  };

  const animateCardEntrance = () => {
    position.setValue({ x: 0, y: 0 });
    cardScale.setValue(0.95);
    cardOpacity.setValue(0);

    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 40,
        friction: 7,
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

  const handleAction = async (actionType: 'like' | 'super_like' | 'skip' | 'golden_leash') => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate button glow
    switch (actionType) {
      case 'like':
        animateButtonGlow(tugGlow);
        break;
      case 'super_like':
        animateButtonGlow(strongTugGlow);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'golden_leash':
        animateButtonGlow(leashGlow);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'skip':
        animateButtonGlow(dropGlow);
        // Animate rope drop
        animateRopeDrop();
        break;
    }

    // TODO: Call backend API to save action
    console.log(`Action: ${actionType} on profile ${currentProfile.id}`);

    // Advance to next card
    advanceCard();
  };

  // Handle Tug long press (1 second)
  const handleTugPressIn = () => {
    setIsTugging(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Start progress animation
    Animated.timing(tugProgress, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();

    // Start rope stretch animation
    Animated.timing(ropeStretch, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Timer to complete action after 1 second
    tugTimer.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      animateRopePull();
      handleAction('like');
      resetTugAnimation();
    }, 1000);
  };

  const handleTugPressOut = () => {
    if (tugTimer.current) {
      clearTimeout(tugTimer.current);
      tugTimer.current = null;
    }
    resetTugAnimation();
  };

  const resetTugAnimation = () => {
    setIsTugging(false);
    tugProgress.setValue(0);
    ropeStretch.setValue(0);
  };

  // Handle Strong Tug long press (1.5 seconds)
  const handleStrongTugPressIn = () => {
    setIsStrongTugging(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Start progress animation
    Animated.timing(strongTugProgress, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Start rope glow animation
    Animated.parallel([
      Animated.timing(ropeStretch, {
        toValue: 1.2,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(ropeGlow, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(ropeGlow, {
            toValue: 0.5,
            duration: 250,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Timer to complete action after 1.5 seconds
    strongTugTimer.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      animateRopePullWithGlow();
      handleAction('super_like');
      resetStrongTugAnimation();
    }, 1500);
  };

  const handleStrongTugPressOut = () => {
    if (strongTugTimer.current) {
      clearTimeout(strongTugTimer.current);
      strongTugTimer.current = null;
    }
    resetStrongTugAnimation();
  };

  const resetStrongTugAnimation = () => {
    setIsStrongTugging(false);
    strongTugProgress.setValue(0);
    ropeStretch.setValue(0);
    ropeGlow.setValue(0);
  };

  // Rope animations
  const animateRopePull = () => {
    // Rope stretches then recoils
    Animated.sequence([
      Animated.timing(ropeStretch, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(ropeStretch, {
        toValue: 0,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateRopePullWithGlow = () => {
    // Rope stretches with glow then recoils
    Animated.sequence([
      Animated.parallel([
        Animated.timing(ropeStretch, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(ropeGlow, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(ropeStretch, {
          toValue: 0,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(ropeGlow, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const animateRopeDrop = () => {
    // Rope falls down
    Animated.sequence([
      Animated.timing(ropeDrop, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(ropeDrop, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const advanceCard = () => {
    Animated.timing(cardOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIndex(currentIndex + 1);
    });
  };

  // Swipe gesture handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        // Swipe right = Tug (like)
        if (gesture.dx > SWIPE_THRESHOLD) {
          Animated.spring(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            useNativeDriver: true,
          }).start(() => handleAction('like'));
        }
        // Swipe left = Drop (skip)
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
        }
      },
    })
  ).current;

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a0a00']} style={styles.container}>
        <ActivityIndicator size="large" color="#FFD700" />
      </LinearGradient>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <LinearGradient colors={['#000000', '#1a0a00']} style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🦴</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptyText}>
            No more profiles nearby. Check back soon!
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const currentProfile = profiles[currentIndex];

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const tugGlowColor = tugGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(220, 20, 60, 0.3)', 'rgba(220, 20, 60, 0.8)'],
  });

  const strongTugGlowColor = strongTugGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.8)'],
  });

  const dropGlowColor = dropGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(128, 128, 128, 0.3)', 'rgba(128, 128, 128, 0.8)'],
  });

  const leashGlowColor = leashGlow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 0.8)'],
  });

  return (
    <LinearGradient colors={['#000000', '#1a0a00']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tug Yard 💕</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Profile Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
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
        {/* Owner Photo (main) */}
        <Image source={{ uri: currentProfile.owner_photo }} style={styles.ownerPhoto} />
        
        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
          style={styles.gradient}
        />

        {/* Pet Photo (circle, overlaid) */}
        <View style={styles.petPhotoContainer}>
          <Image source={{ uri: currentProfile.pet_photo }} style={styles.petPhoto} />
          {currentProfile.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>🐾</Text>
            </View>
          )}
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.ownerName}>{currentProfile.owner_name}, {currentProfile.age}</Text>
          <Text style={styles.petName}>with {currentProfile.pet_name}</Text>
          <Text style={styles.distance}>📍 {currentProfile.distance_km} km away</Text>
          
          {/* Interests */}
          <View style={styles.interestsContainer}>
            {currentProfile.interests.map((interest, index) => (
              <View key={index} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>

          {/* Bio */}
          <Text style={styles.bio} numberOfLines={3}>{currentProfile.bio}</Text>
        </View>
      </Animated.View>

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
        <Text style={styles.swipeHintText}>DROP</Text>
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
        <Text style={styles.swipeHintText}>TUG</Text>
      </Animated.View>

      {/* Action Dock */}
      <View style={styles.actionDock}>
        {/* Drop Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleAction('skip')}
          style={styles.actionButtonWrapper}
        >
          <Animated.View style={[styles.actionButton, styles.dropButton, { shadowColor: dropGlowColor }]}>
            <Text style={styles.actionIcon}>🪃</Text>
            <Text style={styles.actionLabel}>Drop</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Tug Button (Like) - Long Press 1s */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handleTugPressIn}
          onPressOut={handleTugPressOut}
          style={styles.actionButtonWrapper}
        >
          <Animated.View style={[styles.actionButton, styles.tugButton, { shadowColor: tugGlowColor }]}>
            <View style={styles.iconContainer}>
              <Text style={styles.actionIcon}>🪢</Text>
              {isTugging && (
                <View style={styles.progressRing}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      {
                        width: tugProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              )}
            </View>
            <Text style={styles.actionLabel}>Hold 1s</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Strong Tug Button (Super Like) - Long Press 1.5s */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handleStrongTugPressIn}
          onPressOut={handleStrongTugPressOut}
          style={styles.actionButtonWrapper}
        >
          <Animated.View style={[styles.actionButton, styles.strongTugButton, { shadowColor: strongTugGlowColor }]}>
            <View style={styles.iconContainer}>
              <Animated.Text 
                style={[
                  styles.actionIcon,
                  {
                    opacity: isStrongTugging ? ropeGlow : 1,
                  },
                ]}
              >
                ✨🪢
              </Animated.Text>
              {isStrongTugging && (
                <View style={styles.progressRing}>
                  <Animated.View 
                    style={[
                      styles.progressFill,
                      styles.progressFillGold,
                      {
                        width: strongTugProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              )}
            </View>
            <Text style={styles.actionLabel}>Hold 1.5s</Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Golden Leash Button (Boost) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleAction('golden_leash')}
          style={styles.actionButtonWrapper}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.actionButton, styles.leashButton]}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={[styles.actionLabel, styles.leashLabel]}>Leash</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + 10,
    paddingBottom: SPACING.lg,
  },
  headerBackButton: {
    paddingVertical: SPACING.xs,
  },
  headerBackText: {
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
  card: {
    position: 'absolute',
    top: 100,
    left: SPACING.lg,
    right: SPACING.lg,
    height: SCREEN_HEIGHT * 0.65,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  ownerPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  petPhotoContainer: {
    position: 'absolute',
    bottom: 200,
    right: SPACING.lg,
  },
  petPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  verifiedText: {
    fontSize: 16,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
  },
  ownerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  petName: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#DC143C',
    marginBottom: 6,
  },
  distance: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SPACING.sm,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  interestTag: {
    backgroundColor: '#DC143C',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 16,
  },
  interestText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    maxHeight: 60,
  },
  swipeHint: {
    position: 'absolute',
    top: '40%',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    borderWidth: 3,
  },
  swipeHintLeft: {
    left: SPACING.xxl,
    borderColor: 'rgba(128, 128, 128, 0.8)',
  },
  swipeHintRight: {
    right: SPACING.xxl,
    borderColor: 'rgba(220, 20, 60, 0.8)',
  },
  swipeHintText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  dropButton: {},
  tugButton: {},
  strongTugButton: {},
  leashButton: {
    borderRadius: 16,
    paddingHorizontal: SPACING.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 2,
  },
  actionLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    marginTop: SPACING.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  leashLabel: {
    color: '#000',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DC143C',
    borderRadius: 2,
  },
  progressFillGold: {
    backgroundColor: '#FFD700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 16,
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
