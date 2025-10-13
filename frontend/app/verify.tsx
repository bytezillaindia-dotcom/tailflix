import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function VerifyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✅</Text>
        <Text style={styles.title}>Pet Added Successfully!</Text>
        <Text style={styles.subtitle}>
          Your pet profile is being verified
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What's Next?</Text>
          <Text style={styles.infoText}>
            • Our team is reviewing your pet's profile
          </Text>
          <Text style={styles.infoText}>
            • You'll be notified once verification is complete
          </Text>
          <Text style={styles.infoText}>
            • Meanwhile, explore pet and human dating features
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/add-pet')}
        >
          <Text style={styles.secondaryButtonText}>Add Another Pet</Text>
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
    lineHeight: 20,
  },
  button: {
    backgroundColor: COLORS.crimson,
    padding: SPACING.md,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
  },
});
