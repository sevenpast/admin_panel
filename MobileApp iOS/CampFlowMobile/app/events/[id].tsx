import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
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

export default function EventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const event = {
    id: params.id as string,
    title: params.title as string,
    time: params.time as string,
    location: params.location as string,
    facilitator: params.facilitator as string,
    notes: params.notes as string,
  };

  const handleEditEvent = () => {
    Alert.alert('Bearbeiten', `Event "${event.title}" bearbeiten (Demo)`);
  };

  const handleCopyEvent = () => {
    Alert.alert('Erfolg', `Event "${event.title}" wurde kopiert.`);
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Event löschen',
      `Möchtest du das Event "${event.title}" wirklich löschen?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Erfolg', 'Event wurde gelöscht.');
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Zurück"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Event Details</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.detailCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            
            <View style={styles.detailSection}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#2563EB" />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Zeit</Text>
                  <Text style={styles.detailValue}>{event.time}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={24} color="#2563EB" />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Ort</Text>
                  <Text style={styles.detailValue}>{event.location}</Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="account-outline" size={24} color="#2563EB" />
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Lead</Text>
                  <Text style={styles.detailValue}>{event.facilitator}</Text>
                </View>
              </View>
            </View>

            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notizen</Text>
              <Text style={styles.notesText}>{event.notes}</Text>
            </View>
          </View>

          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Aktionen</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
                onPress={handleEditEvent}
                accessibilityRole="button"
                accessibilityLabel="Event bearbeiten"
              >
                <MaterialCommunityIcons name="pencil-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>Bearbeiten</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
                onPress={handleCopyEvent}
                accessibilityRole="button"
                accessibilityLabel="Event kopieren"
              >
                <MaterialCommunityIcons name="content-copy" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>Kopieren</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
                onPress={handleDeleteEvent}
                accessibilityRole="button"
                accessibilityLabel="Event löschen"
              >
                <MaterialCommunityIcons name="delete-outline" size={24} color="#FFFFFF" />
                <Text style={styles.actionText}>Löschen</Text>
              </TouchableOpacity>
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
    marginRight: 16,
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
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.large,
    marginBottom: responsive.spacing.lg,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  eventTitle: {
    fontSize: responsive.fontSize.xxlarge,
    fontWeight: '700',
    color: '#111827',
    marginBottom: responsive.spacing.lg,
    textAlign: 'center',
  },
  detailSection: {
    marginBottom: responsive.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.spacing.md,
    gap: responsive.spacing.md,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: responsive.fontSize.small,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: responsive.fontSize.medium,
    color: '#111827',
    fontWeight: '500',
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: responsive.spacing.lg,
  },
  notesLabel: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#374151',
    marginBottom: responsive.spacing.md,
  },
  notesText: {
    fontSize: responsive.fontSize.medium,
    color: '#475569',
    lineHeight: 22,
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.large,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  actionsTitle: {
    fontSize: responsive.fontSize.xlarge,
    fontWeight: '700',
    color: '#111827',
    marginBottom: responsive.spacing.md,
  },
  actionsGrid: {
    gap: responsive.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: responsive.spacing.md,
    paddingVertical: responsive.spacing.md,
    borderRadius: responsive.borderRadius.medium,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
  },
});
