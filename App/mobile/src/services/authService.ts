import axios from 'axios';
import { Platform } from 'react-native';
import { AuthResponse, User } from '../types/auth';

// For local development:
// Android Emulator: http://10.0.2.2:3000/api
// iOS Simulator: http://localhost:3000/api
// Physical Device: http://YOUR_LOCAL_IP:3000/api
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, error: 'Connection error', data: {} as User, token: '' };
  }
};

export const register = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', { email, password, name });
    return response.data;
  } catch (error: any) {
    if (error.response) {
      return error.response.data;
    }
    return { success: false, error: 'Connection error', data: {} as User, token: '' };
  }
};

export default {
  login,
  register,
};
