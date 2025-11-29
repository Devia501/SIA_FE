import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { notificationService, Notification } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const navigation = useNavigation();

  const loadNotifications = async () => {
    try {
      console.log('🔄 Loading notifications...');
      const response = await notificationService.getNotifications();
      console.log('✅ Notifications loaded:', response.data);
      
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error: any) {
      console.error('❌ Error loading notifications:', error);
      
      let errorMessage = 'Gagal memuat notifikasi';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      console.log('📖 Marking notification as read:', notificationId);
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log('✅ Notification marked as read');
    } catch (error: any) {
      console.error('❌ Error marking as read:', error);
      Alert.alert('Error', error.message || 'Gagal menandai notifikasi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      console.log('📖 Marking all notifications as read');
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          is_read: true, 
          read_at: new Date().toISOString() 
        }))
      );
      
      setUnreadCount(0);
      console.log('✅ All notifications marked as read');
    } catch (error: any) {
      console.error('❌ Error marking all as read:', error);
      Alert.alert('Error', error.message || 'Gagal menandai semua notifikasi');
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit yang lalu`;
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.is_read && styles.unreadNotification,
      ]}
      onPress={() => !item.is_read && handleMarkAsRead(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationHeader}>
        <View style={[
          styles.typeIndicator,
          { backgroundColor: getTypeColor(item.type) }
        ]} />
        <View style={styles.headerContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
      </View>
      
      <Text style={styles.notificationMessage}>{item.message}</Text>
      
      <View style={styles.notificationFooter}>
        <Text style={[
          styles.notificationType,
          { color: getTypeColor(item.type) }
        ]}>
          {getTypeLabel(item.type)}
        </Text>
        <Text style={styles.notificationDate}>
          {formatDate(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return '#3498db';
      case 'warning': return '#f39c12';
      case 'important': return '#e74c3c';
      case 'success': return '#2ecc71';
      default: return '#3498db';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'info': return 'INFO';
      case 'warning': return 'PERINGATAN';
      case 'important': return 'PENTING';
      case 'success': return 'SUKSES';
      default: return 'INFO';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DABC4E" />
          <Text style={styles.loadingText}>Memuat notifikasi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header with Mark All Read */}
      {unreadCount > 0 && (
        <View style={styles.actionBar}>
          <Text style={styles.unreadText}>
            {unreadCount} notifikasi belum dibaca
          </Text>
          <TouchableOpacity 
            onPress={handleMarkAllAsRead}
            style={styles.markAllButton}
          >
            <Text style={styles.markAllText}>Tandai Semua Dibaca</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#DABC4E"
            colors={['#DABC4E']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
            <Text style={styles.emptySubtext}>
              Notifikasi dari admin/manager akan muncul di sini
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#015023',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#DABC4E',
    fontSize: 14,
    fontWeight: '600',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(218, 188, 78, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(218, 188, 78, 0.2)',
  },
  unreadText: {
    color: '#DABC4E',
    fontSize: 13,
    fontWeight: '600',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DABC4E',
    borderRadius: 12,
  },
  markAllText: {
    color: '#015023',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#DABC4E',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  typeIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 40,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#015023',
    flex: 1,
    marginRight: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e74c3c',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
    marginLeft: 16,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  notificationType: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DABC4E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(218, 188, 78, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;