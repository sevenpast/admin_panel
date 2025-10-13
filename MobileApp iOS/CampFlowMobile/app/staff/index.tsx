import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';

const STAFF_DATA = [
  {
    id: '1',
    name: 'Jonas Hartmann',
    role: 'Surf Instructor',
    status: 'aktiv',
    shift: '08:00 - 16:00',
  },
  {
    id: '2',
    name: 'Luisa Mendes',
    role: 'Kitchen Manager',
    status: 'aktiv',
    shift: '06:00 - 14:00',
  },
  {
    id: '3',
    name: 'Sven Keller',
    role: 'Equipment Manager',
    status: 'pause',
    shift: '10:00 - 18:00',
  },
  {
    id: '4',
    name: 'Marek Bianchi',
    role: 'Guest Relations',
    status: 'aktiv',
    shift: '09:00 - 17:00',
  },
];

export default function StaffScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const headerTint = Colors[colorScheme].tint;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Staff</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.staffCard}>
            <Text style={styles.staffTitle}>Team Übersicht</Text>
            <Text style={styles.staffSubtitle}>Aktuelle Schichtplanung</Text>
            
            {STAFF_DATA.map((member) => (
              <View key={member.id} style={styles.staffItem}>
                <View style={styles.staffInfo}>
                  <Text style={styles.staffName}>{member.name}</Text>
                  <Text style={styles.staffRole}>{member.role}</Text>
                </View>
                <View style={styles.staffDetails}>
                  <Text style={styles.staffShift}>{member.shift}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: member.status === 'aktiv' ? '#10B981' : '#F59E0B' }]}>
                    <Text style={styles.statusText}>{member.status}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Team Statistiken</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={24} color="#1D4ED8" />
                <Text style={styles.statValue}>4</Text>
                <Text style={styles.statLabel}>Team Mitglieder</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#059669" />
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>Aktiv</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="calendar-clock" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>8h</Text>
                <Text style={styles.statLabel}>Durchschnitt</Text>
              </View>
            </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.medium,
    marginBottom: responsive.spacing.lg,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  staffTitle: {
    fontSize: responsive.fontSize.xlarge,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  staffSubtitle: {
    fontSize: responsive.fontSize.small,
    color: '#6B7280',
    marginBottom: responsive.spacing.md,
  },
  staffItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#111827',
  },
  staffRole: {
    fontSize: responsive.fontSize.small,
    color: '#6B7280',
    marginTop: 2,
  },
  staffDetails: {
    alignItems: 'flex-end',
  },
  staffShift: {
    fontSize: responsive.fontSize.small,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: responsive.spacing.xs,
    paddingVertical: 4,
    borderRadius: responsive.borderRadius.medium,
  },
  statusText: {
    fontSize: responsive.fontSize.small,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.medium,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  statsTitle: {
    fontSize: responsive.fontSize.xlarge,
    fontWeight: '700',
    color: '#111827',
    marginBottom: responsive.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: responsive.fontSize.xlarge,
    fontWeight: '700',
    color: '#111827',
    marginTop: responsive.spacing.xs,
  },
  statLabel: {
    fontSize: responsive.fontSize.small,
    color: '#6B7280',
    marginTop: 4,
  },
});
