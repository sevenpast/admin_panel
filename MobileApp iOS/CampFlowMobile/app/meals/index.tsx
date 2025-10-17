import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';
import { apiService, Meal } from '@/lib/api';

// Meals will be fetched from the API

export default function MealsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const headerTint = Colors[colorScheme].tint;
  
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch meals data
  const fetchMeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const mealsData = await apiService.getMeals();
      setMeals(mealsData);
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return 'Breakfast';
      case 'lunch': return 'Lunch';
      case 'dinner': return 'Dinner';
      default: return type;
    }
  };

  const getMealTime = (type: string) => {
    switch (type) {
      case 'breakfast': return '08:00';
      case 'lunch': return '12:30';
      case 'dinner': return '18:00';
      default: return 'TBD';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return '#10B981';
      case 'draft': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Ready';
      case 'draft': return 'Planned';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meals</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.mealCard}>
            <Text style={styles.mealTitle}>Today's Meals</Text>
            <Text style={styles.mealSubtitle}>Overview of planned meals</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <MaterialCommunityIcons name="loading" size={32} color="#6B7280" />
                <Text style={styles.loadingText}>Loading meals...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={32} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchMeals}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : meals.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={36} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No meals found</Text>
                <Text style={styles.emptyStateText}>
                  Create your first meal to get started.
                </Text>
              </View>
            ) : (
              meals.map((meal) => (
                <View key={meal.id} style={styles.mealItem}>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{getMealTypeLabel(meal.meal_type)}</Text>
                    <Text style={styles.mealTime}>{getMealTime(meal.meal_type)}</Text>
                  </View>
                  <View style={styles.mealDetails}>
                    <Text style={styles.mealParticipants}>{meal.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(meal.status) }]}>
                      <Text style={styles.statusText}>{getStatusLabel(meal.status)}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Statistics</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#DC2626" />
                <Text style={styles.statValue}>{meals.length}</Text>
                <Text style={styles.statLabel}>Meals</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={24} color="#1D4ED8" />
                <Text style={styles.statValue}>{meals.filter(m => m.status === 'published').length}</Text>
                <Text style={styles.statLabel}>Ready</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-outline" size={24} color="#059669" />
                <Text style={styles.statValue}>{meals.filter(m => m.status === 'draft').length}</Text>
                <Text style={styles.statLabel}>Planned</Text>
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
  mealCard: {
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
  mealTitle: {
    fontSize: responsive.fontSize.xlarge,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  mealSubtitle: {
    fontSize: responsive.fontSize.small,
    color: '#6B7280',
    marginBottom: responsive.spacing.md,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mealInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: responsive.fontSize.medium,
    fontWeight: '600',
    color: '#111827',
  },
  mealTime: {
    fontSize: responsive.fontSize.small,
    color: '#6B7280',
    marginTop: 2,
  },
  mealDetails: {
    alignItems: 'flex-end',
  },
  mealParticipants: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 12,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2563EB',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: 24,
    marginTop: 6,
  },
});