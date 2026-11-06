import { Button, Text, View, StyleSheet, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function ProfileScreen() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    Alert.alert('Session Expired', 'Please login again.');
    logout();
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <TextInput
        style={styles.input}
        value={user?.firstname || ''}
        placeholder="First Name"
        disabled={true}
      />
      
      <TextInput
        style={styles.input}
        value={user?.lastname || ''}
        placeholder="Last Name"
        disabled={true}
      />
      
      <TextInput
        style={styles.input}
        value={user?.email || ''}
        placeholder="Email"
        keyboardType="email"
        disabled={true}
      />
      
      <TextInput
        style={styles.input}
        value={user?.phone || ''}
        placeholder="Phone"
        disabled={true}
      />
      
      <TextInput
        style={styles.input}
        value={user?.qualification || ''}
        placeholder="Qualification"
        disabled={true}
      />
      
      <Button title="Log Out" onPress={logout} color="red" style={styles.logoutButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#faf8ff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#1a1a2e',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#ffcccc',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});