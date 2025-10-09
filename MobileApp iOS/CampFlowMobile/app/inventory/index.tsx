import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FooterNav } from '../../components/FooterNav';

const INVENTORY = [
  {
    id: 'i1',
    category: 'Surfboards',
    items: [
      { name: 'Fish 5"8', status: 'OK', detail: '3 verfügbar, 1 zur Reparatur' },
      { name: 'Longboard 9"0', status: 'Low', detail: 'Nur 1 einsatzbereit – neues Board bestellen' },
    ],
  },
  {
    id: 'i2',
    category: 'Safety & Mobility',
    items: [
      { name: 'Helme', status: 'OK', detail: '8 gereinigt, Einsatzbereit' },
      { name: 'First-Aid Kits', status: 'Check', detail: 'Auffüllen nötig – Deadline 18:00' },
    ],
  },
  {
    id: 'i3',
    category: 'Hospitality',
    items: [
      { name: 'Handtücher', status: 'OK', detail: 'Frische Lieferung, 40 Stück' },
      { name: 'Kaffeebohnen', status: 'Low', detail: 'Restbestand für 1 Tag, Nachbestellung offen' },
    ],
  },
];

export default function InventoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Inventory</Text>
          <Text style={styles.subtitle}>Bestände und To-Dos des Tages</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {INVENTORY.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.category}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item) => (
                  <View key={item.name} style={styles.itemRow}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={[styles.itemStatus, statusColor(item.status)]}>{item.status}</Text>
                    </View>
                    <Text style={styles.itemDetail}>{item.detail}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        <FooterNav />
      </View>
    </SafeAreaView>
  );
}

function statusColor(status: string) {
  switch (status) {
    case 'OK':
      return { color: '#10B981' };
    case 'Low':
      return { color: '#F97316' };
    case 'Check':
      return { color: '#2563EB' };
    default:
      return { color: '#111827' };
  }
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  sectionContent: {
    gap: 12,
  },
  itemRow: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  itemDetail: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 19,
  },
});
