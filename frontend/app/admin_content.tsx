import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface TailTalesPost {
  id: number;
  pet_name: string;
  owner: string;
  caption: string;
  likes: number;
  status: 'pending' | 'approved' | 'rejected';
  reported?: boolean;
}

interface TailReel {
  id: number;
  pet_name: string;
  owner: string;
  caption: string;
  views: number;
  status: 'pending' | 'approved' | 'rejected';
  reported?: boolean;
}

interface Adoption {
  id: number;
  pet_name: string;
  breed: string;
  org_owner: string;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

interface NGO {
  id: number;
  name: string;
  cause: string;
  city: string;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

interface Report {
  id: number;
  content_type: 'post' | 'reel' | 'adoption';
  content_id: number;
  reason: string;
  user: string;
}

// Mock Data
const MOCK_POSTS: TailTalesPost[] = [
  { id: 1, pet_name: 'Buddy', owner: 'Arjun', caption: 'First day at park!', likes: 45, status: 'pending' },
  { id: 2, pet_name: 'Luna', owner: 'Priya', caption: 'Nap time 😴', likes: 89, status: 'approved' },
  { id: 3, pet_name: 'Max', owner: 'Raj', caption: 'Inappropriate content here', likes: 12, status: 'pending', reported: true },
];

const MOCK_REELS: TailReel[] = [
  { id: 801, pet_name: 'Rocky', owner: 'Sneha', caption: 'Learning tricks', views: 1250, status: 'pending' },
  { id: 802, pet_name: 'Bella', owner: 'Amit', caption: 'Zoomies!', views: 3400, status: 'approved' },
];

const MOCK_ADOPTIONS: Adoption[] = [
  { id: 901, pet_name: 'Bruno', breed: 'Indie', org_owner: 'Hope Rescue', verified: true, status: 'pending' },
  { id: 902, pet_name: 'Lucy', breed: 'Beagle', org_owner: 'Private Owner', verified: false, status: 'approved' },
];

const MOCK_NGOS: NGO[] = [
  { id: 1, name: 'Paws Foundation', cause: 'Street dog rescue', city: 'Bengaluru', verified: true, status: 'approved' },
  { id: 2, name: 'New Animal Shelter', cause: 'Pet adoption', city: 'Mumbai', verified: false, status: 'pending' },
];

const MOCK_REPORTS: Report[] = [
  { id: 1, content_type: 'post', content_id: 3, reason: 'Inappropriate content', user: 'User123' },
  { id: 2, content_type: 'reel', content_id: 801, reason: 'Spam', user: 'User456' },
];

type TabType = 'posts' | 'reels' | 'adoptions' | 'ngos' | 'reports';

export default function AdminContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [reels, setReels] = useState(MOCK_REELS);
  const [adoptions, setAdoptions] = useState(MOCK_ADOPTIONS);
  const [ngos, setNgos] = useState(MOCK_NGOS);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleApprove = (type: TabType, id: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (type === 'posts') {
      setPosts(posts.map(p => p.id === id ? { ...p, status: 'approved' } : p));
      Alert.alert('✅ Approved', 'Post has been approved and is now visible to users.');
    } else if (type === 'reels') {
      setReels(reels.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      Alert.alert('✅ Approved', 'Reel has been approved and is now visible to users.');
    } else if (type === 'adoptions') {
      setAdoptions(adoptions.map(a => a.id === id ? { ...a, status: 'approved' } : a));
      Alert.alert('✅ Approved', 'Adoption listing has been approved.');
    } else if (type === 'ngos') {
      setNgos(ngos.map(n => n.id === id ? { ...n, status: 'approved' } : n));
      Alert.alert('✅ Approved', 'NGO has been verified and can now receive donations.');
    }
  };

  const handleReject = (type: TabType, id: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    Alert.alert(
      '❌ Reject Content',
      'Are you sure you want to reject this content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            if (type === 'posts') {
              setPosts(posts.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
            } else if (type === 'reels') {
              setReels(reels.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
            } else if (type === 'adoptions') {
              setAdoptions(adoptions.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
            } else if (type === 'ngos') {
              setNgos(ngos.map(n => n.id === id ? { ...n, status: 'rejected' } : n));
            }
            Alert.alert('Rejected', 'Content has been rejected and hidden from users.');
          },
        },
      ]
    );
  };

