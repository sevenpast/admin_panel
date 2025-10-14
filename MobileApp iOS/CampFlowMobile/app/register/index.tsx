import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface CampInfo {
  id: string;
  name: string;
  is_active: boolean;
  timezone: string;
  current_guests: number;
}

interface RegistrationData {
  camp_id: string;
  name: string;
  mobile_number: string;
  instagram: string;
  surf_package: boolean;
  surf_level: 'beginner' | 'intermediate' | 'advanced';
  allergies: string[];
  other_allergies: string;
  notes: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [permission, requestPermission] = useCameraPermissions();

  const [showScanner, setShowScanner] = useState(!params.camp_id);
  const [campInfo, setCampInfo] = useState<CampInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<RegistrationData>({
    camp_id: (params.camp_id as string) || '',
    name: '',
    mobile_number: '',
    instagram: '',
    surf_package: false,
    surf_level: 'beginner',
    allergies: [],
    other_allergies: '',
    notes: '',
  });

  const allergyOptions = [
    'vegetarian',
    'vegan',
    'gluten_free',
    'lactose_free',
    'nut_free',
    'halal',
    'kosher'
  ];

  useEffect(() => {
    if (params.camp_id) {
      loadCampInfo(params.camp_id as string);
    }
  }, [params.camp_id]);

  const loadCampInfo = async (campId: string) => {
    setLoading(true);
    try {
      // For demo purposes, we'll simulate the API call
      // In production, this would call the actual API
      const response = await fetch(`https://your-api-url/api/camps/register?camp_id=${campId}`);

      if (response.ok) {
        const result = await response.json();
        setCampInfo(result.data.camp);
        setFormData(prev => ({ ...prev, camp_id: campId }));
      } else {
        // Fallback for demo
        setCampInfo({
          id: campId,
          name: 'Demo Surf Camp',
          is_active: true,
          timezone: 'Europe/Berlin',
          current_guests: 24
        });
        setFormData(prev => ({ ...prev, camp_id: campId }));
      }
    } catch (error) {
      console.error('Error loading camp info:', error);
      // Demo fallback
      setCampInfo({
        id: campId,
        name: 'Demo Surf Camp',
        is_active: true,
        timezone: 'Europe/Berlin',
        current_guests: 24
      });
      setFormData(prev => ({ ...prev, camp_id: campId }));
    } finally {
      setLoading(false);
    }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    try {
      // Extract camp_id from QR code URL
      const url = new URL(data);
      const campId = url.searchParams.get('camp_id');

      if (campId) {
        setShowScanner(false);
        loadCampInfo(campId);
      } else {
        Alert.alert('Fehler', 'Ungültiger QR-Code. Bitte scannen Sie den Camp-QR-Code.');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Ungültiger QR-Code. Bitte scannen Sie den Camp-QR-Code.');
    }
  };

  const toggleAllergy = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const submitRegistration = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Fehler', 'Bitte geben Sie Ihren Namen ein.');
      return;
    }

    if (!formData.camp_id) {
      Alert.alert('Fehler', 'Keine Camp-ID gefunden. Bitte scannen Sie den QR-Code erneut.');
      return;
    }

