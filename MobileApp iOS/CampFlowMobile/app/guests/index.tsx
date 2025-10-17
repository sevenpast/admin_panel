import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';
import { apiService, Guest } from '@/lib/api';

type AssessmentScore = 1 | 2 | 3 | 4 | 5;
type AssessmentQuestionId =
  | 'arrival_orientation'
  | 'safety_briefing'
  | 'equipment_handling'
  | 'schedule_punctuality'
  | 'team_collaboration'
  | 'water_confidence'
  | 'outdoor_readiness'
  | 'health_awareness'
  | 'communication_skills'
  | 'goal_commitment';

type AssessmentQuestion = {
  id: AssessmentQuestionId;
  label: string;
};

const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  { id: 'arrival_orientation', label: 'Ankunft & Orientierung' },
  { id: 'safety_briefing', label: 'Sicherheitsbriefing verstanden' },
  { id: 'equipment_handling', label: 'Umgang mit Ausrüstung' },
  { id: 'schedule_punctuality', label: 'Pünktlichkeit zum Tagesprogramm' },
  { id: 'team_collaboration', label: 'Team- & Gruppenverhalten' },
  { id: 'water_confidence', label: 'Sicherheit im Wasser' },
  { id: 'outdoor_readiness', label: 'Bereitschaft für Outdoor-Aktivitäten' },
  { id: 'health_awareness', label: 'Bewusstsein für eigene Gesundheit' },
  { id: 'communication_skills', label: 'Kommunikation mit dem Team' },
  { id: 'goal_commitment', label: 'Verbindlichkeit gegenüber Zielen' },
];

const ASSESSMENT_SCORE_OPTIONS: AssessmentScore[] = [1, 2, 3, 4, 5];

type GuestAssessment = Record<AssessmentQuestionId, AssessmentScore>;

const createAssessmentTemplate = (score: AssessmentScore = 3): GuestAssessment => {
  const template = {} as GuestAssessment;
  ASSESSMENT_QUESTIONS.forEach((question) => {
    template[question.id] = score;
  });
  return template;
};

// Guest type is now imported from API service

type GuestViewMode = 'overview' | 'detail' | 'create';
type GuestSectionView = 'personal' | 'assessment';

// Guests will be fetched from the API

const STATUS_META = {
  active: { label: 'Aktiv', color: '#2563EB', icon: 'check-circle-outline' as const },
  inactive: { label: 'Inaktiv', color: '#9CA3AF', icon: 'pause-circle-outline' as const },
  package: { label: 'Im Package', color: '#0EA5E9', icon: 'bag-checked' as const },
  noPackage: { label: 'Nicht im Package', color: '#F97316', icon: 'bag-personal-off-outline' as const },
};

type GuestFilterKey = 'active' | 'inactive' | 'package' | 'noPackage';

type FilterDefinition = {
  key: GuestFilterKey;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  predicate: (guest: Guest) => boolean;
};

const FILTERS: FilterDefinition[] = [
  {
    key: 'active',
    label: 'Aktiv',
    icon: STATUS_META.active.icon,
    predicate: (guest) => guest.is_active,
  },
  {
    key: 'inactive',
    label: 'Inaktiv',
    icon: STATUS_META.inactive.icon,
    predicate: (guest) => !guest.is_active,
  },
  {
    key: 'package',
    label: 'Im Package',
    icon: STATUS_META.package.icon,
    predicate: (guest) => guest.has_surf_package,
  },
  {
    key: 'noPackage',
    label: 'Nicht im Package',
    icon: STATUS_META.noPackage.icon,
    predicate: (guest) => !guest.has_surf_package,
  },
];

const ROOM_OPTIONS = ['River Lodge 12', 'Mountain Cabin 03', 'Garden Suite 05', 'Lake View 07', 'Forest Cabin 09'];
const BED_OPTIONS = ['King Bed', 'Queen Bed', 'Single Bed', 'Twin Bed', 'Bunk Bed'];
const ALLERGY_PRESETS = ['Gluten', 'Erdnüsse', 'Laktose', 'Haselnüsse'];

