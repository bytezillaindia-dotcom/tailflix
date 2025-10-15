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
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

type Tab = 'verifications' | 'reports' | 'users' | 'tailpro' | 'earnings' | 'content';

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
  
  // TailPro states
  const [tailProPartners, setTailProPartners] = useState<any[]>([]);
  const [tailProBookings, setTailProBookings] = useState<any[]>([]);
  const [tailProLoading, setTailProLoading] = useState(true);
  const [tailProSubTab, setTailProSubTab] = useState<'verification' | 'bookings'>('verification');
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
      case 'tailpro':
        return renderTailProTab();
      case 'earnings':
        return renderEarningsTab();
      default:
        return null;
    }
  };

  const renderEarningsTab = () => {
    const [earningsData, setEarningsData] = React.useState({
      totalRevenue: 0,
      vendorPayouts: 0,
      platformCommission: 0,
      activeVendors: 0,
    });
    const [earningsSubTab, setEarningsSubTab] = React.useState<'overview' | 'category' | 'payouts' | 'transactions'>('overview');

    React.useEffect(() => {
      loadEarningsData();
    }, []);

    const loadEarningsData = async () => {
      try {
        // Load vendor earnings to calculate totals
        const earningsStr = await AsyncStorage.getItem('vendor_earnings');
        if (earningsStr) {
          const allEarnings = JSON.parse(earningsStr);
          const vendors = Object.keys(allEarnings);
          
          let totalVendorEarnings = 0;
          let totalPendingPayouts = 0;
          
          vendors.forEach((vendorId) => {
            totalVendorEarnings += allEarnings[vendorId].total;
            totalPendingPayouts += allEarnings[vendorId].pending;
          });
          
          // Calculate platform commission (20% average)
          const commission = Math.round(totalVendorEarnings * 0.25);
          const revenue = totalVendorEarnings + commission;
          
          setEarningsData({
            totalRevenue: revenue,
            vendorPayouts: totalVendorEarnings,
            platformCommission: commission,
            activeVendors: vendors.length,
          });
        }
      } catch (error) {
        console.error('Error loading earnings data:', error);
      }
    };

    const renderOverview = () => (
      <View>
        <View style={styles.earningsOverviewGrid}>
          <View style={[styles.earningsCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.earningsCardLabel}>Total Revenue</Text>
            <Text style={styles.earningsCardValue}>₹{earningsData.totalRevenue.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.earningsCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.earningsCardLabel}>Vendor Payouts</Text>
            <Text style={styles.earningsCardValue}>₹{earningsData.vendorPayouts.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.earningsCard, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.earningsCardLabel}>Platform Commission</Text>
            <Text style={styles.earningsCardValue}>₹{earningsData.platformCommission.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.earningsCard, { backgroundColor: '#F3E5F5' }]}>
            <Text style={styles.earningsCardLabel}>Active Vendors</Text>
            <Text style={styles.earningsCardValue}>{earningsData.activeVendors}</Text>
          </View>
        </View>
      </View>
    );

    const renderByCategory = () => (
      <View>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryName}>TailPro Services</Text>
          <View style={styles.categoryStats}>
            <Text style={styles.categoryRevenue}>₹25,000</Text>
            <Text style={styles.categoryCommission}>Commission: ₹5,000 (20%)</Text>
          </View>
        </View>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryName}>TailMarket Puppies</Text>
          <View style={styles.categoryStats}>
            <Text style={styles.categoryRevenue}>₹15,000</Text>
            <Text style={styles.categoryCommission}>Commission: ₹7,500 (50%)</Text>
          </View>
        </View>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryName}>TailBoard Ads</Text>
          <View style={styles.categoryStats}>
            <Text style={styles.categoryRevenue}>₹5,000</Text>
            <Text style={styles.categoryCommission}>Commission: ₹2,500 (50%)</Text>
          </View>
        </View>
      </View>
    );

    const renderVendorPayouts = () => {
      const [vendorEarnings, setVendorEarnings] = React.useState<any>({});

      React.useEffect(() => {
        loadVendorEarnings();
      }, []);

      const loadVendorEarnings = async () => {
        const earningsStr = await AsyncStorage.getItem('vendor_earnings');
        if (earningsStr) {
          setVendorEarnings(JSON.parse(earningsStr));
        }
      };

      const handleMarkPaid = async (vendorId: string) => {
        Alert.alert(
          'Mark Payout as Paid',
          `Mark all pending payouts for this vendor as completed?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Mark Paid',
              onPress: async () => {
                try {
                  const earningsStr = await AsyncStorage.getItem('vendor_earnings');
                  if (earningsStr) {
                    const allEarnings = JSON.parse(earningsStr);
                    if (allEarnings[vendorId] && allEarnings[vendorId].pending > 0) {
                      allEarnings[vendorId].completed += allEarnings[vendorId].pending;
                      allEarnings[vendorId].pending = 0;
                      await AsyncStorage.setItem('vendor_earnings', JSON.stringify(allEarnings));
                      await loadVendorEarnings();
                      await loadEarningsData();
                      Alert.alert('Success', 'Payout marked as paid');
                    }
                  }
                } catch (error) {
                  console.error('Error marking payout as paid:', error);
                  Alert.alert('Error', 'Failed to update payout status');
                }
              },
            },
          ]
        );
      };

      return (
        <View>
          {Object.keys(vendorEarnings).length === 0 ? (
            <Text style={styles.emptyText}>No vendor earnings yet</Text>
          ) : (
            Object.keys(vendorEarnings).map((vendorId) => {
              const earnings = vendorEarnings[vendorId];
              return (
                <View key={vendorId} style={styles.vendorPayoutCard}>
                  <View style={styles.vendorPayoutHeader}>
                    <Text style={styles.vendorPayoutName}>Vendor: {vendorId}</Text>
                    {earnings.pending > 0 && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>PENDING</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.vendorPayoutStats}>
                    <View style={styles.vendorPayoutStat}>
                      <Text style={styles.vendorPayoutStatLabel}>Total Earned</Text>
                      <Text style={styles.vendorPayoutStatValue}>₹{earnings.total}</Text>
                    </View>
                    <View style={styles.vendorPayoutStat}>
                      <Text style={styles.vendorPayoutStatLabel}>Pending</Text>
                      <Text style={[styles.vendorPayoutStatValue, styles.pendingAmount]}>₹{earnings.pending}</Text>
                    </View>
                    <View style={styles.vendorPayoutStat}>
                      <Text style={styles.vendorPayoutStatLabel}>Completed</Text>
                      <Text style={[styles.vendorPayoutStatValue, styles.completedAmount]}>₹{earnings.completed}</Text>
                    </View>
                  </View>
                  {earnings.pending > 0 && (
                    <TouchableOpacity
                      onPress={() => handleMarkPaid(vendorId)}
                      style={styles.markPaidButton}
                    >
                      <Text style={styles.markPaidButtonText}>✓ Mark Paid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
      );
    };

    const renderTransactions = () => {
      const mockTransactions = [
        { id: 'TXN101', type: 'TailPro Booking', amount: 999, user: 'User A', vendor: 'Happy Paws', status: 'Completed', date: '2025-10-10' },
        { id: 'TXN102', type: 'TailMarket Contact', amount: 499, user: 'User B', vendor: 'Breeder X', status: 'Completed', date: '2025-10-11' },
        { id: 'TXN103', type: 'TailBoard Boost', amount: 199, user: 'User C', vendor: 'Poster Y', status: 'Completed', date: '2025-10-12' },
      ];

      return (
        <View>
          {mockTransactions.map((txn) => (
            <View key={txn.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <Text style={styles.transactionId}>{txn.id}</Text>
                <View style={[styles.transactionStatus, { backgroundColor: '#27AE60' }]}>
                  <Text style={styles.transactionStatusText}>{txn.status}</Text>
                </View>
              </View>
              <Text style={styles.transactionType}>{txn.type}</Text>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDetail}>User: {txn.user}</Text>
                <Text style={styles.transactionDetail}>Vendor: {txn.vendor}</Text>
                <Text style={styles.transactionDetail}>Date: {txn.date}</Text>
              </View>
              <Text style={styles.transactionAmount}>₹{txn.amount}</Text>
            </View>
          ))}
        </View>
      );
    };

    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>Earnings & Payouts 💰</Text>

        {/* Sub-tabs */}
        <View style={styles.earningsSubTabs}>
          <TouchableOpacity
            onPress={() => setEarningsSubTab('overview')}
            style={[styles.earningsSubTab, earningsSubTab === 'overview' && styles.earningsSubTabActive]}
          >
            <Text style={[styles.earningsSubTabText, earningsSubTab === 'overview' && styles.earningsSubTabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setEarningsSubTab('category')}
            style={[styles.earningsSubTab, earningsSubTab === 'category' && styles.earningsSubTabActive]}
          >
            <Text style={[styles.earningsSubTabText, earningsSubTab === 'category' && styles.earningsSubTabTextActive]}>
              By Category
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setEarningsSubTab('payouts')}
            style={[styles.earningsSubTab, earningsSubTab === 'payouts' && styles.earningsSubTabActive]}
          >
            <Text style={[styles.earningsSubTabText, earningsSubTab === 'payouts' && styles.earningsSubTabTextActive]}>
              Payouts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setEarningsSubTab('transactions')}
            style={[styles.earningsSubTab, earningsSubTab === 'transactions' && styles.earningsSubTabActive]}
          >
            <Text style={[styles.earningsSubTabText, earningsSubTab === 'transactions' && styles.earningsSubTabTextActive]}>
              Transactions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-tab content */}
        <View style={styles.earningsSubTabContent}>
          {earningsSubTab === 'overview' && renderOverview()}
          {earningsSubTab === 'category' && renderByCategory()}
          {earningsSubTab === 'payouts' && renderVendorPayouts()}
          {earningsSubTab === 'transactions' && renderTransactions()}
        </View>
      </View>
    );
  };

  const renderTailProTab = () => {
    // Mock data for when storage is empty
    const MOCK_VENDORS = [
      {
        vendorId: 'mock_v1',
        name: 'Happy Paws Grooming',
        phone: '+91-9999999999',
        category: 'Grooming',
        city: 'Bengaluru',
        price: 599,
        status: 'pending',
        docs: 'Verified',
      },
      {
        vendorId: 'mock_v2',
        name: 'Pet Care Clinic',
        phone: '+91-8888888888',
        category: 'Veterinary',
        city: 'Mumbai',
        price: 799,
        status: 'pending',
        docs: 'Pending',
      },
    ];

    const MOCK_BOOKINGS = [
      {
        order_id: 'ORD001',
        service: 'Pet Grooming',
        vendor_id: 'mock_v1',
        vendor_name: 'Happy Paws',
        customer: 'Arjun Kumar',
        date: '2025-10-15',
        status: 'Confirmed',
        amount: 599,
      },
      {
        order_id: 'ORD002',
        service: 'Vet Checkup',
        vendor_id: 'mock_v2',
        vendor_name: 'Pet Care Clinic',
        customer: 'Priya Sharma',
        date: '2025-10-16',
        status: 'Pending',
        amount: 799,
      },
    ];

    useEffect(() => {
      loadTailProData();
    }, []);

    const loadTailProData = async () => {
      try {
        // Load partners
        const partnersStr = await AsyncStorage.getItem('tailpro_partners');
        if (partnersStr) {
          const parsedPartners = JSON.parse(partnersStr);
          setTailProPartners(parsedPartners.length > 0 ? parsedPartners : MOCK_VENDORS);
        } else {
          // Use mock data if no data exists
          setTailProPartners(MOCK_VENDORS);
        }

        // Load bookings
        const bookingsStr = await AsyncStorage.getItem('tailpro_bookings');
        if (bookingsStr) {
          const parsedBookings = JSON.parse(bookingsStr);
          setTailProBookings(parsedBookings.length > 0 ? parsedBookings : MOCK_BOOKINGS);
        } else {
          setTailProBookings(MOCK_BOOKINGS);
        }
      } catch (error) {
        console.error('Error loading TailPro data:', error);
        // Fallback to mock data on error
        setTailProPartners(MOCK_VENDORS);
        setTailProBookings(MOCK_BOOKINGS);
      } finally {
        setTailProLoading(false);
      }
    };

    const handleApprove = async (vendorId: string) => {
      Alert.alert(
        'Approve Partner',
        'Approve this partner application?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Approve',
            onPress: async () => {
              try {
                const updatedPartners = tailProPartners.map((p: any) =>
                  p.vendorId === vendorId
                    ? { ...p, status: 'approved', role: 'vendor' }
                    : p
                );
                await AsyncStorage.setItem('tailpro_partners', JSON.stringify(updatedPartners));
                setTailProPartners(updatedPartners);
                Alert.alert('Success', 'Partner approved successfully');
              } catch (error) {
                console.error('Error approving partner:', error);
                Alert.alert('Error', 'Failed to approve partner');
              }
            },
          },
        ]
      );
    };

    const handleReject = async (vendorId: string) => {
      Alert.alert(
        'Reject Partner',
        'Reject this partner application?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reject',
            style: 'destructive',
            onPress: async () => {
              try {
                const updatedPartners = tailProPartners.map((p: any) =>
                  p.vendorId === vendorId ? { ...p, status: 'rejected' } : p
                );
                await AsyncStorage.setItem('tailpro_partners', JSON.stringify(updatedPartners));
                setTailProPartners(updatedPartners);
                Alert.alert('Rejected', 'Partner application rejected');
              } catch (error) {
                console.error('Error rejecting partner:', error);
                Alert.alert('Error', 'Failed to reject partner');
              }
            },
          },
        ]
      );
    };

    if (tailProLoading) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.tabTitle}>TailPro Management</Text>
          <Text style={styles.placeholderText}>Loading...</Text>
        </View>
      );
    }

    const pendingPartners = tailProPartners.filter(p => p.status === 'pending');

    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>TailPro Management</Text>
        
        {/* Sub-tabs */}
        <View style={styles.subTabsContainer}>
          <TouchableOpacity
            style={[styles.subTab, subTab === 'verification' && styles.subTabActive]}
            onPress={() => setSubTab('verification')}
          >
            <Text style={[styles.subTabText, subTab === 'verification' && styles.subTabTextActive]}>
              Partner Verification
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTab, subTab === 'bookings' && styles.subTabActive]}
            onPress={() => setSubTab('bookings')}
          >
            <Text style={[styles.subTabText, subTab === 'bookings' && styles.subTabTextActive]}>
              Bookings 📅
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on sub-tab */}
        {subTab === 'verification' ? (
          pendingPartners.length === 0 ? (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>💼</Text>
              <Text style={styles.placeholderText}>No Pending Applications</Text>
              <Text style={styles.placeholderSubtext}>
                Partner applications will appear here for verification
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {pendingPartners.map((partner) => (
                <View key={partner.vendorId} style={styles.partnerCard}>
                  <View style={styles.partnerHeader}>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <View style={[styles.partnerStatusBadge, { backgroundColor: '#FFA500' }]}>
                      <Text style={styles.partnerStatusText}>PENDING</Text>
                    </View>
                  </View>
                  
                  <View style={styles.partnerDetails}>
                    <Text style={styles.partnerDetailRow}>
                      <Text style={styles.partnerDetailLabel}>Phone: </Text>
                      {partner.phone}
                    </Text>
                    <Text style={styles.partnerDetailRow}>
                      <Text style={styles.partnerDetailLabel}>Category: </Text>
                      {partner.category}
                    </Text>
                    <Text style={styles.partnerDetailRow}>
                      <Text style={styles.partnerDetailLabel}>City: </Text>
                      {partner.city}
                    </Text>
                    <Text style={styles.partnerDetailRow}>
                      <Text style={styles.partnerDetailLabel}>Price: </Text>
                      ₹{partner.price}
                    </Text>
                    <Text style={styles.partnerDetailRow}>
                      <Text style={styles.partnerDetailLabel}>Docs: </Text>
                      {partner.docs || 'Not provided'}
                    </Text>
                    <Text style={styles.partnerDetailRow}>
                      <Text style={styles.partnerDetailLabel}>Vendor ID: </Text>
                      {partner.vendorId}
                    </Text>
                  </View>

                  <View style={styles.partnerActions}>
                    <TouchableOpacity
                      onPress={() => handleApprove(partner.vendorId)}
                      style={styles.approveButton}
                    >
                      <Text style={styles.approveButtonText}>✓ Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleReject(partner.vendorId)}
                      style={styles.rejectButton}
                    >
                      <Text style={styles.rejectButtonText}>✗ Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )
        ) : (
          // Bookings tab
          bookings.length === 0 ? (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>📅</Text>
              <Text style={styles.placeholderText}>No Bookings Yet</Text>
              <Text style={styles.placeholderSubtext}>
                Service bookings will appear here
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {bookings.map((booking) => (
                <View key={booking.order_id} style={styles.bookingCard}>
                  <View style={styles.bookingHeader}>
                    <Text style={styles.bookingOrderId}>#{booking.order_id}</Text>
                    <View style={[
                      styles.bookingStatusBadge,
                      { backgroundColor: booking.status === 'Confirmed' ? '#4CAF50' : '#FFA500' }
                    ]}>
                      <Text style={styles.bookingStatusText}>{booking.status}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.bookingDetails}>
                    <Text style={styles.bookingDetailRow}>
                      <Text style={styles.bookingDetailLabel}>Service: </Text>
                      {booking.service}
                    </Text>
                    <Text style={styles.bookingDetailRow}>
                      <Text style={styles.bookingDetailLabel}>Vendor: </Text>
                      {booking.vendor_name}
                    </Text>
                    <Text style={styles.bookingDetailRow}>
                      <Text style={styles.bookingDetailLabel}>Customer: </Text>
                      {booking.customer}
                    </Text>
                    <Text style={styles.bookingDetailRow}>
                      <Text style={styles.bookingDetailLabel}>Date: </Text>
                      {booking.date}
                    </Text>
                    <Text style={styles.bookingDetailRow}>
                      <Text style={styles.bookingDetailLabel}>Amount: </Text>
                      ₹{booking.amount}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )
        )}
      </View>
    );
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
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'tailpro' && styles.tabActive
          ]}
          onPress={() => setActiveTab('tailpro')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'tailpro' && styles.tabTextActive
          ]}>
            TailPro
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'earnings' && styles.tabActive
          ]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'earnings' && styles.tabTextActive
          ]}>
            Earnings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'content' && styles.tabActive
          ]}
          onPress={() => router.push('/admin_content')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'content' && styles.tabTextActive
          ]}>
            Content 🚨
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
  rejectButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  partnerCard: {
    backgroundColor: '#2C3E50',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#34495E',
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  partnerName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  partnerStatusBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  partnerStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  partnerDetails: {
    marginBottom: SPACING.sm,
  },
  partnerDetailRow: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: 4,
  },
  partnerDetailLabel: {
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  partnerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  approveButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: COLORS.crimson,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  // Earnings Tab Styles
  earningsSubTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.charcoal,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  earningsSubTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  earningsSubTabActive: {
    backgroundColor: COLORS.crimson,
  },
  earningsSubTabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gray,
  },
  earningsSubTabTextActive: {
    color: COLORS.white,
  },
  earningsSubTabContent: {
    flex: 1,
  },
  earningsOverviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  earningsCard: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  earningsCardLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#333',
    marginBottom: SPACING.xs,
  },
  earningsCardValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryRow: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  categoryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  categoryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryRevenue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#10B981',
  },
  categoryCommission: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
  },
  vendorPayoutCard: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  vendorPayoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  vendorPayoutName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  pendingBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  pendingBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  vendorPayoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  vendorPayoutStat: {
    alignItems: 'center',
  },
  vendorPayoutStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    marginBottom: 4,
  },
  vendorPayoutStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  pendingAmount: {
    color: '#FFA500',
  },
  completedAmount: {
    color: '#10B981',
  },
  markPaidButton: {
    backgroundColor: '#10B981',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  markPaidButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  transactionCard: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  transactionId: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  transactionStatus: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  transactionStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  transactionType: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  transactionDetails: {
    marginBottom: SPACING.xs,
  },
  transactionDetail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#10B981',
    textAlign: 'right',
  },
  // TailPro Sub-tabs
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.lg,
  },
  subTab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  subTabActive: {
    backgroundColor: COLORS.pawPink,
  },
  subTabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#999',
  },
  subTabTextActive: {
    color: '#FFF',
  },
  // Booking Card Styles
  bookingCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bookingOrderId: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bookingStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  bookingStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bookingDetails: {
    gap: SPACING.xs,
  },
  bookingDetailRow: {
    fontSize: FONT_SIZES.sm,
    color: '#CCC',
  },
  bookingDetailLabel: {
    fontWeight: '600',
    color: '#FFF',
  },
});
