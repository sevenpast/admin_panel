import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';

const ALERTS = [
  { id: 'a1', title: 'Zimmer 12 - Wartung erforderlich', detail: 'Technikteam informiert, Abschluss bis 18:00.' },
  { id: 'a2', title: 'Surfkurs verschoben', detail: 'Startzeit auf 15:30 geändert, Teilnehmende benachrichtigen.' },
  { id: 'a3', title: 'Inventur fällig', detail: 'Lager Süd überprüfen, Bestandserfassung aktualisieren.' },
];

export default function AlertsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>Aktuelle Hinweise und Eskalationen</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {ALERTS.map((alert) => (
            <View key={alert.id} style={styles.card}>
              <Text style={styles.cardTitle}>{alert.title}</Text>
              <Text style={styles.cardBody}>{alert.detail}</Text>
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
    gap: 16,
    paddingBottom: 120,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.medium,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: responsive.fontSize.xlarge,
    fontWeight: '700',
    color: '#111827',
    marginBottom: responsive.spacing.xs,
  },
  cardBody: {
    fontSize: responsive.fontSize.medium,
    color: '#4B5563',
    lineHeight: 20,
  },
});
