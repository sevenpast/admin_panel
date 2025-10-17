import { StatusBar } from 'expo-status-bar';
import { ReactNode, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FooterNav } from '../../components/FooterNav';
import { responsive } from '@/lib/responsive';
import { apiService, Staff } from '@/lib/api';

type StaffStatus = 'active' | 'inactive' | 'on_leave';
type StaffViewMode = 'overview' | 'detail' | 'create' | 'shifts';

// Staff type is now imported from API service

type StaffDraft = {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: StaffStatus;
  hireDate: string;
};

type Shift = {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  notes: string;
  createdAt: string;
};

const STAFF_ROLES = [
  'Instructor',
  'Kitchen Staff',
  'Housekeeping',
  'Reception',
  'Maintenance',
  'Manager',
  'Coordinator',
  'Other'
];

const STAFF_DEPARTMENTS = [
  'Surf School',
  'Kitchen',
  'Housekeeping',
  'Reception',
  'Maintenance',
  'Management',
  'Other'
];

const STAFF_STATUS_OPTIONS: Array<{ value: StaffStatus; label: string; color: string }> = [
  { value: 'active', label: 'Active', color: '#059669' },
  { value: 'inactive', label: 'Inactive', color: '#6B7280' },
  { value: 'on_leave', label: 'On Leave', color: '#F59E0B' },
];

