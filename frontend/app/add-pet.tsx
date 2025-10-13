import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

type Sex = 'Male' | 'Female';
type Temperament = 'Friendly' | 'Playful' | 'Calm' | 'Energetic' | 'Protective' | 'Other';

const TEMPERAMENT_OPTIONS: Temperament[] = ['Friendly', 'Playful', 'Calm', 'Energetic', 'Protective', 'Other'];

export default function AddPetScreen() {
  const router = useRouter();
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [birthYear, setBirthYear] = useState('');
  const [temperaments, setTemperaments] = useState<Temperament[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const toggleTemperament = (temp: Temperament) => {
    if (temperaments.includes(temp)) {
      setTemperaments(temperaments.filter(t => t !== temp));
    } else {
      setTemperaments([...temperaments, temp]);
    }
  };

  const pickImage = async () => {
    if (photos.length >= 3) {
      Alert.alert('Limit Reached', 'You can upload up to 3 photos only');
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhotos([...photos, base64Image]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!petName.trim()) {
      Alert.alert('Missing Information', 'Please complete your pet\'s profile 🐶\n\nPet Name is required');
      return;
    }
    if (!breed.trim()) {
      Alert.alert('Missing Information', 'Please complete your pet\'s profile 🐶\n\nBreed is required');
      return;
    }
    if (!sex) {
      Alert.alert('Missing Information', 'Please complete your pet\'s profile 🐶\n\nSex is required');
      return;
    }
    if (!birthYear.trim() || isNaN(Number(birthYear))) {
      Alert.alert('Missing Information', 'Please complete your pet\'s profile 🐶\n\nValid Birth Year is required');
      return;
    }
    if (temperaments.length === 0) {
      Alert.alert('Missing Information', 'Please complete your pet\'s profile 🐶\n\nSelect at least one temperament');
      return;
    }
    if (photos.length === 0) {
      Alert.alert('Missing Information', 'Please complete your pet\'s profile 🐶\n\nAdd at least one photo');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/pets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pet_name: petName,
          breed: breed,
          sex: sex,
          birth_year: parseInt(birthYear),
          temperaments: temperaments,
          photos: photos,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        router.replace('/verify');
      } else {
        Alert.alert('Error', data.detail || 'Failed to add pet');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Add pet error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Your Pet</Text>
          <Text style={styles.subtitle}>Tell us about your furry friend</Text>
        </View>

        <View style={styles.form}>
          {/* Pet Name */}
          <Text style={styles.label}>Pet Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Max, Bella"
            placeholderTextColor={COLORS.gray}
            value={petName}
            onChangeText={setPetName}
            editable={!loading}
          />

          {/* Breed */}
          <Text style={styles.label}>Breed *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Golden Retriever"
            placeholderTextColor={COLORS.gray}
            value={breed}
            onChangeText={setBreed}
            editable={!loading}
          />

          {/* Sex */}
          <Text style={styles.label}>Sex *</Text>
          <View style={styles.sexContainer}>
            <TouchableOpacity
              style={[
                styles.sexButton,
                sex === 'Male' && styles.sexButtonActive,
              ]}
              onPress={() => setSex('Male')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.sexButtonText,
                  sex === 'Male' && styles.sexButtonTextActive,
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sexButton,
                sex === 'Female' && styles.sexButtonActive,
              ]}
              onPress={() => setSex('Female')}
              disabled={loading}
            >
              <Text
                style={[
                  styles.sexButtonText,
                  sex === 'Female' && styles.sexButtonTextActive,
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>

          {/* Birth Year */}
          <Text style={styles.label}>Birth Year *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2020"
            placeholderTextColor={COLORS.gray}
            value={birthYear}
            onChangeText={setBirthYear}
            keyboardType="number-pad"
            maxLength={4}
            editable={!loading}
          />

          {/* Temperament Tags */}
          <Text style={styles.label}>Temperament Tags *</Text>
          <View style={styles.tagsContainer}>
            {TEMPERAMENT_OPTIONS.map((temp) => (
              <TouchableOpacity
                key={temp}
                style={[
                  styles.tag,
                  temperaments.includes(temp) && styles.tagActive,
                ]}
                onPress={() => toggleTemperament(temp)}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.tagText,
                    temperaments.includes(temp) && styles.tagTextActive,
                  ]}
                >
                  {temp}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pet Photos */}
          <Text style={styles.label}>Pet Photos * (up to 3)</Text>
          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 3 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={pickImage}
                disabled={loading}
              >
                <Text style={styles.addPhotoText}>+</Text>
                <Text style={styles.addPhotoLabel}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Add Pet</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 1.5,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.crimson,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gold,
    fontStyle: 'italic',
  },
  form: {
    paddingHorizontal: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  input: {
    backgroundColor: COLORS.charcoal,
    color: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    fontSize: FONT_SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  sexContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  sexButton: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.darkGray,
  },
  sexButtonActive: {
    backgroundColor: COLORS.crimson,
    borderColor: COLORS.crimson,
  },
  sexButtonText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  sexButtonTextActive: {
    color: COLORS.white,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.charcoal,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  tagActive: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  tagText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
  },
  tagTextActive: {
    color: COLORS.black,
    fontWeight: '600',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  photoWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: COLORS.charcoal,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.crimson,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.charcoal,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.darkGray,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.xxl,
    marginBottom: SPACING.xs,
  },
  addPhotoLabel: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.xs,
  },
  submitButton: {
    backgroundColor: COLORS.crimson,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
});
