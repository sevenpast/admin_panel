import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { FooterNav } from '../../components/FooterNav';
import { SectionTabs } from '../../components/SectionTabs';

type Meal = {
  id: string;
  time: string;
  title: string;
  location: string;
  menu: string[];
};

const MEAL_SEED: Meal[] = [
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

type MealsTabKey = 'management' | 'kitchen' | 'staff';

const MEAL_TABS = [
  { key: 'management' as MealsTabKey, label: 'Meal Management', icon: 'clipboard-list-outline' },
  { key: 'kitchen' as MealsTabKey, label: 'Kitchen View', icon: 'chef-hat' },
  { key: 'staff' as MealsTabKey, label: 'Staff View', icon: 'account-hard-hat' },
];

const STAFF_GROUPS = [
  { id: 'surf-coaches', name: 'Surf Coaches' },
  { id: 'camp-team', name: 'Camp Team' },
  { id: 'wellness', name: 'Wellness Crew' },
];

type StaffOrders = Record<string, Record<string, number>>; // mealId -> groupId -> count

export default function MealsScreen() {
  const [meals, setMeals] = useState<Meal[]>(MEAL_SEED);
  const [activeTab, setActiveTab] = useState<MealsTabKey>('management');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newMeal, setNewMeal] = useState({
    time: '',
    title: '',
    location: '',
    menu: '',
  });
  const [staffOrders, setStaffOrders] = useState<StaffOrders>(() => {
    const initial: StaffOrders = {};
    MEAL_SEED.forEach((meal) => {
      initial[meal.id] = STAFF_GROUPS.reduce<Record<string, number>>((acc, group) => {
        acc[group.id] = 0;
        return acc;
      }, {});
    });
    return initial;
  });

  const kitchenPrepList = useMemo(() => {
    return meals.map((meal) => ({
      id: meal.id,
      time: meal.time,
      title: meal.title,
      station: meal.location,
      items: meal.menu,
    }));
  }, [meals]);

  const handleSaveNewMeal = () => {
    if (!newMeal.time || !newMeal.title) {
      return;
    }
    const nextMeal: Meal = {
      id: `meal-${Date.now()}`,
      time: newMeal.time,
      title: newMeal.title,
      location: newMeal.location || 'Main Dining Hall',
      menu: newMeal.menu
        ? newMeal.menu
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
        : ['Noch keine Einträge'],
    };
    setMeals((prev) => [...prev, nextMeal]);
    setStaffOrders((prev) => ({
      ...prev,
      [nextMeal.id]: STAFF_GROUPS.reduce<Record<string, number>>((acc, group) => {
        acc[group.id] = 0;
        return acc;
      }, {}),
    }));
    setNewMeal({ time: '', title: '', location: '', menu: '' });
    setShowCreateForm(false);
  };

  const handleAdjustPortion = (mealId: string, groupId: string, delta: number) => {
    setStaffOrders((prev) => {
      const next = { ...prev };
      const current = next[mealId] ? { ...next[mealId] } : {};
      const updatedValue = Math.max(0, (current[groupId] || 0) + delta);
      current[groupId] = updatedValue;
      next[mealId] = current;
      return next;
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Meals</Text>
            <Text style={styles.subtitle}>
              Plane Menüs, teile Kitchen-Preps und halte das Team auf dem Laufenden.
            </Text>
          </View>
          <SectionTabs
            items={MEAL_TABS}
            activeKey={activeTab}
            onChange={(next) => {
              setActiveTab(next);
              setShowCreateForm(false);
            }}
          />
        </View>

        {activeTab === 'management' && (
          <View style={styles.managementWrapper}>
            <View style={styles.managementHeader}>
              <Text style={styles.managementTitle}>Meal Management</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowCreateForm((prev) => !prev)}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name={showCreateForm ? 'close' : 'plus'}
                  size={22}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
            {showCreateForm && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>Neues Meal erstellen</Text>
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Zeit</Text>
                  <TextInput
                    value={newMeal.time}
                    onChangeText={(value) => setNewMeal((prev) => ({ ...prev, time: value }))}
                    placeholder="z. B. 12:30"
                    placeholderTextColor="#94A3B8"
                    style={styles.formInput}
                  />
                </View>
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Titel</Text>
                  <TextInput
                    value={newMeal.title}
                    onChangeText={(value) => setNewMeal((prev) => ({ ...prev, title: value }))}
                    placeholder="Meal Name"
                    placeholderTextColor="#94A3B8"
                    style={styles.formInput}
                  />
                </View>
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Location</Text>
                  <TextInput
                    value={newMeal.location}
                    onChangeText={(value) => setNewMeal((prev) => ({ ...prev, location: value }))}
                    placeholder="Station / Bereich"
                    placeholderTextColor="#94A3B8"
                    style={styles.formInput}
                  />
                </View>
                <View style={styles.formRow}>
                  <Text style={styles.formLabel}>Menü</Text>
                  <TextInput
                    value={newMeal.menu}
                    onChangeText={(value) => setNewMeal((prev) => ({ ...prev, menu: value }))}
                    placeholder="Kommagetrennt: z. B. Bowls, Smoothies, ..."
                    placeholderTextColor="#94A3B8"
                    style={[styles.formInput, styles.formInputMultiline]}
                    multiline
                  />
                </View>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveNewMeal}
                  activeOpacity={0.9}
                >
                  <MaterialCommunityIcons name="content-save-outline" color="#FFFFFF" size={18} />
                  <Text style={styles.saveButtonText}>Meal anlegen</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView contentContainerStyle={styles.managementList} showsVerticalScrollIndicator={false}>
              {meals.map((meal) => (
                <View key={meal.id} style={styles.managementCard}>
                  <View style={styles.managementCardHeader}>
                    <View>
                      <Text style={styles.managementMealTitle}>{meal.title}</Text>
                      <Text style={styles.managementMeta}>
                        {meal.time} · {meal.location}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.outlineButton} activeOpacity={0.85}>
                      <MaterialCommunityIcons name='pencil-outline' size={16} color="#1D4ED8" />
                      <Text style={styles.outlineButtonText}>Bearbeiten</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.managementMenu}>
                    {meal.menu.map((entry) => (
                      <View key={entry} style={styles.managementMenuItem}>
                        <MaterialCommunityIcons name="checkbox-blank-circle" size={6} color="#1D4ED8" />
                        <Text style={styles.managementMenuText}>{entry}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.managementActions}>
                    <TouchableOpacity style={styles.managementActionButton} activeOpacity={0.85}>
                      <MaterialCommunityIcons name="clipboard-text-outline" size={16} color="#0F172A" />
                      <Text style={styles.managementActionText}>Prep Liste</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.managementActionButton} activeOpacity={0.85}>
                      <MaterialCommunityIcons name="share-variant" size={16} color="#0F172A" />
                      <Text style={styles.managementActionText}>An Team senden</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'kitchen' && (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {kitchenPrepList.map((prep) => (
              <View key={prep.id} style={styles.kitchenCard}>
                <View style={styles.kitchenHeader}>
                  <View style={styles.kitchenChip}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#2563EB" />
                    <Text style={styles.kitchenChipText}>{prep.time}</Text>
                  </View>
                  <Text style={styles.kitchenStation}>{prep.station}</Text>
                </View>
                <Text style={styles.kitchenTitle}>{prep.title}</Text>
                <View style={styles.kitchenList}>
                  {prep.items.map((item) => (
                    <View key={item} style={styles.kitchenItem}>
                      <Text style={styles.kitchenItemText}>{item}</Text>
                      <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={16} color="#CBD5F5" />
                    </View>
                  ))}
                </View>
                <View style={styles.kitchenFooter}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#F97316" />
                  <Text style={styles.kitchenFooterText}>Checkliste: Allergene markieren & Kühllog prüfen</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {activeTab === 'staff' && (
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {meals.map((meal) => (
              <View key={meal.id} style={styles.staffCard}>
                <View style={styles.staffHeader}>
                  <View>
                    <Text style={styles.staffTitle}>{meal.title}</Text>
                    <Text style={styles.staffMeta}>
                      {meal.time} · {meal.location}
                    </Text>
                  </View>
                  <Text style={styles.staffPortionLabel}>Gesamtbedarf</Text>
                </View>
                <View style={styles.staffGroups}>
                  {STAFF_GROUPS.map((group) => {
                    const count = staffOrders[meal.id]?.[group.id] ?? 0;
                    return (
                      <View key={group.id} style={styles.staffGroupRow}>
                        <View>
                          <Text style={styles.staffGroupLabel}>{group.name}</Text>
                          <Text style={styles.staffGroupHint}>Anzahl Portionen</Text>
                        </View>
                        <View style={styles.stepper}>
                          <TouchableOpacity
                            style={[styles.stepperButton, count === 0 && styles.stepperButtonDisabled]}
                            onPress={() => handleAdjustPortion(meal.id, group.id, -1)}
                            disabled={count === 0}
                          >
                            <MaterialCommunityIcons
                              name="minus"
                              size={16}
                              color={count === 0 ? '#CBD5F5' : '#1D4ED8'}
                            />
                          </TouchableOpacity>
                          <Text style={styles.stepperValue}>{count}</Text>
                          <TouchableOpacity
                            style={styles.stepperButton}
                            onPress={() => handleAdjustPortion(meal.id, group.id, 1)}
                          >
                            <MaterialCommunityIcons name="plus" size={16} color="#1D4ED8" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

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
    gap: 18,
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
  headerText: {
    gap: 6,
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
  managementWrapper: {
    flex: 1,
    paddingBottom: 24,
  },
  managementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  managementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  formCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  formRow: {
    marginBottom: 14,
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#CBD5F5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  formInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    marginTop: 6,
    backgroundColor: '#1D4ED8',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  managementList: {
    paddingHorizontal: 24,
    paddingBottom: 120,
    gap: 16,
  },
  managementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  managementCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  managementMealTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  managementMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  managementMenu: {
    marginTop: 16,
    gap: 8,
  },
  managementMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  managementMenuText: {
    fontSize: 14,
    color: '#475569',
  },
  managementActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18,
  },
  managementActionButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  managementActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  outlineButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  kitchenCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  kitchenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kitchenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E40AF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  kitchenChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E0E7FF',
  },
  kitchenStation: {
    fontSize: 13,
    color: '#CBD5F5',
  },
  kitchenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  kitchenList: {
    gap: 10,
  },
  kitchenItem: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kitchenItemText: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  kitchenFooter: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kitchenFooterText: {
    fontSize: 12,
    color: '#FCD34D',
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  staffTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  staffMeta: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  staffPortionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  staffGroups: {
    gap: 14,
  },
  staffGroupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  staffGroupLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  staffGroupHint: {
    fontSize: 12,
    color: '#94A3B8',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    backgroundColor: '#F8FAFC',
  },
  stepperValue: {
    width: 24,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});
