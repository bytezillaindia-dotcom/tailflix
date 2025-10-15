import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

interface SafeVideoProps {
  videoUrl: string;
  thumbUrl?: string;
  isVisible: boolean;
  onError?: () => void;
}

export default function SafeVideo({ videoUrl, thumbUrl, isVisible, onError }: SafeVideoProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Safe video URL with fallback
  const safeVideoUrl = videoUrl || 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4';
  
  // Initialize player only if no error
  const player = !hasError ? useVideoPlayer(safeVideoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  }) : null;

  useEffect(() => {
    // Load timeout - fallback to thumbnail after 3s
    if (isVisible && !hasError) {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, hasError]);

  useEffect(() => {
    if (player && !hasError) {
      try {
        if (isVisible) {
          player.play().catch((error) => {
            console.error('Playback error:', error);
            setHasError(true);
            onError?.();
          });
        } else {
          player.pause();
        }
      } catch (error) {
        console.error('Video control error:', error);
        setHasError(true);
        onError?.();
      }
    }
  }, [isVisible, player, hasError]);

  // Error fallback - show thumbnail
  if (hasError || !isVisible) {
    return (
      <View style={styles.thumbnailContainer}>
        {thumbUrl ? (
          <Image source={{ uri: thumbUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderIcon}>🎬</Text>
          </View>
        )}
        {hasError && (
          <View style={styles.errorBadge}>
            <Text style={styles.errorText}>Video unavailable</Text>
          </View>
        )}
      </View>
    );
  }

  // Render video
  return (
    <View style={styles.videoContainer}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B9D" />
        </View>
      )}
      {player && (
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  thumbnailContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 60,
  },
  errorBadge: {
    position: 'absolute',
    top: '50%',
    backgroundColor: 'rgba(255, 107, 157, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
