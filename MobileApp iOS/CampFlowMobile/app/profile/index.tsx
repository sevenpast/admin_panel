import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';

type ProfileSection = 'personal' | 'preferences' | 'notifications' | 'about';

type UserProfile = {
  name: string;
  role: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  preferences: {
    darkMode: boolean;
    autoSync: boolean;
    locationTracking: boolean;
  };
};

const INITIAL_PROFILE: UserProfile = {
  name: 'Max Mustermann',
  role: 'Operations Manager',
  email: 'max.mustermann@campflow.com',
  phone: '+41 79 123 45 67',
  language: 'Deutsch',
  timezone: 'Europe/Zurich',
  notifications: {
    push: true,
    email: true,
    sms: false,
  },
  preferences: {
    darkMode: false,
    autoSync: true,
    locationTracking: true,
  },
};

const PROFILE_SECTIONS = [
  { key: 'personal' as ProfileSection, label: 'Persönlich', icon: 'account' },
  { key: 'preferences' as ProfileSection, label: 'Einstellungen', icon: 'cog' },
  { key: 'notifications' as ProfileSection, label: 'Benachrichtigungen', icon: 'bell' },
  { key: 'about' as ProfileSection, label: 'Über', icon: 'information' },
];

export default function ProfileScreen() {
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);

  const handleNotificationToggle = (type: keyof UserProfile['notifications']) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  const handlePreferenceToggle = (type: keyof UserProfile['preferences']) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: !prev.preferences[type],
      },
    }));
  };

  const handleSaveProfile = () => {
    Alert.alert('Profil gespeichert', 'Deine Änderungen wurden gespeichert (Demo).');
  };

  const handleLogout = () => {
    Alert.alert('Abmelden', 'Möchtest du dich wirklich abmelden?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Abmelden', style: 'destructive', onPress: () => console.log('Logout') },
    ]);
  };

  const renderPersonalSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <MaterialCommunityIcons name="account-circle" size={80} color="#2563EB" />
        </View>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileRole}>{profile.role}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardTitle}>Kontaktinformationen</Text>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="email" size={20} color="#64748B" />
          <Text style={styles.infoText}>{profile.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="phone" size={20} color="#64748B" />
          <Text style={styles.infoText}>{profile.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="translate" size={20} color="#64748B" />
          <Text style={styles.infoText}>{profile.language}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="clock" size={20} color="#64748B" />
          <Text style={styles.infoText}>{profile.timezone}</Text>
        </View>
      </View>
    </View>
  );

  const renderPreferencesSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>App-Einstellungen</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Dunkler Modus</Text>
            <Text style={styles.settingDescription}>Interface im dunklen Design anzeigen</Text>
          </View>
          <Switch
            value={profile.preferences.darkMode}
            onValueChange={() => handlePreferenceToggle('darkMode')}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={profile.preferences.darkMode ? '#2563EB' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-Sync</Text>
            <Text style={styles.settingDescription}>Daten automatisch synchronisieren</Text>
          </View>
          <Switch
            value={profile.preferences.autoSync}
            onValueChange={() => handlePreferenceToggle('autoSync')}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={profile.preferences.autoSync ? '#2563EB' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Standort-Tracking</Text>
            <Text style={styles.settingDescription}>Standort für bessere Services nutzen</Text>
          </View>
          <Switch
            value={profile.preferences.locationTracking}
            onValueChange={() => handlePreferenceToggle('locationTracking')}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={profile.preferences.locationTracking ? '#2563EB' : '#FFFFFF'}
          />
        </View>
      </View>
    </View>
  );

  const renderNotificationsSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.settingsCard}>
        <Text style={styles.cardTitle}>Benachrichtigungen</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push-Benachrichtigungen</Text>
            <Text style={styles.settingDescription}>Sofortige Benachrichtigungen auf dem Gerät</Text>
          </View>
          <Switch
            value={profile.notifications.push}
            onValueChange={() => handleNotificationToggle('push')}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={profile.notifications.push ? '#2563EB' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>E-Mail-Benachrichtigungen</Text>
            <Text style={styles.settingDescription}>Wichtige Updates per E-Mail erhalten</Text>
          </View>
          <Switch
            value={profile.notifications.email}
            onValueChange={() => handleNotificationToggle('email')}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={profile.notifications.email ? '#2563EB' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>SMS-Benachrichtigungen</Text>
            <Text style={styles.settingDescription}>Kritische Alerts per SMS</Text>
          </View>
          <Switch
            value={profile.notifications.sms}
            onValueChange={() => handleNotificationToggle('sms')}
            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
            thumbColor={profile.notifications.sms ? '#2563EB' : '#FFFFFF'}
          />
        </View>
      </View>
    </View>
  );

  const renderAboutSection = () => (
    <View style={styles.sectionContent}>
      <View style={styles.aboutCard}>
        <Text style={styles.cardTitle}>Über CampFlow</Text>
        <Text style={styles.aboutText}>
          CampFlow ist eine umfassende Lösung für das Management von Surf-Camps und Outdoor-Aktivitäten.
        </Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>

      <View style={styles.actionCard}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSaveProfile}>
          <MaterialCommunityIcons name="content-save" size={20} color="#2563EB" />
          <Text style={styles.actionButtonText}>Profil speichern</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Abmelden</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalSection();
      case 'preferences':
        return renderPreferencesSection();
      case 'notifications':
        return renderNotificationsSection();
      case 'about':
        return renderAboutSection();
      default:
        return renderPersonalSection();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>Einstellungen & Account</Text>
        </View>

        <View style={styles.sectionTabs}>
          {PROFILE_SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.key}
              style={[
                styles.sectionTab,
                activeSection === section.key && styles.sectionTabActive,
              ]}
              onPress={() => setActiveSection(section.key)}
            >
              <MaterialCommunityIcons
                name={section.icon}
                size={20}
                color={activeSection === section.key ? '#FFFFFF' : '#64748B'}
              />
              <Text style={[
                styles.sectionTabText,
                activeSection === section.key && styles.sectionTabTextActive,
              ]}>
                {section.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {renderSectionContent()}
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
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  sectionTabActive: {
    backgroundColor: '#2563EB',
  },
  sectionTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  sectionTabTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 120,
    gap: 16,
  },
  sectionContent: {
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.large,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: responsive.spacing.md,
  },
  profileName: {
    fontSize: responsive.fontSize.xxlarge,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: responsive.fontSize.medium,
    color: '#64748B',
  },
  infoCard: {
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
    marginBottom: responsive.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.spacing.md,
    gap: responsive.spacing.md,
  },
  infoText: {
    fontSize: responsive.fontSize.medium,
    color: '#374151',
    flex: 1,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.medium,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
    marginRight: responsive.spacing.md,
  },
  settingLabel: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: responsive.fontSize.small,
    color: '#64748B',
  },
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.medium,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  aboutText: {
    fontSize: responsive.fontSize.medium,
    color: '#374151',
    lineHeight: 22,
    marginBottom: responsive.spacing.md,
  },
  versionText: {
    fontSize: responsive.fontSize.small,
    color: '#64748B',
    fontWeight: '600',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.medium,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsive.spacing.md,
    paddingHorizontal: responsive.padding.medium,
    borderRadius: responsive.borderRadius.medium,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    gap: responsive.spacing.xs,
  },
  logoutButton: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  actionButtonText: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#2563EB',
  },
  logoutButtonText: {
    color: '#EF4444',
  },
});
