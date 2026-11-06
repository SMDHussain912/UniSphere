import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <NavigationContainer>
      <Stack>
        {/* Dashboard and Profile are file-based routes in (app) stack */}
        {/* Expo Router automatically maps file-based routes to navigation */}
      </Stack>
    </NavigationContainer>
  );
}