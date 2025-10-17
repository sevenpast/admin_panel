import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FooterNav } from '../components/FooterNav';
import { responsive, getTileDimensions } from '@/lib/responsive';
import { apiService, DashboardStats } from '@/lib/api';

type DashboardTile = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  accent: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};


const createDashboardTiles = (stats: DashboardStats): DashboardTile[] => [
  {
    id: 'guests',
    title: 'Guests',
    value: stats.guests.total.toString(),
    subtitle: `${stats.guests.inHouse} in house`,
    accent: '#1D4ED8',
    icon: 'account-group',
  },
  {
    id: 'lessons',
    title: 'Lessons',
    value: stats.lessons.today.toString(),
    subtitle: 'Today planned',
    accent: '#059669',
    icon: 'school',
  },
  {
    id: 'meals',
    title: 'Meals',
    value: stats.meals.ordersToday.toString(),
    subtitle: 'Orders today',
    accent: '#DC2626',
    icon: 'silverware-fork-knife',
  },
  {
    id: 'events',
    title: 'Events',
    value: stats.events.today.toString(),
    subtitle: 'Next 7 days',
    accent: '#F59E0B',
    icon: 'calendar-star',
  },
  {
    id: 'inventory',
    title: 'Rooms',
    value: `${stats.inventory.bedsOccupied}/${stats.inventory.bedsTotal}`,
    subtitle: `${stats.inventory.occupancyPercentage}% occupied`,
    accent: '#7C3AED',
    icon: 'clipboard-list-outline',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    value: stats.events.today.toString(),
    subtitle: 'Events today',
    accent: '#10B981',
    icon: 'calendar',
  },
  {
    id: 'staff',
    title: 'Staff',
    value: stats.staff.active.toString(),
    subtitle: 'Active team',
    accent: '#8B5CF6',
    icon: 'account-hard-hat',
  },
  {
    id: 'alerts',
    title: 'Alert Management',
    value: '3',
    subtitle: 'Active alerts',
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch data from the API service
      const dashboardStats = await apiService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set fallback data
      setStats({
        guests: { total: 0, inHouse: 0, surfPackage: 0, surfPackagePercentage: 0 },
        lessons: { today: 0, beginnerCount: 0, intermediateCount: 0, advancedCount: 0 },
        meals: { ordersToday: 0, meatCount: 0, vegetarianCount: 0, veganCount: 0, otherCount: 0 },
        events: { today: 0, totalAttendance: 0 },
        staff: { active: 0 },
        inventory: { bedsOccupied: 0, bedsTotal: 0, occupancyPercentage: 0, roomsCount: 0 },
        shifts: { today: 0 }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const dashboardTiles = stats ? createDashboardTiles(stats) : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.contentArea}>
          <View style={styles.header}>
            <Text style={styles.title}>Dashboard</Text>
            <Text style={styles.subtitle}>CampFlow Mobile</Text>
          </View>

          <ScrollView 
            style={styles.tilesWrapper}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <MaterialCommunityIcons name="loading" size={32} color="#6B7280" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
              </View>
            ) : (
              <View style={styles.tilesGrid}>
                {dashboardTiles.map((tile) => (
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
            )}
          </ScrollView>
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
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
