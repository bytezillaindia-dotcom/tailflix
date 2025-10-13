import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function TailReelsUpload() {
  const router = useRouter();
  const [petName, setPetName] = useState('');
  const [caption, setCaption] = useState('');
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant media library permissions to upload videos');
      return false;
    }
    return true;
  };

  const handlePickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedVideo = result.assets[0];
        setVideoUri(selectedVideo.uri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const handleRemoveVideo = () => {
    setVideoUri(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePost = async () => {
    if (!petName.trim() || !caption.trim()) {
      Alert.alert('Missing Fields', 'Please enter pet name and caption');
      return;
    }

    if (!videoUri) {
      Alert.alert('Missing Video', 'Please select a video to upload');
      return;
    }

    setIsUploading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Mock upload: In real app, upload to server here
      // For MVP, we'll use the local video URI or fallback to sample video
      const mockUploadedUrl = videoUri.startsWith('file://') 
        ? 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' 
        : videoUri;

      const newReel = {
        id: Date.now(),
        pet_name: petName,
        owner: 'You',
        caption: caption,
        video_url: mockUploadedUrl,
        likes: 0,
        comments: [],
        shares: 0,
        timestamp: 'Just now',
        liked_by_user: false,
      };

      const reelsStr = await AsyncStorage.getItem('tailreels_videos');
      const reels = reelsStr ? JSON.parse(reelsStr) : [];
      reels.unshift(newReel);
      await AsyncStorage.setItem('tailreels_videos', JSON.stringify(reels));

      setIsUploading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert('Success!', 'Your TailReel has been posted! 🎬', [
        {
          text: 'View Feed',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error posting reel:', error);
      setIsUploading(false);
      Alert.alert('Error', 'Failed to post your reel');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a TailReel</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconEmoji}>🎬</Text>
          </View>

          {/* Video Upload Section */}
          {!videoUri ? (
            <TouchableOpacity 
              style={styles.uploadBox} 
              onPress={handlePickVideo}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIconContainer}>
                <Text style={styles.uploadIcon}>📹</Text>
              </View>
              <Text style={styles.uploadTitle}>Upload Video</Text>
              <Text style={styles.uploadSubtitle}>Tap to select a video</Text>
              <Text style={styles.uploadNote}>MP4, MOV, WebM (max 60s)</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.videoPreviewContainer}>
              <Text style={styles.previewLabel}>Video Preview</Text>
              <View style={styles.videoPreview}>
                <Video
                  source={{ uri: videoUri }}
                  style={styles.videoPlayer}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
              </View>
              <TouchableOpacity 
                style={styles.removeVideoButton}
                onPress={handleRemoveVideo}
              >
                <Text style={styles.removeVideoText}>✕ Remove Video</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Pet Name Input */}
          <Text style={styles.inputLabel}>Pet Name *</Text>
          <TextInput
            style={styles.textInput}
            value={petName}
            onChangeText={setPetName}
            placeholder="e.g., Rocky 🐕"
            placeholderTextColor="#999"
          />

          {/* Caption Input */}
          <Text style={styles.inputLabel}>Caption *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={caption}
            onChangeText={setCaption}
            placeholder="What's happening in this reel? 🎬"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />

          <View style={styles.uploadNote}>
            <Text style={styles.uploadNoteIcon}>💡</Text>
            <Text style={styles.uploadNoteText}>
              Videos are stored locally for MVP. Real cloud upload coming soon!
            </Text>
          </View>
        </View>

        {/* Post Button */}
        <TouchableOpacity 
          onPress={handlePost} 
          style={styles.postButton}
          disabled={isUploading}
        >
          <LinearGradient
            colors={isUploading ? ['#999', '#666'] : [COLORS.pawPink, COLORS.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.postButtonGradient}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.postButtonText}>Post Reel 🐾</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: '#000',
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.pawPink,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconEmoji: {
    fontSize: 64,
  },
  formCard: {
    backgroundColor: '#1A1A1A',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.pawPink,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    fontSize: FONT_SIZES.md,
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  uploadNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.pawPink,
  },
  uploadNoteIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  uploadNoteText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: '#CCC',
    lineHeight: 20,
  },
  uploadBox: {
    backgroundColor: '#2A2A2A',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.pawPink,
    borderStyle: 'dashed',
    marginBottom: SPACING.md,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  uploadIcon: {
    fontSize: 40,
  },
  uploadTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.xs,
  },
  uploadSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: '#CCC',
    marginBottom: SPACING.xs,
  },
  uploadNote: {
    fontSize: FONT_SIZES.xs,
    color: '#999',
  },
  videoPreviewContainer: {
    marginBottom: SPACING.md,
  },
  previewLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  videoPreview: {
    width: '100%',
    height: 300,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: COLORS.pawPink,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  removeVideoButton: {
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  removeVideoText: {
    color: '#FF4444',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  postButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  postButtonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  postButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
