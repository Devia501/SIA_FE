import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, User, LoginCredentials, RegisterData } from '../services/authService';

// 📌 Data context auth
interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // PERBAIKAN: Menambahkan recaptchaToken ke signature login
  login: (email: string, password: string, recaptchaToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

//
// ===========================================
// 🌐 Auth Provider dengan Laravel Integration
// ===========================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  // 📌 Cek user tersimpan di AsyncStorage dan validasi token
  const checkUserLoggedIn = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        // Validasi token dengan memanggil endpoint /user
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          console.log('✅ User authenticated:', userData.email);
        } catch (error) {
          // Token invalid/expired, clear storage
          console.log('⚠️ Token invalid, clearing auth data');
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 Fungsi LOGIN - Integrasi Laravel API
  const login = async (email: string, password: string, recaptchaToken?: string) => {
    try {
      const credentials: LoginCredentials = {
        email: email.trim().toLowerCase(),
        password: password,
        recaptchaToken: recaptchaToken, // TERUSKAN: token reCAPTCHA
      };

      // Panggil API Laravel
      const response = await authService.login(credentials);
      
      setUser(response.user);
      console.log(`✅ Login success as ${response.user.role}:`, response.user.email);
      
    } catch (error: any) {
// ... (penanganan error tidak berubah)
      console.error('Login error:', error);
      
      // Handle error dari Laravel API
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Login gagal';
        
        if (status === 401) {
          throw new Error('Email atau password salah');
        } else if (status === 422) {
          // Validation error
          const errors = error.response.data?.errors;
          if (errors) {
            const firstError = Object.values(errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : 'Data tidak valid');
          }
        } else if (status === 429) {
          throw new Error('Terlalu banyak percobaan login. Silakan coba lagi nanti.');
        }
        
        throw new Error(message);
      } else if (error.request) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        throw new Error(error.message || 'Login gagal. Silakan coba lagi.');
      }
    }
  };

  // 📌 Fungsi LOGOUT - Integrasi Laravel API
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      console.log('👋 Logout success');
    } catch (error) {
      console.error('Error logging out:', error);
      // Tetap clear local data meskipun API call gagal
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    }
  };

  // 📌 Fungsi REGISTER - Integrasi Laravel API
  const register = async (data: RegisterData) => {
    try {
      // Validasi password confirmation di frontend
      if (data.password !== data.password_confirmation) {
        throw new Error('Konfirmasi password tidak cocok');
      }

      // Panggil API Laravel
      const response = await authService.register({
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        password_confirmation: data.password_confirmation,
        phone: data.phone, // TERUSKAN: phone
      });

      console.log('✅ Registration success:', response.user.email);
      
      // ...
    } catch (error: any) {
// ... (penanganan error tidak berubah)
      console.error('Registration error:', error);
      
      // Handle error dari Laravel API
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'Registrasi gagal';
        
        if (status === 422) {
          // Validation error
          const errors = error.response.data?.errors;
          if (errors) {
            // Ambil error pertama
            if (errors.email) {
              throw new Error(errors.email[0]);
            } else if (errors.password) {
              throw new Error(errors.password[0]);
            } else if (errors.name) {
              throw new Error(errors.name[0]);
            } else if (errors.username) { // Tambahkan penanganan error username
              throw new Error(errors.username[0]);
            } else if (errors['g-recaptcha-response']) {
              throw new Error('Verifikasi Captcha gagal. Coba lagi.');
            } else {
              const firstError = Object.values(errors)[0];
              throw new Error(Array.isArray(firstError) ? firstError[0] : 'Data tidak valid');
            }
          }
        } else if (status === 409) {
          throw new Error('Email sudah terdaftar');
        }
        
        throw new Error(message);
      } else if (error.request) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        throw new Error(error.message || 'Registrasi gagal. Silakan coba lagi.');
      }
    }
  };

  // 📌 Refresh user data from API
  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Jika gagal refresh, logout user
      await logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

//
// ===========================================
// 📌 Custom Hook untuk akses context
// ===========================================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};