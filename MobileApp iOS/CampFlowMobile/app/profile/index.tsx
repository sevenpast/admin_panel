import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FooterNav } from '../../components/FooterNav';

const PROFILE_FIELDS = [
  { label: 'Name', value: 'Max Mustermann' },
  { label: 'Funktion', value: 'Operations Manager' },
  { label: 'Sprache', value: 'Deutsch, Englisch' },
  { label: 'Benachrichtigungen', value: 'Push & E-Mail' },
];

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>Einstellungen & Account</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {PROFILE_FIELDS.map((field) => (
            <View key={field.label} style={styles.card}>
              <Text style={styles.cardLabel}>{field.label}</Text>
              <Text style={styles.cardValue}>{field.value}</Text>
            </View>
          ))}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Demo Hinweis</Text>
            <Text style={styles.cardValue}>
              Dieser Bildschirm ist ein klickbarer Dummy. Ergänze hier später reale Daten- und
              Einstellungsmöglichkeiten.
            </Text>
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
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 22,
  },
});
