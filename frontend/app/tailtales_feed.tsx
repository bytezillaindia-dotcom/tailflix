import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Comment {
  user: string;
  text: string;
}

interface Post {
  id: number;
  pet_name: string;
  owner: string;
  caption: string;
  image_url: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
  verified: boolean;
  liked_by_user?: boolean;
}

const MOCK_POSTS: Post[] = [
  {
    id: 701,
    pet_name: 'Buddy 🐶',
    owner: 'Alice',
    caption: 'First day at the park! 🌳🐾',
    image_url: 'https://images.dog.ceo/breeds/retriever-golden/n02099601_3004.jpg',
    likes: 120,
    comments: [
      { user: 'Max', text: 'So cute!! 🐾' },
      { user: 'Bella', text: 'Love the vibe 💖' },
    ],
    timestamp: '2h ago',
    verified: true,
  },
  {
    id: 702,
    pet_name: 'Milo 🐱',
    owner: 'Raj',
    caption: 'Lazy Sundays = best Sundays 😴',
    image_url: 'https://images.dog.ceo/breeds/poodle-standard/n02113799_2280.jpg',
    likes: 75,
    comments: [
      { user: 'Tommy', text: 'Mood 😂' },
      { user: 'Nina', text: 'Such a floof!' },
    ],
    timestamp: '5h ago',
    verified: false,
  },
  {
    id: 703,
    pet_name: 'Luna 🐕',
    owner: 'Sarah',
    caption: 'Beach day with my bestie! 🏖️',
    image_url: 'https://images.dog.ceo/breeds/labrador/n02099712_3503.jpg',
    likes: 200,
    comments: [{ user: 'John', text: 'Perfect day! 🌊' }],
    timestamp: '1d ago',
    verified: true,
  },
];

export default function TailTalesFeed() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const postsStr = await AsyncStorage.getItem('tailtales_posts');
      if (postsStr) {
        const savedPosts = JSON.parse(postsStr);
        setPosts(savedPosts);
      } else {
        setPosts(MOCK_POSTS);
        await AsyncStorage.setItem('tailtales_posts', JSON.stringify(MOCK_POSTS));
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts(MOCK_POSTS);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const liked = !post.liked_by_user;
        return {
          ...post,
          likes: liked ? post.likes + 1 : post.likes - 1,
          liked_by_user: liked,
        };
      }
      return post;
    });
    setPosts(updatedPosts);
    await AsyncStorage.setItem('tailtales_posts', JSON.stringify(updatedPosts));
  };

  const handleComment = (post: Post) => {
    setSelectedPost(post);
    setCommentsModalVisible(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    const updatedPosts = posts.map((post) => {
      if (post.id === selectedPost.id) {
        return {
          ...post,
          comments: [...post.comments, { user: 'You', text: newComment }],
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    await AsyncStorage.setItem('tailtales_posts', JSON.stringify(updatedPosts));
    setNewComment('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    alert('Post shared successfully! 🔗');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TailTales 🐾</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/tailtales_post');
          }}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+ Post</Text>
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlashList
        data={posts}
        renderItem={({ item, index }) => (
          <PostCard
            key={item.id}
            post={item}
            index={index}
            onLike={() => handleLike(item.id)}
            onComment={() => handleComment(item)}
            onShare={handleShare}
          />
        )}
        estimatedItemSize={400}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.pawPink}
          />
        }
        contentContainerStyle={styles.contentContainer}
      />

      {/* Comments Modal */}
      <Modal
        visible={commentsModalVisible}
        animationType="slide"
        transparent={true}
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
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
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
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

interface PostCardProps {
  post: Post;
  index: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
}

function PostCard({ post, index, onLike, onComment, onShare }: PostCardProps) {
  const scaleAnim = new Animated.Value(0);
  const likeScale = new Animated.Value(1);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 100,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleLikePress = () => {
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    onLike();
  };

  return (
    <Animated.View
      style={[
        styles.postCard,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <Text style={styles.petName}>{post.pet_name}</Text>
          <Text style={styles.ownerName}>by {post.owner}</Text>
        </View>
        <View style={styles.postHeaderRight}>
          {post.verified && <Text style={styles.verifiedBadge}>✓</Text>}
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
      </View>

      {/* Post Image */}
      <Image source={{ uri: post.image_url }} style={styles.postImage} />

      {/* Post Caption */}
      <Text style={styles.postCaption}>{post.caption}</Text>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity onPress={handleLikePress} style={styles.actionButton}>
          <Animated.Text
            style={[
              styles.actionIcon,
              { transform: [{ scale: likeScale }] },
              post.liked_by_user && styles.likedIcon,
            ]}
          >
            🐾
          </Animated.Text>
          <Text style={styles.actionLabel}>{post.likes} Likes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onComment} style={styles.actionButton}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>{post.comments.length} Comments</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShare} style={styles.actionButton}>
          <Text style={styles.actionIcon}>🔗</Text>
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
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
    color: '#2C3E50',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addButton: {
    backgroundColor: COLORS.pawPink,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  postCard: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.goldenBeige,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  postHeaderLeft: {
    flex: 1,
  },
  petName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  ownerName: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
  },
  postHeaderRight: {
    alignItems: 'flex-end',
  },
  verifiedBadge: {
    fontSize: 16,
    color: COLORS.gold,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    color: '#999',
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#F0F0F0',
  },
  postCaption: {
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: '#2C3E50',
    lineHeight: 22,
  },
  postActions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 20,
  },
  likedIcon: {
    color: COLORS.crimson,
  },
  actionLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#5A6C7D',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  commentsSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    maxHeight: '70%',
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  commentsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    fontSize: 24,
    color: '#7F8C8D',
  },
  commentsList: {
    maxHeight: 300,
    padding: SPACING.md,
  },
  commentItem: {
    marginBottom: SPACING.md,
  },
  commentUser: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  commentText: {
    fontSize: FONT_SIZES.sm,
    color: '#5A6C7D',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: SPACING.sm,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.sm,
    color: '#2C3E50',
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
