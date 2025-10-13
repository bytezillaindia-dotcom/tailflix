import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function TailReelsComments() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    { user: 'Arjun', text: 'Smart boy!' },
    { user: 'Lily', text: 'This is so cute 😍' },
  ]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    setComments([...comments, { user: 'You', text: newComment }]);
    setNewComment('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments 💬</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {comments.map((comment, idx) => (
          <View key={idx} style={styles.commentItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{comment.user[0]}</Text>
            </View>
            <View style={styles.commentContent}>
              <Text style={styles.commentUser}>{comment.user}</Text>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.commentInputContainer}>
        <TextInput
          style={styles.commentInput}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          onPress={handleAddComment}
          style={styles.commentSubmitButton}
        >
          <LinearGradient
            colors={[COLORS.pawPink, COLORS.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.commentSubmitGradient}
          >
            <Text style={styles.commentSubmitText}>Post</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    backgroundColor: '#1A1A1A',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.pawPink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: '#FFF',
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentUser: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  commentText: {
    fontSize: FONT_SIZES.sm,
    color: '#CCC',
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    backgroundColor: '#000',
    gap: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.sm,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  commentSubmitButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  commentSubmitGradient: {
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.sm + 2,
  },
  commentSubmitText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
