import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FooterNav } from '../../components/FooterNav';
import { responsive, getActionButtonSize, getCardPadding } from '@/lib/responsive';

type CampEvent = {
  id: string;
  title: string;
  time: string;
  location: string;
  facilitator: string;
  notes: string;
};

const EVENT_SEED: CampEvent[] = [
  {
    id: 'e1',
    title: 'Morning Yoga & Breathwork',
    time: '07:30 - 08:15',
    location: 'Sun Deck',
    facilitator: 'Luisa',
    notes: 'Matten und Handtücher bereitstellen, limitierte Plätze (12).',
  },
  {
    id: 'e2',
    title: 'Surf Theory Session',
    time: '14:00 - 14:45',
    location: 'Media Room',
    facilitator: 'Jonas',
    notes: 'Board-Kunde und Forecast-Analyse, Tablets vor Ort aufladen.',
  },
  {
    id: 'e3',
    title: 'Community Bonfire',
    time: '21:00 - 23:00',
    location: 'North Beach',
    facilitator: 'Team Hosts',
    notes: 'Musikbox & Heißgetränke organisieren, Sicherheitsbriefing durchführen.',
  },
];

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<CampEvent[]>(EVENT_SEED);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    location: '',
    facilitator: '',
    notes: '',
  });

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.time) {
      return;
    }
    const entry: CampEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      time: newEvent.time,
      location: newEvent.location || 'TBD',
      facilitator: newEvent.facilitator || 'Team',
      notes: newEvent.notes || 'Details folgen.',
    };
    setEvents((prev) => [...prev, entry]);
    setNewEvent({
      title: '',
      time: '',
      location: '',
      facilitator: '',
      notes: '',
    });
    setShowCreateForm(false);
  };

  const handleCardClick = (event: CampEvent) => {
    // Navigate to event detail page with event data
    router.push({
      pathname: '/events/[id]',
      params: { 
        id: event.id,
        title: event.title,
        time: event.time,
        location: event.location,
        facilitator: event.facilitator,
        notes: event.notes
      }
    });
  };

  const handleEditEvent = (event: CampEvent) => {
    Alert.alert('Bearbeiten', `Event "${event.title}" bearbeiten (Demo)`);
  };

  const handleCopyEvent = (event: CampEvent) => {
    const copiedEvent: CampEvent = {
      ...event,
      id: `event-${Date.now()}`,
      title: `${event.title} (Kopie)`,
    };
    setEvents((prev) => [...prev, copiedEvent]);
    Alert.alert('Erfolg', `Event "${event.title}" wurde kopiert.`);
  };

  const handleDeleteEvent = (event: CampEvent) => {
    Alert.alert(
      'Event löschen',
      `Möchtest du das Event "${event.title}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            setEvents((prev) => prev.filter((e) => e.id !== event.id));
            Alert.alert('Erfolg', 'Event wurde gelöscht.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Events</Text>
            <Text style={styles.subtitle}>Heutige Aktivitäten und Begegnungen</Text>
          </View>
        </View>
        {showCreateForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Neues Event erstellen</Text>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Titel</Text>
              <TextInput
                value={newEvent.title}
                onChangeText={(value) => setNewEvent((prev) => ({ ...prev, title: value }))}
                placeholder="Name des Events"
                placeholderTextColor="#94A3B8"
                style={styles.formInput}
              />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Zeit</Text>
              <TextInput
                value={newEvent.time}
                onChangeText={(value) => setNewEvent((prev) => ({ ...prev, time: value }))}
                placeholder="z. B. 16:00 - 17:30"
                placeholderTextColor="#94A3B8"
                style={styles.formInput}
              />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Ort</Text>
              <TextInput
                value={newEvent.location}
                onChangeText={(value) => setNewEvent((prev) => ({ ...prev, location: value }))}
                placeholder="z. B. Sun Deck"
                placeholderTextColor="#94A3B8"
                style={styles.formInput}
              />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Lead</Text>
              <TextInput
                value={newEvent.facilitator}
                onChangeText={(value) => setNewEvent((prev) => ({ ...prev, facilitator: value }))}
                placeholder="Verantwortliche Person"
                placeholderTextColor="#94A3B8"
                style={styles.formInput}
              />
            </View>
            <View style={styles.formRow}>
              <Text style={styles.formLabel}>Notizen</Text>
              <TextInput
                value={newEvent.notes}
                onChangeText={(value) => setNewEvent((prev) => ({ ...prev, notes: value }))}
                placeholder="Besondere Hinweise, Material, To-Dos …"
                placeholderTextColor="#94A3B8"
                style={[styles.formInput, styles.formInputMultiline]}
                multiline
              />
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent} activeOpacity={0.9}>
              <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Event speichern</Text>
            </TouchableOpacity>
          </View>
        )}
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.card}
              onPress={() => handleCardClick(event)}
              activeOpacity={0.95}
              accessibilityRole="button"
              accessibilityLabel={`Event ${event.title} öffnen`}
            >
              <Text style={styles.cardTitle}>{event.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Zeit</Text>
                <Text style={styles.metaValue}>{event.time}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Ort</Text>
                <Text style={styles.metaValue}>{event.location}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Lead</Text>
                <Text style={styles.metaValue}>{event.facilitator}</Text>
              </View>
              <Text style={styles.notes}>{event.notes}</Text>
              
              <View style={styles.eventActions}>
                <TouchableOpacity
                  style={styles.eventActionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEditEvent(event);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Event bearbeiten"
                >
                  <MaterialCommunityIcons name="pencil-outline" size={18} color="#F59E0B" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.eventActionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCopyEvent(event);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Event kopieren"
                >
                  <MaterialCommunityIcons name="content-copy" size={18} color="#8B5CF6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.eventActionButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Event löschen"
                >
                  <MaterialCommunityIcons name="delete-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={() => setShowCreateForm((prev) => !prev)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Neues Event erstellen"
        >
          <MaterialCommunityIcons
            name={showCreateForm ? 'close' : 'plus'}
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
        
        <FooterNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  page: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
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
  floatingAddButton: {
    position: 'absolute',
    bottom: 100, // Über dem FooterNav
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    zIndex: 100,
  },
  formCard: {
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 18,
  },
  formRow: {
    marginBottom: 14,
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  formInputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 4,
    backgroundColor: '#1D4ED8',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: getCardPadding(),
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    position: 'relative',
  },
  cardTitle: {
    fontSize: responsive.fontSize.xlarge,
    fontWeight: '700',
    color: '#111827',
    marginBottom: responsive.spacing.md,
  },
  eventActions: {
    position: 'absolute',
    bottom: responsive.spacing.md,
    right: responsive.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive.spacing.xs,
  },
  eventActionButton: {
    width: getActionButtonSize(),
    height: getActionButtonSize(),
    borderRadius: getActionButtonSize() / 2,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsive.spacing.xs,
  },
  metaLabel: {
    fontSize: responsive.fontSize.small,
    fontWeight: '600',
    color: '#64748B',
  },
  metaValue: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#2563EB',
  },
  notes: {
    marginTop: responsive.spacing.md,
    fontSize: responsive.fontSize.small,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 40, // Platz für die Action-Icons
  },
});
