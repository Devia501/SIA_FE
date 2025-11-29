// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Notification {
  id: string;
  title: string;
  message: string;
  targetAudience: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load notifications dari AsyncStorage saat pertama kali
  useEffect(() => {
    loadNotifications();
  }, []);

  // Update unread count setiap kali notifications berubah
  useEffect(() => {
    const count = notifications.filter(n => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = async (notifs: Notification[]) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(notifs));
      setNotifications(notifs);
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const updated = [newNotification, ...notifications];
    await saveNotifications(updated);
  };

  const markAsRead = async (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    await saveNotifications(updated);
  };

  const markAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    await saveNotifications(updated);
  };

  const clearAllNotifications = async () => {
    await saveNotifications([]);
  };

  const fetchNotifications = async () => {
    // Ini nanti akan fetch dari API Laravel
    // Untuk sekarang pakai yang sudah ada di AsyncStorage
    await loadNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};