    setSubmitting(true);
    try {
      // For demo purposes, we'll simulate successful registration
      // In production, this would call the actual API
      const response = await fetch('https://your-api-url/api/camps/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Simulate successful registration
      setTimeout(() => {
        Alert.alert(
          'Registrierung erfolgreich! 🎉',
          `Willkommen im ${campInfo?.name || 'Camp'}! Ihre Registrierung war erfolgreich.`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
        setSubmitting(false);
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Fehler', 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      setSubmitting(false);
    }
  };

  if (showScanner) {
    if (!permission) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <MaterialCommunityIcons name="camera" size={64} color="#6B7280" />
            <Text style={styles.permissionText}>Kamera-Berechtigung wird angefordert...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (!permission.granted) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <MaterialCommunityIcons name="camera-off" size={64} color="#EF4444" />
            <Text style={styles.permissionTitle}>Kamera-Zugriff erforderlich</Text>
            <Text style={styles.permissionText}>
              Um den QR-Code zu scannen, benötigen wir Zugriff auf Ihre Kamera.
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
              <Text style={styles.permissionButtonText}>Berechtigung erteilen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.manualButton}
              onPress={() => setShowScanner(false)}
            >
              <Text style={styles.manualButtonText}>Manuelle Eingabe</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>QR-Code scannen</Text>
            <Text style={styles.scannerSubtitle}>
              Scannen Sie den QR-Code am Camp-Eingang
            </Text>
          </View>

          <View style={styles.cameraContainer}>
            <CameraView
              style={styles.camera}
              facing="back"
              onBarcodeScanned={handleBarcodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
            />
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
            </View>
          </View>

          <TouchableOpacity
            style={styles.manualEntryButton}
            onPress={() => setShowScanner(false)}
          >
            <Text style={styles.manualEntryText}>Manuelle Eingabe</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="waves" size={32} color="#3B82F6" />
          <Text style={styles.title}>Camp Registrierung</Text>
          {campInfo && (
            <Text style={styles.campName}>{campInfo.name}</Text>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Camp-Informationen werden geladen...</Text>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Ihr vollständiger Name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Telefonnummer</Text>
              <TextInput
                style={styles.input}
                value={formData.mobile_number}
                onChangeText={(text) => setFormData(prev => ({ ...prev, mobile_number: text }))}
                placeholder="+49 123 456 7890"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instagram</Text>
              <TextInput
                style={styles.input}
                value={formData.instagram}
                onChangeText={(text) => setFormData(prev => ({ ...prev, instagram: text }))}
                placeholder="@username"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Surf-Paket</Text>
              <TouchableOpacity
                style={[styles.checkbox, formData.surf_package && styles.checkboxChecked]}
                onPress={() => setFormData(prev => ({ ...prev, surf_package: !prev.surf_package }))}
              >
                <MaterialCommunityIcons
                  name={formData.surf_package ? "check" : "plus"}
                  size={20}
                  color={formData.surf_package ? "#FFFFFF" : "#6B7280"}
                />
                <Text style={[styles.checkboxText, formData.surf_package && styles.checkboxTextChecked]}>
                  Ich möchte das Surf-Paket buchen
                </Text>
              </TouchableOpacity>
            </View>

            {formData.surf_package && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Surf-Level</Text>
                <View style={styles.segmentedControl}>
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.segment,
                        formData.surf_level === level && styles.segmentActive
                      ]}
                      onPress={() => setFormData(prev => ({ ...prev, surf_level: level as any }))}
                    >
                      <Text style={[
                        styles.segmentText,
                        formData.surf_level === level && styles.segmentTextActive
                      ]}>
                        {level === 'beginner' ? 'Anfänger' :
                         level === 'intermediate' ? 'Fortgeschritten' : 'Profi'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Allergien & Diät</Text>
              <View style={styles.allergyContainer}>
                {allergyOptions.map((allergy) => (
                  <TouchableOpacity
                    key={allergy}
                    style={[
                      styles.allergyChip,
                      formData.allergies.includes(allergy) && styles.allergyChipSelected
                    ]}
                    onPress={() => toggleAllergy(allergy)}
                  >
                    <Text style={[
                      styles.allergyChipText,
                      formData.allergies.includes(allergy) && styles.allergyChipTextSelected
                    ]}>
                      {allergy === 'vegetarian' ? 'Vegetarisch' :
                       allergy === 'vegan' ? 'Vegan' :
                       allergy === 'gluten_free' ? 'Glutenfrei' :
                       allergy === 'lactose_free' ? 'Laktosefrei' :
                       allergy === 'nut_free' ? 'Nussfrei' :
                       allergy === 'halal' ? 'Halal' : 'Koscher'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weitere Allergien</Text>
              <TextInput
                style={styles.input}
                value={formData.other_allergies}
                onChangeText={(text) => setFormData(prev => ({ ...prev, other_allergies: text }))}
                placeholder="Weitere Allergien oder Unverträglichkeiten"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notizen</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Besondere Wünsche oder Anmerkungen"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={submitRegistration}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Registrierung abschließen</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  campName: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 8,
  },
  checkboxTextChecked: {
    color: '#FFFFFF',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: '#3B82F6',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  allergyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  allergyChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  allergyChipText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  allergyChipTextSelected: {
    color: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },

  // Scanner styles
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  manualButton: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  manualButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  scannerContainer: {
    flex: 1,
  },
  scannerHeader: {
    padding: 20,
    backgroundColor: '#0F172A',
    alignItems: 'center',
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  scannerSubtitle: {
    fontSize: 14,
    color: '#CBD5F5',
    marginTop: 4,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  manualEntryButton: {
    backgroundColor: '#0F172A',
    paddingVertical: 16,
    alignItems: 'center',
  },
  manualEntryText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});