import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// 🔧 KONFIGURASI API URL - PERBAIKAN PENTING!
// ============================================

// ✅ PAKAI IP KOMPUTER/LAPTOP KAMU
const API_URL = 'http://192.168.1.74:8000/api'; // ← PASTIKAN INI



console.log('🌐 API URL:', API_URL);

// ============================================
// 🔧 AXIOS INSTANCE
// ============================================
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 detik timeout
});

// ============================================
// 📤 REQUEST INTERCEPTOR
// ============================================
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔒 Token attached to ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.log(`🔓 No token for ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      // Log request untuk debugging 
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      if (config.data) {
        console.log('   Data:', JSON.stringify(config.data).substring(0, 200));
      }
      
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// 📥 RESPONSE INTERCEPTOR - PERBAIKAN HANDLING
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    
    // ✅ PERBAIKAN: Return data langsung dari response
    return {
      ...response,
      data: response.data
    };
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network error (no response)
    if (!error.response) {
      console.error('❌ Network Error: Cannot connect to server');
      return Promise.reject({
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet dan pastikan server Laravel running.',
        isNetworkError: true,
      });
    }

    const { status, data } = error.response;
    console.error(`❌ ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${status}`);
    console.error('Error response:', data);

    // Handle 401 Unauthorized (token expired/invalid)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔒 Token expired or invalid, clearing auth data...');
      
      // Clear auth data
      await AsyncStorage.multiRemove(['token', 'user']);
      
      // You might want to navigate to login screen here
      // navigation.navigate('Login'); 
    }

    // Handle 403 Forbidden (insufficient permissions)
    if (status === 403) {
      console.error('🚫 Forbidden: Insufficient permissions');
      return Promise.reject({
        message: data?.message || 'Anda tidak memiliki izin untuk akses ini.',
        status: 403
      });
    }

    // Handle 422 Validation Error
    if (status === 422) {
      console.error('⚠️ Validation Error:', data?.errors);
      
      // Format error message dari Laravel validation
      let errorMessage = 'Data tidak valid';
      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
      }
      
      return Promise.reject({
        message: errorMessage,
        errors: data.errors,
        status: 422
      });
    }

    // Handle 500 Server Error
    if (status === 500) {
      console.error('💥 Server Error:', data?.message);
      return Promise.reject({
        message: data?.message || 'Terjadi kesalahan server. Silakan coba lagi.',
        status: 500
      });
    }

    // Handle other errors
    return Promise.reject({
      message: data?.message || `Error ${status}: Terjadi kesalahan`,
      status: status,
      data: data
    });
  }
);

export default api;