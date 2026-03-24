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

export interface InsightData {
  insights: string[];
  warning: string;
  recommendation: string;
}

export interface InsightResponse {
  success: boolean;
  data: InsightData;
  message?: string;
}

/**
 * Fetch weekly AI insights for the authenticated user
 */
export const fetchWeeklyInsights = async (): Promise<InsightResponse> => {
  try {
    const token = await getToken();
    
    if (!token) {
      return { success: false, data: {} as InsightData, message: 'No authentication token found' };
    }

    const response = await api.get<InsightResponse>(
      '/insights/weekly',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, data: {} as InsightData, message: 'Connection error to backend' };
  }
};
