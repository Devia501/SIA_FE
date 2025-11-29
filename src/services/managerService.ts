// services/managerService.ts
import api from './api';

// ============================================
// 📝 TYPES & INTERFACES
// ============================================
export interface Applicant {
  id_profile: number;
  id_user: number;
  full_name: string;
  email: string;
  program_name: string;
  registration_number: string;
  registration_status: 'submitted' | 'approved' | 'rejected' | 'draft';
  created_at: string;
  phone_number?: string;
  rejection_reason?: string; // 🆕 Alasan penolakan
}

export interface Statistics {
  total: number;
  submitted: number;
  approved: number;
  rejected: number;
}

export interface UpdateStatusData {
  status: 'approved' | 'rejected';
  notes?: string; // 🆕 Catatan untuk approval/rejection
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ============================================
// 👨‍💼 MANAGER SERVICE (Full Access - Can Approve/Reject)
// ============================================
export const managerService = {
  /**
   * Get list of applicants with filters
   * GET /api/admin/applicants
   * 
   * @param filters - Optional filters for status and search
   * @returns Promise with list of applicants
   */
  getApplicants: async (filters?: {
    status?: string;
    search?: string;
  }): Promise<ApiResponse<Applicant[]>> => {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      
      if (filters?.search && filters.search.trim() !== '') {
        params.append('search', filters.search.trim());
      }

      const queryString = params.toString();
      const url = `/admin/applicants${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching applicants with URL:', url);
      
      const response = await api.get<ApiResponse<Applicant[]>>(url);
      
      console.log('✅ Applicants fetched successfully:', response.data.data.length, 'records');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get applicants error:', error.response?.data || error.message);
      
      // Handle specific error responses
      if (error.response?.status === 403) {
        throw new Error('Akses ditolak. Anda tidak memiliki izin untuk melihat data ini.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Gagal mengambil data pendaftar. Silakan coba lagi.');
    }
  },

  /**
   * Get statistics of applicants
   * GET /api/admin/statistics
   * 
   * @returns Promise with statistics data
   */
  getStatistics: async (): Promise<ApiResponse<Statistics>> => {
    try {
      console.log('📊 Fetching statistics...');
      
      const response = await api.get<ApiResponse<Statistics>>('/admin/statistics');
      
      console.log('✅ Statistics fetched successfully:', response.data.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get statistics error:', error.response?.data || error.message);
      
      if (error.response?.status === 403) {
        throw new Error('Akses ditolak.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Gagal mengambil statistik. Silakan coba lagi.');
    }
  },

  /**
   * Update applicant status (approve/reject)
   * PUT /api/admin/applicants/{id}/status
   * 🔐 MANAGER ONLY - Can approve/reject
   * 
   * @param id - Applicant profile ID
   * @param data - Status update data (status + optional notes)
   * @returns Promise with success message
   */
  updateApplicantStatus: async (
    id: number,
    data: UpdateStatusData
  ): Promise<ApiResponse<any>> => {
    try {
      // Validasi input
      if (!data.status) {
        throw new Error('Status harus diisi');
      }

      // 🔥 Jika reject, notes WAJIB diisi
      if (data.status === 'rejected' && (!data.notes || data.notes.trim() === '')) {
        throw new Error('Alasan penolakan harus diisi');
      }

      console.log(`🔄 Updating applicant ${id} status to:`, data.status);
      if (data.notes) {
        console.log('📝 Notes:', data.notes);
      }
      
      const response = await api.put<ApiResponse<any>>(
        `/admin/applicants/${id}/status`,
        {
          status: data.status,
          notes: data.notes?.trim() || null,
        }
      );
      
      console.log('✅ Applicant status updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Update status error:', error.response?.data || error.message);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        throw new Error(errorMessages[0] as string);
      }
      
      if (error.response?.status === 403) {
        throw new Error('Akses ditolak. Hanya Manager yang dapat mengubah status.');
      }
      
      if (error.response?.status === 404) {
        throw new Error('Data pendaftar tidak ditemukan.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // If error is already an Error object with message
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Gagal mengubah status pendaftar. Silakan coba lagi.');
    }
  },

  /**
   * Get applicant documents
   * GET /api/admin/applicants/{id}/documents
   * 
   * @param id - Applicant profile ID
   * @returns Promise with documents list
   */
  getApplicantDocuments: async (id: number): Promise<ApiResponse<any>> => {
    try {
      console.log(`📄 Fetching documents for applicant ID: ${id}`);
      
      const response = await api.get<ApiResponse<any>>(
        `/admin/applicants/${id}/documents`
      );
      
      console.log('✅ Documents fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get documents error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        throw new Error('Data pendaftar tidak ditemukan.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('Akses ditolak.');
      }
      
      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Gagal mengambil dokumen pendaftar. Silakan coba lagi.');
    }
  },

  /**
   * Get detailed applicant information
   * GET /api/admin/applicants/{id}
   *
   * @param id - Applicant profile ID
   * @returns Promise with applicant detail
   */
  getApplicantDetail: async (id: number): Promise<ApiResponse<any>> => {
    try {
      console.log(`📄 Fetching applicant detail for ID: ${id}`);

      const response = await api.get<ApiResponse<any>>(
        `/admin/applicants/${id}`
      );

      console.log('✅ Applicant detail fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get applicant detail error:', error.response?.data || error.message);

      if (error.response?.status === 404) {
        throw new Error('Data pendaftar tidak ditemukan.');
      }

      if (error.response?.status === 403) {
        throw new Error('Akses ditolak.');
      }

      if (error.response?.status === 401) {
        throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Gagal mengambil detail pendaftar. Silakan coba lagi.');
    }
  },

  /**
   * Update document verification status
   * PUT /api/admin/documents/{id}/verify
   *
   * @param id - Document ID
   * @param data - Verification data (status + optional notes)
   * @returns Promise with success message
   */
  updateDocumentStatus: async (
    id: number,
    data: {
      status: 'Approved' | 'Rejected' | 'Pending';
      notes?: string;
    }
  ): Promise<ApiResponse<any>> => {
    try {
      console.log(`🔄 Updating document ${id} status to:`, data.status);
      
      const response = await api.put<ApiResponse<any>>(
        `/admin/documents/${id}/verify`,
        data
      );
      
      console.log('✅ Document status updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Update document status error:', error.response?.data || error.message);
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        throw new Error(errorMessages[0] as string);
      }
      
      if (error.response?.status === 404) {
        throw new Error('Dokumen tidak ditemukan.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('Akses ditolak.');
      }
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error('Gagal mengubah status dokumen. Silakan coba lagi.');
    }
  },
};

// ============================================
// 👨‍💼 ADMIN SERVICE (Read-Only - Monitor Only)
// ============================================
export const adminService = {
  /**
   * Get list of applicants (READ ONLY)
   * GET /api/admin/applicants
   * 
   * Admin hanya bisa melihat data, tidak bisa approve/reject
   */
  getApplicants: async (filters?: {
    status?: string;
    search?: string;
  }): Promise<ApiResponse<Applicant[]>> => {
    return managerService.getApplicants(filters);
  },

  /**
   * Get statistics (READ ONLY)
   * GET /api/admin/statistics
   */
  getStatistics: async (): Promise<ApiResponse<Statistics>> => {
    return managerService.getStatistics();
  },

  /**
   * Get detailed applicant information (READ ONLY)
   * GET /api/admin/applicants/{id}
   */
  getApplicantDetail: async (id: number): Promise<ApiResponse<any>> => {
    return managerService.getApplicantDetail(id);
  },

  // ❌ Admin TIDAK bisa update status
  // Admin hanya bisa melihat data untuk monitoring saja
  // Hanya Manager yang bisa approve/reject pendaftar
};

// ============================================
// 🔧 HELPER FUNCTIONS
// ============================================

/**
 * Format error message from API response
 */
export const formatErrorMessage = (error: any): string => {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    const errorMessages = Object.values(errors).flat();
    return errorMessages[0] as string;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Terjadi kesalahan. Silakan coba lagi.';
};

/**
 * Check if user has manager role
 */
export const isManager = (userRole: string): boolean => {
  return userRole === 'manager';
};

/**
 * Check if user has admin role
 */
export const isAdmin = (userRole: string): boolean => {
  return userRole === 'admin';
};

/**
 * Format registration status to Indonesian
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Pending',
    approved: 'Diterima',
    rejected: 'Ditolak',
  };
  
  return statusMap[status] || status;
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    draft: '#95a5a6',
    submitted: '#f39c12',
    approved: '#27ae60',
    rejected: '#e74c3c',
  };
  
  return colorMap[status] || '#95a5a6';
};