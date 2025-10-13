import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Match {
  id: string;
  match_id: string;
  name: string;
  pet_name: string;
  photo: string;
  source: 'fetch_yard' | 'tug_yard'; // 'fetch_yard' for pet dating, 'tug_yard' for owner dating
  matched_at: string;
  last_message?: string;
  unread_count?: number;
}

export default function MatchesScreen() {
  const router = useRouter();
  const { userId } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    fetchMatches();
  }, [userId]);

  useEffect(() => {
    if (matches.length > 0) {
      animateCardsIn();
    }
  }, [matches]);

  const fetchMatches = async () => {
    try {
      // Mock data for now - in production, call backend API
      const mockMatches: Match[] = [
        {
          id: '1',
          match_id: 'match-1',
          name: 'Sarah & Luna',
          pet_name: 'Luna',
          photo: 'https://images.dog.ceo/breeds/husky/n02110185_10047.jpg',
          source: 'fetch_yard',
          matched_at: '2 hours ago',
          last_message: 'Hey! Luna would love to meet...',
          unread_count: 2,
        },
        {
          id: '2',
          match_id: 'match-2',
          name: 'Michael',
          pet_name: 'Max',
          photo: 'https://i.pravatar.cc/400?img=12',
          source: 'tug_yard',
          matched_at: '1 day ago',
          last_message: 'Coffee and dog park this weekend?',
          unread_count: 0,
        },
        {
          id: '3',
          match_id: 'match-3',
          name: 'Emma & Charlie',
          pet_name: 'Charlie',
          photo: 'https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg',
          source: 'fetch_yard',
          matched_at: '3 days ago',
          last_message: 'Charlie loves playing fetch too!',
          unread_count: 1,
        },
        {
          id: '4',
          match_id: 'match-4',
          name: 'Jessica',
          pet_name: 'Bella',
          photo: 'https://i.pravatar.cc/400?img=47',
          source: 'tug_yard',
          matched_at: '1 week ago',
        },
      ];

      setMatches(mockMatches);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setLoading(false);
    }
  };

  const animateCardsIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMatchPress = (match: Match) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to chat with this match
    router.push({
      pathname: '/chat',
      params: { matchId: match.match_id },
    });
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FFF8E7', '#FFE4B5', '#FFDAB9']} style={styles.container}>
        <ActivityIndicator size="large" color="#FFB6C1" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFF8E7', '#FFE4B5', '#FFDAB9']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Matches ✨</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Matches List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {matches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyTitle}>No matches yet</Text>
            <Text style={styles.emptyText}>
              Keep swiping to find your perfect match!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => router.push('/home-premium')}
            >
              <Text style={styles.browseButtonText}>Start Browsing</Text>
            </TouchableOpacity>
          </View>
        ) : (
          matches.map((match, index) => (
            <Animated.View
              key={match.id}
              style={[
                styles.matchCardWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleMatchPress(match)}
              >
                <LinearGradient
                  colors={['#FFDAB9', '#FFF8E7']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.matchCard}
                >
                  {/* Gold glow border effect */}
                  <View style={styles.cardGlowBorder} />

                  {/* Left side: Photo */}
                  <View style={styles.photoContainer}>
                    <Image source={{ uri: match.photo }} style={styles.matchPhoto} />
                    {match.unread_count && match.unread_count > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{match.unread_count}</Text>
                      </View>
                    )}
                  </View>

                  {/* Right side: Info */}
                  <View style={styles.matchInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.matchName}>{match.name}</Text>
                      {match.source === 'tug_yard' && (
                        <Text style={styles.petNameSubtext}> & {match.pet_name}</Text>
                      )}
                    </View>

                    {/* Source Badge */}
                    <View
                      style={[
                        styles.sourceBadge,
                        match.source === 'fetch_yard'
                          ? styles.fetchBadge
                          : styles.tugBadge,
                      ]}
                    >
                      <Text style={styles.sourceBadgeText}>
                        {match.source === 'fetch_yard' ? '🎾 Fetch Yard' : '🪢 Tug Yard'}
                      </Text>
                    </View>

                    {/* Last Message */}
                    {match.last_message && (
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {match.last_message}
                      </Text>
                    )}

                    {/* Matched Time */}
                    <Text style={styles.matchedTime}>{match.matched_at}</Text>
                  </View>

                  {/* Chevron */}
                  <View style={styles.chevronContainer}>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerSpacer: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  matchCardWrapper: {
    marginBottom: SPACING.lg,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: SPACING.md,
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGlowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  photoContainer: {
    position: 'relative',
  },
  matchPhoto: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#DC143C',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  petNameSubtext: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#DC143C',
  },
  sourceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
  },
  fetchBadge: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
  },
  tugBadge: {
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
  },
  lastMessage: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  matchedTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  chevronContainer: {
    justifyContent: 'center',
    paddingLeft: SPACING.xs,
  },
  chevron: {
    fontSize: 32,
    color: 'rgba(255, 215, 0, 0.5)',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: SCREEN_WIDTH * 0.3,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  browseButton: {
    backgroundColor: '#DC143C',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
