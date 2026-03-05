import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, AuthState } from '../types/auth';

// Helper for platform-agnostic storage
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

interface AuthContextData extends AuthState {
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await storage.getItem('token');
        const storedUser = await storage.getItem('user');

        if (storedToken && storedUser) {
          setState({
            user: JSON.parse(storedUser),
            token: storedToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (e) {
        console.error('Failed to load auth data from storage', e);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadStorageData();
  }, []);

  const login = async (user: User, token: string) => {
    try {
      await storage.setItem('token', token);
      await storage.setItem('user', JSON.stringify(user));

      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to save login data', e);
    }
  };

  const logout = async () => {
    try {
      await storage.deleteItem('token');
      await storage.deleteItem('user');

      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (e) {
      console.error('Failed to clear login data', e);
    }
  };

  const updateUser = async (user: User) => {
    try {
      await storage.setItem('user', JSON.stringify(user));
      setState((prev) => ({ ...prev, user }));
    } catch (e) {
      console.error('Failed to update user data', e);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
