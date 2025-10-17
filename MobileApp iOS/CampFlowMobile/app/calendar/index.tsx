import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';

type CalendarEvent = {
  id: string;
  title: string;
  type: 'lesson' | 'event' | 'meal' | 'shift';
  startTime: string;
  endTime: string;
  location: string;
  participants?: number;
  maxParticipants?: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  color: string;
};

type CalendarViewMode = 'day' | 'week' | 'month';

const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Morning Surf Lesson',
    type: 'lesson',
    startTime: new Date().toISOString().split('T')[0] + 'T08:00',
    endTime: new Date().toISOString().split('T')[0] + 'T09:30',
    location: 'Main Beach',
    participants: 8,
    maxParticipants: 10,
    status: 'scheduled',
    color: '#059669',
  },
  {
    id: 'cal-2',
    title: 'Breakfast Service',
    type: 'meal',
    startTime: new Date().toISOString().split('T')[0] + 'T07:00',
    endTime: new Date().toISOString().split('T')[0] + 'T09:00',
    location: 'Dining Hall',
    participants: 24,
    maxParticipants: 30,
    status: 'scheduled',
    color: '#DC2626',
  },
  {
    id: 'cal-3',
    title: 'Welcome BBQ',
    type: 'event',
    startTime: new Date().toISOString().split('T')[0] + 'T18:00',
    endTime: new Date().toISOString().split('T')[0] + 'T21:00',
    location: 'Beach Area',
    participants: 28,
    maxParticipants: 50,
    status: 'scheduled',
    color: '#F59E0B',
  },
  {
    id: 'cal-4',
    title: 'Kitchen Staff Shift',
    type: 'shift',
    startTime: new Date().toISOString().split('T')[0] + 'T06:00',
    endTime: new Date().toISOString().split('T')[0] + 'T14:00',
    location: 'Kitchen',
    status: 'scheduled',
    color: '#8B5CF6',
  },
  {
    id: 'cal-5',
    title: 'Intermediate Surf Session',
    type: 'lesson',
    startTime: new Date().toISOString().split('T')[0] + 'T11:00',
    endTime: new Date().toISOString().split('T')[0] + 'T12:30',
    location: 'Reef Break A',
    participants: 6,
    maxParticipants: 8,
    status: 'scheduled',
    color: '#059669',
  },
  {
    id: 'cal-6',
    title: 'Lunch Service',
    type: 'meal',
    startTime: new Date().toISOString().split('T')[0] + 'T12:00',
    endTime: new Date().toISOString().split('T')[0] + 'T14:00',
    location: 'Dining Hall',
    participants: 26,
    maxParticipants: 30,
    status: 'scheduled',
    color: '#DC2626',
  },
];

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

const EVENT_TYPE_ICONS = {
  lesson: 'school',
  event: 'calendar-star',
  meal: 'silverware-fork-knife',
  shift: 'account-hard-hat',
} as const;

const EVENT_TYPE_LABELS = {
  lesson: 'Lesson',
  event: 'Event',
  meal: 'Meal',
  shift: 'Shift',
} as const;

