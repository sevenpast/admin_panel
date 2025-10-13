import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'view-dashboard', route: '/' },
] as const;

export function FooterNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 6 }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.route || (pathname === '/' && item.route === '/');
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.button, isActive && styles.buttonActive]}
            activeOpacity={0.85}
            onPress={() => router.navigate(item.route as never)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={isActive ? '#2563EB' : '#9CA3AF'}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  buttonActive: {
    backgroundColor: '#E0E7FF',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  labelActive: {
    color: '#2563EB',
  },
});
