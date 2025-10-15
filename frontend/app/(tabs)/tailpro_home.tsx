import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - SPACING.lg * 3) / 2;

interface Service {
  id: string;
  title: string;
  icon: string;
  description: string;
  route: string;
  gradient: string[];
}

const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Grooming',
    icon: '✂️',
    description: 'Professional pet grooming',
    route: '/tailpro_list',
    gradient: ['#FFB6C1', '#FFD1DC'],
  },
  {
    id: '2',
    title: 'Training',
    icon: '🎓',
    description: 'Expert pet training',
    route: '/tailpro_list',
    gradient: ['#FFD47D', '#FFE4B5'],
  },
  {
    id: '3',
    title: 'Veterinary',
    icon: '🏥',
    description: 'Healthcare services',
    route: '/tailpro_list',
    gradient: ['#B0E0E6', '#87CEEB'],
  },
  {
    id: '4',
    title: 'Walking',
    icon: '🚶',
    description: 'Daily pet walks',
    route: '/tailpro_list',
    gradient: ['#98FB98', '#90EE90'],
  },
  {
    id: '5',
    title: 'Boarding',
    icon: '🏠',
    description: 'Pet boarding & daycare',
    route: '/tailpro_list',
    gradient: ['#DDA0DD', '#EE82EE'],
  },
  {
    id: '6',
    title: 'Photography',
    icon: '📸',
    description: 'Pet photoshoots',
    route: '/tailpro_list',
    gradient: ['#F0E68C', '#FFD700'],
  },
];

export default function TailProHomeScreen() {
  const router = useRouter();

  const renderServiceCard = (service: Service) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => router.push(service.route as any)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={service.gradient}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <Text style={styles.serviceIcon}>{service.icon}</Text>
          <Text style={styles.serviceTitle}>{service.title}</Text>
          <Text style={styles.serviceDescription}>{service.description}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TailPro Services 💼</Text>
          <Text style={styles.headerSubtitle}>Professional care for your pet</Text>
        </View>
        <TouchableOpacity
          style={styles.becomePartnerButton}
          onPress={() => router.push('/tailpro_partner_signup')}
        >
          <Text style={styles.becomePartnerText}>Become Partner</Text>
        </TouchableOpacity>
      </View>

      {/* Services Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {SERVICES.map((service) => renderServiceCard(service))}
        </View>

        {/* My Orders Card */}
        <TouchableOpacity
          style={styles.myOrdersCard}
          onPress={() => router.push('/tailpro_orders')}
        >
          <View style={styles.myOrdersContent}>
            <View style={styles.myOrdersLeft}>
              <Text style={styles.myOrdersIcon}>📋</Text>
              <View>
                <Text style={styles.myOrdersTitle}>My Appointments</Text>
                <Text style={styles.myOrdersSubtitle}>View booking history</Text>
              </View>
            </View>
            <Text style={styles.myOrdersArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoTitle}>How TailPro Works</Text>
          <Text style={styles.infoText}>
            1. Select a service {'\n'}
            2. Choose a verified partner {'\n'}
            3. Book your appointment {'\n'}
            4. Pay 10 TailCoins booking fee
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xxl + 10,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginTop: 4,
  },
  becomePartnerButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  becomePartnerText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cardGradient: {
    flex: 1,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  serviceIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  serviceTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  serviceDescription: {
    fontSize: FONT_SIZES.xs,
    color: '#666',
    textAlign: 'center',
  },
  myOrdersCard: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  myOrdersContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myOrdersLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  myOrdersIcon: {
    fontSize: 36,
    marginRight: SPACING.md,
  },
  myOrdersTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  myOrdersSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
  },
  myOrdersArrow: {
    fontSize: 24,
    color: COLORS.primary,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 182, 193, 0.1)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 182, 193, 0.3)',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
});
