// src/services/apiService.ts

import api from './api';
import { AxiosResponse } from 'axios';

// ============================================
// 📋 TYPES & INTERFACES
// ============================================

// Laravel API Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Common response types
interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AnnouncementResult {
  no: number;
  registration_number: string;
  name: string;
  program: {
    id: number;
    name: string;
    code: string;
  };
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// 🔑 Interface untuk User Management (Admin)
export interface UserManagement {
  id_user: number;
  name: string;
  email: string;
  role: string; // 'admin' | 'manager' | 'user'
  phone_number?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// 🔑 Interface untuk data Wilayah (Provinsi/Kota)
export interface Region {
  id_province?: number;
  id_city?: number;
  id?: number;
  name: string;
  type?: string;
}

export interface DocumentType {
  id_document_type: number;
  document_name: string;        
  description?: string;
  is_mandatory?: boolean;     
  is_active: boolean;
}

export interface Profile {
  id_profile?: number;
  id_user?: number;
  id_program?: number;
  id_program_2?: number; 
  id_program_3?: number; 
  registration_number?: string;
  registration_status?: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  full_name: string;
  gender?: string; 
  religion?: string;
  birth_place?: string;
  birth_date?: string; 
  nik?: string;
  birth_certificate_number?: string;
  no_kk?: string;
  citizenship?: string;
  birth_order?: number;
  number_of_siblings?: number;
  full_address?: string;
  dusun?: string;
  kelurahan?: string;
  kecamatan?: string;
  city_regency?: string; 
  province?: string;     
  postal_code?: string;
  phone_number?: string;
  email?: string;
  previous_school?: string;
  graduation_status?: string;
  last_ijazah?: string;
  program?: {
    id_program: number;
    name: string;
    name_program?: string;
  };
}

export interface Document {
  id_document?: number;
  id_profile?: number;
  id_document_type: number;
  file_path: string;
  verification_status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  upload_date?: string;
  document_type?: DocumentType;
  file_url?: string;
}

export interface Guardian {
  id_guardian?: number;
  id_profile?: number;
  relationship_type: string;
  full_name: string;
  address?: string;
  phone_number?: string;
  occupation?: string;
  last_education?: string;
  income_range?: string;
}

export interface Achievement {
  id_achievement?: number;
  id_profile?: number;
  achievement_name: string;
  level?: string;
  year?: number;
  achievement_type?: string;
  achievement_level?: string;
  organizer?: string;
  ranking?: string;
  certificate_path?: string;
}

export interface RegistrationStatus {
  registration_number: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
  full_name: string;
  email: string;
}

export interface Program {
  id_program: number;
  name: string;
  description?: string;
  is_active: boolean;
}

// ============================================
// 👑 ADMIN SERVICE (BARU!)
// ============================================
export const adminService = {
  /**
   * Get list of all users (with optional filtering)
   * GET /api/admin/users
   */
  listUsers: async (params?: { role?: string; is_active?: boolean }): Promise<ApiResponse<UserManagement[]>> => {
    try {
      const response = await api.get<ApiResponse<UserManagement[]>>('/admin/users', { params });
      return response.data;
    } catch (error: any) {
      console.error('❌ adminService.listUsers Error:', error);
      throw error;
    }
  },

  /**
   * Get single user by ID
   * GET /api/admin/users/{id}
   */
  getUser: async (userId: number): Promise<UserManagement> => {
    const response = await api.get<ApiResponse<UserManagement>>(`/admin/users/${userId}`);
    return response.data.data;
  },

  /**
   * Create new user (manager/admin)
   * POST /api/admin/users
   */
  createUser: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    phone_number?: string;
  }): Promise<UserManagement> => {
    const response = await api.post<ApiResponse<UserManagement>>('/admin/users', data);
    return response.data.data;
  },

  /**
   * Update user
   * PUT /api/admin/users/{id}
   */
  updateUser: async (userId: number, data: Partial<UserManagement>): Promise<UserManagement> => {
    const response = await api.put<ApiResponse<UserManagement>>(`/admin/users/${userId}`, data);
    return response.data.data;
  },

  /**
   * Delete user
   * DELETE /api/admin/users/{id}
   */
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  /**
   * Get registration statistics
   * GET /api/admin/statistics/registrations
   */
  getRegistrationStatistics: async (params?: { 
    start_date?: string; 
    end_date?: string;
    program_id?: number;
  }) => {
    const response = await api.get('/admin/statistics/registrations', { params });
    return response.data.data;
  },
};

