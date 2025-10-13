import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

interface Order {
  id: string;
  service: string;
  provider: string;
  package: string;
  slot: string;
  addons: string[];
  petType: string;
  breed: string;
  weight: string;
  address: string;
  total: number;
  city: string;
  status: string;
  createdAt: string;
}

export default function TailProOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersStr = await AsyncStorage.getItem('tailpro_orders');
      if (ordersStr) {
        const ordersData = JSON.parse(ordersStr);
        setOrders(ordersData.reverse()); // Show newest first
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

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedOrders = orders.map((order) =>
                order.id === orderId ? { ...order, status: 'cancelled' } : order
              );
              setOrders(updatedOrders);
              await AsyncStorage.setItem('tailpro_orders', JSON.stringify(updatedOrders));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Cancelled', 'Your booking has been cancelled');
            } catch (error) {
              console.error('Error cancelling order:', error);
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#27AE60';
      case 'cancelled':
        return '#E74C3C';
      case 'completed':
        return '#3498DB';
      default:
        return '#7F8C8D';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✓';
      case 'cancelled':
        return '×';
      case 'completed':
        return '✓✓';
      default:
        return '⏱';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.pawPink}
          />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📅</Text>
            <Text style={styles.emptyText}>No Appointments Yet</Text>
            <Text style={styles.emptySubtext}>Book your first service to see it here</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/tailpro_home');
              }}
              style={styles.browseButton}
            >
              <LinearGradient
                colors={[COLORS.pawPink, COLORS.gold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.browseButtonGradient}
              >
                <Text style={styles.browseButtonText}>Browse Services</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(order.status) },
                ]}
              >
                <Text style={styles.statusText}>
                  {getStatusEmoji(order.status)} {order.status.toUpperCase()}
                </Text>
              </View>

              {/* Order Info */}
              <Text style={styles.serviceTitle}>{order.service}</Text>
              <Text style={styles.providerText}>by {order.provider}</Text>

              <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Package:</Text>
                  <Text style={styles.detailValue}>{order.package}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date & Time:</Text>
                  <Text style={styles.detailValue}>{order.slot}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pet:</Text>
                  <Text style={styles.detailValue}>
                    {order.breed} ({order.weight})
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>City:</Text>
                  <Text style={styles.detailValue}>{order.city}</Text>
                </View>
                {order.addons.length > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Add-ons:</Text>
                    <Text style={styles.detailValue}>{order.addons.join(', ')}</Text>
                  </View>
                )}
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabelBold}>Total Paid:</Text>
                  <Text style={styles.detailPrice}>₹{order.total}</Text>
                </View>
              </View>

              {/* Actions */}
              {order.status === 'confirmed' && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert(
                        'Reschedule',
                        'Rescheduling feature coming soon! Please contact support.',
                        [{ text: 'OK' }]
                      );
                    }}
                    style={styles.rescheduleButton}
                  >
                    <Text style={styles.rescheduleButtonText}>Reschedule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleCancelOrder(order.id)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Booking Date */}
              <Text style={styles.bookingDate}>
                Booked on {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.md,
    color: '#7F8C8D',
    marginBottom: SPACING.xl,
  },
  browseButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    width: 200,
  },
  browseButtonGradient: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  browseButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  orderCard: {
    backgroundColor: '#FFF',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: '#FFF',
  },
  serviceTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: SPACING.xs,
    paddingRight: 80,
  },
  providerText: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
    marginBottom: SPACING.md,
  },
  orderDetails: {
    backgroundColor: COLORS.creamLight,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  detailLabel: {
    fontSize: FONT_SIZES.sm,
    color: '#7F8C8D',
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    color: '#2C3E50',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  detailLabelBold: {
    fontSize: FONT_SIZES.md,
    color: '#2C3E50',
    fontWeight: 'bold',
  },
  detailPrice: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.crimson,
    fontWeight: 'bold',
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.goldenBeige,
    marginVertical: SPACING.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  rescheduleButton: {
    flex: 1,
    backgroundColor: COLORS.pawPinkLight,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.pawPink,
  },
  rescheduleButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.warmBrown,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#E74C3C',
  },
  bookingDate: {
    fontSize: FONT_SIZES.xs,
    color: '#999',
    textAlign: 'right',
  },
});
