import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

// SVG icon definitions
const TENNIS_BALL_SVG = `
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="ballGrad" cx="40%" cy="40%">
      <stop offset="0%" style="stop-color:#B4E657;stop-opacity:1" />
      <stop offset="60%" style="stop-color:#9ACD32;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7CAD28;stop-opacity:1" />
    </radialGradient>
    <filter id="ballShadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="2"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="32" cy="32" r="28" fill="url(#ballGrad)" filter="url(#ballShadow)"/>
  <ellipse cx="38" cy="26" rx="10" ry="12" fill="white" opacity="0.3"/>
  <path d="M 12 20 Q 32 8, 52 20" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M 12 44 Q 32 56, 52 44" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M 10 22 Q 32 10, 54 22" stroke="white" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>
  <path d="M 10 42 Q 32 54, 54 42" stroke="white" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>
</svg>
`;

const FRISBEE_SVG = `
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="frisbeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FF4757;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#FF8C94;stop-opacity:1" />
    </linearGradient>
    <filter id="frisbeeShadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="2"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="32" cy="32" rx="26" ry="8" fill="url(#frisbeeGrad)" filter="url(#frisbeeShadow)"/>
  <ellipse cx="32" cy="32" rx="20" ry="6" fill="none" stroke="#FF4757" stroke-width="1.5" opacity="0.5"/>
  <ellipse cx="32" cy="32" rx="14" ry="4" fill="none" stroke="#FFB6C1" stroke-width="1" opacity="0.7"/>
  <ellipse cx="32" cy="30" rx="22" ry="4" fill="white" opacity="0.4"/>
  <ellipse cx="32" cy="34" rx="22" ry="3" fill="black" opacity="0.15"/>
</svg>
`;

const BONE_SVG = `
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="boneGrad">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="60%" style="stop-color:#F5F5F5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E8E8E8;stop-opacity:1" />
    </radialGradient>
    <filter id="boneShadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
      <feOffset dx="0" dy="2"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <circle cx="14" cy="26" r="7" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
  <circle cx="14" cy="38" r="7" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
  <circle cx="50" cy="26" r="7" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
  <circle cx="50" cy="38" r="7" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
  <rect x="14" y="28" width="36" height="8" rx="4" fill="url(#boneGrad)" filter="url(#boneShadow)"/>
  <ellipse cx="32" cy="30" rx="14" ry="2" fill="white" opacity="0.5"/>
</svg>
`;

const GOLDEN_BONE_SVG = `
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFD700;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#FFA500;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
    </linearGradient>
    <filter id="goldGlow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
      <feOffset dx="0" dy="0"/>
      <feFlood flood-color="#FFD700" flood-opacity="0.5"/>
      <feComposite in2="offsetblur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <g filter="url(#goldGlow)">
    <circle cx="14" cy="26" r="7" fill="url(#goldGrad)"/>
    <circle cx="14" cy="38" r="7" fill="url(#goldGrad)"/>
    <circle cx="50" cy="26" r="7" fill="url(#goldGrad)"/>
    <circle cx="50" cy="38" r="7" fill="url(#goldGrad)"/>
    <rect x="14" y="28" width="36" height="8" rx="4" fill="url(#goldGrad)"/>
  </g>
  <ellipse cx="32" cy="30" rx="14" ry="2" fill="#FFED4E" opacity="0.6"/>
</svg>
`;

interface ActionIconProps {
  type: 'tennis-ball' | 'frisbee' | 'bone' | 'golden-bone';
  size?: number;
  onPress?: () => void;
  glowTrigger?: Animated.Value;
  accessibilityLabel?: string;
}

export const ActionIcon: React.FC<ActionIconProps> = ({
  type,
  size = 56,
  onPress,
  glowTrigger,
  accessibilityLabel,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Golden bone sparkle loop (every 3 seconds)
  useEffect(() => {
    if (type === 'golden-bone') {
      const sparkleLoop = Animated.loop(
        Animated.sequence([
          Animated.delay(3000),
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      sparkleLoop.start();
      return () => sparkleLoop.stop();
    }
  }, [type]);

  // Listen to glow trigger for button press animation
  useEffect(() => {
    if (glowTrigger) {
      const listener = glowTrigger.addListener(({ value }) => {
        if (value > 0) {
          Animated.parallel([
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 0.96,
                duration: 75,
                useNativeDriver: true,
              }),
              Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
              }),
            ]),
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
            ]),
          ]).start();

          // Success animations based on type
          if (type === 'tennis-ball') {
            // Tiny toss arc
            Animated.sequence([
              Animated.timing(rotateAnim, {
                toValue: -0.2,
                duration: 200,
                useNativeDriver: true,
              }),
              Animated.spring(rotateAnim, {
                toValue: 0,
                tension: 100,
                useNativeDriver: true,
              }),
            ]).start();
          } else if (type === 'frisbee') {
            // Quick side swipe
            Animated.sequence([
              Animated.timing(rotateAnim, {
                toValue: 0.3,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.spring(rotateAnim, {
                toValue: 0,
                tension: 150,
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
      });

      return () => glowTrigger.removeListener(listener);
    }
  }, [glowTrigger]);

  const getSvg = () => {
    switch (type) {
      case 'tennis-ball':
        return TENNIS_BALL_SVG;
      case 'frisbee':
        return FRISBEE_SVG;
      case 'bone':
        return BONE_SVG;
      case 'golden-bone':
        return GOLDEN_BONE_SVG;
      default:
        return TENNIS_BALL_SVG;
    }
  };

  const getGlowColor = () => {
    switch (type) {
      case 'tennis-ball':
        return 'rgba(154, 205, 50, 0.6)';
      case 'frisbee':
        return 'rgba(255, 107, 107, 0.6)';
      case 'bone':
        return 'rgba(220, 20, 60, 0.6)';
      case 'golden-bone':
        return 'rgba(255, 215, 0, 0.6)';
      default:
        return 'rgba(255, 255, 255, 0.3)';
    }
  };

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0, 0, 0, 0)', getGlowColor()],
  });

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-20deg', '20deg'],
  });

  return (
    <View style={styles.container} accessibilityLabel={accessibilityLabel} accessible>
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
            backgroundColor: glowColor,
          },
        ]}
      />

      {/* Icon */}
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { rotate }],
        }}
      >
        <SvgXml xml={getSvg()} width={size} height={size} />
      </Animated.View>

      {/* Golden bone sparkles */}
      {type === 'golden-bone' && (
        <>
          <Animated.View
            style={[
              styles.sparkle,
              {
                opacity: sparkleOpacity,
                top: 4,
                right: 4,
              },
            ]}
          >
            <View style={[styles.sparkleShape, { backgroundColor: '#FFD700' }]} />
          </Animated.View>
          <Animated.View
            style={[
              styles.sparkle,
              {
                opacity: sparkleOpacity,
                top: 12,
                right: -2,
              },
            ]}
          >
            <View style={[styles.sparkleShape, { backgroundColor: '#FFA500', width: 6, height: 6 }]} />
          </Animated.View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowRing: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleShape: {
    width: 8,
    height: 8,
    transform: [{ rotate: '45deg' }],
  },
});
