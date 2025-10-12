import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FooterNav } from '../../components/FooterNav';
import { SectionTabs } from '../../components/SectionTabs';

type InventorySectionKey = 'surf' | 'bed' | 'material' | 'safety' | 'hospitality';

type InventoryItem = {
  name: string;
  status: 'OK' | 'Low' | 'Check' | string;
  detail: string;
};

const INVENTORY_SECTIONS: Record<
  InventorySectionKey,
  { title: string; subtitle: string; items: InventoryItem[] }
> = {
  surf: {
    title: 'Surf & Boards',
    subtitle: 'Status deiner Surf-Flotte',
    items: [
      { name: 'Fish 5"8', status: 'OK', detail: '3 verfügbar, 1 zur Reparatur' },
      { name: 'Longboard 9"0', status: 'Low', detail: 'Nur 1 einsatzbereit – neues Board bestellen' },
    ],
  },
  bed: {
    title: 'Bed Inventory',
    subtitle: 'Überblick über Zimmer & Betten',
    items: [
      { name: 'River Lodge – Doppelbetten', status: 'OK', detail: 'Alle 12 bereit, Turn-Down-Service 18:00' },
      { name: 'Forest Cabin – Etagenbetten', status: 'Check', detail: '2x Quietschegeräusche, Wartung informieren' },
      { name: 'Garden Suite – Zusatzbetten', status: 'Low', detail: 'Nur 1 verfügbar, Nachbestellung ausstehend' },
    ],
  },
  material: {
    title: 'Material Inventory',
    subtitle: 'Equipment & Zubehör für Sessions',
    items: [
      { name: 'Neoprenanzüge', status: 'OK', detail: 'Größen S–L bereit, 4 Stück in der Reinigung' },
      { name: 'Leashes & Fins', status: 'Check', detail: 'Set 12 fehlt Fin-Key – Ersatz organisieren' },
      { name: 'Wax & Repair Kits', status: 'Low', detail: 'Nur 2 Kits übrig, Bestellung an Logistik senden' },
    ],
  },
  safety: {
    title: 'Safety & Mobility',
    subtitle: 'Sicherheits- und Shuttle-Setup',
    items: [
      { name: 'Helme', status: 'OK', detail: '8 gereinigt, einsatzbereit' },
      { name: 'First-Aid Kits', status: 'Check', detail: 'Auffüllen nötig – Deadline 18:00' },
    ],
  },
  hospitality: {
    title: 'Hospitality',
    subtitle: 'Camp-Komfort im Blick',
    items: [
      { name: 'Handtücher', status: 'OK', detail: 'Frische Lieferung, 40 Stück' },
      { name: 'Kaffeebohnen', status: 'Low', detail: 'Restbestand für 1 Tag, Nachbestellung offen' },
    ],
  },
};

const INVENTORY_TABS = [
  { key: 'surf' as InventorySectionKey, label: 'Surf & Boards', icon: 'surfing' as const },
  { key: 'bed' as InventorySectionKey, label: 'Bed Inventory', icon: 'bed' as const },
  { key: 'material' as InventorySectionKey, label: 'Material', icon: 'toolbox-outline' as const },
  { key: 'safety' as InventorySectionKey, label: 'Safety', icon: 'shield-check-outline' as const },
  { key: 'hospitality' as InventorySectionKey, label: 'Hospitality', icon: 'coffee-outline' as const },
];

export default function InventoryScreen() {
  const [activeTab, setActiveTab] = useState<InventorySectionKey>('surf');
  const activeSection = INVENTORY_SECTIONS[activeTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.subtitle}>Bestände und To-Dos des Tages</Text>
          </View>
          <SectionTabs items={INVENTORY_TABS} activeKey={activeTab} onChange={setActiveTab} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{activeSection.title}</Text>
            <Text style={styles.sectionSubtitle}>{activeSection.subtitle}</Text>
            <View style={styles.sectionContent}>
              {activeSection.items.map((item) => (
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
    gap: 18,
  },
  headerText: {
    gap: 6,
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
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 18,
  },
  sectionContent: {
    gap: 16,
  },
  itemRow: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
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
    lineHeight: 20,
  },
});
