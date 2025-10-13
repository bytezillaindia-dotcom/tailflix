import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function VerificationSuccessScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>Verification Submitted</Text>
        <Text style={styles.subtitle}>
          Your profile will be visible after approval.
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What Happens Next?</Text>
          <Text style={styles.infoText}>
            📋 Our team will review your verification within 24-48 hours
          </Text>
          <Text style={styles.infoText}>
            📧 You'll receive a notification once approved
          </Text>
          <Text style={styles.infoText}>
            🔒 Your data is secure and encrypted
          </Text>
          <Text style={styles.infoText}>
            🐾 After approval, you can access all TailFlix features
          </Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Status: Pending Review</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Thank you for helping us keep TailFlix safe!
        </Text>
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
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
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
    marginBottom: SPACING.xxl,
  },
  infoCard: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  infoTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gold,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
  statusBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginBottom: SPACING.xl,
  },
  statusText: {
    color: COLORS.black,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: COLORS.crimson,
    padding: SPACING.md,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  footerText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
