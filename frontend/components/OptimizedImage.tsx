import React, { useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: any;
  contentFit?: 'cover' | 'contain' | 'fill';
  priority?: 'low' | 'normal' | 'high';
  placeholder?: string;
  onLoad?: () => void;
}

export default function OptimizedImage({
  source,
  style,
  contentFit = 'cover',
  priority = 'normal',
  placeholder,
  onLoad,
}: OptimizedImageProps) {
  const [loading, setLoading] = useState(true);
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.shimmer,
            { opacity: shimmerOpacity },
          ]}
        />
      )}
      <Image
        source={source}
        style={[StyleSheet.absoluteFill]}
        contentFit={contentFit}
        priority={priority}
        placeholder={placeholder}
        transition={200}
        cachePolicy="memory-disk"
        onLoad={() => {
          setLoading(false);
          onLoad?.();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F0F0F0',
  },
  shimmer: {
    backgroundColor: '#E0E0E0',
  },
});
