import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

type Tab = 'verifications' | 'reports' | 'users' | 'tailpro';

interface Verification {
  id: string;
  user_id: string;
  selfie_url: string;
  pet_pose_url: string;
  doc_url?: string;
  status: string;
  created_at: string;
}

interface User {
  id: string;
  method: string;
  value: string;
  created_at: string;
  last_login?: string;
  is_verified_human?: boolean;
  is_premium?: boolean;
}

// Hardcoded admin account - replace with your actual user ID
const ADMIN_USER_ID = 'admin123'; // TODO: Replace with actual admin user ID

export default function AdminScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('verifications');
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'verifications') {
        await loadVerifications();
      } else if (activeTab === 'users') {
        await loadUsers();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerifications = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/verifications/pending`);
      const data = await response.json();
      setVerifications(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load verifications');
      console.error(error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApprove = async (verificationId: string, userId: string) => {
    setProcessingId(verificationId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/verifications/${verificationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Verification approved!');
        await loadVerifications();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'Failed to approve verification');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (verificationId: string) => {
    setProcessingId(verificationId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/verifications/${verificationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        Alert.alert('Success', 'Verification rejected');
        await loadVerifications();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'Failed to reject verification');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    setProcessingId(userId);
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/users/${userId}/premium`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_premium: !currentStatus }),
      });

      if (response.ok) {
        Alert.alert('Success', `User ${!currentStatus ? 'upgraded to' : 'downgraded from'} Premium`);
        await loadUsers();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.detail || 'Failed to update premium status');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const renderVerificationItem = (verification: Verification) => (
    <View key={verification.id} style={styles.verificationCard}>
      <View style={styles.verificationHeader}>
        <Text style={styles.verificationId}>ID: {verification.id.slice(0, 8)}...</Text>
        <Text style={styles.verificationDate}>
          {new Date(verification.created_at).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.photoRow}>
        <View style={styles.photoContainer}>
          <Text style={styles.photoLabel}>Selfie</Text>
          <Image 
            source={{ uri: verification.selfie_url }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
        <View style={styles.photoContainer}>
          <Text style={styles.photoLabel}>Pet Pose</Text>
          <Image 
            source={{ uri: verification.pet_pose_url }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
        {verification.doc_url && (
          <View style={styles.photoContainer}>
            <Text style={styles.photoLabel}>Document</Text>
            <Image 
              source={{ uri: verification.doc_url }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.approveButton,
            processingId === verification.id && styles.buttonDisabled
          ]}
          onPress={() => handleApprove(verification.id, verification.user_id)}
          disabled={processingId === verification.id}
        >
          {processingId === verification.id ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>✓ Approve</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.rejectButton,
            processingId === verification.id && styles.buttonDisabled
          ]}
          onPress={() => handleReject(verification.id)}
          disabled={processingId === verification.id}
        >
          <Text style={styles.buttonText}>× Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVerificationsTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.crimson} />
      }
    >
      <Text style={styles.tabTitle}>Pending Verifications ({verifications.length})</Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.crimson} style={styles.loader} />
      ) : verifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>✅ No pending verifications</Text>
        </View>
      ) : (
        verifications.map(renderVerificationItem)
      )}
    </ScrollView>
  );

  const renderReportsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Reports</Text>
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderIcon}>📈</Text>
        <Text style={styles.placeholderText}>Reports section coming soon</Text>
        <Text style={styles.placeholderSubtext}>
          User reports and moderation tools will be available here
        </Text>
      </View>
    </View>
  );

  const renderUserItem = (user: User) => (
    <View key={user.id} style={styles.userCard}>
      <View style={styles.userRow}>
        <Text style={styles.userLabel}>Contact:</Text>
        <Text style={styles.userValue}>{user.value}</Text>
      </View>
      <View style={styles.userRow}>
        <Text style={styles.userLabel}>Method:</Text>
        <Text style={styles.userValue}>{user.method}</Text>
      </View>
      <View style={styles.userRow}>
        <Text style={styles.userLabel}>Verified:</Text>
        <View style={[
          styles.badge,
          user.is_verified_human ? styles.badgeVerified : styles.badgeUnverified
        ]}>
          <Text style={styles.badgeText}>
            {user.is_verified_human ? '✓ Yes' : '× No'}
          </Text>
        </View>
      </View>
      <View style={styles.userRow}>
        <Text style={styles.userLabel}>Premium:</Text>
        <TouchableOpacity
          style={[
            styles.premiumToggle,
            user.is_premium ? styles.premiumToggleOn : styles.premiumToggleOff,
            processingId === user.id && styles.buttonDisabled
          ]}
          onPress={() => handleTogglePremium(user.id, user.is_premium || false)}
          disabled={processingId === user.id}
        >
          {processingId === user.id ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.premiumToggleText}>
              {user.is_premium ? '✓ Premium' : 'Set Premium'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.userRow}>
        <Text style={styles.userLabel}>Joined:</Text>
        <Text style={styles.userValue}>
          {new Date(user.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderUsersTab = () => (
    <ScrollView
      style={styles.tabContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.crimson} />
      }
    >
      <Text style={styles.tabTitle}>All Users ({users.length})</Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.crimson} style={styles.loader} />
      ) : (
        users.map(renderUserItem)
      )}
    </ScrollView>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'verifications':
        return renderVerificationsTab();
      case 'reports':
        return renderReportsTab();
      case 'users':
        return renderUsersTab();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔒 Admin Panel</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'verifications' && styles.tabActive
          ]}
          onPress={() => setActiveTab('verifications')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'verifications' && styles.tabTextActive
          ]}>
            Verifications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'reports' && styles.tabActive
          ]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'reports' && styles.tabTextActive
          ]}>
            Reports
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'users' && styles.tabActive
          ]}
          onPress={() => setActiveTab('users')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'users' && styles.tabTextActive
          ]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 1.5,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.crimson,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkGray,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.crimson,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.crimson,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  tabTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  loader: {
    marginTop: SPACING.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.lg,
  },
  verificationCard: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  verificationId: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  verificationDate: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.sm,
  },
  photoRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  photoContainer: {
    flex: 1,
  },
  photoLabel: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.xs,
    marginBottom: SPACING.xs,
  },
  thumbnail: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    backgroundColor: COLORS.darkGray,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.crimson,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: SPACING.lg,
  },
  placeholderText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  placeholderSubtext: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  userCard: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  userLabel: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  userValue: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    flex: 1,
    textAlign: 'right',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  badgeVerified: {
    backgroundColor: '#10B981',
  },
  badgeUnverified: {
    backgroundColor: COLORS.darkGray,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
  },
  premiumToggle: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  premiumToggleOn: {
    backgroundColor: '#FFD700',
  },
  premiumToggleOff: {
    backgroundColor: COLORS.darkGray,
  },
  premiumToggleText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});
