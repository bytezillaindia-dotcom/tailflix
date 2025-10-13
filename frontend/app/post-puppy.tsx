import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function PostPuppy() {
  const router = useRouter();

  return (
    <LinearGradient colors={[COLORS.cream, COLORS.goldenBeige]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>List Puppy Feature</Text>
        <Text style={styles.subtitle}>Coming Soon! 🐶</Text>
        <Text style={styles.description}>
          List your puppies for sale on TailMarket with verified breeder badges
        </Text>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to TailMarket</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.chocolateBrown,
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.pawPink,
    marginBottom: SPACING.lg,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.warmBrown,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  backButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 20,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
});
