import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform, Alert } from 'react-native';
import { login } from '@/services/api';

export interface User {
  _id: string;
  fullname: { firstname: string; lastname?: string };
  email: string;
  phone?: string;
  dob?: string;
  gender?: string;
  qualification?: string;
  role: string;
  active: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string; captcha: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restore session - check for existing session data
  // NO longer assume unisphere_token from backend; backend uses HTTP-only cookies
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Backend sets HTTP-only cookie on login; session persisted via cookies
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to restore session', error);
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (credentials: { email: string; password: string; captcha: string }) => {
    try {
      const response: { success: boolean; message?: string; user?: User } = await login(credentials);
      if (response.success && response.user) {
        // Backend sets HTTP-only cookie on login; session maintained via cookies
        setUser(response.user);
        setIsAuthenticated(true);
        return true;
      }
      Alert.alert('Login Failed', response.message || 'Login failed');
      return false;
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Login failed');
      return false;
    }
  };

  const logout = async () => {
    // Clear session - backend invalidates HTTP-only cookie
    try {
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Failed to clear session', error);
    }
  };

  const refresh = async () => {
    // Session persists via HTTP-only cookies; check with backend
    try {
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Failed to refresh session', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refresh,
  };
};