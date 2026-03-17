import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Reusing the same logic for API URL as authService
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get token (platform agnostic)
const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('token');
  }
  return await SecureStore.getItemAsync('token');
};

export type Expense = {
  id: string;
  amount: number;
  category: string;
  description?: string;
  createdAt: string;
};

export interface ExpenseData {
  amount: number;
  category?: string;
  description?: string;
}

export interface ExpenseResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Create a new expense
 */
export const createExpense = async (data: ExpenseData): Promise<ExpenseResponse<Expense>> => {
  try {
    const token = await getToken();
    
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await api.post<ExpenseResponse<Expense>>(
      '/expenses',
      data,
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
    return { success: false, message: 'Connection error to backend' };
  }
};

/**
 * Fetch all expenses for the authenticated user
 */
export const fetchExpenses = async (): Promise<ExpenseResponse<Expense[]>> => {
  try {
    const token = await getToken();
    
    if (!token) {
      return { success: false, message: 'No authentication token found' };
    }

    const response = await api.get<ExpenseResponse<Expense[]>>(
      '/expenses',
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
    return { success: false, message: 'Connection error to backend' };
  }
};

export default {
  createExpense,
  fetchExpenses,
};
