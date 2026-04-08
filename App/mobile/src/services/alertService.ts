import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  }
  return await SecureStore.getItemAsync('token');
};

export interface Alert {
  warning: string;
  reason: string;
  suggestion: string;
}

export interface AlertResponse {
  success: boolean;
  data: Alert | null;
  message?: string;
}

export const getAlerts = async (): Promise<AlertResponse> => {
  try {
    const token = await getToken();
    const response = await api.get('/alerts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