  const handleRemove = (type: TabType, id: number) => {
    Alert.alert(
      '🚫 Remove Content',
      'This will permanently delete the content. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            if (type === 'posts') {
              setPosts(posts.filter(p => p.id !== id));
            } else if (type === 'reels') {
              setReels(reels.filter(r => r.id !== id));
            } else if (type === 'adoptions') {
              setAdoptions(adoptions.filter(a => a.id !== id));
            } else if (type === 'ngos') {
              setNgos(ngos.filter(n => n.id !== id));
            }
            Alert.alert('Deleted', 'Content has been permanently removed.');
          },
        },
      ]
    );
  };

  const handleBanUser = (username: string) => {
    Alert.alert(
      '⛔ Ban User',
      `Ban ${username} from the platform?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('User Banned', `${username} has been banned from TailFlix.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.crimson, COLORS.warmBrown]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Content Moderation 🚨</Text>
          <Text style={styles.headerSubtitle}>Manage & moderate user content</Text>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContainer}
      >
        {[
          { key: 'posts' as TabType, label: 'TailTales 🐾' },
          { key: 'reels' as TabType, label: 'TailReels 🎥' },
          { key: 'adoptions' as TabType, label: 'Adoptions 🐕' },
          { key: 'ngos' as TabType, label: 'NGOs ❤️' },
          { key: 'reports' as TabType, label: 'Reports 🚨' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'posts' && (
          <View>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onApprove={() => handleApprove('posts', post.id)}
                onReject={() => handleReject('posts', post.id)}
                onRemove={() => handleRemove('posts', post.id)}
              />
            ))}
          </View>
        )}

        {activeTab === 'reels' && (
          <View>
            {reels.map((reel) => (
              <ReelCard
                key={reel.id}
                reel={reel}
                onApprove={() => handleApprove('reels', reel.id)}
                onReject={() => handleReject('reels', reel.id)}
                onRemove={() => handleRemove('reels', reel.id)}
              />
            ))}
          </View>
        )}

        {activeTab === 'adoptions' && (
          <View>
            {adoptions.map((adoption) => (
              <AdoptionCard
                key={adoption.id}
                adoption={adoption}
                onApprove={() => handleApprove('adoptions', adoption.id)}
                onReject={() => handleReject('adoptions', adoption.id)}
                onRemove={() => handleRemove('adoptions', adoption.id)}
              />
            ))}
          </View>
        )}

        {activeTab === 'ngos' && (
          <View>
            {ngos.map((ngo) => (
              <NGOCard
                key={ngo.id}
                ngo={ngo}
                onApprove={() => handleApprove('ngos', ngo.id)}
                onReject={() => handleReject('ngos', ngo.id)}
                onRemove={() => handleRemove('ngos', ngo.id)}
              />
            ))}
          </View>
        )}

        {activeTab === 'reports' && (
          <View>
            {MOCK_REPORTS.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onBanUser={() => handleBanUser(report.user)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Component Cards
function PostCard({ post, onApprove, onReject, onRemove }: any) {
  return (
    <View style={[styles.card, post.reported && styles.reportedCard]}>
      {post.reported && <Text style={styles.reportBadge}>🚨 REPORTED</Text>}
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>Post #{post.id}</Text>
        <StatusBadge status={post.status} />
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Pet:</Text>
        <Text style={styles.value}>{post.pet_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Owner:</Text>
        <Text style={styles.value}>{post.owner}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Caption:</Text>
        <Text style={styles.value} numberOfLines={2}>{post.caption}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Likes:</Text>
        <Text style={styles.value}>{post.likes}</Text>
      </View>
      <ActionButtons onApprove={onApprove} onReject={onReject} onRemove={onRemove} />
    </View>
  );
}

function ReelCard({ reel, onApprove, onReject, onRemove }: any) {
  return (
    <View style={[styles.card, reel.reported && styles.reportedCard]}>
      {reel.reported && <Text style={styles.reportBadge}>🚨 REPORTED</Text>}
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>Reel #{reel.id}</Text>
        <StatusBadge status={reel.status} />
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Pet:</Text>
        <Text style={styles.value}>{reel.pet_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Owner:</Text>
        <Text style={styles.value}>{reel.owner}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Caption:</Text>
        <Text style={styles.value} numberOfLines={2}>{reel.caption}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Views:</Text>
        <Text style={styles.value}>{reel.views}</Text>
      </View>
      <ActionButtons onApprove={onApprove} onReject={onReject} onRemove={onRemove} />
    </View>
  );
}

function AdoptionCard({ adoption, onApprove, onReject, onRemove }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>Adoption #{adoption.id}</Text>
        <StatusBadge status={adoption.status} />
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Pet:</Text>
        <Text style={styles.value}>{adoption.pet_name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Breed:</Text>
        <Text style={styles.value}>{adoption.breed}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Org/Owner:</Text>
        <Text style={styles.value}>{adoption.org_owner}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Verified:</Text>
        <Text style={styles.value}>{adoption.verified ? '✅ Yes' : '❌ No'}</Text>
      </View>
      <ActionButtons onApprove={onApprove} onReject={onReject} onRemove={onRemove} />
    </View>
  );
}

function NGOCard({ ngo, onApprove, onReject, onRemove }: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>NGO #{ngo.id}</Text>
        <StatusBadge status={ngo.status} />
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{ngo.name}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Cause:</Text>
        <Text style={styles.value} numberOfLines={2}>{ngo.cause}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>City:</Text>
        <Text style={styles.value}>{ngo.city}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Verified:</Text>
        <Text style={styles.value}>{ngo.verified ? '✅ Yes' : '❌ No'}</Text>
      </View>
      <ActionButtons onApprove={onApprove} onReject={onReject} onRemove={onRemove} />
    </View>
  );
}

function ReportCard({ report, onBanUser }: any) {
  return (
    <View style={[styles.card, styles.reportedCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>Report #{report.id}</Text>
        <Text style={styles.reportBadge}>🚨 URGENT</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{report.content_type}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Content ID:</Text>
        <Text style={styles.value}>#{report.content_id}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Reason:</Text>
        <Text style={styles.value}>{report.reason}</Text>
      </View>
      <View style={styles.cardRow}>
        <Text style={styles.label}>Reported by:</Text>
        <Text style={styles.value}>{report.user}</Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.banButton} onPress={onBanUser}>
          <Text style={styles.banButtonText}>⛔ Ban User</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    pending: { bg: '#FFF3CD', text: '#856404' },
    approved: { bg: '#D4EDDA', text: '#155724' },
    rejected: { bg: '#F8D7DA', text: '#721C24' },
  };
  
  return (
    <View style={[styles.statusBadge, { backgroundColor: colors[status]?.bg || '#CCC' }]}>
      <Text style={[styles.statusText, { color: colors[status]?.text || '#000' }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

function ActionButtons({ onApprove, onReject, onRemove }: any) {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.approveButton} onPress={onApprove}>
        <Text style={styles.buttonText}>✅ Approve</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
        <Text style={styles.buttonText}>❌ Reject</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
        <Text style={styles.buttonText}>🚫 Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: SPACING.xxl + 10,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tabsScroll: {
    maxHeight: 50,
    backgroundColor: '#FFF',
  },
  tabsContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  tab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#F0F0F0',
  },
  activeTab: {
    backgroundColor: COLORS.crimson,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.charcoal,
  },
  activeTabText: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  reportedCard: {
    borderColor: COLORS.crimson,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardId: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.charcoal,
  },
  reportBadge: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.crimson,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.warmBrown,
    width: 100,
  },
  value: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.charcoal,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  removeButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  banButton: {
    flex: 1,
    backgroundColor: '#9C27B0',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#FFF',
  },
  banButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
