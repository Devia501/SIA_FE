import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// 📝 TYPES & INTERFACES
// ============================================
export interface LoginCredentials {
  email: string;
  password: string;
  recaptchaToken?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'pendaftar' | 'manager' | 'admin';
  phone?: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

// 🆕 Interface untuk Change Password
export interface ChangePasswordData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// 🆕 Interface untuk Change Email
export interface ChangeEmailData {
  email: string;
  password: string;
}

// ============================================
// 🔐 AUTH SERVICE
// ============================================
export const authService = {
  /**
   * Login user
   * POST /api/login
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const payload = {
        email: credentials.email,
        password: credentials.password,
        'g-recaptcha-response': credentials.recaptchaToken, 
      };

      const response = await api.post<{ data: AuthResponse } | AuthResponse>('/login', payload);
      
      const authData = (response.data as any).data || response.data; 
      
      if (authData.token) {
        await AsyncStorage.setItem('token', authData.token);
        await AsyncStorage.setItem('user', JSON.stringify(authData.user));
        console.log('✅ Token saved to AsyncStorage');
      }
      
      return authData;
    } catch (error: any) {
      console.error('❌ Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Register new user (default role: pendaftar)
   * POST /api/register
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<{ data: AuthResponse } | AuthResponse>('/register', data);
      
      const authData = (response.data as any).data || response.data;

      if (authData.token) {
        await AsyncStorage.setItem('token', authData.token);
        await AsyncStorage.setItem('user', JSON.stringify(authData.user));
        console.log('✅ Registration successful, token saved');
      }
      
      return authData;
    } catch (error: any) {
      console.error('❌ Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Logout user
   * POST /api/logout
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/logout');
      console.log('✅ Logout API call successful');
    } catch (error: any) {
      console.error('⚠️ Logout API error (proceeding anyway):', error.message);
    } finally {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      console.log('✅ Local auth data cleared');
    }
  },

  /**
   * Get current authenticated user
   * GET /api/user
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<{ data: User } | User>('/user');
      
      // Handle response yang bisa berupa { data: User } atau langsung User
      const userData = (response.data as any).data || response.data;
      
      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error: any) {
      console.error('❌ Get current user error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('❌ Error checking authentication:', error);
      return false;
    }
  },

  /**
   * Get stored user from AsyncStorage (offline)
   */
  getStoredUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('❌ Error getting stored user:', error);
      return null;
    }
  },

  /**
   * Forgot password - send reset link
   * POST /api/forgot-password
   */
  forgotPassword: async (data: ForgotPasswordData): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/forgot-password', data);
      console.log('✅ Password reset email sent');
      return response.data;
    } catch (error: any) {
      console.error('❌ Forgot password error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Reset password with token
   * POST /api/reset-password
   */
  resetPassword: async (data: ResetPasswordData): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/reset-password', data);
      console.log('✅ Password reset successful');
      return response.data;
    } catch (error: any) {
      console.error('❌ Reset password error:', error.response?.data || error.message);
      throw error;
    }
  },

  // 🆕 ============================================
  // 🔄 CHANGE PASSWORD & EMAIL
  // ============================================

  /**
   * Change user password
   * POST /api/change-password
   * @param data - Current password, new password, and confirmation
   * @returns Success message
   */
  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/change-password', data);
      console.log('✅ Password changed successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Change password error:', error.response?.data || error.message);
      
      // Handle validation errors dari Laravel
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const firstError = errors[firstErrorKey][0];
        throw new Error(firstError);
      }
      
      // Handle message error
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  },

  /**
   * Change user email
   * POST /api/change-email
   * @param data - New email and password for verification
   * @returns Updated user data
   */
  changeEmail: async (data: ChangeEmailData): Promise<{ success: boolean; message: string; data: { user: User } }> => {
    try {
      const response = await api.post<{ success: boolean; message: string; data: { user: User } }>('/change-email', data);
      
      // Update stored user dengan email baru
      if (response.data.data?.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('✅ Email changed successfully, user data updated');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Change email error:', error.response?.data || error.message);
      
      // Handle validation errors dari Laravel
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        const firstError = errors[firstErrorKey][0];
        throw new Error(firstError);
      }
      
      // Handle message error
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw error;
    }
  },

  // ============================================
  // 🔍 ROLE CHECKING
  // ============================================

  /**
   * Check if user has specific role(s)
   */
  hasRole: async (roles: string[]): Promise<boolean> => {
    try {
      const user = await authService.getStoredUser();
      return user ? roles.includes(user.role) : false;
    } catch (error) {
      console.error('❌ Error checking role:', error);
      return false;
    }
  },

  /**
   * Check if user is admin
   */
  isAdmin: async (): Promise<boolean> => {
    return authService.hasRole(['admin']);
  },

  /**
   * Check if user is manager or admin
   */
  isManagerOrAdmin: async (): Promise<boolean> => {
    return authService.hasRole(['manager', 'admin']);
  },

  /**
   * Check if user is pendaftar (applicant)
   */
  isPendaftar: async (): Promise<boolean> => {
    return authService.hasRole(['pendaftar']);
  },
};