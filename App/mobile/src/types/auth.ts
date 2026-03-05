export interface User {
  id: string;
  email: string;
  name?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
  token: string;
  error?: string;
}

export interface AuthErrorResponse {
  success: boolean;
  error: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
