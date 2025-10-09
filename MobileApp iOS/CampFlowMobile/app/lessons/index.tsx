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

const SURF_LEVELS = ['Nicht zugewiesen', 'Anfänger', 'Fortgeschritten', 'Profi'];

const LESSON_SKILL_LEVELS = [
  { value: 'beginner' as const, label: 'Beginner' },
  { value: 'intermediate' as const, label: 'Intermediate' },
  { value: 'advanced' as const, label: 'Advanced' },
];

const LESSON_STATUS_META: Record<
  'scheduled' | 'completed' | 'cancelled',
  { label: string; color: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  scheduled: { label: 'Scheduled', color: '#2563EB', icon: 'calendar-check' },
  completed: { label: 'Completed', color: '#059669', icon: 'check-circle-outline' },
  cancelled: { label: 'Cancelled', color: '#EF4444', icon: 'close-circle-outline' },
};

const INSTRUCTORS: Array<{ id: string; name: string }> = [
  { id: 'inst-jonas', name: 'Jonas Hartmann' },
  { id: 'inst-luisa', name: 'Luisa Mendes' },
  { id: 'inst-sven', name: 'Sven Keller' },
  { id: 'inst-marek', name: 'Marek Bianchi' },
];

const LESSON_STATUS_OPTIONS: Array<{ value: SurfLesson['status']; label: string }> = [
  { value: 'scheduled', label: LESSON_STATUS_META.scheduled.label },
  { value: 'completed', label: LESSON_STATUS_META.completed.label },
  { value: 'cancelled', label: LESSON_STATUS_META.cancelled.label },
];

const SURF_GUESTS = [
  {
    id: 'g1',
    name: 'Anna Keller',
    level: 'Anfänger',
    equipment: 'Fish 6"4, Wetsuit M3',
  },
  {
    id: 'g2',
    name: 'Marco Lüthi',
    level: 'Fortgeschritten',
    equipment: 'Shortboard 5"11, Shorty L2',
  },
  {
    id: 'g3',
    name: 'Sofia Giordano',
    level: 'Profi',
    equipment: 'Step-up 6"6, Fullsuit S1',
  },
  {
    id: 'g4',
    name: 'Daniel Steiner',
    level: 'Nicht zugewiesen',
    equipment: 'Longboard 8"0, Springsuit M4',
  },
];

type SurfGuest = typeof SURF_GUESTS[number];

type SurfViewMode = 'overview' | 'guestDetail' | 'lessonDetail' | 'create';

type OverviewSection = 'surfers' | 'sessions' | 'assessment';

type LevelFilterKey = 'all' | 'Nicht zugewiesen' | 'Anfänger' | 'Fortgeschritten' | 'Profi';

type LevelFilterDefinition = {
  key: LevelFilterKey;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  predicate: (guest: SurfGuest) => boolean;
};

type SurfLesson = {
  id: string;
  title: string;
  lessonCode: string;
  instructorId: string;
  instructorName: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  location: string;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  description: string;
  createdAt: string;
};

type LessonDraft = {
  title: string;
  lessonCode: string;
  instructorId: string;
  startTime: string;
  endTime: string;
  maxParticipants: string;
  skillLevel: SurfLesson['skillLevel'];
  location: string;
  price: string;
  status: SurfLesson['status'];
  description: string;
};

const LEVEL_FILTERS: LevelFilterDefinition[] = [
  {
    key: 'all',
    label: 'Alle',
    icon: 'account-group-outline',
    predicate: () => true,
  },
  {
    key: 'Nicht zugewiesen',
    label: 'Nicht zugewiesen',
    icon: 'help-circle-outline',
    predicate: (guest) => guest.level === 'Nicht zugewiesen',
  },
  {
    key: 'Anfänger',
    label: 'Anfänger',
    icon: 'surfboard',
    predicate: (guest) => guest.level === 'Anfänger',
  },
  {
    key: 'Fortgeschritten',
    label: 'Fortgeschritten',
    icon: 'wave',
    predicate: (guest) => guest.level === 'Fortgeschritten',
  },
  {
    key: 'Profi',
    label: 'Profi',
    icon: 'trophy-outline',
    predicate: (guest) => guest.level === 'Profi',
  },
];

const OVERVIEW_TOGGLES: Array<{ key: OverviewSection; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { key: 'surfers', label: 'Surfer:innen', icon: 'account-group-outline' },
  { key: 'sessions', label: 'Lessons', icon: 'calendar-clock' },
  { key: 'assessment', label: 'Assessment', icon: 'clipboard-text-outline' },
];

