import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';

const BREEDS = ['Golden Retriever', 'Labrador', 'German Shepherd', 'Beagle', 'Pug', 'Bulldog', 'Poodle', 'Husky', 'Other'];
const CITIES = ['Bengaluru', 'Chennai', 'Delhi', 'Hyderabad', 'Mumbai', 'Pune'];

export default function TailMarketPostPuppy() {
  const router = useRouter();
  const [puppyName, setPuppyName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!puppyName || !breed || !age || !price || !city) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Puppy Listed',
      `Your puppy "${puppyName}" has been listed successfully on TailMarket!`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>List Puppy</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.inputLabel}>Puppy Name *</Text>
        <TextInput
          style={styles.textInput}
          value={puppyName}
          onChangeText={setPuppyName}
          placeholder="e.g., Max"
          placeholderTextColor="#999"
        />

        <Text style={styles.inputLabel}>Breed *</Text>
        <View style={styles.radioGroup}>
          {BREEDS.map((b) => (
            <TouchableOpacity
              key={b}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setBreed(b);
              }}
              style={[
                styles.radioOption,
                breed === b && styles.radioOptionSelected,
              ]}
            >
              <Text
                style={[
                  styles.radioText,
                  breed === b && styles.radioTextSelected,
                ]}
              >
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Age (Months) *</Text>
        <TextInput
          style={styles.textInput}
          value={age}
          onChangeText={setAge}
          placeholder="e.g., 3"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>Price (₹) *</Text>
        <TextInput
          style={styles.textInput}
          value={price}
          onChangeText={setPrice}
          placeholder="e.g., 25000"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />

        <Text style={styles.inputLabel}>City *</Text>
        <View style={styles.cityGrid}>
          {CITIES.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCity(c);
              }}
              style={[
                styles.cityChip,
                city === c && styles.cityChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.cityChipText,
                  city === c && styles.cityChipTextSelected,
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Tell buyers about this puppy"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <LinearGradient
            colors={[COLORS.pawPink, COLORS.gold]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitButtonGradient}
          >
            <Text style={styles.submitButtonText}>List Puppy 🐶</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  textInput: {
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: FONT_SIZES.md,
    color: '#2C3E50',
    marginBottom: SPACING.sm,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  radioOption: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  radioOptionSelected: {
    borderColor: COLORS.pawPink,
    backgroundColor: COLORS.pawPinkLight,
  },
  radioText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  radioTextSelected: {
    color: COLORS.warmBrown,
    fontWeight: 'bold',
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  cityChip: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  cityChipSelected: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.goldenBeige,
  },
  cityChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  cityChipTextSelected: {
    color: COLORS.warmBrown,
    fontWeight: 'bold',
  },
  submitButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.lg,
  },
  submitButtonGradient: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
