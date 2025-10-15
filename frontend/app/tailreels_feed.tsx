import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import SafeVideo from '../components/SafeVideo';
import VideoModal from '../components/VideoModal';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface Comment {
  user: string;
  text: string;
}

interface Reel {
  id: number;
  pet_name: string;
  owner: string;
  caption: string;
  video_url: string;
  likes: number;
  comments: Comment[];
  shares: number;
  timestamp: string;
  liked_by_user?: boolean;
}

const MOCK_REELS: Reel[] = [
  {
    id: 101,
    pet_name: 'Rocky 🐕',
    owner: 'John',
    caption: 'Tail wagging fun!',
    video_url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    likes: 120,
    comments: [],
    shares: 45,
    timestamp: '2h ago',
    liked_by_user: false,
  },
  {
    id: 102,
    pet_name: 'Luna 🐱',
    owner: 'Sarah',
    caption: 'Snack time POV 😂',
    video_url: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
    likes: 340,
    comments: [],
    shares: 78,
    timestamp: '5h ago',
    liked_by_user: false,
  },
];

export default function TailReelsFeed() {
  const router = useRouter();
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [newComment, setNewComment] = useState('');
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Reel | null>(null);
  const flashListRef = useRef<FlashList<Reel>>(null);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const reelsStr = await AsyncStorage.getItem('tailreels_videos');
      if (reelsStr) {
        setReels(JSON.parse(reelsStr));
      } else {
        setReels(MOCK_REELS);
        await AsyncStorage.setItem('tailreels_videos', JSON.stringify(MOCK_REELS));
      }
    } catch (error) {
      console.error('Error loading reels:', error);
      setReels(MOCK_REELS);
    }
  };

  const handleLike = async (reelId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedReels = reels.map((reel) => {
      if (reel.id === reelId) {
        const liked = !reel.liked_by_user;
        return {
          ...reel,
          likes: liked ? reel.likes + 1 : reel.likes - 1,
          liked_by_user: liked,
        };
      }
      return reel;
    });
    setReels(updatedReels);
    await AsyncStorage.setItem('tailreels_videos', JSON.stringify(updatedReels));
  };

  const handleComment = (reel: Reel) => {
    setSelectedReel(reel);
    setCommentsModalVisible(true);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedReel) return;

    const updatedReels = reels.map((reel) => {
      if (reel.id === selectedReel.id) {
        return {
          ...reel,
          comments: [...reel.comments, { user: 'You', text: newComment }],
        };
      }
      return reel;
    });

    setReels(updatedReels);
    await AsyncStorage.setItem('tailreels_videos', JSON.stringify(updatedReels));
    setNewComment('');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleShare = async (reelId: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedReels = reels.map((reel) => {
      if (reel.id === reelId) {
        return { ...reel, shares: reel.shares + 1 };
      }
      return reel;
    });
    setReels(updatedReels);
    await AsyncStorage.setItem('tailreels_videos', JSON.stringify(updatedReels));
    alert('Reel shared successfully! 🎉');
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / SCREEN_HEIGHT);
    if (index !== currentIndex && index >= 0 && index < reels.length) {
      setCurrentIndex(index);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TailReels 🎬</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/tailreels_upload');
          }}
          style={styles.uploadButton}
        >
          <Text style={styles.uploadButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Video Feed or Empty State */}
      {reels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyTitle}>No Reels Yet</Text>
          <Text style={styles.emptySubtitle}>
            Be the first to share your pet's moment!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/tailreels_upload')}
          >
            <LinearGradient
              colors={[COLORS.pawPink, COLORS.gold]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.emptyButtonGradient}
            >
              <Text style={styles.emptyButtonText}>Upload First Reel 🎥</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlashList
          ref={flashListRef}
          data={reels}
          renderItem={({ item: reel, index }) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              isActive={index === currentIndex}
              onLike={() => handleLike(reel.id)}
              onComment={() => handleComment(reel)}
              onShare={() => handleShare(reel.id)}
            />
          )}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          estimatedItemSize={SCREEN_HEIGHT}
          keyExtractor={(item) => String(item.id)}
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
          removeClippedSubviews={true}
        />
      )}

      {/* Floating Upload Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/tailreels_upload');
        }}
      >
        <LinearGradient
          colors={[COLORS.pawPink, COLORS.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.floatingButtonGradient}
        >
          <Text style={styles.floatingButtonIcon}>➕</Text>
        </LinearGradient>
      </TouchableOpacity>

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
              {selectedReel?.comments.map((comment, idx) => (
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

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onPlayPress: () => void;
}

function ReelCard({ reel, isActive, onLike, onComment, onShare }: ReelCardProps) {
  const likeScale = useRef(new Animated.Value(1)).current;

  const handleLikePress = () => {
    Animated.sequence([
      Animated.spring(likeScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(likeScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onLike();
  };

  return (
    <View style={styles.reelContainer}>
      {/* Thumbnail placeholder - stable, no crashes */}
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: `https://placekitten.com/${600 + reel.id}/${900 + reel.id}` }}
          style={styles.thumbnail}
        />
        <View style={styles.playButtonOverlay}>
          <Text style={styles.playButton}>▶️</Text>
        </View>
      </View>

      {/* Gradient Overlays */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={styles.topGradient}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomGradient}
      />

      {/* Top Info */}
      <View style={styles.topInfo}>
        <Text style={styles.petName}>{reel.pet_name}</Text>
        <Text style={styles.ownerName}>@{reel.owner}</Text>
        <Text style={styles.timestamp}>{reel.timestamp}</Text>
      </View>

      {/* Bottom Caption */}
      <View style={styles.bottomInfo}>
        <Text style={styles.caption}>{reel.caption}</Text>
      </View>

      {/* Right Actions */}
      <View style={styles.rightActions}>
        <TouchableOpacity onPress={handleLikePress} style={styles.actionButton}>
          <Animated.View style={{ transform: [{ scale: likeScale }] }}>
            <LinearGradient
              colors={reel.liked_by_user ? [COLORS.crimson, COLORS.crimson] : [COLORS.pawPink, COLORS.gold]}
              style={styles.actionCircle}
            >
              <Text style={styles.actionIcon}>🐾</Text>
            </LinearGradient>
          </Animated.View>
          <Text style={styles.actionLabel}>{reel.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onComment} style={styles.actionButton}>
          <LinearGradient
            colors={[COLORS.pawPink, COLORS.gold]}
            style={styles.actionCircle}
          >
            <Text style={styles.actionIcon}>💬</Text>
          </LinearGradient>
          <Text style={styles.actionLabel}>{reel.comments.length}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShare} style={styles.actionButton}>
          <LinearGradient
            colors={[COLORS.pawPink, COLORS.gold]}
            style={styles.actionCircle}
          >
            <Text style={styles.actionIcon}>🔗</Text>
          </LinearGradient>
          <Text style={styles.actionLabel}>{reel.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  uploadButton: {
    backgroundColor: COLORS.pawPink,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  reelContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  topInfo: {
    position: 'absolute',
    top: SPACING.xxl + 70,
    left: SPACING.lg,
  },
  petName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  ownerName: {
    fontSize: FONT_SIZES.md,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: FONT_SIZES.sm,
    color: '#FFF',
    opacity: 0.7,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: SPACING.xl + 10,
    left: SPACING.lg,
    right: 100,
  },
  caption: {
    fontSize: FONT_SIZES.md,
    color: '#FFF',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  rightActions: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SCREEN_HEIGHT * 0.15,
    gap: SPACING.lg,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
  floatingButton: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT * 0.12,
    left: SPACING.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: COLORS.pawPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingButtonIcon: {
    fontSize: 28,
    color: '#FFF',
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: '#999',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  emptyButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  emptyButtonGradient: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },
  emptyButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
  },
  // Video Error State
  videoErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  videoErrorIcon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  videoErrorText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.xs,
  },
  videoErrorSubtext: {
    fontSize: FONT_SIZES.sm,
    color: '#999',
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
  playButtonOverlay: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 157, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    fontSize: 40,
    marginLeft: 6,
  },
});
