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
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

interface ReceivedLike {
  id: string;
  action_type: string;
  created_at: string;
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
  const [likes, setLikes] = useState<ReceivedLike[]>([]);
  const [superLikes, setSuperLikes] = useState<ReceivedLike[]>([]);
  const [goldenBones, setGoldenBones] = useState<ReceivedLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'super'>('all');

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchReceivedLikes();
  }, []);

  const fetchReceivedLikes = async () => {
    try {
      const url = userId 
        ? `${BACKEND_URL}/api/likes/received?user_id=${userId}`
        : `${BACKEND_URL}/api/likes/received`;
        
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setLikes(data.likes || []);
        setSuperLikes(data.super_likes || []);
        setGoldenBones(data.golden_bones || []);
      }
    } catch (error) {
      console.error('Error fetching received likes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReceivedLikes();
  };

  const handleLikeBack = (senderPetId: string) => {
    // Navigate to pet feed and auto-like that pet
    router.push({
      pathname: '/pet-feed',
      params: { autoLikePetId: senderPetId }
    });
  };

  const renderLikeItem = ({ item }: { item: ReceivedLike }) => {
    const isSpecial = item.action_type === 'super_like' || item.action_type === 'golden_bone';
    const icon = item.action_type === 'golden_bone' ? '✨🍖' : 
                 item.action_type === 'super_like' ? '🦴' : '❤️';
    
    return (
      <TouchableOpacity
        style={[
          styles.likeCard,
          isSpecial && styles.specialLikeCard
        ]}
        onPress={() => handleLikeBack(item.sender_pet.id)}
      >
        {/* Pet Photo */}
        <View style={styles.petPhotoContainer}>
          {item.sender_pet.photo ? (
            <Image
              source={{ uri: item.sender_pet.photo }}
              style={styles.petPhoto}
            />
          ) : (
            <View style={styles.petPhotoPlaceholder}>
              <Text style={styles.petPhotoPlaceholderText}>🐾</Text>
            </View>
          )}
        </View>

        {/* Like Info */}
        <View style={styles.likeInfo}>
          <View style={styles.likeHeader}>
            <Text style={[styles.petName, isSpecial && styles.specialText]}>
              {item.sender_pet.name}
            </Text>
            <Text style={styles.likeIcon}>{icon}</Text>
          </View>
          
          {isSpecial && (
            <View style={styles.specialBadge}>
              <Text style={styles.specialBadgeText}>
                {item.action_type === 'golden_bone' ? '✨ Golden Bone' : '🦴 Super Like'}
              </Text>
            </View>
          )}
          
          <Text style={styles.petBreed}>{item.sender_pet.breed}</Text>
          <Text style={styles.likeSubtext}>
            Liked your pet: {item.my_pet.name}
          </Text>
          
          {item.sender.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.likeBackButton, isSpecial && styles.specialLikeBackButton]}
          onPress={() => handleLikeBack(item.sender_pet.id)}
        >
          <Text style={[styles.likeBackText, isSpecial && styles.specialLikeBackText]}>
            ❤️
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const allLikes = [...goldenBones, ...superLikes, ...likes];
  const specialLikes = [...goldenBones, ...superLikes];
  const displayLikes = activeTab === 'all' ? allLikes : specialLikes;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.crimson} />
        <Text style={styles.loadingText}>Loading likes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Likes</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All ({allLikes.length})
          </Text>
          {likes.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>🔴</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'super' && styles.activeTab]}
          onPress={() => setActiveTab('super')}
        >
          <Text style={[styles.tabText, activeTab === 'super' && styles.activeTabText]}>
            Special ({specialLikes.length})
          </Text>
          {specialLikes.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>⭐</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Likes List */}
      {displayLikes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💔</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'all' 
              ? 'No likes yet. Keep swiping!' 
              : 'No special likes yet'}
          </Text>
          <TouchableOpacity
            style={styles.goToFeedButton}
            onPress={() => router.push('/pet-feed')}
          >
            <Text style={styles.goToFeedButtonText}>Go to Pet Feed</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={displayLikes}
          renderItem={renderLikeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.crimson}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.black,
  },
  loadingText: {
    color: COLORS.white,
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkGray,
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
    color: COLORS.white,
  },
  headerSpacer: {
    width: 60,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 8,
    backgroundColor: COLORS.charcoal,
  },
  activeTab: {
    backgroundColor: COLORS.crimson,
  },
  tabText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.white,
  },
  tabBadge: {
    marginLeft: SPACING.xs,
  },
  tabBadgeText: {
    fontSize: 12,
  },
  listContent: {
    padding: SPACING.lg,
  },
  likeCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.charcoal,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  specialLikeCard: {
    borderColor: COLORS.gold,
    borderWidth: 2,
    backgroundColor: '#1a1200',
  },
  petPhotoContainer: {
    marginRight: SPACING.md,
  },
  petPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: COLORS.crimson,
  },
  petPhotoPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petPhotoPlaceholderText: {
    fontSize: 30,
  },
  likeInfo: {
    flex: 1,
  },
  likeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  petName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginRight: SPACING.xs,
  },
  specialText: {
    color: COLORS.gold,
  },
  likeIcon: {
    fontSize: 16,
  },
  specialBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  specialBadgeText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  petBreed: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  likeSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.7,
  },
  verifiedBadge: {
    backgroundColor: COLORS.crimson,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  verifiedText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  likeBackButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.crimson,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialLikeBackButton: {
    backgroundColor: COLORS.gold,
  },
  likeBackText: {
    fontSize: 24,
  },
  specialLikeBackText: {
    fontSize: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  goToFeedButton: {
    backgroundColor: COLORS.crimson,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  goToFeedButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
