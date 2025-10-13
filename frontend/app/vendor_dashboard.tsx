import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { useAuth } from '../components/AuthContext';

type Tab = 'bookings' | 'services' | 'earnings';

interface Order {
  id: string;
  service: string;
  provider: string;
  slot: string;
  status: string;
  total: number;
  vendorId?: string;
}

export default function VendorDashboard() {
  const router = useRouter();
  const { userId, role, status, vendorId } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('bookings');
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Check if user is vendor and approved
    if (role !== 'vendor' || status !== 'approved') {
      Alert.alert('Access Denied', 'You do not have vendor access');
      router.back();
      return;
    }
    loadOrders();
  }, [role, status]);

  const loadOrders = async () => {
    try {
      const ordersStr = await AsyncStorage.getItem('tailpro_orders');
      if (ordersStr) {
        const allOrders = JSON.parse(ordersStr);
        // Filter orders for this vendor
        const vendorOrders = allOrders.filter((order: Order) => 
          order.vendorId === vendorId
        );
        setOrders(vendorOrders.reverse());
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleMarkComplete = async (orderId: string) => {
    Alert.alert(
      'Mark Complete',
      'Mark this booking as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              const ordersStr = await AsyncStorage.getItem('tailpro_orders');
              if (ordersStr) {
                const allOrders = JSON.parse(ordersStr);
                const updatedOrders = allOrders.map((order: Order) =>
                  order.id === orderId ? { ...order, status: 'completed' } : order
                );
                await AsyncStorage.setItem('tailpro_orders', JSON.stringify(updatedOrders));
                await loadOrders();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Success', 'Booking marked as completed');
              }
            } catch (error) {
              console.error('Error updating order:', error);
              Alert.alert('Error', 'Failed to update booking');
            }
          },
        },
      ]
    );
  };

  const handleCancelBooking = async (orderId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure? Customer will be notified.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              const ordersStr = await AsyncStorage.getItem('tailpro_orders');
              if (ordersStr) {
                const allOrders = JSON.parse(ordersStr);
                const updatedOrders = allOrders.map((order: Order) =>
                  order.id === orderId ? { ...order, status: 'cancelled' } : order
                );
                await AsyncStorage.setItem('tailpro_orders', JSON.stringify(updatedOrders));
                await loadOrders();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                Alert.alert('Cancelled', 'Booking has been cancelled');
              }
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const renderBookingsTab = () => {
    const activeBookings = orders.filter(o => o.status === 'confirmed');
    const completedBookings = orders.filter(o => o.status === 'completed');
    const cancelledBookings = orders.filter(o => o.status === 'cancelled');

    return (
      <View style={styles.tabContent}>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Text style={styles.statNumber}>{activeBookings.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Text style={styles.statNumber}>{completedBookings.length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
            <Text style={styles.statNumber}>{cancelledBookings.length}</Text>
            <Text style={styles.statLabel}>Cancelled</Text>
          </View>
        </View>

        {activeBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>No Active Bookings</Text>
          </View>
        ) : (
          activeBookings.map((order) => (
            <View key={order.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingId}>#{order.id.slice(-8)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: '#27AE60' }]}>
                  <Text style={styles.statusText}>ACTIVE</Text>
                </View>
              </View>

              <Text style={styles.bookingService}>{order.service}</Text>
              <Text style={styles.bookingSlot}>📅 {order.slot}</Text>
              <Text style={styles.bookingPrice}>₹{order.total}</Text>

              <View style={styles.bookingActions}>
                <TouchableOpacity
                  onPress={() => handleMarkComplete(order.id)}
                  style={styles.completeButton}
                >
                  <Text style={styles.completeButtonText}>✅ Mark Complete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleCancelBooking(order.id)}
                  style={styles.cancelBookingButton}
                >
                  <Text style={styles.cancelBookingButtonText}>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderServicesTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/tailpro_post_service');
        }}
        style={styles.addServiceButton}
      >
        <LinearGradient
          colors={[COLORS.pawPink, COLORS.gold]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addServiceGradient}
        >
          <Text style={styles.addServiceText}>➕ Add New Service</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderIcon}>🐾</Text>
        <Text style={styles.placeholderText}>My Services</Text>
        <Text style={styles.placeholderSubtext}>
          Service listing and management coming soon
        </Text>
      </View>
    </View>
  );

  const renderEarningsTab = () => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalEarnings = completedOrders.reduce((sum, order) => sum + order.total, 0);
    const pendingPayouts = totalEarnings * 0.3; // Mock: 30% pending
    const completedPayouts = totalEarnings * 0.7; // Mock: 70% completed

    return (
      <View style={styles.tabContent}>
        <LinearGradient
          colors={[COLORS.goldenBeige, COLORS.gold]}
          style={styles.earningsCard}
        >
          <Text style={styles.earningsLabel}>Total Earnings</Text>
          <Text style={styles.earningsAmount}>₹{totalEarnings}</Text>
        </LinearGradient>

        <View style={styles.earningsBreakdown}>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsRowLabel}>Pending Payouts</Text>
            <Text style={styles.earningsRowValue}>₹{Math.round(pendingPayouts)}</Text>
          </View>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsRowLabel}>Completed Payouts</Text>
            <Text style={styles.earningsRowValue}>₹{Math.round(completedPayouts)}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Payout Requested', 'Your payout request has been submitted successfully!');
          }}
          style={styles.payoutButton}
        >
          <Text style={styles.payoutButtonText}>💰 Request Payout</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Dashboard</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookings' && styles.tabActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.tabTextActive]}>
            📅 Bookings
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.tabActive]}
          onPress={() => setActiveTab('services')}
        >
          <Text style={[styles.tabText, activeTab === 'services' && styles.tabTextActive]}>
            🐾 Services
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'earnings' && styles.tabActive]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.tabTextActive]}>
            💰 Earnings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.pawPink} />
        }
      >
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'services' && renderServicesTab()}
        {activeTab === 'earnings' && renderEarningsTab()}
      </ScrollView>
    </View>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.pawPink,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  tabTextActive: {
    color: COLORS.pawPink,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  tabContent: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  bookingId: {
    fontSize: FONT_SIZES.xs,
    color: '#7F8C8D',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: '#FFF',
  },
  bookingService: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  bookingSlot: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  bookingPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.crimson,
    marginBottom: SPACING.sm,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#27AE60',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#FFF',
  },
  cancelBookingButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
  },
  cancelBookingButtonText: {
    fontSize: FONT_SIZES.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#7F8C8D',
  },
  addServiceButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  addServiceGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  addServiceText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
  },
  placeholderContainer: {
    alignItems: 'center',
    paddingTop: SPACING.xxl,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  placeholderText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: SPACING.xs,
  },
  placeholderSubtext: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  earningsCard: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  earningsLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: SPACING.xs,
  },
  earningsAmount: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
  },
  earningsBreakdown: {
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  earningsRowLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
  },
  earningsRowValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  payoutButton: {
    backgroundColor: COLORS.pawPink,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  payoutButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
