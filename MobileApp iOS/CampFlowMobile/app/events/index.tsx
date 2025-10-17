import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useState } from 'react';
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
import { apiService, Event } from '@/lib/api';

type EventStatus = 'draft' | 'published' | 'cancelled';
type EventViewMode = 'overview' | 'detail' | 'create';

// Event type is now imported from API service

type EventDraft = {
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  max_participants: string;
  status: EventStatus;
  category: string;
};

const EVENT_CATEGORIES = [
  'Workshop',
  'Social Event',
  'Sports Activity',
  'Educational',
  'Entertainment',
  'Meeting',
  'Other'
];

const EVENT_STATUS_OPTIONS: Array<{ value: EventStatus; label: string; color: string }> = [
  { value: 'draft', label: 'Draft', color: '#6B7280' },
  { value: 'published', label: 'Published', color: '#059669' },
  { value: 'cancelled', label: 'Cancelled', color: '#EF4444' },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'Welcome BBQ',
    description: 'Welcome dinner for all new guests with traditional BBQ and drinks.',
    startAt: new Date().toISOString().split('T')[0] + 'T18:00',
    endAt: new Date().toISOString().split('T')[0] + 'T21:00',
    location: 'Main Beach Area',
    maxParticipants: 50,
    currentParticipants: 24,
    status: 'published',
    category: 'Social Event',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event-2',
    title: 'Surf Safety Workshop',
    description: 'Learn about ocean safety, wave reading, and emergency procedures.',
    startAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T10:00',
    endAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T12:00',
    location: 'Conference Room',
    maxParticipants: 20,
    currentParticipants: 15,
    status: 'published',
    category: 'Educational',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'event-3',
    title: 'Sunset Yoga Session',
    description: 'Relaxing yoga session on the beach during sunset.',
    startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T18:30',
    endAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] + 'T19:30',
    location: 'Beach Front',
    maxParticipants: 25,
    currentParticipants: 8,
    status: 'draft',
    category: 'Sports Activity',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_EVENT_DRAFT: EventDraft = {
  title: '',
  description: '',
  startAt: '',
  endAt: '',
  location: '',
  maxParticipants: '',
  status: 'draft',
  category: 'Other',
};