// ============================================
// 🎓 REGISTRATION SERVICE
// ============================================
export const registrationService = {
  

  getDocumentTypes: async (): Promise<DocumentType[]> => {
    const response = await api.get<ApiResponse<DocumentType[]>>('/registration/document-types');
    return response.data.data; 
  },

  storeProfile: async (data: Partial<Profile>): Promise<Profile> => {
    const response = await api.post<ApiResponse<Profile>>('/registration/profile', data);
    return response.data.data; 
  },

  getProfile: async (): Promise<Profile> => {
    const response = await api.get<ApiResponse<Profile>>('/registration/profile');
    return response.data.data; 
  },

  uploadDocument: async (formData: FormData): Promise<Document> => {
    const response = await api.post<ApiResponse<Document>>('/registration/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data; 
  },

  getDocuments: async (): Promise<Document[]> => {
    const response = await api.get<ApiResponse<Document[]>>('/registration/documents');
    return response.data.data; 
  },

  deleteDocument: async (id_document: number): Promise<void> => {
    await api.delete(`/registration/documents/${id_document}`);
  },

  addAchievement: async (data: FormData): Promise<Achievement> => {
    const response = await api.post<ApiResponse<Achievement>>(
      '/registration/achievements', 
      data, 
      {
        headers: {
            'Content-Type': 'multipart/form-data', // Wajib untuk upload file
        }
      }
    );
    return response.data.data; 
  },

  getAchievements: async (): Promise<Achievement[]> => {
    const response = await api.get<ApiResponse<Achievement[]>>('/registration/achievements');
    return response.data.data; 
  },

  deleteAchievement: async (id_achievement: number): Promise<void> => {
    await api.delete(`/registration/achievements/${id_achievement}`);
  },

  addGuardian: async (data: Partial<Guardian>): Promise<Guardian> => {
    const response = await api.post<ApiResponse<Guardian>>('/registration/guardians', data);
    return response.data.data; 
  },

  getGuardians: async (): Promise<Guardian[]> => {
    const response = await api.get<ApiResponse<Guardian[]>>('/registration/guardians');
    return response.data.data; 
  },

  updateGuardian: async (id_guardian: number, data: Partial<Guardian>): Promise<Guardian> => {
    const response = await api.put<ApiResponse<Guardian>>(`/registration/guardians/${id_guardian}`, data);
    return response.data.data; 
  },

  deleteGuardian: async (id_guardian: number): Promise<void> => {
    await api.delete(`/registration/guardians/${id_guardian}`);
  },

  submitRegistration: async (): Promise<Profile> => {
    const response = await api.post<ApiResponse<Profile>>('/registration/submit');
    return response.data.data; 
  },

  getRegistrationStatus: async (): Promise<RegistrationStatus> => {
    const response = await api.get<ApiResponse<RegistrationStatus>>('/registration/status');
    return response.data.data; 
  },
};

// ============================================
// 🌐 PUBLIC SERVICE
// ============================================
export const publicService = {
  getActivePrograms: async (): Promise<Program[]> => {
    const response = await api.get<ApiResponse<Program[]>>('/programs');
    return response.data.data; 
  },

  getProvinces: async (): Promise<Region[]> => {
    const response = await api.get<ApiResponse<Region[]>>('/public/provinces');
    return response.data.data; 
  },

  getCities: async (provinceId: number): Promise<Region[]> => {
      if (!provinceId) {
          throw new Error("Province ID is missing.");
      }
      const response = await api.get<ApiResponse<Region[]>>(`/public/cities/${provinceId}`);
      return response.data.data;
  },

  /**
   * Mengambil daftar pendaftar yang lulus (Public)
   * GET /api/announcements
   */
  getAnnouncementResults: async (params?: { 
    search?: string; 
    program?: number; 
    page?: number 
  }): Promise<{ data: AnnouncementResult[], meta: PaginationMeta }> => {
    // Sesuaikan URL endpoint dengan route Laravel Anda
    const response = await api.get('/announcements', { params });
    
    // Mapping response sesuai struktur dari AnnouncementController
    return {
        data: response.data.data.data, // Array hasil
        meta: {
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            per_page: response.data.data.per_page,
            total: response.data.data.total
        }
    };
  },
};

// ============================================
// 📋 TYPES
// ============================================

export interface PaymentMethod {
  id: number;
  method_type: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  payment_instructions?: string;
  is_active: boolean;
}

export interface Payment {
  id: number;
  id_user: number;
  payment_code: string;
  invoice_number?: string;
  amount: number;
  rejection_reason?: string; // ✅ Pastikan ini ada
  paid_amount: number;
  status: 'pending' | 'waiting_verification' | 'verified' | 'expired' | 'rejected';
  due_date: string;
  payment_proof_file?: string; // ✅ Tambahkan ini
  // Backend me-load 'user', bukan 'applicant_profile' secara langsung di endpoint myPayment
  user?: {
    id: number;
    name: string;
    email: string;
  };
  // Kita tambahkan ini opsional, jaga-jaga jika PaymentResource mengembalikannya
  applicant_profile?: {
    full_name: string;
    registration_number: string;
  };
}

export interface MyPaymentResponse {
  payment: Payment;
  available_payment_methods: PaymentMethod[];
}

// ============================================
// 💰 PAYMENT SERVICE
// ============================================
export const paymentService = {
  /**
   * GET /api/payments/my
   */

  

  getMyPayment: async (): Promise<MyPaymentResponse | null> => {
    try {
      const response = await api.get('/payments/my');
      console.log('💳 Payment response:', response.data); // ✅ Debugging
      return response.data.data; 
    } catch (error: any) {
      // Jika 404 atau error lain, return null
      if (error.response?.status === 404) {
        console.log('💳 No payment data found');
        return null;
      }
      console.error('❌ Error fetching payment:', error);
      throw error;
    }
  },

  /**
   * POST /api/payments/{id}/upload-proof
   * Sesuai PaymentController: uploadProof(PaymentUploadProofRequest $request, Payment $payment)
   */
  uploadProof: async (paymentId: number, formData: FormData) => {
    // Simulasi mode offline/hybrid
    if (paymentId === 8888) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Upload Simulasi Berhasil' });
            }, 1000);
        });
    }

    const response = await api.post(`/payments/${paymentId}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }
};
// ============================================
// 📦 EXPORT
// ============================================
export default {
  admin: adminService,
  registration: registrationService,
  public: publicService,
  payment: paymentService,
};

// Interceptor untuk error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 422) {
      const errors = error.response.data.errors;
      if (errors) {
        const messages = Object.values(errors).flat() as string[];
        error.userMessage = messages.join('\n');
      } else {
        error.userMessage = error.response.data.message || 'Validasi gagal';
      }
    } else if (error.response?.status === 401) {
      error.userMessage = 'Sesi login habis. Silakan login ulang.';
    } else if (error.response?.status === 500) {
      error.userMessage = 'Terjadi kesalahan server. Coba lagi nanti.';
    }
    return Promise.reject(error);
  }
);

