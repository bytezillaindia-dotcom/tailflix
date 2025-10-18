import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

export default function SplashScreen() {
  const router = useRouter();
  const videoRef = useRef<Video>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // If video fails to load, navigate after 3 seconds
    const fallbackTimer = setTimeout(() => {
      if (videoError) {
        checkSessionAndNavigate();
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [videoError]);

  const checkSessionAndNavigate = async () => {
    try {
      // Check if user is logged in
      const sessionToken = await AsyncStorage.getItem('sessionToken');
      
      console.log('🔍 Session Token:', sessionToken ? 'EXISTS' : 'NOT FOUND');
      console.log('🚀 Navigating to:', sessionToken ? '/(tabs)/home' : '/login-premium');
      
      if (sessionToken) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/login-premium');
      }
    } catch (error) {
      console.error('Error checking session:', error);
      router.replace('/login-premium');
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      // Video finished playing
      if (status.didJustFinish) {
        console.log('✅ Video finished, navigating...');
        checkSessionAndNavigate();
      }
    } else if (status.error) {
      console.error('❌ Video error:', status.error);
      setVideoError(true);
    }
  };

  const handleVideoError = (error: string) => {
    console.error('❌ Video failed to load:', error);
    setVideoError(true);
  };

  return (
    <View style={styles.container}>
      {videoError ? (
        // Fallback: Black background
        <View style={styles.fallbackBackground} />
      ) : (
        // Video Splash Screen
        <Video
          ref={videoRef}
          source={{ uri: 'https://customer-assets.emergentagent.com/job_pawflix-preview/artifacts/3s7whpuf_TAILFLIX.mp4' }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping={false}
          isMuted={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onError={handleVideoError}
          useNativeControls={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  fallbackBackground: {
    flex: 1,
    backgroundColor: '#000',
  },
});
