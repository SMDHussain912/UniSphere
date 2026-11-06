import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../providers/AuthProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import { SvgXml } from 'react-native-svg';

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <StatusBar style="auto" />
        {/* Expo Router handles navigation based on file structure */}
      </ThemeProvider>
    </AuthProvider>
  );
}