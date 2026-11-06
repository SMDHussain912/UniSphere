import { View, useColorScheme, StyleSheet } from 'react-native';
import { colors } from '@packages/design-tokens';

type ThemeMode = 'light' | 'dark';

const getStyleForMode = (mode: ThemeMode) => ({
  container: {
    backgroundColor: mode === 'light' ? colors.canvas : colors.surface,
    color: mode === 'light' ? colors.onSurface : colors.surfaceVariant,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
  },
  text: {
    color: mode === 'light' ? colors.onSurface : colors.canvas,
  },
});

export const ThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === 'dark' ? 'dark' : 'light';

  // Pre-compute styles for the current mode
  const styles = getStyleForMode(mode);

  return (
    <View style={styles.container}>
      {children}
    </View>
  );
};