export default function CalendarScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const headerTint = Colors[colorScheme].tint;

  const [viewMode, setViewMode] = useState<CalendarViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.startTime.startsWith(dateStr));
  };

  const getEventsForWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const renderTimeSlot = (timeSlot: string) => {
    const eventsInSlot = getEventsForDate(selectedDate).filter(event => {
      const eventStart = new Date(event.startTime);
      const slotTime = new Date(selectedDate);
      const [hours, minutes] = timeSlot.split(':');
      slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      return eventStart.getHours() === parseInt(hours);
    });

    return (
      <View key={timeSlot} style={styles.timeSlot}>
        <Text style={styles.timeLabel}>{timeSlot}</Text>
        <View style={styles.eventsColumn}>
          {eventsInSlot.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={[styles.eventBlock, { backgroundColor: event.color }]}
              onPress={() => setSelectedEvent(event)}
            >
              <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
              <Text style={styles.eventTime}>
                {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </Text>
              <Text style={styles.eventLocation} numberOfLines={1}>{event.location}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderWeekDay = (day: Date) => {
    const dayEvents = getEventsForDate(day);
    const isToday = day.toDateString() === new Date().toDateString();
    const isSelected = day.toDateString() === selectedDate.toDateString();

    return (
      <TouchableOpacity
        key={day.toISOString()}
        style={[styles.weekDay, isSelected && styles.weekDaySelected]}
        onPress={() => setSelectedDate(day)}
      >
        <Text style={[styles.weekDayName, isToday && styles.weekDayToday]}>
          {day.toLocaleDateString('en-US', { weekday: 'short' })}
        </Text>
        <Text style={[styles.weekDayNumber, isToday && styles.weekDayToday]}>
          {day.getDate()}
        </Text>
        <View style={styles.weekDayEvents}>
          {dayEvents.slice(0, 3).map((event, index) => (
            <View
              key={index}
              style={[styles.weekDayEventDot, { backgroundColor: event.color }]}
            />
          ))}
          {dayEvents.length > 3 && (
            <Text style={styles.weekDayMoreEvents}>+{dayEvents.length - 3}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEventCard = ({ item }: { item: CalendarEvent }) => {
    const startDate = new Date(item.startTime);
    const endDate = new Date(item.endTime);
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    return (
      <TouchableOpacity
        style={[styles.eventCard, { borderLeftColor: item.color }]}
        onPress={() => setSelectedEvent(item)}
      >
        <View style={styles.eventCardHeader}>
          <View style={styles.eventCardTitleRow}>
            <MaterialCommunityIcons 
              name={EVENT_TYPE_ICONS[item.type]} 
              size={20} 
              color={item.color} 
            />
            <Text style={styles.eventCardTitle}>{item.title}</Text>
          </View>
          <View style={[styles.eventTypeBadge, { backgroundColor: `${item.color}20` }]}>
            <Text style={[styles.eventTypeText, { color: item.color }]}>
              {EVENT_TYPE_LABELS[item.type]}
            </Text>
          </View>
        </View>
        
        <View style={styles.eventCardDetails}>
          <View style={styles.eventCardRow}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#6B7280" />
            <Text style={styles.eventCardText}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)} ({duration}h)
            </Text>
          </View>
          <View style={styles.eventCardRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color="#6B7280" />
            <Text style={styles.eventCardText}>{item.location}</Text>
          </View>
          {item.participants !== undefined && (
            <View style={styles.eventCardRow}>
              <MaterialCommunityIcons name="account-group" size={16} color="#6B7280" />
              <Text style={styles.eventCardText}>
                {item.participants}/{item.maxParticipants} participants
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const DayView = () => (
    <View style={styles.dayView}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayTitle}>{formatDate(selectedDate)}</Text>
        <View style={styles.dayNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setSelectedDate(new Date())}
          >
            <Text style={styles.todayButton}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.timeSlotsContainer} showsVerticalScrollIndicator={false}>
        {TIME_SLOTS.map(renderTimeSlot)}
      </ScrollView>
    </View>
  );

  const WeekView = () => {
    const weekDays = getWeekDays(selectedDate);
    const weekEvents = getEventsForWeek(selectedDate);

    return (
      <View style={styles.weekView}>
        <View style={styles.weekHeader}>
          <Text style={styles.weekTitle}>
            Week of {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
          <View style={styles.weekNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 7);
                setSelectedDate(newDate);
              }}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setSelectedDate(new Date())}
            >
              <Text style={styles.todayButton}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 7);
                setSelectedDate(newDate);
              }}
            >
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.weekDaysContainer}>
          {weekDays.map(renderWeekDay)}
        </View>

        <FlatList
          data={weekEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.weekEventsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const MonthView = () => {
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.getMonth() === selectedDate.getMonth() && 
             eventDate.getFullYear() === selectedDate.getFullYear();
    });

    return (
      <View style={styles.monthView}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthTitle}>
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <View style={styles.monthNavigation}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}
            >
              <MaterialCommunityIcons name="chevron-left" size={24} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => setSelectedDate(new Date())}
            >
              <Text style={styles.todayButton}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}
            >
              <MaterialCommunityIcons name="chevron-right" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={monthEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.monthEventsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  const renderViewMode = () => {
    switch (viewMode) {
      case 'day':
        return <DayView />;
      case 'week':
        return <WeekView />;
      case 'month':
        return <MonthView />;
      default:
        return <DayView />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <Text style={styles.subtitle}>Schedule Overview</Text>
        </View>

        <View style={styles.viewModeSelector}>
          {(['day', 'week', 'month'] as CalendarViewMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.viewModeButton,
                viewMode === mode && styles.viewModeButtonActive
              ]}
              onPress={() => setViewMode(mode)}
            >
              <Text style={[
                styles.viewModeText,
                viewMode === mode && styles.viewModeTextActive
              ]}>
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentArea}>
          {renderViewMode()}
        </View>

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
  viewModeSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#2563EB',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  viewModeTextActive: {
    color: '#FFFFFF',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  dayView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  dayNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  todayButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  timeSlotsContainer: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    marginBottom: 20,
    minHeight: 60,
  },
  timeLabel: {
    width: 60,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'right',
    paddingRight: 12,
    paddingTop: 8,
  },
  eventsColumn: {
    flex: 1,
    paddingLeft: 12,
  },
  eventBlock: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  weekView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  weekTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  weekNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  weekDaySelected: {
    backgroundColor: '#EEF2FF',
  },
  weekDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  weekDayToday: {
    color: '#2563EB',
  },
  weekDayEvents: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  weekDayEventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  weekDayMoreEvents: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  weekEventsList: {
    paddingBottom: 120,
  },
  monthView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthEventsList: {
    paddingBottom: 120,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  eventCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  eventCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  eventTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  eventCardDetails: {
    gap: 6,
  },
  eventCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventCardText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
});