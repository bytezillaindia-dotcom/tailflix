import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Path, Defs, RadialGradient, Stop, Filter, FeGaussianBlur, FeOffset, FeComponentTransfer, FeFuncA, FeMerge, FeMergeNode, LinearGradient, Ellipse, Rect, G, FeFlood, FeComposite } from 'react-native-svg';

// Tennis Ball SVG Component
const TennisBallIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Defs>
      <Filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <FeOffset dx="0" dy="2" result="offsetblur"/>
        <FeComponentTransfer>
          <FeFuncA type="linear" slope="0.3"/>
        </FeComponentTransfer>
        <FeMerge>
          <FeMergeNode/>
          <FeMergeNode in="SourceGraphic"/>
        </FeMerge>
      </Filter>
      <RadialGradient id="grad" cx="40%" cy="40%">
        <Stop offset="0%" stopColor="#B4E657" stopOpacity="1" />
        <Stop offset="100%" stopColor="#7CAD28" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    
    <Circle cx="32" cy="32" r="28" fill="#9ACD32" filter="url(#shadow)"/>
    <Circle cx="32" cy="32" r="28" fill="url(#grad)"/>
    
    <Path d="M 12 20 Q 32 8, 52 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <Path d="M 12 44 Q 32 56, 52 44" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    
    <Path d="M 10 22 Q 32 10, 54 22" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
    <Path d="M 10 42 Q 32 54, 54 42" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
  </Svg>
);

// Frisbee SVG Component
const FrisbeeIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Defs>
      <LinearGradient id="frisbeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FF6347" stopOpacity="1" />
        <Stop offset="50%" stopColor="#FF4500" stopOpacity="1" />
        <Stop offset="100%" stopColor="#FF8C00" stopOpacity="1" />
      </LinearGradient>
      <Filter id="frisbeeShadow" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <FeOffset dx="0" dy="2" result="offsetblur"/>
        <FeComponentTransfer>
          <FeFuncA type="linear" slope="0.3"/>
        </FeComponentTransfer>
        <FeMerge>
          <FeMergeNode/>
          <FeMergeNode in="SourceGraphic"/>
        </FeMerge>
      </Filter>
    </Defs>
    
    <Ellipse cx="32" cy="32" rx="26" ry="8" fill="url(#frisbeeGrad)" filter="url(#frisbeeShadow)"/>
    <Ellipse cx="32" cy="32" rx="20" ry="6" fill="none" stroke="#FF6347" strokeWidth="1.5" opacity="0.5"/>
    <Ellipse cx="32" cy="32" rx="14" ry="4" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.7"/>
    <Ellipse cx="32" cy="30" rx="22" ry="4" fill="white" opacity="0.3"/>
    <Ellipse cx="32" cy="34" rx="22" ry="3" fill="black" opacity="0.2"/>
  </Svg>
);

// Bone SVG Component
const BoneIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Defs>
      <Filter id="boneShadow" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <FeOffset dx="0" dy="2" result="offsetblur"/>
        <FeComponentTransfer>
          <FeFuncA type="linear" slope="0.3"/>
        </FeComponentTransfer>
        <FeMerge>
          <FeMergeNode/>
          <FeMergeNode in="SourceGraphic"/>
        </FeMerge>
      </Filter>
      <RadialGradient id="boneGrad">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
        <Stop offset="100%" stopColor="#E8E8E8" stopOpacity="1" />
      </RadialGradient>
    </Defs>
    
    <Circle cx="14" cy="26" r="7" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
    <Circle cx="14" cy="38" r="7" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
    <Circle cx="50" cy="26" r="7" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
    <Circle cx="50" cy="38" r="7" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
    <Rect x="14" y="28" width="36" height="8" rx="4" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
    <Ellipse cx="32" cy="30" rx="14" ry="2" fill="white" opacity="0.4"/>
  </Svg>
);

