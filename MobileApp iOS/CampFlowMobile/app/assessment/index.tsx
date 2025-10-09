import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FooterNav } from '../../components/FooterNav';

export default function AssessmentScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Assessment</Text>
          <Text style={styles.subtitle}>Auswahl der Assessment-Module folgt</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>Assesment Dashboard</Text>
            <Text style={styles.placeholderText}>
              Hier präsentierst du später Bewertungen, Feedback und Auswertungen. Nutze diesen Dummy, um den
              Workflow zu zeigen.
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
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 120,
    gap: 16,
  },
  placeholderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
});
