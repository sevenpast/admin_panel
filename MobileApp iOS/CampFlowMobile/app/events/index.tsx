import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FooterNav } from '../../components/FooterNav';

const EVENTS = [
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Events</Text>
          <Text style={styles.subtitle}>Heutige Aktivitäten und Begegnungen</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {EVENTS.map((event) => (
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
