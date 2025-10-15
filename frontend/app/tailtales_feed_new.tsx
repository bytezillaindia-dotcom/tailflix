import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Story {
  id: string;
  avatar: string;
  name: string;
}

interface Post {
  id: string;
  avatar: string;
  pet_name: string;
  timeAgo: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  caption: string;
  comments: string[];
  likes: number;
  isLiked: boolean;
}

// Mock Data
const MOCK_STORIES: Story[] = [
  { id: 'S01', avatar: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg', name: 'Buddy 🐕' },
  { id: 'S02', avatar: 'https://images.dog.ceo/breeds/husky/n02110185_10273.jpg', name: 'Luna 🐈' },
  { id: 'S03', avatar: 'https://images.dog.ceo/breeds/bulldog-french/n02108915_5306.jpg', name: 'Max 🐶' },
  { id: 'S04', avatar: 'https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg', name: 'Charlie 🦮' },
];

const MOCK_POSTS: Post[] = [
  {
    id: 'P01',
    avatar: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg',
    pet_name: 'Buddy 🐕',
    timeAgo: '2h ago',
    mediaType: 'image',
    mediaUrl: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg',
    caption: "Buddy's first walk today 🐾❤️",
    comments: ['So cute!', 'Love this 🐶'],
    likes: 145,
    isLiked: false,
  },
  {
    id: 'P02',
    avatar: 'https://images.dog.ceo/breeds/husky/n02110185_10273.jpg',
    pet_name: 'Luna 🐈',
    timeAgo: '5h ago',
    mediaType: 'image',
    mediaUrl: 'https://images.dog.ceo/breeds/husky/n02110185_10273.jpg',
    caption: 'Luna caught red-handed stealing snacks 😂',
    comments: ['Hahaha naughty cat!', '😂❤️'],
    likes: 89,
    isLiked: false,
  },
  {
    id: 'P03',
    avatar: 'https://images.dog.ceo/breeds/bulldog-french/n02108915_5306.jpg',
    pet_name: 'Max 🐶',
    timeAgo: '1d ago',
    mediaType: 'image',
    mediaUrl: 'https://images.dog.ceo/breeds/bulldog-french/n02108915_5306.jpg',
    caption: 'Lazy Sunday vibes 😴',
    comments: ['Me every Sunday 😂'],
    likes: 234,
    isLiked: true,
  },
];

export default function TailTalesFeed() {
  const router = useRouter();
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');

  const handleLike = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleComment = (post: Post) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedPost(post);
    setCommentsModalVisible(true);
  };

  const handleShare = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Share', 'Post shared!');
  };

  const handleSave = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Saved', 'Post saved to your collection!');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Comment Added', newComment);
    setNewComment('');
    setCommentsModalVisible(false);
  };

  const handleOpenStory = (storyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Story', `Opening story ${storyId}`);
  };

  const renderStory = (story: Story) => (
    <TouchableOpacity
      key={story.id}
      style={styles.storyItem}
      onPress={() => handleOpenStory(story.id)}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.storyGradient}
      >
        <View style={styles.storyImageBorder}>
          <Image source={{ uri: story.avatar }} style={styles.storyImage} />
        </View>
      </LinearGradient>
      <Text style={styles.storyName} numberOfLines={1}>
        {story.name}
      </Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item: post }: { item: Post }) => (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
        <View style={styles.postHeaderText}>
          <Text style={styles.postPetName}>{post.pet_name}</Text>
          <Text style={styles.postTimeAgo}>{post.timeAgo}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.postMoreIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Post Media */}
      <Image source={{ uri: post.mediaUrl }} style={styles.postMedia} />

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={() => handleLike(post.id)} style={styles.actionButton}>
            <Text style={[styles.actionIcon, post.isLiked && styles.actionIconLiked]}>
              {post.isLiked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleComment(post)} style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleShare(post.id)} style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔄</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => handleSave(post.id)} style={styles.actionButton}>
          <Text style={styles.actionIcon}>🐾</Text>
        </TouchableOpacity>
      </View>

      {/* Post Likes */}
      <Text style={styles.postLikes}>{post.likes} likes</Text>

      {/* Post Caption */}
      <View style={styles.postCaptionContainer}>
        <Text style={styles.postCaption}>
          <Text style={styles.postCaptionUser}>{post.pet_name}</Text> {post.caption}
        </Text>
      </View>

      {/* Comments Preview */}
      {post.comments.length > 0 && (
        <TouchableOpacity onPress={() => handleComment(post)}>
          <Text style={styles.postViewComments}>
            View all {post.comments.length} comments
          </Text>
          {post.comments.slice(0, 2).map((comment, idx) => (
            <Text key={idx} style={styles.postCommentPreview}>
              <Text style={styles.postCommentUser}>user{idx + 1}</Text> {comment}
            </Text>
          ))}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.storiesContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {stories.length > 0 ? (
          stories.map((story) => renderStory(story))
        ) : (
          <Text style={styles.emptyStories}>No stories yet 🐾</Text>
        )}
      </ScrollView>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🐾</Text>
      <Text style={styles.emptyTitle}>No TailTales yet</Text>
      <Text style={styles.emptyText}>Share your first tale!</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TailTales 📸</Text>
        <TouchableOpacity onPress={() => router.push('/tailtales_post' as any)}>
          <Text style={styles.addButton}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Stories Header */}
      {renderHeader()}

      {/* Feed */}
      {posts.length > 0 ? (
        <FlashList
          data={posts}
          renderItem={renderPost}
          estimatedItemSize={600}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmpty()
      )}

      {/* Comments Modal */}
      <Modal
        visible={commentsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCommentsModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCommentsModalVisible(false)}
          />
          <View style={styles.commentsSheet}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments 💬</Text>
              <TouchableOpacity onPress={() => setCommentsModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsList}>
              {selectedPost?.comments.map((comment, idx) => (
                <View key={idx} style={styles.commentItem}>
                  <Text style={styles.commentUser}>user{idx + 1}</Text>
                  <Text style={styles.commentText}>{comment}</Text>
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
              <TouchableOpacity onPress={handleAddComment} style={styles.commentSubmitButton}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.commentSubmitGradient}
                >
                  <Text style={styles.commentSubmitText}>Post</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + 10,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    fontSize: 28,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    fontSize: 32,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  storiesContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: COLORS.background,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
    width: 70,
  },
  storyGradient: {
    width: 66,
    height: 66,
    borderRadius: 33,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  storyImageBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  storyName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyStories: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    paddingHorizontal: SPACING.lg,
  },
  postCard: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  postHeaderText: {
    flex: 1,
  },
  postPetName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  postTimeAgo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
  },
  postMoreIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  postMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#F0F0F0',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  postActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: SPACING.md,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionIconLiked: {
    transform: [{ scale: 1.1 }],
  },
  postLikes: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  postCaptionContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  postCaption: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  postCaptionUser: {
    fontWeight: 'bold',
  },
  postViewComments: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  postCommentPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: 4,
  },
  postCommentUser: {
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentsSheet: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: '70%',
    paddingBottom: SPACING.xl,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  commentsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    fontSize: 28,
    color: COLORS.gray,
  },
  commentsList: {
    maxHeight: 300,
    paddingHorizontal: SPACING.lg,
  },
  commentItem: {
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  commentUser: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  commentText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  commentSubmitButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  commentSubmitGradient: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  commentSubmitText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
