import {
  View,
  Text,
  StyleSheet,
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

export default function VerifyScreen() {
  const router = useRouter();
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [petPosePhoto, setPetPosePhoto] = useState<string | null>(null);
  const [docPhoto, setDocPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

  const pickImage = async (type: 'selfie' | 'petPose' | 'doc') => {
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
      
      if (type === 'selfie') {
        setSelfiePhoto(base64Image);
      } else if (type === 'petPose') {
        setPetPosePhoto(base64Image);
      } else if (type === 'doc') {
        setDocPhoto(base64Image);
      }
    }
  };

  const removePhoto = (type: 'selfie' | 'petPose' | 'doc') => {
    if (type === 'selfie') {
      setSelfiePhoto(null);
    } else if (type === 'petPose') {
      setPetPosePhoto(null);
    } else if (type === 'doc') {
      setDocPhoto(null);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selfiePhoto) {
      Alert.alert('Missing Information', 'Selfie photo is required for verification');
      return;
    }
    if (!petPosePhoto) {
      Alert.alert('Missing Information', 'Pet pose photo is required for verification');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selfie_url: selfiePhoto,
          pet_pose_url: petPosePhoto,
          doc_url: docPhoto || null,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        router.replace('/verification-success');
      } else {
        Alert.alert('Error', data.detail || 'Failed to submit verification');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPhotoSection = (
    title: string,
    description: string,
    photo: string | null,
    type: 'selfie' | 'petPose' | 'doc',
    required: boolean = true
  ) => (
    <View style={styles.photoSection}>
      <View style={styles.photoHeader}>
        <Text style={styles.photoTitle}>
          {title} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <Text style={styles.photoDescription}>{description}</Text>
      </View>

      {photo ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: photo }} style={styles.photoPreview} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removePhoto(type)}
          >
            <Text style={styles.removeButtonText}>× Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => pickImage(type)}
          disabled={loading}
        >
          <Text style={styles.uploadIcon}>📷</Text>
          <Text style={styles.uploadText}>Upload Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
          <Text style={styles.title}>Verification Required</Text>
          <Text style={styles.subtitle}>
            Help us keep TailFlix safe and authentic
          </Text>
        </View>

        <View style={styles.form}>
          {renderPhotoSection(
            'Selfie Photo',
            'Clear photo of yourself for identity verification',
            selfiePhoto,
            'selfie',
            true
          )}

          {renderPhotoSection(
            'Pet Pose Photo',
            'You and your pet together to verify pet ownership',
            petPosePhoto,
            'petPose',
            true
          )}

          {renderPhotoSection(
            'Document Upload',
            'Optional: ID or pet vaccination records',
            docPhoto,
            'doc',
            false
          )}

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Your information is encrypted and only used for verification purposes.
              Review typically takes 24-48 hours.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit for Verification</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.skipText}>Skip for now</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.crimson,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gold,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: SPACING.xl,
  },
  photoSection: {
    marginBottom: SPACING.xl,
  },
  photoHeader: {
    marginBottom: SPACING.md,
  },
  photoTitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.crimson,
  },
  photoDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
  },
  uploadButton: {
    backgroundColor: COLORS.charcoal,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.darkGray,
    borderStyle: 'dashed',
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  uploadText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
  },
  photoPreviewContainer: {
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.charcoal,
  },
  removeButton: {
    backgroundColor: COLORS.crimson,
    padding: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  removeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: COLORS.charcoal,
    padding: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  infoText: {
    flex: 1,
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: COLORS.crimson,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    padding: SPACING.sm,
  },
  skipText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
    textDecorationLine: 'underline',
  },
});