const INITIAL_STAFF: Staff[] = [
  {
    id: 'staff-1',
    name: 'Jonas Hartmann',
    email: 'jonas@campflow.com',
    phone: '+41 78 123 45 67',
    role: 'Instructor',
    department: 'Surf School',
    status: 'active',
    hireDate: '2024-01-15',
    color: '#3B82F6',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-2',
    name: 'Luisa Mendes',
    email: 'luisa@campflow.com',
    phone: '+41 79 234 56 78',
    role: 'Kitchen Staff',
    department: 'Kitchen',
    status: 'active',
    hireDate: '2024-02-01',
    color: '#10B981',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-3',
    name: 'Sven Keller',
    email: 'sven@campflow.com',
    phone: '+41 76 345 67 89',
    role: 'Manager',
    department: 'Management',
    status: 'active',
    hireDate: '2023-11-20',
    color: '#F59E0B',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'staff-4',
    name: 'Marek Bianchi',
    email: 'marek@campflow.com',
    phone: '+41 77 456 78 90',
    role: 'Housekeeping',
    department: 'Housekeeping',
    status: 'on_leave',
    hireDate: '2024-03-10',
    color: '#8B5CF6',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift-1',
    staffId: 'staff-1',
    staffName: 'Jonas Hartmann',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    role: 'Instructor',
    notes: 'Morning surf lessons',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'shift-2',
    staffId: 'staff-2',
    staffName: 'Luisa Mendes',
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    endTime: '14:00',
    role: 'Kitchen Staff',
    notes: 'Breakfast and lunch prep',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'shift-3',
    staffId: 'staff-3',
    staffName: 'Sven Keller',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    role: 'Manager',
    notes: 'Daily operations',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_STAFF_DRAFT: StaffDraft = {
  name: '',
  email: '',
  phone: '',
  role: 'Other',
  department: 'Other',
  status: 'active',
  hireDate: new Date().toISOString().split('T')[0],
};

const generateStaffColor = (name: string): string => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export default function StaffScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const headerTint = Colors[colorScheme].tint;

  const [mode, setMode] = useState<StaffViewMode>('overview');
  const [staff, setStaff] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editableStaff, setEditableStaff] = useState<Staff | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newStaff, setNewStaff] = useState<StaffDraft>(INITIAL_STAFF_DRAFT);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const staffData = await apiService.getStaff();
      setStaff(staffData);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (mode === 'detail' && selectedStaff) {
      setEditableStaff(selectedStaff);
      setIsEditing(false);
    }

    if (mode === 'overview') {
      setEditableStaff(null);
      setSelectedStaff(null);
      setIsEditing(false);
    }

    if (mode === 'create') {
      setNewStaff(INITIAL_STAFF_DRAFT);
      setEditableStaff(null);
      setIsEditing(false);
    }
  }, [mode, selectedStaff]);

  const filteredStaff = staff.filter((member) => {
    const matchesSearch = searchTerm.trim() === '' || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'All' || member.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredShifts = shifts.filter((shift) => shift.date === selectedDate);

  const renderStaffCard = ({ item }: { item: Staff }) => {
    const statusMeta = STAFF_STATUS_OPTIONS.find(opt => opt.value === item.status);
    const todayShifts = shifts.filter(shift => 
      shift.staffId === item.id && shift.date === new Date().toISOString().split('T')[0]
    );

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.staffCard}
        activeOpacity={0.82}
        onPress={() => {
          setSelectedStaff(item);
          setMode('detail');
        }}
      >
        <View style={styles.staffCardHeader}>
          <View style={[styles.staffAvatar, { backgroundColor: item.color }]}>
            <Text style={styles.staffInitial}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.staffInfo}>
            <Text style={styles.staffName}>{item.name}</Text>
            <Text style={styles.staffRole}>{item.role}</Text>
            <Text style={styles.staffDepartment}>{item.department}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusMeta?.color}20`, borderColor: statusMeta?.color }]}>
            <Text style={[styles.statusText, { color: statusMeta?.color }]}>{statusMeta?.label}</Text>
          </View>
        </View>
        
        <View style={styles.staffMeta}>
          <View style={styles.staffMetaRow}>
            <MaterialCommunityIcons name="email-outline" size={16} color="#6B7280" />
            <Text style={styles.staffMetaText}>{item.email}</Text>
          </View>
          <View style={styles.staffMetaRow}>
            <MaterialCommunityIcons name="phone-outline" size={16} color="#6B7280" />
            <Text style={styles.staffMetaText}>{item.phone}</Text>
          </View>
          {todayShifts.length > 0 && (
            <View style={styles.staffMetaRow}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#059669" />
              <Text style={[styles.staffMetaText, { color: '#059669' }]}>
                {todayShifts.length} shift{todayShifts.length > 1 ? 's' : ''} today
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderShiftCard = ({ item }: { item: Shift }) => {
    const staffMember = staff.find(s => s.id === item.staffId);
    
    return (
      <View style={styles.shiftCard}>
        <View style={styles.shiftCardHeader}>
          <View style={[styles.shiftAvatar, { backgroundColor: staffMember?.color || '#6B7280' }]}>
            <Text style={styles.shiftInitial}>{item.staffName.charAt(0)}</Text>
          </View>
          <View style={styles.shiftInfo}>
            <Text style={styles.shiftStaffName}>{item.staffName}</Text>
            <Text style={styles.shiftRole}>{item.role}</Text>
          </View>
          <View style={styles.shiftTime}>
            <Text style={styles.shiftTimeText}>{item.startTime} - {item.endTime}</Text>
          </View>
        </View>
        {item.notes && (
          <Text style={styles.shiftNotes}>{item.notes}</Text>
        )}
      </View>
    );
  };

  const handleCreateStaff = () => {
    const name = newStaff.name.trim();
    const email = newStaff.email.trim();
    const phone = newStaff.phone.trim();

    if (!name) {
      Alert.alert('Name Required', 'Please enter staff member name.');
      return;
    }

    if (!email) {
      Alert.alert('Email Required', 'Please enter staff member email.');
      return;
    }

    const staffToAdd: Staff = {
      id: `staff-${Date.now()}`,
      name,
      email,
      phone: phone || 'Not provided',
      role: newStaff.role,
      department: newStaff.department,
      status: newStaff.status,
      hireDate: newStaff.hireDate,
      color: generateStaffColor(name),
      createdAt: new Date().toISOString(),
    };

    setStaff((prev) => [...prev, staffToAdd]);
    Alert.alert('Staff Created', `${staffToAdd.name} has been added to the team.`);
    setNewStaff(INITIAL_STAFF_DRAFT);
    setMode('overview');
  };

  const handleSaveStaff = () => {
    if (!editableStaff) return;

    const name = editableStaff.name.trim();
    const email = editableStaff.email.trim();
    
    if (!name) {
      Alert.alert('Name Required', 'Please enter staff member name.');
      return;
    }

    if (!email) {
      Alert.alert('Email Required', 'Please enter staff member email.');
      return;
    }

    const updatedStaff: Staff = {
      ...editableStaff,
      name,
      email,
      phone: editableStaff.phone.trim() || 'Not provided',
    };

    setStaff((prev) => prev.map((member) => (member.id === updatedStaff.id ? updatedStaff : member)));
    setSelectedStaff(updatedStaff);
    setEditableStaff(updatedStaff);
    setIsEditing(false);
    Alert.alert('Staff Updated', `${updatedStaff.name} has been updated.`);
  };

  const handleDeleteStaff = () => {
    if (!selectedStaff) return;

    Alert.alert('Delete Staff', `Are you sure you want to delete "${selectedStaff.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setStaff((prev) => prev.filter((member) => member.id !== selectedStaff.id));
          setShifts((prev) => prev.filter((shift) => shift.staffId !== selectedStaff.id));
          setSelectedStaff(null);
          setEditableStaff(null);
          setIsEditing(false);
          setMode('overview');
          Alert.alert('Staff Deleted', 'Staff member has been removed.');
        },
      },
    ]);
  };

  const Overview = () => (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748B" />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search staff..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statusScroll}
        contentContainerStyle={styles.statusContainer}
      >
        {['All', ...STAFF_STATUS_OPTIONS.map(opt => opt.value)].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusChip,
              selectedStatus === status && styles.statusChipActive
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.statusChipText,
              selectedStatus === status && styles.statusChipTextActive
            ]}>
              {status === 'All' ? 'All' : STAFF_STATUS_OPTIONS.find(opt => opt.value === status)?.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredStaff}
        keyExtractor={(item) => item.id}
        renderItem={renderStaffCard}
        contentContainerStyle={styles.staffList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-group-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No staff found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your search or add new staff members.
            </Text>
          </View>
        }
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.shiftsFab, { backgroundColor: '#8B5CF6' }]}
          onPress={() => setMode('shifts')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="calendar-clock" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: headerTint }]}
          onPress={() => setMode('create')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const Shifts = () => (
    <View style={styles.container}>
      <View style={styles.dateSelector}>
        <Text style={styles.dateLabel}>Shifts for:</Text>
        <TextInput
          value={selectedDate}
          onChangeText={setSelectedDate}
          style={styles.dateInput}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#94A3B8"
        />
      </View>

      <FlatList
        data={filteredShifts}
        keyExtractor={(item) => item.id}
        renderItem={renderShiftCard}
        contentContainerStyle={styles.shiftsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-clock-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No shifts scheduled</Text>
            <Text style={styles.emptyStateText}>
              No shifts are scheduled for this date.
            </Text>
          </View>
        }
      />
    </View>
  );

  const Detail = () => {
    if (!editableStaff) return null;

    const actionButtons: Array<{
      key: string;
      icon: keyof typeof MaterialCommunityIcons.glyphMap;
      color: string;
      onPress: () => void;
    }> = [
      {
        key: 'back',
        icon: 'view-dashboard-outline',
        color: '#2563EB',
        onPress: () => setMode('overview'),
      },
      {
        key: 'edit',
        icon: 'pencil-circle-outline',
        color: isEditing ? '#059669' : '#F59E0B',
        onPress: () => setIsEditing(!isEditing),
      },
      {
        key: 'delete',
        icon: 'trash-can-outline',
        color: '#EF4444',
        onPress: handleDeleteStaff,
      },
    ];

    return (
      <ScrollView contentContainerStyle={styles.detailWrapper} showsVerticalScrollIndicator={false}>
        <View style={styles.actionBar}>
          {actionButtons.map((action) => (
            <TouchableOpacity
              key={action.key}
              style={styles.actionButton}
              onPress={action.onPress}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={[styles.detailAvatar, { backgroundColor: editableStaff.color }]}>
              <Text style={styles.detailInitial}>{editableStaff.name.charAt(0)}</Text>
            </View>
            <Text style={styles.detailName}>{editableStaff.name}</Text>
            <Text style={styles.detailRole}>{editableStaff.role} • {editableStaff.department}</Text>
          </View>

          <StaffFormField label="Name">
            {isEditing ? (
              <TextInput
                value={editableStaff.name}
                onChangeText={(value) => setEditableStaff((prev) => prev ? { ...prev, name: value } : prev)}
                style={styles.formInput}
                placeholder="Staff member name"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <Text style={styles.detailValue}>{editableStaff.name}</Text>
            )}
          </StaffFormField>

          <StaffFormField label="Email">
            {isEditing ? (
              <TextInput
                value={editableStaff.email}
                onChangeText={(value) => setEditableStaff((prev) => prev ? { ...prev, email: value } : prev)}
                style={styles.formInput}
                placeholder="email@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.detailValue}>{editableStaff.email}</Text>
            )}
          </StaffFormField>

          <StaffFormField label="Phone">
            {isEditing ? (
              <TextInput
                value={editableStaff.phone}
                onChangeText={(value) => setEditableStaff((prev) => prev ? { ...prev, phone: value } : prev)}
                style={styles.formInput}
                placeholder="Phone number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.detailValue}>{editableStaff.phone}</Text>
            )}
          </StaffFormField>

          <StaffFormField label="Role">
            {isEditing ? (
              <View style={styles.chipRow}>
                {STAFF_ROLES.map((role) => {
                  const isActive = editableStaff.role === role;
                  return (
                    <TouchableOpacity
                      key={role}
                      style={[styles.chipButton, isActive && styles.chipButtonActive]}
                      onPress={() => setEditableStaff((prev) => prev ? { ...prev, role } : prev)}
                    >
                      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{role}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.detailValue}>{editableStaff.role}</Text>
            )}
          </StaffFormField>

          <StaffFormField label="Department">
            {isEditing ? (
              <View style={styles.chipRow}>
                {STAFF_DEPARTMENTS.map((department) => {
                  const isActive = editableStaff.department === department;
                  return (
                    <TouchableOpacity
                      key={department}
                      style={[styles.chipButton, isActive && styles.chipButtonActive]}
                      onPress={() => setEditableStaff((prev) => prev ? { ...prev, department } : prev)}
                    >
                      <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{department}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.detailValue}>{editableStaff.department}</Text>
            )}
          </StaffFormField>

          <StaffFormField label="Status">
            <View style={styles.chipRow}>
              {STAFF_STATUS_OPTIONS.map((option) => {
                const isActive = editableStaff.status === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.chipButton, isActive && styles.chipButtonActive]}
                    onPress={() => setEditableStaff((prev) => prev ? { ...prev, status: option.value } : prev)}
                  >
                    <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </StaffFormField>

          <StaffFormField label="Hire Date">
            {isEditing ? (
              <TextInput
                value={editableStaff.hireDate}
                onChangeText={(value) => setEditableStaff((prev) => prev ? { ...prev, hireDate: value } : prev)}
                style={styles.formInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            ) : (
              <Text style={styles.detailValue}>{new Date(editableStaff.hireDate).toLocaleDateString()}</Text>
            )}
          </StaffFormField>

          {isEditing && (
            <View style={styles.detailFooter}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleSaveStaff}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="content-save-outline" size={24} color="#059669" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const Create = () => (
    <ScrollView contentContainerStyle={styles.createWrapper} showsVerticalScrollIndicator={false}>
      <View style={styles.createCard}>
        <Text style={styles.createTitle}>Add New Staff Member</Text>
        <Text style={styles.createDescription}>
          Add a new team member to your staff roster.
        </Text>

        <StaffFormField label="Name">
          <TextInput
            value={newStaff.name}
            onChangeText={(value) => setNewStaff((prev) => ({ ...prev, name: value }))}
            style={styles.formInput}
            placeholder="Staff member name"
            placeholderTextColor="#94A3B8"
          />
        </StaffFormField>

        <StaffFormField label="Email">
          <TextInput
            value={newStaff.email}
            onChangeText={(value) => setNewStaff((prev) => ({ ...prev, email: value }))}
            style={styles.formInput}
            placeholder="email@example.com"
            placeholderTextColor="#94A3B8"
            keyboardType="email-address"
          />
        </StaffFormField>

        <StaffFormField label="Phone">
          <TextInput
            value={newStaff.phone}
            onChangeText={(value) => setNewStaff((prev) => ({ ...prev, phone: value }))}
            style={styles.formInput}
            placeholder="Phone number"
            placeholderTextColor="#94A3B8"
            keyboardType="phone-pad"
          />
        </StaffFormField>

        <StaffFormField label="Role">
          <View style={styles.chipRow}>
            {STAFF_ROLES.map((role) => {
              const isActive = newStaff.role === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.chipButton, isActive && styles.chipButtonActive]}
                  onPress={() => setNewStaff((prev) => ({ ...prev, role }))}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{role}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </StaffFormField>

        <StaffFormField label="Department">
          <View style={styles.chipRow}>
            {STAFF_DEPARTMENTS.map((department) => {
              const isActive = newStaff.department === department;
              return (
                <TouchableOpacity
                  key={department}
                  style={[styles.chipButton, isActive && styles.chipButtonActive]}
                  onPress={() => setNewStaff((prev) => ({ ...prev, department }))}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{department}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </StaffFormField>

        <StaffFormField label="Status">
          <View style={styles.chipRow}>
            {STAFF_STATUS_OPTIONS.map((option) => {
              const isActive = newStaff.status === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.chipButton, isActive && styles.chipButtonActive]}
                  onPress={() => setNewStaff((prev) => ({ ...prev, status: option.value }))}
                >
                  <Text style={[styles.chipLabel, isActive && styles.chipLabelActive]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </StaffFormField>

        <StaffFormField label="Hire Date">
          <TextInput
            value={newStaff.hireDate}
            onChangeText={(value) => setNewStaff((prev) => ({ ...prev, hireDate: value }))}
            style={styles.formInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
          />
        </StaffFormField>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => setMode('overview')}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: headerTint }]}
            onPress={handleCreateStaff}
          >
            <Text style={styles.primaryButtonText}>Add Staff</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.page}>
        <View style={styles.header}>
          {mode !== 'overview' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setMode('overview')}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          <View style={[styles.headerTextContainer, mode !== 'overview' && styles.headerTextWithBack]}>
            <Text style={styles.title}>
              {mode === 'overview'
                ? 'Staff'
                : mode === 'detail'
                ? selectedStaff?.name ?? 'Staff Detail'
                : mode === 'create'
                ? 'Add Staff'
                : 'Shifts'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'overview'
                ? 'Staff Management'
                : mode === 'detail'
                ? 'Staff Details'
                : mode === 'create'
                ? 'Add New Staff'
                : 'Shift Schedule'}
            </Text>
          </View>
        </View>

        <View style={styles.contentArea}>
          {mode === 'overview' && <Overview />}
          {mode === 'detail' && <Detail />}
          {mode === 'create' && <Create />}
          {mode === 'shifts' && <Shifts />}
        </View>

        <FooterNav />
      </View>
    </SafeAreaView>
  );
}

type StaffFormFieldProps = {
  label: string;
  children: ReactNode;
  style?: ViewStyle;
};

function StaffFormField({ label, children, style }: StaffFormFieldProps) {
  return (
    <View style={[styles.formField, style]}>
      <Text style={styles.formLabel}>{label}</Text>
      {children}
    </View>
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
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTextWithBack: {
    marginLeft: 16,
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
  contentArea: {
    flex: 1,
    backgroundColor: '#F5F6FB',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
    backgroundColor: '#F5F6FB',
  },
  searchRow: {
    marginBottom: 16,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#111827',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  statusScroll: {
    marginBottom: 16,
  },
  statusContainer: {
    paddingHorizontal: 4,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  statusChipActive: {
    backgroundColor: '#2563EB',
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  statusChipTextActive: {
    color: '#FFFFFF',
  },
  staffList: {
    paddingBottom: 120,
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  staffCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  staffInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  staffRole: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  staffDepartment: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  staffMeta: {
    marginTop: 8,
  },
  staffMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  staffMetaText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    flexDirection: 'column',
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  shiftsFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 12,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 120,
  },
  shiftsList: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  shiftCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shiftAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shiftInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shiftInfo: {
    flex: 1,
  },
  shiftStaffName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  shiftRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  shiftTime: {
    alignItems: 'flex-end',
  },
  shiftTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  shiftNotes: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  detailWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 120,
    backgroundColor: '#F5F6FB',
  },
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#CBD5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  detailHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  detailInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  detailRole: {
    fontSize: 16,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    color: '#1F2937',
  },
  detailFooter: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    paddingBottom: 120,
    backgroundColor: '#F5F6FB',
  },
  createCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  createTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  createDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 24,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    backgroundColor: '#F1F5F9',
  },
  chipButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  chipLabelActive: {
    color: '#FFFFFF',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 24,
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});