import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="profile/index" />
        <Stack.Screen name="alerts/index" />
        <Stack.Screen name="guests/index" />
        <Stack.Screen name="lessons/index" />
        <Stack.Screen name="meals/index" />
        <Stack.Screen name="events/index" />
        <Stack.Screen name="inventory/index" />
        <Stack.Screen name="assessment/index" />
        <Stack.Screen name="staff/index" />
        <Stack.Screen name="calendar/index" />
        <Stack.Screen name="reports/index" />
        <Stack.Screen name="register/index" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
