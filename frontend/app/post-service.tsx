import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function PostService() {
  const router = useRouter();

  return (
    <LinearGradient colors={[COLORS.cream, COLORS.peach]} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>List Service Feature</Text>
        <Text style={styles.subtitle}>Coming Soon! 💼</Text>
        <Text style={styles.description}>
          List your premium pet services on TailPro and connect with pet owners
        </Text>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to TailPro</Text>
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
