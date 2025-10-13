import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to TailFlix! 🐾</Text>
        <Text style={styles.subtitle}>Where pets lead the way to love</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Coming Soon:</Text>
          
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💕</Text>
            <Text style={styles.featureTitle}>Tug - Human Dating</Text>
            <Text style={styles.featureDescription}>
              Connect with fellow pet lovers
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎾</Text>
            <Text style={styles.featureTitle}>Pet Dating</Text>
            <Text style={styles.featureDescription}>
              Ball • Frisbee • Bone • Golden Bone
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.crimson,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gold,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: SPACING.xxl,
  },
  infoContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
  },
  featureCard: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  featureIcon: {
    fontSize: FONT_SIZES.xxl,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  featureTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gold,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: COLORS.darkGray,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  logoutText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
  },
});
