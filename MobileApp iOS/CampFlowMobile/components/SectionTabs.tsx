import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TabItem<T extends string> = {
  key: T;
  label: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  extra?: ReactNode;
};

type SectionTabsProps<T extends string> = {
  items: Array<TabItem<T>>;
  activeKey: T;
  onChange: (key: T) => void;
  style?: ViewStyle;
};

export function SectionTabs<T extends string>({ items, activeKey, onChange, style }: SectionTabsProps<T>) {
  return (
    <View style={[styles.container, style]}>
      {items.map((item) => {
        const isActive = item.key === activeKey;
        return (
          <TouchableOpacity
            key={item.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(item.key)}
            activeOpacity={0.85}
          >
            {item.icon ? (
              <MaterialCommunityIcons
                name={item.icon}
                size={18}
                color={isActive ? '#1D4ED8' : '#CBD5F5'}
              />
            ) : item.extra ? (
              item.extra
            ) : null}
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
    flexWrap: 'wrap',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#1E293B',
  },
  tabActive: {
    backgroundColor: '#F8FAFC',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5F5',
  },
  labelActive: {
    color: '#1D4ED8',
  },
});