const INITIAL_LESSONS: SurfLesson[] = [
  {
    id: 'lesson-1',
    lessonCode: 'L-MORNING01',
    title: 'Morning Beginner Surf Session',
    instructorId: INSTRUCTORS[0].id,
    instructorName: INSTRUCTORS[0].name,
    startTime: new Date().toISOString().split('T')[0] + 'T08:00',
    endTime: new Date().toISOString().split('T')[0] + 'T09:30',
    maxParticipants: 8,
    skillLevel: 'beginner',
    location: 'Main Beach',
    price: 79,
    status: 'scheduled',
    description: 'Introduction to surfing basics, stance, and pop-up drills.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lesson-2',
    lessonCode: 'L-INT001',
    title: 'Intermediate Reef Coaching',
    instructorId: INSTRUCTORS[1].id,
    instructorName: INSTRUCTORS[1].name,
    startTime: new Date().toISOString().split('T')[0] + 'T11:00',
    endTime: new Date().toISOString().split('T')[0] + 'T12:30',
    maxParticipants: 6,
    skillLevel: 'intermediate',
    location: 'Reef Break A',
    price: 95,
    status: 'scheduled',
    description: 'Refine line selection and improve turning technique on the reef.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'lesson-3',
    lessonCode: 'L-ADV002',
    title: 'Advanced Wave Riding Lab',
    instructorId: INSTRUCTORS[2].id,
    instructorName: INSTRUCTORS[2].name,
    startTime: new Date().toISOString().split('T')[0] + 'T15:30',
    endTime: new Date().toISOString().split('T')[0] + 'T17:00',
    maxParticipants: 4,
    skillLevel: 'advanced',
    location: 'North Point',
    price: 120,
    status: 'completed',
    description: 'Video analysis session focusing on rail engagement and power turns.',
    createdAt: new Date().toISOString(),
  },
];

const ASSESSMENT_BLUEPRINT = [
  { id: 'q1', category: 'Experience', question: 'Wie viele Jahre surfst du bereits aktiv?' },
  { id: 'q2', category: 'Comfort', question: 'Wie wohl fühlst du dich bei Wellen über 1.5m?' },
  { id: 'q3', category: 'Tech', question: 'Kannst du einen kontrollierten Bottom Turn fahren?' },
  { id: 'q4', category: 'Goals', question: 'Was ist dein Hauptfokus für diese Woche?' },
  { id: 'q5', category: 'Safety', question: 'Kennst du die gängigen Right-of-Way-Regeln?' },
];

const INITIAL_LESSON_DRAFT: LessonDraft = {
  title: '',
  lessonCode: '',
  instructorId: INSTRUCTORS[0].id,
  startTime: '',
  endTime: '',
  maxParticipants: '',
  skillLevel: 'beginner',
  location: '',
  price: '',
  status: 'scheduled',
  description: '',
};

