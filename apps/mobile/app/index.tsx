import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function RootIndex() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      if (!isLoading) {
        if (isAuthenticated && user) {
          navigation.replace('(app)/Dashboard');
        } else {
          navigation.replace('(auth)/Login');
        }
      }
    };

    checkAuthAndNavigate();
  }, [isLoading, isAuthenticated, user, navigation]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});