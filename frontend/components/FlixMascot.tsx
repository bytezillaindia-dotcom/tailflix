import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface FlixMascotProps {
  pose?: 'idle' | 'wagging' | 'running' | 'celebrating' | 'thinking';
  message?: string;
  size?: number;
}

export const FlixMascot: React.FC<FlixMascotProps> = ({
  pose = 'idle',
  message,
  size = 120,
}) => {
  const tailWag = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const runX = useRef(new Animated.Value(0)).current;
  const celebrateScale = useRef(new Animated.Value(1)).current;
  const bubbleScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    switch (pose) {
      case 'wagging':
        startWagging();
        break;
      case 'running':
        startRunning();
        break;
      case 'celebrating':
        startCelebrating();
        break;
      case 'thinking':
        startThinking();
        break;
      default:
        startIdle();
    }
  }, [pose]);

  const startIdle = () => {
    // Gentle breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -5,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startWagging = () => {
    // Tail wagging loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(tailWag, {
          toValue: -1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(tailWag, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -10,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startRunning = () => {
    // Quick tail wag
    Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(tailWag, {
          toValue: -1,
          duration: 100,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Running bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -15,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startCelebrating = () => {
    // Excited jumping
    Animated.loop(
      Animated.sequence([
        Animated.spring(celebrateScale, {
          toValue: 1.2,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(celebrateScale, {
          toValue: 1,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Fast tail wag
    Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, {
          toValue: 1,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.timing(tailWag, {
          toValue: -1,
          duration: 80,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startThinking = () => {
    // Slow gentle sway
    Animated.loop(
      Animated.sequence([
        Animated.timing(tailWag, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(tailWag, {
          toValue: -0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Show thought bubble
    Animated.spring(bubbleScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const tailRotate = tailWag.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-30deg', '0deg', '30deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.flixContainer,
          {
            transform: [
              { translateY: bounce },
              { rotate: tailRotate },
              { scale: celebrateScale },
            ],
          },
        ]}
      >
        <Text style={[styles.flix, { fontSize: size }]}>🐕</Text>
      </Animated.View>

      {/* Thought bubble for thinking pose */}
      {message && pose === 'thinking' && (
        <Animated.View
          style={[
            styles.thoughtBubble,
            {
              transform: [{ scale: bubbleScale }],
            },
          ]}
        >
          <View style={styles.bubbleTail} />
          <View style={styles.bubbleContent}>
            <Text style={styles.bubbleText}>{message}</Text>
          </View>
        </Animated.View>
      )}

      {/* Speech bubble for other messages */}
      {message && pose !== 'thinking' && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{message}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flixContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flix: {
    fontSize: 120,
  },
  thoughtBubble: {
    position: 'absolute',
    top: -80,
    right: -120,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  bubbleTail: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255, 255, 255, 0.95)',
  },
  bubbleContent: {
    alignItems: 'center',
  },
  bubbleText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  speechBubble: {
    position: 'absolute',
    top: -60,
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: 200,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
  speechText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '700',
    textAlign: 'center',
  },
});
