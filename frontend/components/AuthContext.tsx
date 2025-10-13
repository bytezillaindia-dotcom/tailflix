import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  userId: string | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userId: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@tailflix_user_id';
const TOKEN_STORAGE_KEY = '@tailflix_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from AsyncStorage on app start
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [storedUserId, storedToken] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_STORAGE_KEY),
      ]);

      if (storedUserId && storedToken) {
        setUserId(storedUserId);
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (newUserId: string, newToken: string) => {
    try {
      // Save to state
      setUserId(newUserId);
      setToken(newToken);

      // Persist to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(AUTH_STORAGE_KEY, newUserId),
        AsyncStorage.setItem(TOKEN_STORAGE_KEY, newToken),
      ]);

      console.log('User logged in:', newUserId);
    } catch (error) {
      console.error('Error saving auth state:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Clear state
      setUserId(null);
      setToken(null);

      // Clear AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem(AUTH_STORAGE_KEY),
        AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
      ]);

      console.log('User logged out');
    } catch (error) {
      console.error('Error clearing auth state:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    userId,
    token,
    isAuthenticated: !!userId && !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
