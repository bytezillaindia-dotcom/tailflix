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
import { SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function TugMatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const matchId = params.matchId as string;
  const myOwnerName = params.myOwnerName as string || 'You';
  const myOwnerPhoto = params.myOwnerPhoto as string;
  const myPetPhoto = params.myPetPhoto as string;
  const theirOwnerName = params.theirOwnerName as string || 'Match';
  const theirOwnerPhoto = params.theirOwnerPhoto as string;
  const theirPetPhoto = params.theirPetPhoto as string;
  
  // Animation values
  const leftRopeX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const rightRopeX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const ropeOpacity = useRef(new Animated.Value(0)).current;
  const leashScale = useRef(new Animated.Value(0)).current;
  const leashGlow = useRef(new Animated.Value(0)).current;
  const leftAvatarX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const rightAvatarX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const avatarScale = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0.8)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startAnimation();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const startAnimation = () => {
    // Step 1: Ropes appear from sides (0.6s)
    Animated.parallel([
      Animated.timing(ropeOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(leftRopeX, {
        toValue: SCREEN_WIDTH / 2 - 60,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(rightRopeX, {
        toValue: -SCREEN_WIDTH / 2 + 60,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Step 2: Ropes form golden leash with hearts (0.8s)
      Animated.parallel([
        Animated.spring(leashScale, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(leashGlow, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(leashGlow, {
              toValue: 0.5,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();

      // Sparkles animation
      setTimeout(() => {
        [sparkle1, sparkle2, sparkle3].forEach((sparkle, index) => {
          setTimeout(() => {
            Animated.loop(
              Animated.sequence([
                Animated.timing(sparkle, {
                  toValue: 1,
                  duration: 600,
                  useNativeDriver: true,
                }),
                Animated.timing(sparkle, {
                  toValue: 0,
                  duration: 600,
                  useNativeDriver: true,
                }),
              ])
            ).start();
          }, index * 200);
        });
      }, 400);

      // Step 3: Avatars slide in (0.8s)
      setTimeout(() => {
        Animated.parallel([
          Animated.spring(leftAvatarX, {
            toValue: -80,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(rightAvatarX, {
            toValue: 80,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(avatarScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      }, 800);

      // Step 4: Text fades in (0.5s)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(textScale, {
            toValue: 1,
            tension: 40,
            friction: 6,
            useNativeDriver: true,
          }),
        ]).start();
      }, 1600);

      // Step 5: Buttons appear (0.3s)
      setTimeout(() => {
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2100);
    });
  };

  const handleStartChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (matchId) {
      router.push({
        pathname: '/chat',
        params: { matchId }
      });
    }
  };

  const handleKeepTugging = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/tug-yard');
  };

  const glowOpacity = leashGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  return (
    <LinearGradient 
      colors={['#000000', '#1a0000', '#2a0000']} 
      style={styles.container}
    >
      {/* Animated Ropes */}
      <Animated.View
        style={[
          styles.rope,
          styles.leftRope,
          {
            opacity: ropeOpacity,
            transform: [{ translateX: leftRopeX }],
          },
        ]}
      >
        <View style={styles.ropeSegment} />
      </Animated.View>

      <Animated.View
        style={[
          styles.rope,
          styles.rightRope,
          {
            opacity: ropeOpacity,
            transform: [{ translateX: rightRopeX }],
          },
        ]}
      >
        <View style={styles.ropeSegment} />
      </Animated.View>

      {/* Golden Leash with Hearts */}
      <Animated.View
        style={[
          styles.leashContainer,
          {
            opacity: glowOpacity,
            transform: [{ scale: leashScale }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#DAA520']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.leash}
        >
          <Text style={styles.heartEmoji}>❤️</Text>
          <Text style={styles.leashEmoji}>🪢</Text>
          <Text style={styles.heartEmoji}>❤️</Text>
        </LinearGradient>
      </Animated.View>

      {/* Sparkles */}
      <Animated.View style={[styles.sparkle, styles.sparkle1, { opacity: sparkle1 }]}>
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle2, { opacity: sparkle2 }]}>
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>
      <Animated.View style={[styles.sparkle, styles.sparkle3, { opacity: sparkle3 }]}>
        <Text style={styles.sparkleText}>✨</Text>
      </Animated.View>

      {/* Avatars Area */}
      <View style={styles.avatarsContainer}>
        {/* Left User (Me) */}
        <Animated.View
          style={[
            styles.avatarGroup,
            {
              transform: [
                { translateX: leftAvatarX },
                { scale: avatarScale },
              ],
            },
          ]}
        >
          <View style={styles.goldRing}>
            {myOwnerPhoto ? (
              <Image source={{ uri: myOwnerPhoto }} style={styles.ownerAvatar} />
            ) : (
              <Text style={styles.avatarPlaceholder}>👤</Text>
            )}
          </View>
          {myPetPhoto && (
            <View style={[styles.goldRing, styles.petAvatarContainer]}>
              <Image source={{ uri: myPetPhoto }} style={styles.petAvatar} />
            </View>
          )}
          <Text style={styles.avatarName}>{myOwnerName}</Text>
        </Animated.View>

        {/* Right User (Match) */}
        <Animated.View
          style={[
            styles.avatarGroup,
            {
              transform: [
                { translateX: rightAvatarX },
                { scale: avatarScale },
              ],
            },
          ]}
        >
          <View style={styles.goldRing}>
            {theirOwnerPhoto ? (
              <Image source={{ uri: theirOwnerPhoto }} style={styles.ownerAvatar} />
            ) : (
              <Text style={styles.avatarPlaceholder}>👤</Text>
            )}
          </View>
          {theirPetPhoto && (
            <View style={[styles.goldRing, styles.petAvatarContainer]}>
              <Image source={{ uri: theirPetPhoto }} style={styles.petAvatar} />
            </View>
          )}
          <Text style={styles.avatarName}>{theirOwnerName}</Text>
        </Animated.View>
      </View>

      {/* Match Text */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textOpacity,
            transform: [{ scale: textScale }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FFD700', '#DC143C', '#FFD700']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.textGradient}
        >
          <Text style={styles.matchTitle}>Two Hearts Found</Text>
          <Text style={styles.matchTitle}>Their Leash!</Text>
        </LinearGradient>
        <Text style={styles.matchSubtitle}>
          You and {theirOwnerName} tugged each other! 💕
        </Text>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          { opacity: buttonsOpacity },
        ]}
      >
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleStartChat}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#DC143C', '#8B0000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Start Chat 💌</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleKeepTugging}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Keep Tugging 🪢</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rope: {
    position: 'absolute',
    top: '25%',
  },
  leftRope: {
    left: 0,
  },
  rightRope: {
    right: 0,
  },
  ropeSegment: {
    width: 120,
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  leashContainer: {
    position: 'absolute',
    top: '23%',
  },
  leash: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 30,
    gap: SPACING.sm,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 12,
  },
  heartEmoji: {
    fontSize: 32,
  },
  leashEmoji: {
    fontSize: 40,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: '20%',
    left: '15%',
  },
  sparkle2: {
    top: '18%',
    right: '20%',
  },
  sparkle3: {
    top: '28%',
    left: '50%',
    marginLeft: -15,
  },
  sparkleText: {
    fontSize: 30,
  },
  avatarsContainer: {
    position: 'absolute',
    top: '35%',
    flexDirection: 'row',
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    gap: 40,
  },
  avatarGroup: {
    alignItems: 'center',
  },
  goldRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  ownerAvatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  petAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  petAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarPlaceholder: {
    fontSize: 50,
  },
  avatarName: {
    marginTop: SPACING.sm,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  textContainer: {
    position: 'absolute',
    top: '55%',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  textGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    lineHeight: 34,
  },
  matchSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: SPACING.md,
    lineHeight: 22,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.15,
    width: '100%',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  chatButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#DC143C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  buttonText: {
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
