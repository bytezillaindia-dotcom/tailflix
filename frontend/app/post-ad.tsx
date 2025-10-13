import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function PostAd() {
  const router = useRouter();

  return (
    <LinearGradient colors={COLORS.gradientPeach} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Post Ad Feature</Text>
        <Text style={styles.subtitle}>Coming Soon! 🚀</Text>
        <Text style={styles.description}>
          Create poster-style ads for Lost, Found, Services, and Events
        </Text>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to TailBoard</Text>
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
    backgroundColor: COLORS.pawPink,
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