// Golden Bone SVG Component
const GoldenBoneIcon = ({ size = 32 }) => (
  <Svg width={size} height={size} viewBox="0 0 64 64">
    <Defs>
      <LinearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFD700" stopOpacity="1" />
        <Stop offset="50%" stopColor="#FFA500" stopOpacity="1" />
        <Stop offset="100%" stopColor="#DAA520" stopOpacity="1" />
      </LinearGradient>
      <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <FeGaussianBlur in="SourceAlpha" stdDeviation="3"/>
        <FeOffset dx="0" dy="0" result="offsetblur"/>
        <FeFlood floodColor="#FFD700" floodOpacity="0.6"/>
        <FeComposite in2="offsetblur" operator="in"/>
        <FeMerge>
          <FeMergeNode/>
          <FeMergeNode in="SourceGraphic"/>
        </FeMerge>
      </Filter>
    </Defs>
    
    <G filter="url(#glow)">
      <Circle cx="14" cy="26" r="7" fill="url(#goldGrad)"/>
      <Circle cx="14" cy="38" r="7" fill="url(#goldGrad)"/>
      <Circle cx="50" cy="26" r="7" fill="url(#goldGrad)"/>
      <Circle cx="50" cy="38" r="7" fill="url(#goldGrad)"/>
      <Rect x="14" y="28" width="36" height="8" rx="4" fill="url(#goldGrad)"/>
    </G>
    
    <Ellipse cx="32" cy="30" rx="14" ry="2" fill="#FFED4E" opacity="0.6"/>
    
    <G transform="translate(48, 18)">
      <Path d="M 0,-4 L 0.5,-0.5 L 4,0 L 0.5,0.5 L 0,4 L -0.5,0.5 L -4,0 L -0.5,-0.5 Z" fill="#FFD700" opacity="0.9"/>
      <Circle cx="0" cy="0" r="1.5" fill="white" opacity="0.8"/>
    </G>
    
    <G transform="translate(52, 24)">
      <Path d="M 0,-3 L 0.4,-0.4 L 3,0 L 0.4,0.4 L 0,3 L -0.4,0.4 L -3,0 L -0.4,-0.4 Z" fill="#FFD700" opacity="0.8"/>
      <Circle cx="0" cy="0" r="1" fill="white" opacity="0.7"/>
    </G>
  </Svg>
);

const { width, height } = Dimensions.get('window');

// Animated Action Button Component
const AnimatedActionButton = ({ onPress, icon: Icon, label, disabled }: any) => {
  const scale = new Animated.Value(1);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={styles.actionButton}
      android_ripple={{ 
        color: 'rgba(255, 255, 255, 0.3)', 
        borderless: true,
        radius: 36
      }}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon size={label === 'Like' ? 44 : 32} />
      </Animated.View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
};

