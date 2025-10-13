import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function MatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const matchType = params.matchType as string || 'like';
  const matchId = params.matchId as string;
  const myPetName = params.myPetName as string || 'Your pet';
  const myPetPhoto = params.myPetPhoto as string;
  const theirPetName = params.theirPetName as string || 'Their pet';
  const theirPetPhoto = params.theirPetPhoto as string;
  
  // Animation values
  const leftPetPosition = new Animated.Value(-width / 2);
  const rightPetPosition = new Animated.Value(width / 2);
  const heartScale = new Animated.Value(0);
  const confettiOpacity = new Animated.Value(0);
  
  useEffect(() => {
    // Trigger haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    // Animate pets running toward each other
    Animated.parallel([
      Animated.spring(leftPetPosition, {
        toValue: -20,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(rightPetPosition, {
        toValue: 20,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After pets meet, show heart
      Animated.spring(heartScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
      
      // Show confetti for golden_bone matches
      if (matchType === 'golden_bone') {
        Animated.timing(confettiOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    });
  }, []);
  
  const handleStartChat = () => {
    if (matchId) {
      router.push({
        pathname: '/chat',
        params: { matchId }
      });
    } else {
      alert('Chat feature coming soon!');
    }
  };

  return (
    <View style={styles.container}>
      {/* Gold sparkles/confetti overlay for golden_bone */}
      {matchType === 'golden_bone' && (
        <Animated.View style={[styles.confettiContainer, { opacity: confettiOpacity }]}>
          <Text style={[styles.confetti, { top: '10%', left: '20%' }]}>✨</Text>
          <Text style={[styles.confetti, { top: '15%', right: '25%' }]}>✨</Text>
          <Text style={[styles.confetti, { top: '30%', left: '15%' }]}>💫</Text>
          <Text style={[styles.confetti, { top: '35%', right: '20%' }]}>⭐</Text>
          <Text style={[styles.confetti, { top: '50%', left: '25%' }]}>✨</Text>
          <Text style={[styles.confetti, { top: '55%', right: '15%' }]}>💫</Text>
          <Text style={[styles.confetti, { top: '70%', left: '30%' }]}>⭐</Text>
          <Text style={[styles.confetti, { top: '75%', right: '30%' }]}>✨</Text>
        </Animated.View>
      )}
      
      {/* Main content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>It's a Match! 🐾</Text>
          {matchType === 'golden_bone' && (
            <View style={styles.goldenBadge}>
              <Text style={styles.goldenBadgeText}>✨ Golden Bone Match ✨</Text>
            </View>
          )}
          <Text style={styles.subtitle}>
            {myPetName} and {theirPetName} are ready for a playdate!
          </Text>
        </View>
        
        {/* Animation area with photos */}
        <View style={styles.animationContainer}>
          {/* Left pet (mine) */}
          <Animated.View 
            style={[
              styles.petContainer,
              { transform: [{ translateX: leftPetPosition }] }
            ]}
          >
            {myPetPhoto ? (
              <Image source={{ uri: myPetPhoto }} style={styles.petPhoto} />
            ) : (
              <Text style={styles.petIcon}>🐕</Text>
            )}
            <Text style={styles.petLabel}>{myPetName}</Text>
          </Animated.View>
          
          {/* Heart in the middle */}
          <Animated.View 
            style={[
              styles.heartContainer,
              { transform: [{ scale: heartScale }] }
            ]}
          >
            <Text style={styles.heart}>❤️</Text>
          </Animated.View>
          
          {/* Right pet (theirs) */}
          <Animated.View 
            style={[
              styles.petContainer,
              { transform: [{ translateX: rightPetPosition }] }
            ]}
          >
            {theirPetPhoto ? (
              <Image source={{ uri: theirPetPhoto }} style={styles.petPhoto} />
            ) : (
              <Text style={styles.petIcon}>🐕</Text>
            )}
            <Text style={styles.petLabel}>{theirPetName}</Text>
          </Animated.View>
        </View>
        
        {/* Info text */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {matchType === 'golden_bone' 
              ? 'A rare Golden Bone connection! This is extra special ✨'
              : 'You both liked each other! Start chatting to arrange a playdate 🎾'
            }
          </Text>
        </View>
        
        {/* Action buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleStartChat}
          >
            <Text style={styles.chatButtonText}>Start Chat 💬</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push('/pet-feed')}
          >
            <Text style={styles.continueButtonText}>Continue Browsing</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  confetti: {
    position: 'absolute',
    fontSize: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
    paddingBottom: SPACING.xxl,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl + 8,
    fontWeight: 'bold',
    color: COLORS.crimson,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  goldenBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  goldenBadgeText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 24,
  },
  animationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    position: 'relative',
  },
  petContainer: {
    alignItems: 'center',
    position: 'absolute',
  },
  petPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.crimson,
  },
  petIcon: {
    fontSize: 80,
  },
  petLabel: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.xs,
    maxWidth: 100,
    textAlign: 'center',
  },
  heartContainer: {
    position: 'absolute',
    zIndex: 10,
  },
  heart: {
    fontSize: 60,
  },
  infoContainer: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.lg,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.crimson,
  },
  infoText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonsContainer: {
    gap: SPACING.md,
  },
  chatButton: {
    backgroundColor: COLORS.crimson,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
