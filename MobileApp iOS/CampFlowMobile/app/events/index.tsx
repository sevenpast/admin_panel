import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Events</Text>
            <Text style={styles.subtitle}>Heutige Aktivitäten und Begegnungen</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateForm((prev) => !prev)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name={showCreateForm ? 'close' : 'plus'}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
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
            <View key={event.id} style={styles.card}>
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
            </View>
          ))}
        </ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 18,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
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
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  notes: {
    marginTop: 12,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});
