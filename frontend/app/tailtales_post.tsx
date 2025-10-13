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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function TailTalesPost() {
  const router = useRouter();
  const [petName, setPetName] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handlePost = async () => {
    if (!petName.trim() || !caption.trim()) {
      Alert.alert('Missing Fields', 'Please enter pet name and caption');
      return;
    }

    try {
      // Create new post
      const newPost = {
        id: Date.now(),
        pet_name: petName,
        owner: 'You',
        caption: caption,
        image_url:
          imageUrl ||
          'https://images.dog.ceo/breeds/poodle-toy/n02113624_1444.jpg',
        likes: 0,
        comments: [],
        timestamp: 'Just now',
        verified: false,
        liked_by_user: false,
      };

      // Load existing posts
      const postsStr = await AsyncStorage.getItem('tailtales_posts');
      const posts = postsStr ? JSON.parse(postsStr) : [];

      // Add new post to beginning
      posts.unshift(newPost);

      // Save updated posts
      await AsyncStorage.setItem('tailtales_posts', JSON.stringify(posts));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success!', 'Your TailTale has been posted! 🐾', [
        {
          text: 'View Feed',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error posting:', error);
      Alert.alert('Error', 'Failed to post your TailTale');
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
        <Text style={styles.headerTitle}>New TailTale</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>Pet Name *</Text>
          <TextInput
            style={styles.textInput}
            value={petName}
            onChangeText={setPetName}
            placeholder="e.g., Buddy 🐶"
            placeholderTextColor="#999"
          />

          <Text style={styles.inputLabel}>Caption *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={caption}
            onChangeText={setCaption}
            placeholder="Share your pet's story... 🐾"
            placeholderTextColor="#999"
            multiline
            numberOfLines={5}
          />

          <Text style={styles.inputLabel}>Photo URL (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://... (leave empty for random)"
            placeholderTextColor="#999"
          />

          <View style={styles.uploadNote}>
            <Text style={styles.uploadNoteIcon}>💡</Text>
            <Text style={styles.uploadNoteText}>
              Leave photo URL empty for a random cute pet image!
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
            <Text style={styles.postButtonText}>Post TailTale 🐾</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.crimson,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  formCard: {
    backgroundColor: '#FFF',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: COLORS.goldenBeige,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: FONT_SIZES.md,
    color: '#2C3E50',
    marginBottom: SPACING.sm,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  uploadNote: {
    flexDirection: 'row',
    backgroundColor: COLORS.creamLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.goldenBeige,
  },
  uploadNoteIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  uploadNoteText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: '#5A6C7D',
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