type FormFieldProps = {
  label: string;
  children: ReactNode;
  style?: ViewStyle;
};

const buildNewGuest = (): Partial<Guest> => ({
  guest_code: '',
  name: '',
  phone: '',
  instagram: '',
  allergies: '',
  is_active: true,
  has_surf_package: false,
});

export default function GuestsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const headerTint = Colors[colorScheme].tint;

  const [mode, setMode] = useState<GuestViewMode>('overview');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<GuestFilterKey[]>([]);
  const [editableGuest, setEditableGuest] = useState<Guest | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newGuest, setNewGuest] = useState<Partial<Guest>>(() => buildNewGuest());
  const [isRoomPickerOpen, setRoomPickerOpen] = useState(false);
  const [isBedPickerOpen, setBedPickerOpen] = useState(false);
  const [selectedAllergyOptions, setSelectedAllergyOptions] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [detailSection, setDetailSection] = useState<GuestSectionView>('personal');
  const [createSection, setCreateSection] = useState<GuestSectionView>('personal');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch guests data
  const fetchGuests = async () => {
    try {
      setLoading(true);
      setError(null);
      const guestsData = await apiService.getGuests();
      setGuests(guestsData);
    } catch (err) {
      console.error('Error fetching guests:', err);
      setError('Failed to load guests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    if (mode === 'detail' && selectedGuest) {
      setEditableGuest(selectedGuest);
      setIsEditing(false);
      setDetailSection('personal');
    }

    if (mode === 'overview') {
      setEditableGuest(null);
      setSelectedGuest(null);
      setIsEditing(false);
      setDetailSection('personal');
    }

    if (mode === 'create') {
      setNewGuest(buildNewGuest());
      setEditableGuest(null);
      setIsEditing(false);
      setSelectedAllergyOptions([]);
      setCustomAllergy('');
      setRoomPickerOpen(false);
      setBedPickerOpen(false);
      setCreateSection('personal');
    }
  }, [mode, selectedGuest]);

  const filteredGuests = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return guests.filter((guest) => {
      const matchesSearch = normalizedSearch
        ? guest.name.toLowerCase().includes(normalizedSearch) ||
          guest.guest_code.toLowerCase().includes(normalizedSearch) ||
          guest.room_assignment?.room_name.toLowerCase().includes(normalizedSearch) ||
          guest.room_assignment?.bed_name.toLowerCase().includes(normalizedSearch) ||
          guest.phone.toLowerCase().includes(normalizedSearch) ||
          guest.instagram?.toLowerCase().includes(normalizedSearch) ||
          guest.allergies?.toLowerCase().includes(normalizedSearch)
        : true;

      const matchesFilters =
        activeFilters.length === 0 || activeFilters.every((filterKey) => FILTERS.find((f) => f.key === filterKey)?.predicate(guest));

      return matchesSearch && matchesFilters;
    });
  }, [guests, searchTerm, activeFilters]);

  const renderGuestCard = ({ item }: { item: Guest }) => {
    const activityMeta = item.is_active ? STATUS_META.active : STATUS_META.inactive;

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.guestCard}
        activeOpacity={0.82}
        onPress={() => {
          setSelectedGuest(item);
          setMode('detail');
        }}
      >
        <View style={styles.guestCardHeader}>
          <Text style={styles.guestName}>{item.name}</Text>
        </View>
        <Text style={styles.guestMeta}>Gast-ID: {item.guest_code}</Text>
        <Text style={styles.guestMetaSecondary}>Tel: {item.phone}</Text>
        <Text style={styles.guestMetaSecondary}>IG: {item.instagram || 'N/A'}</Text>
        <View style={styles.guestBadgeRow}>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: `${activityMeta.color}18`,
                borderColor: `${activityMeta.color}3D`,
              },
            ]}
          >
            <MaterialCommunityIcons name={activityMeta.icon} size={16} color={activityMeta.color} />
            <Text style={[styles.statusBadgeText, { color: activityMeta.color }]}>{activityMeta.label}</Text>
          </View>
        </View>
        <Text style={styles.guestRoom}>{item.room_assignment?.room_name || 'No room assigned'}</Text>
        <Text style={styles.guestMetaSecondary}>Bett: {item.room_assignment?.bed_name || 'No bed assigned'}</Text>
        <Text style={styles.guestMetaSecondary}>Allergien: {item.allergies || 'Keine'}</Text>
      </TouchableOpacity>
    );
  };

  const handleSaveDraft = async () => {
    if (!editableGuest) {
      return;
    }

    try {
      const updatedGuest = await apiService.updateGuest(editableGuest.id, editableGuest);
      setSelectedGuest(updatedGuest);
      setGuests(prev => prev.map(g => g.id === updatedGuest.id ? updatedGuest : g));
      setIsEditing(false);
      Alert.alert('Success', 'Guest updated successfully');
    } catch (error) {
      console.error('Error updating guest:', error);
      Alert.alert('Error', 'Failed to update guest');
    }
  };

  const handleCreateGuest = async () => {
    const generatedGuestCode = `GF-${Math.floor(1000 + Math.random() * 9000)}`;
    const combinedAllergies = [
      ...selectedAllergyOptions,
      ...(customAllergy.trim() ? [customAllergy.trim()] : []),
    ];
    const allergyText = combinedAllergies.length ? combinedAllergies.join(', ') : '';

    try {
      const guestData = {
        ...newGuest,
        guest_code: generatedGuestCode,
        allergies: allergyText,
      };

      const createdGuest = await apiService.createGuest(guestData);
      setGuests(prev => [...prev, createdGuest]);
      
      Alert.alert('Success', `Guest ${generatedGuestCode} created successfully`);

      setNewGuest(buildNewGuest());
      setSelectedAllergyOptions([]);
      setCustomAllergy('');
      setRoomPickerOpen(false);
      setBedPickerOpen(false);
      setMode('overview');
    } catch (error) {
      console.error('Error creating guest:', error);
      Alert.alert('Error', 'Failed to create guest');
    }
  };

  const Overview = () => (
    <View style={styles.guestsContainer}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Suche nach Namen, ID oder Zimmer"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
      </View>
      <View style={styles.filterRow}>
        {FILTERS.map((filter) => {
          const isActive = activeFilters.includes(filter.key);
          const activeColor = (() => {
            switch (filter.key) {
              case 'active':
                return STATUS_META.active.color;
              case 'inactive':
                return STATUS_META.inactive.color;
              case 'package':
                return STATUS_META.package.color;
              case 'noPackage':
                return STATUS_META.noPackage.color;
              default:
                return '#2563EB';
            }
          })();

          const toggleFilter = () => {
            setActiveFilters((prev) =>
              isActive ? prev.filter((key) => key !== filter.key) : [...prev, filter.key],
            );
          };

          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, isActive && [styles.filterChipActive, { borderColor: activeColor }]]}
              onPress={toggleFilter}
              activeOpacity={0.85}
              accessibilityLabel={filter.label}
            >
              <MaterialCommunityIcons
                name={filter.icon}
                size={22}
                color={isActive ? activeColor : '#475569'}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="loading" size={32} color="#6B7280" />
          <Text style={styles.loadingText}>Loading guests...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={32} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchGuests}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredGuests}
          keyExtractor={(item) => item.id}
          renderItem={renderGuestCard}
          contentContainerStyle={styles.guestListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search" size={36} color="#9CA3AF" />
              <Text style={styles.emptyStateTitle}>Keine Gäste gefunden</Text>
              <Text style={styles.emptyStateText}>
                Passe Suche oder Filter an, um weitere Gäste zu sehen.
              </Text>
            </View>
          }
        />
      )}
      
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: headerTint }]}
        onPress={() => setMode('create')}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

