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
  const [videoUrl, setVideoUrl] = useState('');

  const handlePost = async () => {
    if (!petName.trim() || !caption.trim()) {
      Alert.alert('Missing Fields', 'Please enter pet name and caption');
      return;
    }

    try {
      const newReel = {
        id: Date.now(),
        pet_name: petName,
        owner: 'You',
        caption: caption,
        video_url:
          videoUrl ||
          'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
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

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success!', 'Your TailReel has been posted! 🎬', [
        {
          text: 'View Feed',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error posting reel:', error);
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
        <Text style={styles.headerTitle}>Upload Reel</Text>
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

          <Text style={styles.inputLabel}>Pet Name *</Text>
          <TextInput
            style={styles.textInput}
            value={petName}
            onChangeText={setPetName}
            placeholder="e.g., Rocky 🐕"
            placeholderTextColor="#999"
          />

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

          <Text style={styles.inputLabel}>Video URL (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={videoUrl}
            onChangeText={setVideoUrl}
            placeholder="https://... (leave empty for sample)"
            placeholderTextColor="#999"
          />

          <View style={styles.uploadNote}>
            <Text style={styles.uploadNoteIcon}>💡</Text>
            <Text style={styles.uploadNoteText}>
              Leave video URL empty for a sample video. Real video upload coming soon!
            </Text>
          </View>
        </View>

        <TouchableOpacity onPress={handlePost} style={styles.postButton}>
          <LinearGradient
            colors={[COLORS.pawPink, COLORS.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.postButtonGradient}
          >
            <Text style={styles.postButtonText}>Post Reel 🎬</Text>
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
