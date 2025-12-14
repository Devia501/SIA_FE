import api from './api';

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'important' | 'success';
  is_read: boolean;
  read_at: string | null;
  sent_by: number;
  created_at: string;
  updated_at: string;
}

// 泊 UPDATE: Tambahkan semua kemungkinan key yang diterima backend
export interface SendNotificationData {
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'important' | 'success';
  
  // Opsi filter (Salah satu dari ini harusnya ditangkap backend)
  status?: string; 
  registration_status?: string;
  target_audience?: string;
}

export const notificationService = {
  /**
   * Send notification to all applicants (Admin/Manager only)
   * POST /api/notifications/send
   */
  sendNotification: async (data: SendNotificationData): Promise<{ 
    success: boolean; 
    message: string;
    data: { notifications_sent: number } 
  }> => {
    try {
      const response = await api.post('/notifications/send', data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Send notification error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get notifications for current user
   * GET /api/notifications
   */
  getNotifications: async (): Promise<{
    success: boolean;
    data: {
      notifications: Notification[];
      total: number;
      unread_count: number;
    }
  }> => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get notifications error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get unread notifications count
   * GET /api/notifications/unread-count
   */
  getUnreadCount: async (): Promise<{
    success: boolean;
    data: { unread_count: number }
  }> => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error: any) {
      console.error('❌ Get unread count error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * POST /api/notifications/{id}/read
   */
  markAsRead: async (notificationId: number): Promise<{
    success: boolean;
    message: string;
    data: { notification: Notification }
  }> => {
    try {
      const response = await api.post(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Mark as read error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * POST /api/notifications/mark-all-read
   */
  markAllAsRead: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await api.post('/notifications/mark-all-read');
      return response.data;
    } catch (error: any) {
      console.error('❌ Mark all as read error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Delete notification (Admin/Manager only)
   * DELETE /api/notifications/{id}
   */
  deleteNotification: async (notificationId: number): Promise<{
    success: boolean;
    message: string;
  }> => {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Delete notification error:', error.response?.data || error.message);
      throw error;
    }
  }
};