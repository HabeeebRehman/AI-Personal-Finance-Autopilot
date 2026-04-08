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

export interface Budget {
  id: string;
  userId: string;
  amount: number;
  month: number;
  year: number;
}

export interface BudgetResponse {
  success: boolean;
  data: Budget;
}

export const setBudget = async (amount: number, month: number, year: number): Promise<BudgetResponse> => {
  try {
    const token = await getToken();
    const response = await api.post(
      '/budget',
      { amount, month, year },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

export const getBudget = async (month?: number, year?: number): Promise<BudgetResponse> => {
  try {
    const token = await getToken();
    const response = await api.get('/budget', {
      params: { month, year },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
