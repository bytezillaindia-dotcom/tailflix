import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Image } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

interface VideoModalProps {
  visible: boolean;
  videoUrl: string;
  caption: string;
  petName: string;
  onClose: () => void;
}

export default function VideoModal({ visible, videoUrl, caption, petName, onClose }: VideoModalProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  });

  React.useEffect(() => {
    if (visible && player) {
      setIsLoading(true);
      setHasError(false);
      player.play().catch((error) => {
        console.error('Video playback error:', error);
        setHasError(true);
      }).finally(() => {
        setIsLoading(false);
      });
    } else if (!visible && player) {
      player.pause();
    }
  }, [visible, player]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <View style={styles.closeCircle}>
            <Text style={styles.closeText}>✕</Text>
          </View>
        </TouchableOpacity>

        {/* Video Player or Error */}
        {hasError ? (
          <View style={styles.errorContainer}>
            <Image 
              source={{ uri: 'https://placekitten.com/600/900' }}
              style={styles.fallbackImage}
            />
            <View style={styles.errorBadge}>
              <Text style={styles.errorIcon}>🎬</Text>
              <Text style={styles.errorText}>Video failed to load</Text>
            </View>
            <TouchableOpacity style={styles.retryButton} onPress={onClose}>
              <Text style={styles.retryText}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.pawPink} />
              </View>
            )}
            <VideoView
              player={player}
              style={styles.video}
              contentFit="contain"
              nativeControls={true}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
          </>
        )}

        {/* Overlay Info */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.bottomGradient}
        >
          <Text style={styles.petName}>{petName}</Text>
          <Text style={styles.caption}>{caption}</Text>
        </LinearGradient>

        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'transparent']}
          style={styles.topGradient}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 100,
  },
  closeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: '#FFF',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.pawPink,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  retryText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  petName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.xs,
  },
  caption: {
    fontSize: FONT_SIZES.md,
    color: '#FFF',
    opacity: 0.9,
  },
});
