import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  userId: string | null;
  userMethod: string | null;
  userValue: string | null;
  isVerified: boolean;
  verificationStatus: string | null;
  setUser: (userId: string, method: string, value: string) => Promise<void>;
  checkVerificationStatus: () => Promise<string>;
  clearUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userMethod, setUserMethod] = useState<string | null>(null);
  const [userValue, setUserValue] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedMethod = await AsyncStorage.getItem('userMethod');
      const storedValue = await AsyncStorage.getItem('userValue');
      
      if (storedUserId) {
        setUserId(storedUserId);
        setUserMethod(storedMethod);
        setUserValue(storedValue);
        await checkVerificationStatusInternal(storedUserId);
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (id: string, method: string, value: string) => {
    try {
      await AsyncStorage.setItem('userId', id);
      await AsyncStorage.setItem('userMethod', method);
      await AsyncStorage.setItem('userValue', value);
      setUserId(id);
      setUserMethod(method);
      setUserValue(value);
      await checkVerificationStatusInternal(id);
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  };

  const checkVerificationStatusInternal = async (id: string): Promise<string> => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/verifications/status/${id}`);
      const data = await response.json();
      const status = data.status || 'not_found';
      setVerificationStatus(status);
      return status;
    } catch (error) {
      console.error('Error checking verification status:', error);
      setVerificationStatus('not_found');
      return 'not_found';
    }
  };

  const checkVerificationStatus = async (): Promise<string> => {
    if (userId) {
      return await checkVerificationStatusInternal(userId);
    }
    return 'not_found';
  };

  const clearUser = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userMethod');
      await AsyncStorage.removeItem('userValue');
      setUserId(null);
      setUserMethod(null);
      setUserValue(null);
      setVerificationStatus(null);
    } catch (error) {
      console.error('Error clearing user session:', error);
    }
  };

  const isVerified = verificationStatus === 'approved';

  return (
    <AuthContext.Provider
      value={{
        userId,
        userMethod,
        userValue,
        isVerified,
        verificationStatus,
        setUser,
        checkVerificationStatus,
        clearUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
