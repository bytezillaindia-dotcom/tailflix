import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  userId: string | null;
  token: string | null;
  role: string | null;
  status: string | null;
  vendorId: string | null;
  vendorType: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (userId: string, token: string, role?: string, status?: string, vendorId?: string, vendorType?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateVendorStatus: (role: string, status: string, vendorId: string, vendorType: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@tailflix_user_id';
const TOKEN_STORAGE_KEY = '@tailflix_token';
const ROLE_STORAGE_KEY = '@tailflix_role';
const STATUS_STORAGE_KEY = '@tailflix_status';
const VENDOR_ID_STORAGE_KEY = '@tailflix_vendor_id';
const VENDOR_TYPE_STORAGE_KEY = '@tailflix_vendor_type';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from AsyncStorage on app start
  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [storedUserId, storedToken, storedRole, storedStatus, storedVendorId] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(TOKEN_STORAGE_KEY),
        AsyncStorage.getItem(ROLE_STORAGE_KEY),
        AsyncStorage.getItem(STATUS_STORAGE_KEY),
        AsyncStorage.getItem(VENDOR_ID_STORAGE_KEY),
      ]);

      if (storedUserId && storedToken) {
        setUserId(storedUserId);
        setToken(storedToken);
        setRole(storedRole);
        setStatus(storedStatus);
        setVendorId(storedVendorId);
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (newUserId: string, newToken: string, newRole?: string, newStatus?: string, newVendorId?: string) => {
    try {
      // Save to state
      setUserId(newUserId);
      setToken(newToken);
      setRole(newRole || null);
      setStatus(newStatus || null);
      setVendorId(newVendorId || null);

      // Persist to AsyncStorage
      const storagePromises = [
        AsyncStorage.setItem(AUTH_STORAGE_KEY, newUserId),
        AsyncStorage.setItem(TOKEN_STORAGE_KEY, newToken),
      ];
      
      if (newRole) storagePromises.push(AsyncStorage.setItem(ROLE_STORAGE_KEY, newRole));
      if (newStatus) storagePromises.push(AsyncStorage.setItem(STATUS_STORAGE_KEY, newStatus));
      if (newVendorId) storagePromises.push(AsyncStorage.setItem(VENDOR_ID_STORAGE_KEY, newVendorId));
      
      await Promise.all(storagePromises);

      console.log('User logged in:', newUserId, 'Role:', newRole, 'Status:', newStatus);
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
      setRole(null);
      setStatus(null);
      setVendorId(null);

      // Clear AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem(AUTH_STORAGE_KEY),
        AsyncStorage.removeItem(TOKEN_STORAGE_KEY),
        AsyncStorage.removeItem(ROLE_STORAGE_KEY),
        AsyncStorage.removeItem(STATUS_STORAGE_KEY),
        AsyncStorage.removeItem(VENDOR_ID_STORAGE_KEY),
      ]);

      console.log('User logged out');
    } catch (error) {
      console.error('Error clearing auth state:', error);
      throw error;
    }
  };

  const updateVendorStatus = async (newRole: string, newStatus: string, newVendorId: string) => {
    try {
      setRole(newRole);
      setStatus(newStatus);
      setVendorId(newVendorId);
      
      await Promise.all([
        AsyncStorage.setItem(ROLE_STORAGE_KEY, newRole),
        AsyncStorage.setItem(STATUS_STORAGE_KEY, newStatus),
        AsyncStorage.setItem(VENDOR_ID_STORAGE_KEY, newVendorId),
      ]);
      
      console.log('Vendor status updated:', newRole, newStatus, newVendorId);
    } catch (error) {
      console.error('Error updating vendor status:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    userId,
    token,
    role,
    status,
    vendorId,
    isAuthenticated: !!userId && !!token,
    loading,
    login,
    logout,
    updateVendorStatus,
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
