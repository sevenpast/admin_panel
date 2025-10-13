import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FooterNav } from '../components/FooterNav';
import { responsive, getTileDimensions } from '@/lib/responsive';

type DashboardTile = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  accent: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const DASHBOARD_TILES: DashboardTile[] = [
  {
    id: 'guests',
    title: 'Guests',
    value: '24',
    subtitle: '18 in house',
    accent: '#1D4ED8',
    icon: 'account-group',
  },
  {
    id: 'lessons',
    title: 'Lessons',
    value: '8',
    subtitle: 'Heute geplant',
    accent: '#059669',
    icon: 'school',
  },
  {
    id: 'meals',
    title: 'Meals',
    value: '15',
    subtitle: 'Heute geplant',
    accent: '#DC2626',
    icon: 'silverware-fork-knife',
  },
  {
    id: 'events',
    title: 'Events',
    value: '5',
    subtitle: 'Heute live',
    accent: '#F59E0B',
    icon: 'calendar-star',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    value: '12',
    subtitle: 'Checks pending',
    accent: '#7C3AED',
    icon: 'clipboard-list-outline',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    value: '7',
    subtitle: 'Termine heute',
    accent: '#10B981',
    icon: 'calendar',
  },
  {
    id: 'staff',
    title: 'Staff',
    value: '12',
    subtitle: 'Team aktiv',
    accent: '#8B5CF6',
    icon: 'account-hard-hat',
  },
  {
    id: 'alerts',
    title: 'Alert Management',
    value: '5',
    subtitle: 'Aktive Hinweise',
    accent: '#F97316',
    icon: 'bell-alert',
  },
];

const TILE_ROUTES: Partial<Record<DashboardTile['id'], string>> = {
  guests: '/guests',
  lessons: '/lessons',
  events: '/events',
  inventory: '/inventory',
  alerts: '/alerts',
  calendar: '/calendar',
  meals: '/meals',
  staff: '/staff',
};

export default function DashboardScreen() {
  const router = useRouter();
  const tileDimensions = getTileDimensions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.contentArea}>
          <View style={styles.header}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>CampFlow Mobile</Text>
          </View>

          <View style={styles.tilesWrapper}>
            {DASHBOARD_TILES.map((tile) => (
              <TouchableOpacity
                key={tile.id}
                style={styles.tile}
                activeOpacity={0.85}
                onPress={() => {
                  const route = TILE_ROUTES[tile.id];
                  if (route) {
                    router.navigate(route as never);
                  }
                }}
              >
                <View style={[styles.iconBadge, { backgroundColor: `${tile.accent}20`, borderColor: tile.accent }]}
                >
                  <MaterialCommunityIcons name={tile.icon} size={26} color={tile.accent} />
                </View>
                <View style={styles.tileContent}>
                  <Text style={styles.tileTitle}>{tile.title}</Text>
                  <Text style={styles.tileValue}>{tile.value}</Text>
                  <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
    justifyContent: 'space-between',
  },
  contentArea: {
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
  tilesWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  tile: {
    width: '47%',
    height: '25%',
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.borderRadius.xlarge,
    padding: responsive.padding.medium,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    marginBottom: responsive.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    padding: responsive.padding.small,
    borderWidth: 2,
    borderRadius: responsive.borderRadius.medium,
    marginBottom: responsive.spacing.md,
  },
  tileTitle: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  tileValue: {
    fontSize: responsive.fontSize.xxlarge,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
    textAlign: 'center',
  },
  tileSubtitle: {
    fontSize: responsive.fontSize.small,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
});