export default function EventsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const headerTint = Colors[colorScheme].tint;

  const [mode, setMode] = useState<EventViewMode>('overview');
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editableEvent, setEditableEvent] = useState<Event | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState<EventDraft>(INITIAL_EVENT_DRAFT);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events data
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const eventsData = await apiService.getEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (mode === 'detail' && selectedEvent) {
      setEditableEvent(selectedEvent);
      setIsEditing(false);
    }

    if (mode === 'overview') {
      setEditableEvent(null);
      setSelectedEvent(null);
      setIsEditing(false);
    }

    if (mode === 'create') {
      setNewEvent(INITIAL_EVENT_DRAFT);
      setEditableEvent(null);
      setIsEditing(false);
    }
  }, [mode, selectedEvent]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchTerm.trim() === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const renderEventCard = ({ item }: { item: Event }) => {
    const statusMeta = EVENT_STATUS_OPTIONS.find(opt => opt.value === item.status);
    const startDate = new Date(item.start_time);
    const isToday = startDate.toDateString() === new Date().toDateString();
    const isUpcoming = startDate > new Date();

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.eventCard}
        activeOpacity={0.82}
        onPress={() => {
          setSelectedEvent(item);
          setMode('detail');
        }}
      >
        <View style={styles.eventCardHeader}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusMeta?.color}20`, borderColor: statusMeta?.color }]}>
            <Text style={[styles.statusText, { color: statusMeta?.color }]}>{statusMeta?.label}</Text>
          </View>
        </View>
        
        <Text style={styles.eventDescription} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.eventMeta}>
          <View style={styles.eventMetaRow}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color="#6B7280" />
            <Text style={styles.eventMetaText}>
              {isToday ? 'Today' : startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={styles.eventMetaRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
            <Text style={styles.eventMetaText}>{item.location}</Text>
          </View>
          <View style={styles.eventMetaRow}>
            <MaterialCommunityIcons name="account-group" size={16} color="#6B7280" />
            <Text style={styles.eventMetaText}>{item.currentParticipants}/{item.maxParticipants} participants</Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <Text style={styles.categoryText}>{item.category}</Text>
          {isUpcoming && (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingText}>Upcoming</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const handleCreateEvent = () => {
    const title = newEvent.title.trim();
    const description = newEvent.description.trim();
    const location = newEvent.location.trim();
    const startAt = newEvent.startAt.trim();
    const endAt = newEvent.endAt.trim();

    if (!title) {
      Alert.alert('Title Required', 'Please enter an event title.');
      return;
    }

    if (!startAt || !endAt) {
      Alert.alert('Time Required', 'Please enter start and end times.');
      return;
    }

    const eventToAdd: Event = {
      id: `event-${Date.now()}`,
      title,
      description: description || 'No description provided.',
      startAt,
      endAt,
      location: location || 'TBD',
      maxParticipants: Number.parseInt(newEvent.maxParticipants, 10) || 0,
      currentParticipants: 0,
      status: newEvent.status,
      category: newEvent.category,
      createdAt: new Date().toISOString(),
    };

    setEvents((prev) => [...prev, eventToAdd]);
    Alert.alert('Event Created', `${eventToAdd.title} has been created.`);
    setNewEvent(INITIAL_EVENT_DRAFT);
    setMode('overview');
  };

  const handleSaveEvent = () => {
    if (!editableEvent) return;

    const title = editableEvent.title.trim();
    if (!title) {
      Alert.alert('Title Required', 'Please enter an event title.');
      return;
    }

    const updatedEvent: Event = {
      ...editableEvent,
      title,
      description: editableEvent.description.trim() || 'No description provided.',
      location: editableEvent.location.trim() || 'TBD',
    };

    setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    setSelectedEvent(updatedEvent);
    setEditableEvent(updatedEvent);
    setIsEditing(false);
    Alert.alert('Event Updated', `${updatedEvent.title} has been updated.`);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;

    Alert.alert('Delete Event', `Are you sure you want to delete "${selectedEvent.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setEvents((prev) => prev.filter((event) => event.id !== selectedEvent.id));
          setSelectedEvent(null);
          setEditableEvent(null);
          setIsEditing(false);
          setMode('overview');
          Alert.alert('Event Deleted', 'Event has been deleted.');
        },
      },
    ]);
  };

  const handleDuplicateEvent = () => {
    if (!selectedEvent) return;

    const duplicatedEvent: Event = {
      ...selectedEvent,
      id: `event-${Date.now()}`,
      title: `${selectedEvent.title} (Copy)`,
      status: 'draft',
      currentParticipants: 0,
      createdAt: new Date().toISOString(),
    };

    setEvents((prev) => [...prev, duplicatedEvent]);
    Alert.alert('Event Duplicated', `"${selectedEvent.title}" has been duplicated.`);
  };

  const handleToggleStatus = () => {
    if (!editableEvent) return;

    const newStatus: EventStatus = editableEvent.status === 'published' ? 'draft' : 'published';
    const updatedEvent = { ...editableEvent, status: newStatus };

    setEditableEvent(updatedEvent);
    setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    setSelectedEvent(updatedEvent);
    
    Alert.alert('Status Updated', `Event is now ${newStatus}.`);
  };

  const Overview = () => (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search events..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {['All', ...EVENT_CATEGORIES].map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.categoryChipTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEventCard}
        contentContainerStyle={styles.eventsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No events found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or create a new event.
            </Text>
          </View>
        }
      />

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
    if (!editableEvent) return null;

    const actionButtons: Array<{
      key: string;
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
      color: string;
      onPress: () => void;
    }> = [
      {
        key: 'back',
        icon: 'view-dashboard-outline',
        color: '#2563EB',
        onPress: () => setMode('overview'),
      },
      {
        key: 'edit',
        icon: 'pencil-circle-outline',
        color: isEditing ? '#059669' : '#F59E0B',
        onPress: () => setIsEditing(!isEditing),
      },
      {
        key: 'duplicate',
        icon: 'content-copy',
        color: '#8B5CF6',
        onPress: handleDuplicateEvent,
      },
      {
        key: 'status',
        icon: editableEvent.status === 'published' ? 'eye-off-outline' : 'eye-outline',
        color: editableEvent.status === 'published' ? '#6B7280' : '#059669',
        onPress: handleToggleStatus,
      },
      {
        key: 'delete',
        icon: 'trash-can-outline',
        color: '#EF4444',
        onPress: handleDeleteEvent,
      },
    ];

    return (
      <ScrollView contentContainerStyle={styles.detailWrapper} showsVerticalScrollIndicator={false}>
        <View style={styles.actionBar}>
          {actionButtons.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionButton}
              onPress={action.onPress}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailTitle}>{editableEvent.title}</Text>
          <Text style={styles.detailDescription}>{editableEvent.description}</Text>

          <EventFormField label="Start Time">
            {isEditing ? (
              <TextInput
                value={editableEvent.startAt}
                onChangeText={(value) => setEditableEvent((prev) => prev ? { ...prev, startAt: value } : prev)}
                style={styles.formInput}
                placeholder="2025-01-15T18:00"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <Text style={styles.detailValue}>
                {new Date(editableEvent.startAt).toLocaleString()}
              </Text>
            )}
          </EventFormField>

          <EventFormField label="End Time">
            {isEditing ? (
              <TextInput
                value={editableEvent.endAt}
                onChangeText={(value) => setEditableEvent((prev) => prev ? { ...prev, endAt: value } : prev)}
                style={styles.formInput}
                placeholder="2025-01-15T21:00"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <Text style={styles.detailValue}>
                {new Date(editableEvent.endAt).toLocaleString()}
              </Text>
            )}
          </EventFormField>

          <EventFormField label="Location">
            {isEditing ? (
              <TextInput
                value={editableEvent.location}
                onChangeText={(value) => setEditableEvent((prev) => prev ? { ...prev, location: value } : prev)}
                style={styles.formInput}
                placeholder="Event location"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <Text style={styles.detailValue}>{editableEvent.location}</Text>
            )}
          </EventFormField>

          <EventFormField label="Max Participants">
            {isEditing ? (
              <TextInput
                value={editableEvent.maxParticipants.toString()}
                onChangeText={(value) => setEditableEvent((prev) => prev ? { ...prev, maxParticipants: Number.parseInt(value, 10) || 0 } : prev)}
                style={styles.formInput}
                placeholder="50"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.detailValue}>{editableEvent.maxParticipants} people</Text>
            )}
          </EventFormField>

          <EventFormField label="Category">
            {isEditing ? (
              <View style={styles.chipRow}>
                {EVENT_CATEGORIES.map((category) => {
                  const isActive = editableEvent.category === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[styles.chipButton, isActive && styles.chipButtonActive]}
                      onPress={() => setEditableEvent((prev) => prev ? { ...prev, category } : prev)}
                    >
                      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{category}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.detailValue}>{editableEvent.category}</Text>
            )}
          </EventFormField>

          <EventFormField label="Status">
            <View style={styles.chipRow}>
              {EVENT_STATUS_OPTIONS.map((option) => {
                const isActive = editableEvent.status === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.chipButton, isActive && styles.chipButtonActive]}
                    onPress={() => setEditableEvent((prev) => prev ? { ...prev, status: option.value } : prev)}
                  >
                    <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </EventFormField>

          {isEditing && (
            <View style={styles.detailFooter}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveEvent}
                accessibilityRole="button"
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
    <ScrollView contentContainerStyle={styles.createWrapper} showsVerticalScrollIndicator={false}>
      <View style={styles.createCard}>
        <Text style={styles.createTitle}>Create New Event</Text>
        <Text style={styles.createDescription}>
          Create a new event for your camp. Fill in the details below.
        </Text>

        <EventFormField label="Title">
          <TextInput
            value={newEvent.title}
            onChangeText={(value) => setNewEvent((prev) => ({ ...prev, title: value }))}
            style={styles.formInput}
            placeholder="Event title"
            placeholderTextColor="#94A3B8"
          />
        </EventFormField>

        <EventFormField label="Description">
          <TextInput
            value={newEvent.description}
            onChangeText={(value) => setNewEvent((prev) => ({ ...prev, description: value }))}
            style={[styles.formInput, styles.notesInput]}
            placeholder="Event description"
            placeholderTextColor="#94A3B8"
            multiline
          />
        </EventFormField>

        <EventFormField label="Start Time">
          <TextInput
            value={newEvent.startAt}
            onChangeText={(value) => setNewEvent((prev) => ({ ...prev, startAt: value }))}
            style={styles.formInput}
            placeholder="2025-01-15T18:00"
            placeholderTextColor="#94A3B8"
          />
        </EventFormField>

        <EventFormField label="End Time">
          <TextInput
            value={newEvent.endAt}
            onChangeText={(value) => setNewEvent((prev) => ({ ...prev, endAt: value }))}
            style={styles.formInput}
            placeholder="2025-01-15T21:00"
            placeholderTextColor="#94A3B8"
          />
        </EventFormField>

        <EventFormField label="Location">
          <TextInput
            value={newEvent.location}
            onChangeText={(value) => setNewEvent((prev) => ({ ...prev, location: value }))}
            style={styles.formInput}
            placeholder="Event location"
            placeholderTextColor="#94A3B8"
          />
        </EventFormField>

        <EventFormField label="Max Participants">
          <TextInput
            value={newEvent.maxParticipants}
            onChangeText={(value) => setNewEvent((prev) => ({ ...prev, maxParticipants: value }))}
            style={styles.formInput}
            placeholder="50"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
          />
        </EventFormField>

        <EventFormField label="Category">
          <View style={styles.chipRow}>
            {EVENT_CATEGORIES.map((category) => {
              const isActive = newEvent.category === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.chipButton, isActive && styles.chipButtonActive]}
                  onPress={() => setNewEvent((prev) => ({ ...prev, category }))}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{category}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </EventFormField>

        <EventFormField label="Status">
          <View style={styles.chipRow}>
            {EVENT_STATUS_OPTIONS.map((option) => {
              const isActive = newEvent.status === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.chipButton, isActive && styles.chipButtonActive]}
                  onPress={() => setNewEvent((prev) => ({ ...prev, status: option.value }))}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </EventFormField>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setMode('overview')}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: headerTint }]}
            onPress={handleCreateEvent}
          >
            <Text style={styles.primaryButtonText}>Create Event</Text>
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
                ? 'Events'
                : mode === 'detail'
                ? selectedEvent?.title ?? 'Event Detail'
                : 'Create Event'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'overview'
                ? 'Event Management'
                : mode === 'detail'
                ? 'Event Details'
                : 'Create New Event'}
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

type EventFormFieldProps = {
  label: string;
  children: ReactNode;
  style?: ViewStyle;
};

function EventFormField({ label, children, style }: EventFormFieldProps) {
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
  container: {
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
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  eventsList: {
    paddingBottom: 120,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventMeta: {
    marginBottom: 12,
  },
  eventMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventMetaText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  fab: {
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
  detailWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 120,
    backgroundColor: '#F5F6FB',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#CBD5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
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
  detailTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 24,
  },
  detailValue: {
    fontSize: 15,
    color: '#1F2937',
  },
  detailFooter: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 120,
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
    marginBottom: 24,
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
    height: 80,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
});