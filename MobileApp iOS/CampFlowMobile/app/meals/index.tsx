import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FooterNav } from '../../components/FooterNav';

const MEALS = [
  {
    id: 'm1',
    time: '08:00',
    title: 'Breakfast Buffet',
    location: 'Main Dining Hall',
    menu: ['Acai Bowls', 'Fresh Fruit', 'Omelette Station', 'Cold Brew & Tea'],
  },
  {
    id: 'm2',
    time: '12:30',
    title: 'Fuel Lunch',
    location: 'Garden Terrace',
    menu: ['Grilled Mahi-Mahi', 'Sweet Potato Bowls', 'Vegan Buddha Bowls', 'Hydration Bar'],
  },
  {
    id: 'm3',
    time: '19:00',
    title: 'Sunset Dinner',
    location: 'Beach Club',
    menu: ['BBQ Selection', 'Fire-Roasted Veggies', 'Coconut Rice', 'Dessert Platter'],
  },
];

export default function MealsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Meals</Text>
          <Text style={styles.subtitle}>Heutiger Speiseplan und Servicezeiten</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {MEALS.map((meal) => (
            <View key={meal.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTime}>{meal.time}</Text>
                <Text style={styles.cardLocation}>{meal.location}</Text>
              </View>
              <Text style={styles.cardTitle}>{meal.title}</Text>
              <View style={styles.menuList}>
                {meal.menu.map((entry) => (
                  <View key={entry} style={styles.menuItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.menuText}>{entry}</Text>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  cardLocation: {
    fontSize: 14,
    color: '#64748B',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 12,
  },
  menuText: {
    fontSize: 15,
    color: '#475569',
  },
});
