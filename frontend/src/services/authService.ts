import { apiClient } from './api';

export interface UserProfile {
  id?: number;
  customUserId?: string;
  username: string;
  email: string;
  mobileNumber?: string;
  fullName: string;
  role: string;
  accountStatus?: string;
  active?: boolean;
}

export interface AuthResponse {
  token: string;
  type: string;
  id?: number;
  customUserId?: string;
  username: string;
  email: string;
  mobileNumber?: string;
  fullName: string;
  role: string;
  accountStatus?: string;
  active?: boolean;
  message?: string;
  sessionToken?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  mobileNumber?: string;
  password: string;
  fullName?: string;
  department?: string;
  region?: string;
}

const TOKEN_KEY = 'vet_auth_token';
const USER_KEY = 'vet_auth_user';
const SESSION_KEY = 'vet_session_token';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<{ success: boolean; message: string; data: AuthResponse }>(
        '/auth/login',
        {
          username: credentials.username.trim(),
          password: credentials.password,
        }
      );

      if (response.data && response.data.data) {
        const authData = response.data.data;
        if (authData.token) {
          localStorage.setItem(TOKEN_KEY, authData.token);
        }
        if (authData.sessionToken) {
          localStorage.setItem(SESSION_KEY, authData.sessionToken);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(authData));
        return authData;
      }
      throw new Error(response.data?.message || 'Login failed');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Invalid username or password';
      throw new Error(msg);
    }
  },

  async register(credentials: RegisterCredentials): Promise<{ message: string; user?: any }> {
    const response = await apiClient.post<{ success: boolean; message: string; data: any }>(
      '/auth/register',
      credentials
    );
    return {
      message: response.data.message || 'Registration submitted for Administrator approval.',
      user: response.data.data,
    };
  },

  async sendHeartbeat(durationSeconds?: number): Promise<void> {
    const sessionToken = localStorage.getItem(SESSION_KEY);
    if (!sessionToken) return;
    try {
      await apiClient.post('/auth/heartbeat', { sessionToken, durationSeconds });
    } catch {
      // Ignore background heartbeat errors
    }
  },

  async logout(): Promise<void> {
    const sessionToken = localStorage.getItem(SESSION_KEY);
    if (sessionToken) {
      try {
        await apiClient.post(`/auth/logout-session?sessionToken=${encodeURIComponent(sessionToken)}`);
      } catch {
        // silent
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getSessionToken(): string | null {
    return localStorage.getItem(SESSION_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN' || user?.role === 'ROLE_ADMIN' || user?.email === 'dacentreadmin@gmail.com';
  },
};