export default function LessonsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const headerTint = Colors[colorScheme].tint;

  const [mode, setMode] = useState<SurfViewMode>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<LevelFilterKey>('all');
  const [selectedGuest, setSelectedGuest] = useState<SurfGuest | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('Nicht zugewiesen');
  const [overviewSection, setOverviewSection] = useState<OverviewSection>('surfers');
  const [lessons, setLessons] = useState<SurfLesson[]>(INITIAL_LESSONS);
  const [newLesson, setNewLesson] = useState<LessonDraft>(INITIAL_LESSON_DRAFT);
  const [selectedLesson, setSelectedLesson] = useState<SurfLesson | null>(null);
  const [editableLesson, setEditableLesson] = useState<SurfLesson | null>(null);
  const [isLessonEditing, setIsLessonEditing] = useState(false);

  useEffect(() => {
    if (mode === 'guestDetail' && selectedGuest) {
      setSelectedLevel(selectedGuest.level);
    }

    if (mode === 'lessonDetail' && selectedLesson) {
      setEditableLesson(selectedLesson);
      setIsLessonEditing(false);
      setOverviewSection('sessions');
    }

    if (mode === 'overview') {
      setSelectedGuest(null);
      setSelectedLesson(null);
      setEditableLesson(null);
      setIsLessonEditing(false);
      setSelectedLevel('Nicht zugewiesen');
    }

    if (mode === 'create') {
      setOverviewSection('sessions');
      setSelectedGuest(null);
      setSelectedLesson(null);
      setEditableLesson(null);
      setIsLessonEditing(false);
      setNewLesson(INITIAL_LESSON_DRAFT);
    }
  }, [mode, selectedGuest, selectedLesson]);

  const filteredGuests = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();

    return SURF_GUESTS.filter((guest) => {
      const matchesSearch = normalized
        ? guest.name.toLowerCase().includes(normalized) || guest.level.toLowerCase().includes(normalized)
        : true;

      const matchesFilter = LEVEL_FILTERS.find((filter) => filter.key === activeFilter)?.predicate(guest) ?? true;

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilter]);

  const renderGuestCard = ({ item }: { item: SurfGuest }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      activeOpacity={0.82}
      onPress={() => {
        setSelectedLesson(null);
        setSelectedGuest(item);
        setMode('guestDetail');
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>{item.level}</Text>
        </View>
      </View>
      <Text style={styles.cardSubtitle}>{item.equipment}</Text>
    </TouchableOpacity>
  );

  const handleCreateLesson = () => {
    const title = newLesson.title.trim();
    const lessonCode = newLesson.lessonCode.trim() || `L-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const startTime = newLesson.startTime.trim();
    const endTime = newLesson.endTime.trim();
    const location = newLesson.location.trim();
    const description = newLesson.description.trim();
    const instructor = INSTRUCTORS.find((item) => item.id === newLesson.instructorId) ?? INSTRUCTORS[0];

    if (!title) {
      Alert.alert('Titel erforderlich', 'Bitte gib den Titel der Surf Lesson an.');
      return;
    }

    if (!startTime || !endTime) {
      Alert.alert('Zeitplan unvollständig', 'Bitte Start- und Endzeit im ISO-Format eintragen (z. B. 2025-05-18T08:00).');
      return;
    }

    const lessonToAdd: SurfLesson = {
      id: `lesson-${Date.now()}`,
      lessonCode,
      title,
      instructorId: instructor.id,
      instructorName: instructor.name,
      startTime,
      endTime,
      maxParticipants: Number.parseInt(newLesson.maxParticipants, 10) || 0,
      skillLevel: newLesson.skillLevel,
      location: location || 'tbd',
      price: Number.parseFloat(newLesson.price) || 0,
      status: newLesson.status,
      description: description || 'Noch keine Beschreibung hinterlegt.',
      createdAt: new Date().toISOString(),
    };

    setLessons((prev) => [...prev, lessonToAdd]);
    Alert.alert('Surf Lesson erstellt', `${lessonToAdd.title} wurde angelegt (Demo).`);
    setNewLesson(INITIAL_LESSON_DRAFT);
    setMode('overview');
    setOverviewSection('sessions');
  };

  const handleLessonSave = () => {
    if (!editableLesson) {
      return;
    }

    const trimmedTitle = editableLesson.title.trim();
    if (!trimmedTitle) {
      Alert.alert('Titel erforderlich', 'Bitte gib den Titel der Lesson an.');
      return;
    }

    if (!editableLesson.startTime || !editableLesson.endTime) {
      Alert.alert('Zeitplan unvollständig', 'Bitte Start- und Endzeit im ISO-Format ergänzen.');
      return;
    }

    const instructor = INSTRUCTORS.find((item) => item.id === editableLesson.instructorId);

    const updatedLesson: SurfLesson = {
      ...editableLesson,
      title: trimmedTitle,
      lessonCode: editableLesson.lessonCode.trim() || editableLesson.lessonCode,
      location: editableLesson.location.trim() || editableLesson.location,
      description: editableLesson.description.trim(),
      instructorName: instructor?.name ?? editableLesson.instructorName,
    };

    setLessons((prev) => prev.map((lesson) => (lesson.id === updatedLesson.id ? updatedLesson : lesson)));
    setSelectedLesson(updatedLesson);
    setEditableLesson(updatedLesson);
    setIsLessonEditing(false);
    Alert.alert('Lesson aktualisiert', `${updatedLesson.title} wurde aktualisiert (Demo).`);
  };

  const handleLessonDelete = () => {
    if (!selectedLesson) {
      return;
    }

    Alert.alert('Lesson löschen', 'Du bist dabei, diese Lesson (Demo) zu entfernen.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          setLessons((prev) => prev.filter((lesson) => lesson.id !== selectedLesson.id));
          setSelectedLesson(null);
          setEditableLesson(null);
          setIsLessonEditing(false);
          setOverviewSection('sessions');
          setMode('overview');
          Alert.alert('Lesson gelöscht', 'Dummy Löschaktion ausgeführt.');
        },
      },
    ]);
  };

  const GuestDetail = () => (
    <ScrollView contentContainerStyle={styles.detailWrapper} showsVerticalScrollIndicator={false}>
      <View style={styles.detailCard}>
        <Text style={styles.detailName}>{selectedGuest?.name}</Text>
        <Text style={styles.detailSectionTitle}>Surf Assessment</Text>
        <Text style={styles.detailText}>
          Dummy-Fragen werden hier angezeigt. Ergänze später die echten Assessment-Antworten.
        </Text>

        <Text style={styles.detailSectionTitle}>Surf Level zuweisen</Text>
        <View style={styles.levelPicker}>
          {SURF_LEVELS.map((level) => {
            const isActive = selectedLevel === level;
            return (
              <TouchableOpacity
                key={level}
                style={[styles.levelChip, isActive && styles.levelChipActive]}
                onPress={() => setSelectedLevel(level)}
                accessibilityRole="button"
              >
                <Text style={[styles.levelChipText, isActive && styles.levelChipTextActive]}>{level}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: headerTint }]}
          onPress={() => Alert.alert('Level gespeichert', `Surf-Level auf ${selectedLevel} gesetzt (Dummy).`)}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="content-save-outline" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Änderung speichern</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const LessonDetail = () => {
    if (!editableLesson) {
      return null;
    }

    const lessonActionButtons: Array<{
      key: string;
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
      color: string;
      onPress: () => void;
    }> = [
      {
        key: 'back',
        icon: 'view-dashboard-outline',
        color: '#2563EB',
        onPress: () => {
          setMode('overview');
          setSelectedLesson(null);
          setEditableLesson(null);
          setIsLessonEditing(false);
          setOverviewSection('sessions');
        },
      },
      {
        key: 'edit',
        icon: 'pencil-circle-outline',
        color: isLessonEditing ? '#059669' : '#F59E0B',
        onPress: () => {
          if (!selectedLesson) {
            return;
          }
          if (isLessonEditing) {
            setIsLessonEditing(false);
            setEditableLesson(selectedLesson);
          } else {
            setIsLessonEditing(true);
          }
        },
      },
      {
        key: 'delete',
        icon: 'trash-can-outline',
        color: '#EF4444',
        onPress: handleLessonDelete,
      },
    ];

    return (
      <ScrollView contentContainerStyle={styles.lessonDetailWrapper} showsVerticalScrollIndicator={false}>
        <View style={styles.lessonActionBar}>
          {lessonActionButtons.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.lessonQuickButton}
              onPress={action.onPress}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.lessonDetailCard}>
          <Text style={styles.lessonDetailTitle}>{editableLesson.title}</Text>
          <Text style={styles.lessonDetailMeta}>
            {editableLesson.startTime} - {editableLesson.endTime} · {editableLesson.location}
          </Text>
          <Text style={styles.lessonDetailSubMeta}>Instructor: {editableLesson.instructorName}</Text>

          <LessonFormField label="Lesson Code">
            {isLessonEditing ? (
              <TextInput
                value={editableLesson.lessonCode}
                onChangeText={(value) =>
                  setEditableLesson((prev) => (prev ? { ...prev, lessonCode: value } : prev))
                }
                style={styles.formInput}
                placeholder="z. B. L-INT001"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <Text style={styles.detailValue}>{editableLesson.lessonCode}</Text>
            )}
          </LessonFormField>

          <LessonFormField label="Instructor">
            {isLessonEditing ? (
              <View style={styles.chipRow}>
                {INSTRUCTORS.map((instructor) => {
                  const isActive = editableLesson.instructorId === instructor.id;
                  return (
                    <TouchableOpacity
                      key={instructor.id}
                      style={[styles.chipButton, isActive && styles.chipButtonActive]}
                      onPress={() =>
                        setEditableLesson((prev) =>
                          prev ? { ...prev, instructorId: instructor.id, instructorName: instructor.name } : prev,
                        )
                      }
                      accessibilityRole="button"
                      accessibilityLabel={instructor.name}
                    >
                      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{instructor.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.detailValue}>{editableLesson.instructorName}</Text>
            )}
          </LessonFormField>

          <LessonFormField label="Skill Level">
            {isLessonEditing ? (
              <View style={styles.chipRow}>
                {LESSON_SKILL_LEVELS.map((level) => {
                  const isActive = editableLesson.skillLevel === level.value;
                  return (
                    <TouchableOpacity
                      key={level.value}
                      style={[styles.chipButton, isActive && styles.chipButtonActive]}
                      onPress={() =>
                        setEditableLesson((prev) => (prev ? { ...prev, skillLevel: level.value } : prev))
                      }
                      accessibilityRole="button"
                      accessibilityLabel={level.label}
                    >
                      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{level.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.detailValue}>
                {LESSON_SKILL_LEVELS.find((level) => level.value === editableLesson.skillLevel)?.label ??
                  editableLesson.skillLevel}
              </Text>
            )}
          </LessonFormField>

          <LessonFormField label="Status">
            {isLessonEditing ? (
              <View style={styles.chipRow}>
                {LESSON_STATUS_OPTIONS.map((option) => {
                  const isActive = editableLesson.status === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.chipButton, isActive && styles.chipButtonActive]}
                      onPress={() =>
                        setEditableLesson((prev) => (prev ? { ...prev, status: option.value } : prev))
                      }
                      accessibilityRole="button"
                      accessibilityLabel={option.label}
                    >
                      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{option.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.detailValue}>{LESSON_STATUS_META[editableLesson.status].label}</Text>
            )}
          </LessonFormField>

          <LessonFormField label="Zeitplan (ISO)">
            {isLessonEditing ? (
              <View style={styles.formRow}>
                <TextInput
                  value={editableLesson.startTime}
                  onChangeText={(value) =>
                    setEditableLesson((prev) => (prev ? { ...prev, startTime: value } : prev))
                  }
                  style={[styles.formInput, styles.formRowItem]}
                  placeholder="2025-05-18T08:00"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numbers-and-punctuation"
                />
                <TextInput
                  value={editableLesson.endTime}
                  onChangeText={(value) =>
                    setEditableLesson((prev) => (prev ? { ...prev, endTime: value } : prev))
                  }
                  style={[styles.formInput, styles.formRowItem]}
                  placeholder="2025-05-18T09:30"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            ) : (
              <Text style={styles.detailValue}>
                {editableLesson.startTime} - {editableLesson.endTime}
              </Text>
            )}
          </LessonFormField>

          <LessonFormField label="Standort">
            {isLessonEditing ? (
              <TextInput
                value={editableLesson.location}
                onChangeText={(value) =>
                  setEditableLesson((prev) => (prev ? { ...prev, location: value } : prev))
                }
                style={styles.formInput}
                placeholder="z. B. Main Beach"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <Text style={styles.detailValue}>{editableLesson.location}</Text>
            )}
          </LessonFormField>

          <LessonFormField label="Max. Teilnehmer">
            {isLessonEditing ? (
              <TextInput
                value={String(editableLesson.maxParticipants)}
                onChangeText={(value) =>
                  setEditableLesson((prev) =>
                    prev ? { ...prev, maxParticipants: Number.parseInt(value, 10) || 0 } : prev,
                  )
                }
                style={styles.formInput}
                placeholder="8"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.detailValue}>{editableLesson.maxParticipants} Personen</Text>
            )}
          </LessonFormField>

          <LessonFormField label="Preis (CHF)">
            {isLessonEditing ? (
              <TextInput
                value={String(editableLesson.price)}
                onChangeText={(value) =>
                  setEditableLesson((prev) =>
                    prev ? { ...prev, price: Number.parseFloat(value) || 0 } : prev,
                  )
                }
                style={styles.formInput}
                placeholder="79"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.detailValue}>CHF {editableLesson.price.toFixed(2)}</Text>
            )}
          </LessonFormField>

          <LessonFormField label="Beschreibung">
            {isLessonEditing ? (
              <TextInput
                value={editableLesson.description}
                onChangeText={(value) =>
                  setEditableLesson((prev) => (prev ? { ...prev, description: value } : prev))
                }
                style={[styles.formInput, styles.notesInput]}
                placeholder="Kurzbeschreibung und wichtige Hinweise"
                placeholderTextColor="#94A3B8"
                multiline
              />
            ) : (
              <Text style={styles.detailNotes}>{editableLesson.description}</Text>
            )}
          </LessonFormField>

          {isLessonEditing && (
            <View style={styles.lessonDetailFooter}>
              <TouchableOpacity
                style={[styles.lessonQuickButton, styles.lessonSaveButton]}
                onPress={handleLessonSave}
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

  const CreateLesson = () => (
    <ScrollView contentContainerStyle={styles.createWrapper} showsVerticalScrollIndicator={false}>
      <View style={styles.createCard}>
        <Text style={styles.createTitle}>Neue Surf Lesson</Text>
        <Text style={styles.createDescription}>
          Lege eine neue Session oder Theorieeinheit an. Diese Demo speichert nichts persistent, zeigt dir aber die Struktur,
          die wir später mit echter API-Anbindung nutzen können.
        </Text>

        <LessonFormField label="Titel">
          <TextInput
            value={newLesson.title}
            onChangeText={(value) => setNewLesson((prev) => ({ ...prev, title: value }))}
            style={styles.formInput}
            placeholder="z. B. Morning Reef Session"
            placeholderTextColor="#94A3B8"
          />
        </LessonFormField>
        <LessonFormField label="Lesson Code">
          <TextInput
            value={newLesson.lessonCode}
            onChangeText={(value) => setNewLesson((prev) => ({ ...prev, lessonCode: value }))}
            style={styles.formInput}
            placeholder="z. B. L-MORNING01"
            placeholderTextColor="#94A3B8"
          />
        </LessonFormField>

        <LessonFormField label="Instructor">
          <View style={styles.chipRow}>
            {INSTRUCTORS.map((instructor) => {
              const isActive = newLesson.instructorId === instructor.id;
              return (
                <TouchableOpacity
                  key={instructor.id}
                  style={[styles.chipButton, isActive && styles.chipButtonActive]}
                  onPress={() => setNewLesson((prev) => ({ ...prev, instructorId: instructor.id }))}
                  accessibilityRole="button"
                  accessibilityLabel={instructor.name}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{instructor.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LessonFormField>

        <View style={styles.formRow}>
          <LessonFormField label="Start (ISO)" style={styles.formRowItem}>
            <TextInput
              value={newLesson.startTime}
              onChangeText={(value) => setNewLesson((prev) => ({ ...prev, startTime: value }))}
              style={styles.formInput}
              placeholder="2025-05-18T08:00"
              placeholderTextColor="#94A3B8"
              keyboardType="numbers-and-punctuation"
            />
          </LessonFormField>
          <LessonFormField label="Ende (ISO)" style={styles.formRowItem}>
            <TextInput
              value={newLesson.endTime}
              onChangeText={(value) => setNewLesson((prev) => ({ ...prev, endTime: value }))}
              style={styles.formInput}
              placeholder="2025-05-18T09:30"
              placeholderTextColor="#94A3B8"
              keyboardType="numbers-and-punctuation"
            />
          </LessonFormField>
        </View>

        <LessonFormField label="Skill Level">
          <View style={styles.chipRow}>
            {LESSON_SKILL_LEVELS.map((level) => {
              const isActive = newLesson.skillLevel === level.value;
              return (
                <TouchableOpacity
                  key={level.value}
                  style={[styles.chipButton, isActive && styles.chipButtonActive]}
                  onPress={() => setNewLesson((prev) => ({ ...prev, skillLevel: level.value }))}
                  accessibilityRole="button"
                  accessibilityLabel={level.label}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{level.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LessonFormField>

        <LessonFormField label="Status">
          <View style={styles.chipRow}>
            {LESSON_STATUS_OPTIONS.map((statusOption) => {
              const isActive = newLesson.status === statusOption.value;
              return (
                <TouchableOpacity
                  key={statusOption.value}
                  style={[styles.chipButton, isActive && styles.chipButtonActive]}
                  onPress={() => setNewLesson((prev) => ({ ...prev, status: statusOption.value }))}
                  accessibilityRole="button"
                  accessibilityLabel={statusOption.label}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{statusOption.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </LessonFormField>

        <LessonFormField label="Standort">
          <TextInput
            value={newLesson.location}
            onChangeText={(value) => setNewLesson((prev) => ({ ...prev, location: value }))}
            style={styles.formInput}
            placeholder="z. B. Main Beach"
            placeholderTextColor="#94A3B8"
          />
        </LessonFormField>

        <View style={styles.formRow}>
          <LessonFormField label="Max. Teilnehmer" style={styles.formRowItem}>
            <TextInput
              value={newLesson.maxParticipants}
              onChangeText={(value) => setNewLesson((prev) => ({ ...prev, maxParticipants: value }))}
              style={styles.formInput}
              placeholder="8"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />
          </LessonFormField>
          <LessonFormField label="Preis (CHF)" style={styles.formRowItem}>
            <TextInput
              value={newLesson.price}
              onChangeText={(value) => setNewLesson((prev) => ({ ...prev, price: value }))}
              style={styles.formInput}
              placeholder="79"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />
          </LessonFormField>
        </View>

        <LessonFormField label="Beschreibung">
          <TextInput
            value={newLesson.description}
            onChangeText={(value) => setNewLesson((prev) => ({ ...prev, description: value }))}
            style={[styles.formInput, styles.notesInput]}
            placeholder="Kurzbeschreibung und wichtige Hinweise"
            placeholderTextColor="#94A3B8"
            multiline
          />
        </LessonFormField>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              setNewLesson(INITIAL_LESSON_DRAFT);
              setOverviewSection('sessions');
              setMode('overview');
            }}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Abbrechen</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: headerTint }]}
            onPress={handleCreateLesson}
            accessibilityRole="button"
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
              onPress={() => {
                if (mode === 'guestDetail') {
                  setOverviewSection('surfers');
                } else {
                  setOverviewSection('sessions');
                }
                setMode('overview');
                setSelectedGuest(null);
                setSelectedLesson(null);
                setEditableLesson(null);
                setIsLessonEditing(false);
                setSelectedLevel('Nicht zugewiesen');
                setNewLesson(INITIAL_LESSON_DRAFT);
              }}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {mode === 'overview'
              ? 'Surf Lessons'
              : mode === 'guestDetail'
              ? selectedGuest?.name ?? 'Gastdetail'
              : mode === 'lessonDetail'
              ? selectedLesson?.title ?? 'Lesson Detail'
              : 'Neue Surf Lesson'}
          </Text>
        </View>

        {mode === 'overview' && (
          <View style={styles.listContainer}>
            <View style={styles.sectionToggleRow}>
              {OVERVIEW_TOGGLES.map((toggle) => {
                const isActive = overviewSection === toggle.key;
                return (
                  <TouchableOpacity
                    key={toggle.key}
                    style={[styles.sectionToggleButton, isActive && styles.sectionToggleButtonActive]}
                    onPress={() => setOverviewSection(toggle.key)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={toggle.label}
                    accessibilityHint={`Wechsel zu ${toggle.label}`}
                  >
                    <MaterialCommunityIcons
                      name={toggle.icon}
                      size={22}
                      color={isActive ? '#FFFFFF' : '#475569'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {overviewSection === 'surfers' && (
              <>
                <View style={styles.searchRow}>
                  <View style={styles.searchInputWrapper}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
                    <TextInput
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                      placeholder="Suche nach Namen oder Level"
                      placeholderTextColor="#94A3B8"
                      style={styles.searchInput}
                      returnKeyType="search"
                    />
                  </View>
                </View>
                <View style={styles.filterRow}>
                  {LEVEL_FILTERS.map((filter) => {
                    const isActive = activeFilter === filter.key;
                    return (
                      <TouchableOpacity
                        key={filter.key}
                        style={[styles.filterChip, isActive && [styles.filterChipActive]]}
                        onPress={() => setActiveFilter(filter.key)}
                        activeOpacity={0.85}
                        accessibilityRole="button"
                      >
                        <MaterialCommunityIcons
                          name={filter.icon}
                          size={22}
                          color={isActive ? '#2563EB' : '#475569'}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <FlatList
                  data={filteredGuests}
                  keyExtractor={(item) => item.id}
                  renderItem={renderGuestCard}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                />
              </>
            )}

            {overviewSection === 'sessions' && (
              <ScrollView contentContainerStyle={styles.lessonContent} showsVerticalScrollIndicator={false}>
                {lessons.map((lesson) => {
                  const skillLabel =
                    LESSON_SKILL_LEVELS.find((level) => level.value === lesson.skillLevel)?.label ??
                    lesson.skillLevel;
                  const statusMeta = LESSON_STATUS_META[lesson.status];

                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={styles.lessonCard}
                      activeOpacity={0.82}
                      onPress={() => {
                        setSelectedGuest(null);
                        setSelectedLesson(lesson);
                        setMode('lessonDetail');
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`${lesson.title} öffnen`}
                    >
                      <View style={styles.lessonCardHeader}>
                        <View>
                          <Text style={styles.lessonTitle}>{lesson.title}</Text>
                          <Text style={styles.lessonMetaLine}>
                            {lesson.startTime} - {lesson.endTime} · {lesson.location}
                          </Text>
                          <Text style={styles.lessonSubMeta}>Instructor: {lesson.instructorName}</Text>
                        </View>
                        <View style={styles.lessonBadges}>
                          <Text style={[styles.lessonBadge, styles.lessonCodeBadge]}>{lesson.lessonCode}</Text>
                          <Text style={[styles.lessonBadge, styles.lessonSkillBadge]}>{skillLabel}</Text>
                        </View>
                      </View>
                      <Text style={styles.lessonDescription}>{lesson.description}</Text>
                      <View style={styles.lessonCardFooter}>
                        <Text style={styles.lessonInfoLine}>
                          CHF {lesson.price.toFixed(2)} · {lesson.maxParticipants} Plätze
                        </Text>
                        <View
                          style={[styles.lessonStatusBadge, { borderColor: statusMeta.color, backgroundColor: `${statusMeta.color}15` }]}
                        >
                          <MaterialCommunityIcons name={statusMeta.icon} size={16} color={statusMeta.color} />
                          <Text style={[styles.lessonStatusLabel, { color: statusMeta.color }]}>{statusMeta.label}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {overviewSection === 'assessment' && (
              <ScrollView contentContainerStyle={styles.assessmentContent} showsVerticalScrollIndicator={false}>
                {ASSESSMENT_BLUEPRINT.map((entry) => (
                  <View key={entry.id} style={styles.assessmentCard}>
                    <Text style={styles.assessmentCategory}>{entry.category}</Text>
                    <Text style={styles.assessmentQuestion}>{entry.question}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {overviewSection === 'sessions' && (
              <TouchableOpacity
                style={[styles.lessonFab, { backgroundColor: headerTint }]}
                onPress={() => {
                  setMode('create');
                }}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel="Neue Surf Lesson anlegen"
              >
                <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {mode === 'guestDetail' && <GuestDetail />}
        {mode === 'lessonDetail' && <LessonDetail />}
        {mode === 'create' && <CreateLesson />}

        <FooterNav />
      </View>
    </SafeAreaView>
  );
}

type LessonFormFieldProps = {
  label: string;
  children: ReactNode;
  style?: ViewStyle;
};

function LessonFormField({ label, children, style }: LessonFormFieldProps) {
  return (
    <View style={[styles.formField, style]}>
      <Text style={styles.formLabel}>{label}</Text>
      {children}
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
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
    position: 'relative',
  },
  sectionToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 18,
  },
  sectionToggleButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  sectionToggleButtonActive: {
    backgroundColor: '#2563EB',
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
  },
  filterChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: 18,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
  },
  listContent: {
    paddingBottom: 120,
  },
  lessonContent: {
    gap: 16,
    paddingBottom: 140,
  },
  lessonFab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  lessonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  lessonMetaLine: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
  },
  lessonSubMeta: {
    marginTop: 2,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  lessonBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  lessonBadge: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lessonCodeBadge: {
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
  },
  lessonSkillBadge: {
    backgroundColor: '#F5F3FF',
    color: '#6D28D9',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 12,
    lineHeight: 20,
  },
  lessonCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lessonInfoLine: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  lessonStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  lessonStatusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  assessmentContent: {
    gap: 16,
    paddingBottom: 140,
  },
  assessmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  assessmentCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  assessmentQuestion: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 21,
  },
  lessonDetailWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 140,
    backgroundColor: '#F5F6FB',
  },
  lessonActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  lessonQuickButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonSaveButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },
  lessonDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  lessonDetailTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  lessonDetailMeta: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  lessonDetailSubMeta: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  detailValue: {
    fontSize: 15,
    color: '#1F2937',
  },
  detailNotes: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 21,
  },
  lessonDetailFooter: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 140,
    backgroundColor: '#F5F6FB',
  },
  createCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  createTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  createDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 20,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  notesInput: {
    height: 110,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    backgroundColor: '#F1F5F9',
  },
  chipButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  formRowItem: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 24,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  levelBadge: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EEF2FF',
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#4B5563',
  },
  detailWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 120,
    backgroundColor: '#F5F6FB',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  detailName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  levelPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  levelChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    backgroundColor: '#F8FAFF',
  },
  levelChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  levelChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  levelChipTextActive: {
    color: '#FFFFFF',
  },
  saveButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
