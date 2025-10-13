import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { COLORS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DoubleFetchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const matchType = params.matchType as string || 'like';
  const matchId = params.matchId as string;
  const myPetName = params.myPetName as string || 'Your pet';
  const myPetPhoto = params.myPetPhoto as string;
  const theirPetName = params.theirPetName as string || 'Their pet';
  const theirPetPhoto = params.theirPetPhoto as string;
  
  // Animation values
  const leftPetX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const rightPetX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const leftTailWag = useRef(new Animated.Value(0)).current;
  const rightTailWag = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const confettiScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Play sound effect and haptic
    playMatchSound();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Step 1: Pets run toward each other
    Animated.parallel([
      Animated.spring(leftPetX, {
        toValue: -60,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(rightPetX, {
        toValue: 60,
        tension: 30,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Step 2: Tail wagging animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(leftTailWag, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(leftTailWag, {
            toValue: -1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(leftTailWag, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(rightTailWag, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rightTailWag, {
            toValue: -1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(rightTailWag, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Step 3: Heart puff appears
      Animated.parallel([
        Animated.spring(heartScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Step 4: Show "Double Fetch" text
        Animated.spring(textScale, {
          toValue: 1,
          tension: 40,
          friction: 6,
          useNativeDriver: true,
        }).start(() => {
          // Step 5: Fade in buttons
          Animated.timing(buttonsOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        });

        // Confetti animation for special matches
        if (matchType === 'golden_bone') {
          Animated.spring(confettiScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }).start();
        }
      });
    });
  }, []);

  const playMatchSound = async () => {
    try {
      // Mock sound - in production, load actual audio files
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../assets/sounds/match.mp3')
      // );
      // await sound.playAsync();
      console.log('🔊 Playing match sound (mocked)');
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleStartChat = () => {
    if (matchId) {
      router.push({
        pathname: '/chat',
        params: { matchId }
      });
    }
  };

  const handleKeepFetching = () => {
    router.push('/fetch-yard');
  };

  const leftTailRotate = leftTailWag.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const rightTailRotate = rightTailWag.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <LinearGradient colors={['#000000', '#1a0000']} style={styles.container}>
      {/* Confetti particles for golden_bone */}
      {matchType === 'golden_bone' && (
        <>
          {[...Array(12)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confettiParticle,
                {
                  left: `${(i * 8 + 10)}%`,
                  top: `${(i % 3) * 30 + 10}%`,
                  transform: [
                    { scale: confettiScale },
                    { rotate: `${i * 30}deg` }
                  ],
                },
              ]}
            >
              <Text style={styles.confettiText}>
                {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '💫'}
              </Text>
            </Animated.View>
          ))}
        </>
      )}

      {/* Main content */}
      <View style={styles.content}>
        {/* Pet Animation Area */}
        <View style={styles.animationArea}>
          {/* Left Pet */}
          <Animated.View
            style={[
              styles.petContainer,
              {
                transform: [
                  { translateX: leftPetX },
                  { rotate: leftTailRotate }
                ],
              },
            ]}
          >
            {myPetPhoto ? (
              <Image source={{ uri: myPetPhoto }} style={styles.petImage} />
            ) : (
              <Text style={styles.petEmoji}>🐕</Text>
            )}
            <Text style={styles.petName}>{myPetName}</Text>
          </Animated.View>

          {/* Heart Puff */}
          <Animated.View
            style={[
              styles.heartContainer,
              {
                opacity: heartOpacity,
                transform: [{ scale: heartScale }],
              },
            ]}
          >
            <Text style={styles.heart}>❤️</Text>
            <View style={styles.heartRing}>
              <View style={styles.heartRingInner} />
            </View>
          </Animated.View>

          {/* Right Pet */}
          <Animated.View
            style={[
              styles.petContainer,
              {
                transform: [
                  { translateX: rightPetX },
                  { rotate: rightTailRotate }
                ],
              },
            ]}
          >
            {theirPetPhoto ? (
              <Image source={{ uri: theirPetPhoto }} style={styles.petImage} />
            ) : (
              <Text style={styles.petEmoji}>🐕</Text>
            )}
            <Text style={styles.petName}>{theirPetName}</Text>
          </Animated.View>
        </View>

        {/* "Double Fetch" Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            { transform: [{ scale: textScale }] }
          ]}
        >
          <Text style={styles.title}>It's a Double Fetch!</Text>
          {matchType === 'golden_bone' && (
            <View style={styles.goldenBadge}>
              <Text style={styles.goldenBadgeText}>🦴 Golden Bone Match 🦴</Text>
            </View>
          )}
          <Text style={styles.subtitle}>
            {myPetName} and {theirPetName} both want to play!
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonsContainer,
            { opacity: buttonsOpacity }
          ]}
        >
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleStartChat}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#DC143C', '#FFD700']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.chatButtonText}>Start Chat 💌</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleKeepFetching}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Keep Fetching 🎾</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  confettiParticle: {
    position: 'absolute',
  },
  confettiText: {
    fontSize: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl * 2,
  },
  animationArea: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  petContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  petEmoji: {
    fontSize: 100,
  },
  petName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: SPACING.sm,
    maxWidth: 120,
    textAlign: 'center',
  },
  heartContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heart: {
    fontSize: 80,
  },
  heartRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'rgba(220, 20, 60, 0.5)',
  },
  heartRingInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    top: -13,
    left: -13,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: SPACING.md,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  goldenBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.md,
  },
  goldenBadgeText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: SPACING.md,
  },
  chatButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg + 4,
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    paddingVertical: SPACING.lg,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '600',
  },
});
