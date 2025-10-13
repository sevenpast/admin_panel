import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';

type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  type: 'lesson' | 'meal' | 'event' | 'maintenance';
  location: string;
  participants?: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
};

const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Morning Surf Session',
    time: '08:00 - 09:30',
    type: 'lesson',
    location: 'Main Beach',
    participants: 8,
    status: 'scheduled',
  },
  {
    id: '2',
    title: 'Breakfast Service',
    time: '08:30 - 10:00',
    type: 'meal',
    location: 'Main Dining Hall',
    participants: 24,
    status: 'in_progress',
  },
  {
    id: '3',
    title: 'Equipment Check',
    time: '10:00 - 10:30',
    type: 'maintenance',
    location: 'Equipment Room',
    status: 'scheduled',
  },
  {
    id: '4',
    title: 'Intermediate Surf Coaching',
    time: '11:00 - 12:30',
    type: 'lesson',
    location: 'Reef Break A',
    participants: 6,
    status: 'scheduled',
  },
  {
    id: '5',
    title: 'Lunch Service',
    time: '12:30 - 14:00',
    type: 'meal',
    location: 'Garden Terrace',
    participants: 24,
    status: 'scheduled',
  },
  {
    id: '6',
    title: 'Yoga Session',
    time: '14:00 - 14:45',
    type: 'event',
    location: 'Sun Deck',
    participants: 12,
    status: 'scheduled',
  },
  {
    id: '7',
    title: 'Advanced Wave Riding',
    time: '15:30 - 17:00',
    type: 'lesson',
    location: 'North Point',
    participants: 4,
    status: 'scheduled',
  },
];

const EVENT_TYPE_COLORS = {
  lesson: '#059669',
  meal: '#DC2626',
  event: '#F59E0B',
  maintenance: '#6B7280',
};

const STATUS_COLORS = {
  scheduled: '#2563EB',
  in_progress: '#F59E0B',
  completed: '#059669',
  cancelled: '#EF4444',
};

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getEventTypeIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'lesson':
        return 'school';
      case 'meal':
        return 'silverware-fork-knife';
      case 'event':
        return 'calendar-star';
      case 'maintenance':
        return 'wrench';
      default:
        return 'calendar';
    }
  };

  const getStatusIcon = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'scheduled':
        return 'clock-outline';
      case 'in_progress':
        return 'play-circle';
      case 'completed':
        return 'check-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'clock-outline';
    }
  };

  const renderEvent = (event: CalendarEvent) => (
    <View key={event.id} style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <View style={styles.eventTypeIndicator}>
          <MaterialCommunityIcons
            name={getEventTypeIcon(event.type)}
            size={16}
            color={EVENT_TYPE_COLORS[event.type]}
          />
        </View>
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventTime}>{event.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLORS[event.status]}20` }]}>
          <MaterialCommunityIcons
            name={getStatusIcon(event.status)}
            size={14}
            color={STATUS_COLORS[event.status]}
          />
        </View>
      </View>
      
      <View style={styles.eventDetails}>
        <View style={styles.eventDetailRow}>
          <MaterialCommunityIcons name="map-marker" size={14} color="#64748B" />
          <Text style={styles.eventDetailText}>{event.location}</Text>
        </View>
        {event.participants && (
          <View style={styles.eventDetailRow}>
            <MaterialCommunityIcons name="account-group" size={14} color="#64748B" />
            <Text style={styles.eventDetailText}>{event.participants} Teilnehmer</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>Tagesplan und Termine</Text>
        </View>

        <View style={styles.dateSelector}>
          <TouchableOpacity style={styles.dateButton}>
            <MaterialCommunityIcons name="chevron-left" size={20} color="#2563EB" />
          </TouchableOpacity>
          <Text style={styles.selectedDate}>
            {new Date(selectedDate).toLocaleDateString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <TouchableOpacity style={styles.dateButton}>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.eventsSection}>
            <Text style={styles.sectionTitle}>Heutige Termine</Text>
            {CALENDAR_EVENTS.map(renderEvent)}
          </View>
        </ScrollView>

        <FooterNav />
      </View>
    </SafeAreaView>
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
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 120,
  },
  eventsSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.medium,
    padding: responsive.spacing.md,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.spacing.md,
  },
  eventTypeIndicator: {
    width: responsive.button.medium,
    height: responsive.button.medium,
    borderRadius: responsive.button.medium / 2,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsive.spacing.md,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: responsive.fontSize.small,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: responsive.spacing.xs,
    paddingVertical: 4,
    borderRadius: responsive.borderRadius.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventDetails: {
    gap: responsive.spacing.xs,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsive.spacing.xs,
  },
  eventDetailText: {
    fontSize: responsive.fontSize.small,
    color: '#64748B',
  },
});
