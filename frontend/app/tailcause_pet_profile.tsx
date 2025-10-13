import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

export default function TailCausePetProfile() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const handleApplyForAdoption = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      '💝 Apply for Adoption',
      'Unlock adoption contact for 5 TailCoins?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock (5 coins)',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              'Success! 🎉',
              'Contact information unlocked! The rescue organization will reach out to you within 24 hours.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.cream, COLORS.softPeach]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Profile</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Pet Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400' }}
            style={styles.petImage}
          />
          <View style={styles.heartBadge}>
            <Text style={styles.heartEmoji}>💝</Text>
          </View>
        </View>

        {/* Pet Details Card */}
        <View style={styles.card}>
          <View style={styles.nameSection}>
            <Text style={styles.petName}>Max</Text>
            <Text style={styles.verifiedBadge}>✅ Verified NGO</Text>
          </View>

          <View style={styles.detailsGrid}>
            <DetailRow label="Age" value="2 years" icon="🎂" />
            <DetailRow label="Breed" value="Indie" icon="🐕" />
            <DetailRow label="Vaccinated" value="Yes" icon="💉" />
            <DetailRow label="Gender" value="Male" icon="♂️" />
            <DetailRow label="Size" value="Medium" icon="📏" />
            <DetailRow label="Location" value="Bengaluru" icon="📍" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Max 📖</Text>
            <Text style={styles.aboutText}>
              Max was rescued from the streets and has been with Hope Rescue for 6 months.
              He is a friendly and playful dog who loves kids and gets along well with other pets.
              Max is house-trained, vaccinated, and ready to find his forever home. He enjoys
              walks in the park and belly rubs. Looking for a loving family to adopt him!
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rescue Organization 🏠</Text>
            <View style={styles.orgCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=60&h=60' }}
                style={styles.orgLogo}
              />
              <View style={styles.orgInfo}>
                <Text style={styles.orgName}>Hope Rescue</Text>
                <Text style={styles.orgDesc}>Saving lives, one paw at a time</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyForAdoption}>
          <LinearGradient
            colors={[COLORS.pawPink, COLORS.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.applyButtonGradient}
          >
            <Text style={styles.applyButtonText}>Apply for Adoption 💝</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
  icon: string;
}

function DetailRow({ label, value, icon }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.chocolateBrown,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: SPACING.xxl,
  },
  imageContainer: {
    position: 'relative',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  petImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.goldenBeige,
  },
  heartBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heartEmoji: {
    fontSize: 28,
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.gold,
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nameSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  petName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
  },
  verifiedBadge: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.chocolateBrown,
    backgroundColor: COLORS.softPeach,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  detailRow: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warmBrown,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.chocolateBrown,
  },
  section: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.goldenBeige,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
    marginBottom: SPACING.sm,
  },
  aboutText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warmBrown,
    lineHeight: 22,
  },
  orgCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.softPeach,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  orgLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.md,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
    marginBottom: 4,
  },
  orgDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warmBrown,
  },
  applyButton: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    shadowColor: COLORS.pawPink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
