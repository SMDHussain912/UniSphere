import { Button, Text, View, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/packages/shared-types';

export default function DashboardScreen() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch user data from API
    }
  }, [isAuthenticated, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    setUsers(prev => []);
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' />
      </View>
    );
  }

  if (!isAuthenticated) {
    navigation.replace('(auth)/Login');
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user?.firstname}</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <Text style={styles.listItem}>{item.fullname?.firstname} {item.fullname?.lastname || ''}</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        style={styles.list}
      />
      <Button title='Log Out' onPress={logout} color='red' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    margin: 20,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  list: {
    marginHorizontal: 20,
    marginTop: 20,
  }
});
