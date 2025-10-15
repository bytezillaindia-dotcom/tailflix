import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

interface ReceivedLike {
  id: string;
  action_type: string;
  created_at: string;
  seen?: boolean;
  sender: {
    user_id: string;
    contact: string;
    is_verified: boolean;
  };
  sender_pet: {
    id: string;
    name: string;
    breed: string;
    photo: string | null;
  };
  my_pet: {
    id: string;
    name: string;
  };
}

export default function LikesScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [allLikes, setAllLikes] = useState<ReceivedLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

  useEffect(() => {
    fetchReceivedLikes();
    markLikesAsSeen();
  }, [userId]);

  const fetchReceivedLikes = async () => {
    try {
      const url = userId
        ? `${BACKEND_URL}/api/likes/received?user_id=${userId}`
        : `${BACKEND_URL}/api/likes/received`;

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        // Combine all likes into one list, sorted by time
        const combined = [
          ...data.likes.map((like: any) => ({ ...like, category: 'like' })),
          ...data.super_likes.map((like: any) => ({ ...like, category: 'super_like' })),
          ...data.golden_bones.map((like: any) => ({ ...like, category: 'golden_bone' })),
        ];
        
        // Sort by created_at (most recent first)
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        setAllLikes(combined);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markLikesAsSeen = async () => {
    if (!userId) return;
    
    try {
      await fetch(`${BACKEND_URL}/api/likes/mark-seen?user_id=${userId}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error marking likes as seen:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchReceivedLikes();
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'like':
        return '🎾';
      case 'super_like':
        return '🍖';
      case 'golden_bone':
        return '🦴';
      default:
        return '❤️';
    }
  };

  const getActionText = (like: ReceivedLike) => {
    const petName = like.sender_pet.name;
    switch (like.action_type) {
      case 'like':
        return `${petName} liked you!`;
      case 'super_like':
        return `${petName} sent you a Super Like!`;
      case 'golden_bone':
        return `${petName} boosted you with Golden Bone!`;
      default:
        return `${petName} liked you!`;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const renderLikeItem = ({ item }: { item: ReceivedLike }) => {
    const isSpecial = item.action_type === 'super_like' || item.action_type === 'golden_bone';
    
    return (
      <TouchableOpacity
        style={[
          styles.likeCard,
          isSpecial && styles.specialLikeCard
        ]}
        activeOpacity={0.8}
      >
        {isSpecial && (
          <LinearGradient
            colors={['rgba(255, 215, 0, 0.2)', 'rgba(255, 165, 0, 0.1)']}
            style={StyleSheet.absoluteFill}
          />
        )}
        
        <View style={styles.likeContent}>
          {/* Pet Photo */}
          <View style={[styles.photoContainer, isSpecial && styles.specialPhotoContainer]}>
            {item.sender_pet.photo ? (
              <Image source={{ uri: item.sender_pet.photo }} style={styles.petPhoto} />
            ) : (
              <View style={[styles.petPhoto, styles.placeholderPhoto]}>
                <Text style={styles.placeholderText}>🐕</Text>
              </View>
            )}
            
            {isSpecial && (
              <View style={styles.specialBadge}>
                <Text style={styles.specialBadgeText}>⭐</Text>
              </View>
            )}
          </View>

          {/* Like Info */}
          <View style={styles.likeInfo}>
            <Text style={[styles.actionText, isSpecial && styles.specialActionText]}>
              {getActionIcon(item.action_type)} {getActionText(item)}
            </Text>
            <Text style={styles.breedText}>{item.sender_pet.breed}</Text>
            <Text style={styles.timeText}>{getTimeAgo(item.created_at)}</Text>
          </View>

          {/* Action Arrow */}
          <Text style={styles.arrowText}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💌</Text>
      <Text style={styles.emptyTitle}>No Likes Yet</Text>
      <Text style={styles.emptyText}>
        When someone likes your pet, you'll see it here!
      </Text>
      <TouchableOpacity
        style={styles.goBackButton}
        onPress={() => router.back()}
      >
        <Text style={styles.goBackButtonText}>Go to Fetch Yard</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#1a0000']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#1a0000']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Likes & Super Likes</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* List */}
      <FlatList
        data={allLikes}
        renderItem={renderLikeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          allLikes.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + 10,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    paddingVertical: SPACING.xs,
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSpacer: {
    width: 60,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  likeCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 16,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  specialLikeCard: {
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  likeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  photoContainer: {
    position: 'relative',
  },
  specialPhotoContainer: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  petPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
  },
  placeholderPhoto: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  specialBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  specialBadgeText: {
    fontSize: 12,
  },
  likeInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  specialActionText: {
    color: '#FFD700',
  },
  breedText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  arrowText: {
    fontSize: 28,
    color: 'rgba(255, 255, 255, 0.3)',
    fontWeight: '300',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  goBackButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  goBackButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