const Detail = () => {
  const activityMeta = editableGuest?.isActive ? STATUS_META.active : STATUS_META.inactive;

  const actionButtons: Array<{
    key: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    onPress: () => void;
  }> = [
    {
      key: 'back',
      icon: 'account-group-outline',
      color: '#2563EB',
      onPress: () => setMode('overview'),
    },
    {
      key: 'edit',
      icon: 'pencil-circle-outline',
      color: isEditing ? '#059669' : '#F59E0B',
      onPress: () => {
        if (!editableGuest) {
          return;
        }
        if (isEditing) {
          setIsEditing(false);
          setEditableGuest(selectedGuest);
        } else {
          setIsEditing(true);
        }
      },
    },
    {
      key: 'delete',
      icon: 'trash-can-outline',
      color: '#EF4444',
      onPress: () => Alert.alert('Löschen', 'Dummy Löschaktion ausgeführt.'),
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.detailWrapper} showsVerticalScrollIndicator={false}>
      <View style={styles.actionBar}>
        {actionButtons.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={styles.quickActionButton}
            onPress={action.onPress}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.detailCardLarge}>
        <View style={styles.guestDetailHeader}>
          <Text style={styles.guestDetailName}>{editableGuest?.name ?? 'Gastdetails'}</Text>
        </View>
        <Text style={styles.detailDescription}>
          Dieser Dummy zeigt, wie die Detailansicht später aussehen kann. Nutze "Bearbeiten", um eine
          Demo-Anpassung vorzunehmen.
        </Text>
        <View style={styles.sectionToggleContainer}>
          <SectionToggle value={detailSection} onChange={setDetailSection} />
        </View>

        {detailSection === 'personal' ? (
          <>
            <GuestDetailRow
              icon="card-account-details-outline"
              editable={false}
              value={editableGuest?.guestCode ?? '-'}
              placeholder="Gast-ID"
              onChangeText={() => undefined}
            />
            <GuestDetailRow
              icon="account"
              editable={isEditing}
              value={editableGuest?.name ?? ''}
              placeholder="Name"
              onChangeText={(value) =>
                setEditableGuest((prev) => (prev ? { ...prev, name: value } : prev))
              }
            />
            <GuestDetailRow
              icon="phone"
              editable={isEditing}
              value={editableGuest?.phone ?? ''}
              placeholder="Telefon"
              keyboardType="phone-pad"
              onChangeText={(value) =>
                setEditableGuest((prev) => (prev ? { ...prev, phone: value } : prev))
              }
            />
            <GuestDetailRow
              icon="instagram"
              editable={isEditing}
              value={editableGuest?.instagram ?? ''}
              placeholder="Instagram"
              onChangeText={(value) =>
                setEditableGuest((prev) => (prev ? { ...prev, instagram: value } : prev))
              }
            />
            <GuestDetailRow
              icon="checkbox-marked-circle-outline"
              editable={false}
              value={activityMeta.label}
              placeholder="Status"
              onChangeText={() => undefined}
            />
            <GuestDetailRow
              icon="door-closed"
              editable={isEditing}
              value={editableGuest?.room ?? ''}
              placeholder="Zimmer"
              onChangeText={(value) =>
                setEditableGuest((prev) => (prev ? { ...prev, room: value } : prev))
              }
            />
            <GuestDetailRow
              icon="bed"
              editable={isEditing}
              value={editableGuest?.bed ?? ''}
              placeholder="Bett"
              onChangeText={(value) =>
                setEditableGuest((prev) => (prev ? { ...prev, bed: value } : prev))
              }
            />
            <GuestDetailRow
              icon="food-apple-outline"
              editable={isEditing}
              value={editableGuest?.allergies ?? ''}
              placeholder="Allergien"
              onChangeText={(value) =>
                setEditableGuest((prev) => (prev ? { ...prev, allergies: value } : prev))
              }
            />
          </>
        ) : (
          <View style={styles.assessmentSection}>
            {ASSESSMENT_QUESTIONS.map((question) => (
              <AssessmentRatingRow
                key={question.id}
                label={question.label}
                value={editableGuest?.assessment[question.id] ?? 3}
                editable={!!isEditing && !!editableGuest}
                onSelect={(score) =>
                  setEditableGuest((prev) =>
                    prev
                      ? {
                          ...prev,
                          assessment: { ...prev.assessment, [question.id]: score },
                        }
                      : prev,
                  )
                }
              />
            ))}
          </View>
        )}
        {isEditing && (
          <View style={styles.detailFooter}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.saveButton]}
              onPress={handleSaveDraft}
              accessibilityRole="button"
              accessibilityLabel="Änderungen speichern"
            >
              <MaterialCommunityIcons name="content-save-outline" size={24} color="#059669" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

  const Create = () => (
    <ScrollView contentContainerStyle={styles.guestCreateWrapper} showsVerticalScrollIndicator={false}>
      <View style={styles.detailCardLarge}>
        <Text style={styles.guestDetailName}>Neuer Gast</Text>
        <Text style={styles.detailDescription}>
          Dieses Formular dient als Vorlage. Ergänze später die echte API-Anbindung und Validierung.
        </Text>

        <View style={styles.sectionToggleContainer}>
          <SectionToggle value={createSection} onChange={setCreateSection} />
        </View>

        {createSection === 'personal' ? (
          <>
            <FormField label="Name">
              <TextInput
                value={newGuest.name}
                onChangeText={(value) => setNewGuest((prev) => ({ ...prev, name: value }))}
                style={styles.formInput}
                placeholder="Vor- und Nachname"
                placeholderTextColor="#94A3B8"
              />
            </FormField>
            <FormField label="Telefon">
              <TextInput
                value={newGuest.phone}
                onChangeText={(value) => setNewGuest((prev) => ({ ...prev, phone: value }))}
                style={styles.formInput}
                placeholder="Telefon"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            </FormField>
            <FormField label="Instagram">
              <TextInput
                value={newGuest.instagram}
                onChangeText={(value) => setNewGuest((prev) => ({ ...prev, instagram: value }))}
                style={styles.formInput}
                placeholder="@handle"
                placeholderTextColor="#94A3B8"
              />
            </FormField>
            <FormField label="Zimmer">
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setRoomPickerOpen((prev) => !prev)}
                  accessibilityRole="button"
                >
                  <Text style={styles.pickerTriggerText}>{newGuest.room || 'Zimmer auswählen'}</Text>
                  <MaterialCommunityIcons
                    name={isRoomPickerOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#1F2937"
                  />
                </TouchableOpacity>
                {isRoomPickerOpen && (
                  <View style={styles.pickerOptions}>
                    {ROOM_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.pickerOption, newGuest.room === option && styles.pickerOptionActive]}
                        onPress={() => {
                          setNewGuest((prev) => ({ ...prev, room: option }));
                          setRoomPickerOpen(false);
                        }}
                      >
                        <Text style={[styles.pickerOptionText, newGuest.room === option && styles.pickerOptionTextActive]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </FormField>
            <FormField label="Bett">
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={styles.pickerTrigger}
                  onPress={() => setBedPickerOpen((prev) => !prev)}
                  accessibilityRole="button"
                >
                  <Text style={styles.pickerTriggerText}>{newGuest.bed || 'Bett auswählen'}</Text>
                  <MaterialCommunityIcons
                    name={isBedPickerOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#1F2937"
                  />
                </TouchableOpacity>
                {isBedPickerOpen && (
                  <View style={styles.pickerOptions}>
                    {BED_OPTIONS.map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[styles.pickerOption, newGuest.bed === option && styles.pickerOptionActive]}
                        onPress={() => {
                          setNewGuest((prev) => ({ ...prev, bed: option }));
                          setBedPickerOpen(false);
                        }}
                      >
                        <Text style={[styles.pickerOptionText, newGuest.bed === option && styles.pickerOptionTextActive]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </FormField>
            <FormField label="Allergien">
              <View style={styles.allergyChipsContainer}>
                {ALLERGY_PRESETS.map((option) => {
                  const selected = selectedAllergyOptions.includes(option);
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.allergyChip, selected && styles.allergyChipActive]}
                      onPress={() =>
                        setSelectedAllergyOptions((prev) =>
                          selected ? prev.filter((item) => item !== option) : [...prev, option],
                        )
                      }
                      accessibilityRole="button"
                    >
                      <MaterialCommunityIcons
                        name={selected ? 'check' : 'plus'}
                        size={16}
                        color={selected ? '#FFFFFF' : '#1F2937'}
                      />
                      <Text style={[styles.allergyChipText, selected && styles.allergyChipTextActive]}>{option}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TextInput
                value={customAllergy}
                onChangeText={setCustomAllergy}
                style={styles.allergyCustomInput}
                placeholder="Weitere Allergien (optional)"
                placeholderTextColor="#94A3B8"
              />
            </FormField>
          </>
        ) : (
          <View style={styles.assessmentSection}>
            {ASSESSMENT_QUESTIONS.map((question) => (
              <AssessmentRatingRow
                key={question.id}
                label={question.label}
                value={newGuest.assessment[question.id]}
                editable
                onSelect={(score) =>
                  setNewGuest((prev) => ({
                    ...prev,
                    assessment: { ...prev.assessment, [question.id]: score },
                  }))
                }
              />
            ))}
          </View>
        )}

        <View style={styles.detailButtonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setMode('overview')}>
            <Text style={styles.secondaryButtonText}>Abbrechen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, styles.detailPrimaryButton, { backgroundColor: headerTint }]}
            onPress={handleCreateGuest}
          >
            <Text style={styles.primaryButtonText}>Dummy erstellen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          {mode !== 'overview' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setMode('overview')}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={[styles.headerTextContainer, mode !== 'overview' && styles.headerTextWithBack]}>
            <Text style={styles.title}>
              {mode === 'overview'
                ? 'Guests'
                : mode === 'detail'
                ? selectedGuest?.name ?? 'Gastdetail'
                : 'Neuer Gast'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'overview'
                ? 'Guest Overview'
                : mode === 'detail'
                ? 'Detailansicht'
                : 'Neuen Gast anlegen'}
            </Text>
          </View>
        </View>

        <View style={styles.contentArea}>
          {mode === 'overview' && <Overview />}
          {mode === 'detail' && <Detail />}
          {mode === 'create' && <Create />}
        </View>

        <FooterNav />
      </View>
    </SafeAreaView>
  );
}

type GuestDetailRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  placeholder: string;
  editable: boolean;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
};

function GuestDetailRow({ icon, value, placeholder, editable, onChangeText, keyboardType }: GuestDetailRowProps) {
  return (
    <View style={styles.guestDetailRow}>
      <MaterialCommunityIcons name={icon} size={20} color="#1F2937" />
      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.guestDetailValueInput}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType={keyboardType}
        />
      ) : (
        <Text style={styles.guestDetailValue}>{value || '-'}</Text>
      )}
    </View>
  );
}

type FormFieldComponentProps = FormFieldProps;

function FormField({ label, children, style }: FormFieldComponentProps) {
  return (
    <View style={[styles.formField, style]}>
      <Text style={styles.formLabel}>{label}</Text>
      {children}
    </View>
  );
}

type SectionToggleProps = {
  value: GuestSectionView;
  onChange: (value: GuestSectionView) => void;
};

function SectionToggle({ value, onChange }: SectionToggleProps) {
  return (
    <View style={styles.sectionToggle}>
      {(['personal', 'assessment'] as GuestSectionView[]).map((option) => {
        const isActive = value === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.sectionToggleButton, isActive && styles.sectionToggleButtonActive]}
            onPress={() => onChange(option)}
            activeOpacity={0.85}
          >
            <Text style={[styles.sectionToggleLabel, isActive && styles.sectionToggleLabelActive]}>
              {option === 'personal' ? 'Persönliche Daten' : 'Assessment'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

type AssessmentRatingRowProps = {
  label: string;
  value: AssessmentScore;
  editable: boolean;
  onSelect: (score: AssessmentScore) => void;
};

function AssessmentRatingRow({ label, value, editable, onSelect }: AssessmentRatingRowProps) {
  return (
    <View style={styles.assessmentRatingRow}>
      <View style={styles.assessmentRatingHeader}>
        <Text style={styles.assessmentLabel}>{label}</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>{value}</Text>
        </View>
      </View>
      <View style={styles.scoreButtonRow}>
        {ASSESSMENT_SCORE_OPTIONS.map((score) => {
          const isActive = score === value;
          return (
            <TouchableOpacity
              key={score}
              style={[
                styles.scoreButton,
                isActive && styles.scoreButtonActive,
                !editable && styles.scoreButtonDisabled,
              ]}
              onPress={() => onSelect(score)}
              activeOpacity={0.85}
              disabled={!editable}
            >
              <Text style={[styles.scoreButtonText, isActive && styles.scoreButtonTextActive]}>{score}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  page: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTextWithBack: {
    marginLeft: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#CBD5F5',
    marginTop: 4,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  guestsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
    backgroundColor: '#F5F6FB',
  },
  searchRow: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'nowrap',
  },
  filterChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: 18,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
  },
  guestListContent: {
    paddingBottom: 120,
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.medium,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: responsive.spacing.md,
  },
  guestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.spacing.md,
  },
  guestMeta: {
    fontSize: responsive.fontSize.small,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  guestMetaSecondary: {
    fontSize: responsive.fontSize.small,
    color: '#6B7280',
    marginBottom: responsive.spacing.md,
  },
  guestBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive.spacing.xs,
    marginBottom: responsive.spacing.md,
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsive.padding.large,
    marginBottom: responsive.spacing.md,
  },
  quickActionButton: {
    width: responsive.button.large,
    height: responsive.button.large,
    borderRadius: responsive.button.large / 2,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5F5',
  },
  saveButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },
  guestName: {
    fontSize: responsive.fontSize.xlarge,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: responsive.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadgeText: {
    fontSize: responsive.fontSize.small,
    fontWeight: '600',
    color: '#1F2937',
  },
  guestRoom: {
    fontSize: responsive.fontSize.small,
    color: '#4B5563',
    marginBottom: responsive.spacing.xs,
  },
  guestDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestDatesText: {
    fontSize: responsive.fontSize.small,
    color: '#1F2937',
    fontWeight: '500',
    marginLeft: responsive.spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: responsive.padding.large,
    bottom: responsive.padding.large,
    width: responsive.button.large,
    height: responsive.button.large,
    borderRadius: responsive.button.large / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3A8A',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: responsive.fontSize.xlarge,
    fontWeight: '600',
    color: '#111827',
    marginTop: responsive.spacing.md,
  },
  emptyStateText: {
    fontSize: responsive.fontSize.small,
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: responsive.padding.large,
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  detailWrapper: {
    paddingHorizontal: responsive.padding.large,
    paddingVertical: responsive.padding.large,
    backgroundColor: '#F5F6FB',
    paddingBottom: 120,
  },
  detailCardLarge: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.large,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  guestDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.spacing.md,
  },
  guestDetailName: {
    fontSize: responsive.fontSize.xxlarge,
    fontWeight: '700',
    color: '#111827',
  },
  guestDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.spacing.md,
  },
  guestDetailValue: {
    fontSize: responsive.fontSize.medium,
    color: '#1F2937',
    flex: 1,
    marginLeft: responsive.spacing.md,
  },
  guestDetailValueStatic: {
    marginLeft: responsive.spacing.md,
  },
  guestDetailValueInput: {
    flex: 1,
    fontSize: responsive.fontSize.medium,
    color: '#1F2937',
    backgroundColor: '#F8FAFC',
    borderRadius: responsive.borderRadius.medium,
    paddingHorizontal: responsive.spacing.md,
    paddingVertical: responsive.spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginLeft: responsive.spacing.md,
  },
  detailDescription: {
    fontSize: responsive.fontSize.medium,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: responsive.padding.large,
  },
  sectionToggleContainer: {
    marginBottom: responsive.padding.large,
  },
  sectionToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: responsive.borderRadius.medium,
    padding: 6,
    gap: 6,
  },
  sectionToggleButton: {
    flex: 1,
    borderRadius: responsive.borderRadius.medium,
    paddingVertical: responsive.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionToggleButtonActive: {
    backgroundColor: '#1D4ED8',
  },
  sectionToggleLabel: {
    fontSize: responsive.fontSize.small,
    fontWeight: '600',
    color: '#334155',
  },
  sectionToggleLabelActive: {
    color: '#FFFFFF',
  },
  assessmentSection: {
    gap: responsive.padding.large,
  },
  assessmentLabel: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  assessmentRatingRow: {
    gap: responsive.spacing.md,
  },
  assessmentRatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreBadge: {
    minWidth: responsive.button.medium,
    paddingVertical: 6,
    paddingHorizontal: responsive.spacing.md,
    borderRadius: 999,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
  },
  scoreBadgeText: {
    fontSize: responsive.fontSize.small,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  scoreButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: responsive.spacing.xs,
  },
  scoreButton: {
    flex: 1,
    borderRadius: responsive.borderRadius.medium,
    paddingVertical: responsive.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5F5',
    backgroundColor: '#FFFFFF',
  },
  scoreButtonActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  scoreButtonDisabled: {
    opacity: 0.6,
  },
  scoreButtonText: {
    fontSize: responsive.fontSize.small,
    fontWeight: '600',
    color: '#1F2937',
  },
  scoreButtonTextActive: {
    color: '#FFFFFF',
  },
  detailFooter: {
    marginTop: responsive.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: responsive.spacing.md,
  },
  primaryButton: {
    paddingVertical: responsive.spacing.md,
    paddingHorizontal: responsive.padding.large,
    borderRadius: responsive.borderRadius.medium,
  },
  primaryButtonText: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailPrimaryButton: {
    flex: 1,
    alignItems: 'center',
    marginLeft: responsive.spacing.md,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: responsive.spacing.md,
    borderRadius: responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
  },
  secondaryButtonText: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  guestCreateWrapper: {
    paddingHorizontal: responsive.padding.large,
    paddingVertical: responsive.padding.large,
    backgroundColor: '#F5F6FB',
    paddingBottom: 120,
  },
  formField: {
    marginBottom: responsive.spacing.md,
  },
  formLabel: {
    fontSize: responsive.fontSize.small,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '600',
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: responsive.borderRadius.medium,
    paddingHorizontal: responsive.spacing.md,
    paddingVertical: responsive.spacing.md,
    fontSize: responsive.fontSize.medium,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pickerContainer: {
    position: 'relative',
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerTriggerText: {
    fontSize: responsive.fontSize.medium,
    color: '#0F172A',
  },
  pickerOptions: {
    marginTop: responsive.spacing.xs,
    borderRadius: responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  pickerOption: {
    paddingVertical: responsive.spacing.md,
    paddingHorizontal: responsive.spacing.md,
  },
  pickerOptionActive: {
    backgroundColor: '#EEF2FF',
  },
  pickerOptionText: {
    fontSize: responsive.fontSize.medium,
    color: '#1F2937',
  },
  pickerOptionTextActive: {
    fontWeight: '600',
    color: '#2563EB',
  },
  allergyChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsive.spacing.xs,
    marginBottom: responsive.spacing.md,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: responsive.spacing.md,
    paddingVertical: responsive.spacing.xs,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  allergyChipActive: {
    backgroundColor: '#2563EB',
  },
  allergyChipText: {
    fontSize: responsive.fontSize.small,
    color: '#1F2937',
    fontWeight: '600',
  },
  allergyChipTextActive: {
    color: '#FFFFFF',
  },
  allergyCustomInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  formFieldHalf: {
    flex: 1,
  },
  formFieldHalfLast: {
    flex: 1,
  },
});