// Special Animated Golden Bone Button Component with glow and sparkle animation
const AnimatedGoldenBoneButton = ({ onPress, icon: Icon, label, disabled, isAnimating }: any) => {
  const scale = new Animated.Value(1);
  const glowOpacity = new Animated.Value(0);
  const sparkle1Opacity = new Animated.Value(0);
  const sparkle2Opacity = new Animated.Value(0);
  const sparkle1Rotate = new Animated.Value(0);
  const sparkle2Rotate = new Animated.Value(0);

  React.useEffect(() => {
    if (isAnimating) {
      // Glow effect
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Sparkle animations
      Animated.parallel([
        Animated.sequence([
          Animated.timing(sparkle1Opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle1Opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(sparkle2Opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle2Opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(sparkle1Rotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(sparkle2Rotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [isAnimating]);

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const sparkle1RotateInterpolate = sparkle1Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sparkle2RotateInterpolate = sparkle2Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  return (
    <View style={styles.goldenBoneContainer}>
      {/* Glow effect */}
      <Animated.View 
        style={[
          styles.goldenBoneGlow,
          { 
            opacity: glowOpacity,
          }
        ]} 
      />
      
      {/* Sparkles */}
      <Animated.Text 
        style={[
          styles.sparkle,
          styles.sparkle1,
          { 
            opacity: sparkle1Opacity,
            transform: [{ rotate: sparkle1RotateInterpolate }],
          }
        ]}
      >
        ✨
      </Animated.Text>
      <Animated.Text 
        style={[
          styles.sparkle,
          styles.sparkle2,
          { 
            opacity: sparkle2Opacity,
            transform: [{ rotate: sparkle2RotateInterpolate }],
          }
        ]}
      >
        ✨
      </Animated.Text>
      
      {/* Button */}
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={styles.actionButton}
        android_ripple={{ 
          color: 'rgba(255, 215, 0, 0.3)', 
          borderless: true,
          radius: 36
        }}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Icon size={32} />
        </Animated.View>
        <Text style={styles.actionLabel}>{label}</Text>
      </Pressable>
    </View>
  );
};

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
  const [goldenBoneAnimating, setGoldenBoneAnimating] = useState(false);

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
        // Check for server-side verification guard
        if (data.error === 'verification_required') {
          setLoading(false);
          Alert.alert(
            'Verification Required',
            'You must be verified to access the pet feed. Please complete verification.',
            [
              {
                text: 'Go to Verification',
                onPress: () => router.push('/verify')
              }
            ]
          );
          return;
        }
        
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

  const handleAction = async (actionType: 'like' | 'skip' | 'super_like' | 'golden_bone') => {
    if (currentIndex >= pets.length) return;

    const currentPet = pets[currentIndex];
    
    try {
      setActionLoading(true);
      
      // Special check for super_like: Premium-only feature
      if (actionType === 'super_like') {
        const limitsResponse = await fetch(`${backendUrl}/api/likes/daily-count`);
        const limitsData = await limitsResponse.json();
        
        if (limitsResponse.ok) {
          // If user is not premium, redirect to paywall with custom message
          if (!limitsData.is_premium) {
            setActionLoading(false);
            router.push({
              pathname: '/paywall',
              params: { message: 'Super Likes are a premium feature 🦴✨' }
            });
            return;
          }
          // Premium users: super_like counts toward daily limit, check it
          if (limitsData.daily_likes_count >= limitsData.limit) {
            setActionLoading(false);
            router.push('/paywall');
            return;
          }
        }
      }
      
      // Special check for golden_bone: Premium-only feature with monthly limit (5/month)
      if (actionType === 'golden_bone') {
        const limitsResponse = await fetch(`${backendUrl}/api/likes/daily-count`);
        const limitsData = await limitsResponse.json();
        
        if (limitsResponse.ok) {
          // If user is not premium, redirect to paywall
          if (!limitsData.is_premium) {
            setActionLoading(false);
            router.push({
              pathname: '/paywall',
              params: { message: 'Golden Bones are a premium feature ✨🍖' }
            });
            return;
          }
          // Premium user: check monthly golden_bones limit
          if (limitsData.golden_bones_remaining <= 0) {
            setActionLoading(false);
            Alert.alert(
              'No Golden Bones Left',
              "You've used all your Golden Bones this month. They reset on the 1st of next month.",
              [{ text: 'OK' }]
            );
            return;
          }
        }
        
        // Trigger animation for golden_bone
        setGoldenBoneAnimating(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setGoldenBoneAnimating(false);
      }
      
      // Check daily limit for other limited actions: like
      // Skip is unlimited, super_like and golden_bone already checked above
      const limitedActions = ['like'];
      if (limitedActions.includes(actionType)) {
        const limitsResponse = await fetch(`${backendUrl}/api/likes/daily-count`);
        const limitsData = await limitsResponse.json();
        
        if (limitsResponse.ok) {
          // Check if user has reached daily limit (10 actions for free users)
          if (limitsData.daily_likes_count >= limitsData.limit) {
            setActionLoading(false);
            // Show paywall
            router.push('/paywall');
            return;
          }
        }
      }
      
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
        const data = await response.json();
        
        // Check for server-side premium validation error
        if (data.error === 'premium_required') {
          setActionLoading(false);
          // Navigate to paywall with custom message
          const actionName = data.action_type === 'super_like' ? 'Super Likes' : 'Golden Bones';
          router.push({
            pathname: '/paywall',
            params: { 
              message: `${actionName} are a premium feature ${data.action_type === 'super_like' ? '🦴✨' : '✨🍖'}` 
            }
          });
          return;
        }
        
        // Check for server-side daily limit error
        if (data.error === 'daily_limit_reached') {
          setActionLoading(false);
          // Navigate to paywall
          router.push({
            pathname: '/paywall',
            params: { 
              message: `You've used all ${data.limit} free actions today. Upgrade for unlimited! 🐾` 
            }
          });
          return;
        }
        
        // Check if this resulted in a match
        if (data.match && data.match.matched) {
          setActionLoading(false);
          // Navigate to match screen with full pet details
          router.push({
            pathname: '/match',
            params: {
              matchType: data.match.match_type,
              matchId: data.match.match_id,
              myPetName: data.match.my_pet.name,
              myPetPhoto: data.match.my_pet.photo || '',
              theirPetName: data.match.their_pet.name,
              theirPetPhoto: data.match.their_pet.photo || '',
            }
          });
          return;
        }
        
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
        <ActivityIndicator size="large" color={COLORS.crimson} />
        <Text style={styles.loadingText}>Loading pets...</Text>
      </View>
    );
  }

  if (pets.length === 0 || currentIndex >= pets.length) {
    return (
      <View style={styles.emptyContainer}>
        <TouchableOpacity
          style={styles.backButtonEmpty}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
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
        <AnimatedActionButton
          onPress={() => handleAction('skip')}
          icon={FrisbeeIcon}
          label="Skip"
          disabled={actionLoading}
        />

        <AnimatedActionButton
          onPress={() => handleAction('like')}
          icon={TennisBallIcon}
          label="Like"
          disabled={actionLoading}
        />

        <AnimatedActionButton
          onPress={() => handleAction('super_like')}
          icon={BoneIcon}
          label="Super Like"
          disabled={actionLoading}
        />

        <AnimatedGoldenBoneButton
          onPress={() => handleAction('golden_bone')}
          icon={GoldenBoneIcon}
          label="Golden Bone"
          disabled={actionLoading}
          isAnimating={goldenBoneAnimating}
        />
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
          <ActivityIndicator size="large" color={COLORS.crimson} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: COLORS.crimson,
    borderRadius: 24,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  cardContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.charcoal,
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
    color: COLORS.white,
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
    color: COLORS.white,
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
    color: COLORS.white,
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
    color: COLORS.white,
  },
  petAge: {
    fontSize: 28,
    color: COLORS.white,
    opacity: 0.9,
  },
  verifiedBadge: {
    fontSize: 24,
    color: COLORS.gold,
    marginLeft: 8,
  },
  breed: {
    fontSize: 18,
    color: COLORS.white,
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
    borderColor: COLORS.crimson,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  temperamentText: {
    fontSize: 12,
    color: COLORS.white,
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
    backgroundColor: COLORS.white,
    width: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: COLORS.black,
  },
  actionButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  actionIcon: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 10,
    color: COLORS.white,
    marginTop: 4,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.charcoal,
  },
  closeButton: {
    fontSize: 28,
    color: COLORS.white,
    width: 40,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  modalContent: {
    flex: 1,
  },
  fullProfileImage: {
    width: width,
    height: 400,
    backgroundColor: COLORS.charcoal,
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
    backgroundColor: COLORS.crimson,
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
    borderBottomColor: COLORS.charcoal,
  },
  detailColumn: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.charcoal,
  },
  detailLabel: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.6,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '500',
  },
  actionLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldenBoneContainer: {
    position: 'relative',
    width: 72,
    height: 72,
  },
  goldenBoneGlow: {
    ...StyleSheet.absoluteFillObject,
    width: 90,
    height: 90,
    left: -9,
    top: -9,
    borderRadius: 45,
    backgroundColor: '#FFD700',
    opacity: 0,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
  },
  sparkle1: {
    top: -5,
    right: 0,
  },
  sparkle2: {
    bottom: -5,
    left: 0,
  },
});
