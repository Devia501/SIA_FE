import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';

const { width } = Dimensions.get('window');

type DashboardScreenNavigationProp = NativeStackNavigationProp<PendaftarStackParamList, 'PendaftarDashboard'>;

const DashboardScreen = () => {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { user } = useAuth(); 
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const slideAnim = useState(new Animated.Value(-width * 0.7))[0];

  // Load unread count
  useEffect(() => {
    loadUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const userName = user?.name || 'Calon Mahasiswa';
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    }
    if (parts.length === 1 && parts[0]) {
      return parts[0][0].toUpperCase();
    }
    return 'CM'; 
  };
  const avatarText = getInitials(userName);

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      Animated.timing(slideAnim, {
        toValue: -width * 0.7,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsDrawerOpen(false));
    } else {
      setIsDrawerOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleMenuItemPress = (screen?: keyof PendaftarStackParamList) => {
    toggleDrawer();
    if (screen && screen !== 'PendaftarDashboard') {
      setTimeout(() => {
        navigation.navigate(screen);
      }, 300);
    }
  };

  const handleNotificationPress = () => {
    console.log('🔔 Notification button pressed');
    // @ts-ignore - Navigate to NotificationsScreen
    navigation.navigate('Notifications');
  };
  
  return (
    <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={PendaftarStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/Rectangle 48.png')}
            style={PendaftarStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={PendaftarStyles.headerContent}>
              <TouchableOpacity 
                style={PendaftarStyles.menuButton}
                onPress={toggleDrawer}
              >
                <Image
                  source={require('../../assets/icons/fluent_navigation.png')}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <View style={PendaftarStyles.userInfo}>
                <View style={PendaftarStyles.avatar}>
                  <Text style={PendaftarStyles.avatarText}>{avatarText}</Text>
                </View>
                <View style={PendaftarStyles.userTextContainer}>
                  <Text style={PendaftarStyles.userName}>{userName}</Text>
                  <Text style={PendaftarStyles.userRole}>Calon Mahasiswa</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={PendaftarStyles.notifButton}
                onPress={handleNotificationPress}
              >
                <Image
                  source={require('../../assets/icons/Exclude.png')}
                  resizeMode="contain"
                />
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        <View style={PendaftarStyles.content}>
          <View style={PendaftarStyles.quickActions}>
            <TouchableOpacity 
              style={PendaftarStyles.actionButton}
              onPress={() => navigation.navigate('TataCara')}
            >
              <Image
                  source={require('../../assets/icons/ant-design_form.png')}
                  style={PendaftarStyles.actionIcon}
                  resizeMode="contain"
                />
              <View>
                <Text style={PendaftarStyles.actionTitle}>Tata cara</Text>
                <Text style={PendaftarStyles.actionSubtitle}>Pendaftaran</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
            style={PendaftarStyles.actionButton}
            onPress={() => navigation.navigate('InformasiPenting')}
            >
              <Image
                  source={require('../../assets/icons/material-symbols_info.png')}
                  style={PendaftarStyles.actionIcon}
                  resizeMode="contain"
                />
              <View>
                <Text style={PendaftarStyles.actionTitle}>Informasi</Text>
                <Text style={PendaftarStyles.actionSubtitle}>Penting</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
          onPress={() => navigation.navigate('TataCara')}>
            <LinearGradient
                colors={['#DABC4E', '#F5EFD3']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}
                style={PendaftarStyles.registerButton}
              >
                <Text style={PendaftarStyles.registerButtonText}>Daftar Mahasiswa Baru</Text>
              </LinearGradient>
          </TouchableOpacity>

          <View style={PendaftarStyles.newsSection}>
            <View style={PendaftarStyles.newsCard}>
              <Text style={PendaftarStyles.newsTitle}>Berita Terbaru</Text>
              <View style={PendaftarStyles.newsCard2}>
                <Text style={PendaftarStyles.newsCardTitle}>
                Selamat Kepada Calon Mahasiswa Baru
              </Text>
              <TouchableOpacity style={PendaftarStyles.newsCardContent}>
                <Text style={PendaftarStyles.newsCardText}>
                  Klik disini untuk melihat pengumuman!
                </Text>
              </TouchableOpacity>
              
              </View>
            </View>

            <View style={PendaftarStyles.pagination}>
              <View style={[PendaftarStyles.dot, PendaftarStyles.dotActive]} />
              <View style={PendaftarStyles.dot} />
              <View style={PendaftarStyles.dot1} />
            </View>
          </View>
        </View>

        <View style={PendaftarStyles.bottomNav}>
          <TouchableOpacity style={PendaftarStyles.navItem}>
            <View style={PendaftarStyles.navItemActive}>
              <Image
                  source={require('../../assets/icons/material-symbols_home-rounded.png')}
                  style={PendaftarStyles.navIconImage}
                  resizeMode="contain"
                />
              <Text style={PendaftarStyles.navTextActive}>Home</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={PendaftarStyles.navItem}
          onPress={() => navigation.navigate('TataCara')}>
            <Image
                  source={require('../../assets/icons/clarity_form-line.png')}
                  style={PendaftarStyles.navIconImage}
                  resizeMode="contain"
                />
          </TouchableOpacity>

          <TouchableOpacity style={PendaftarStyles.navItem}
          onPress={() => navigation.navigate('StatusPendaftaranAwal')}>
            <Image
                  source={require('../../assets/icons/fluent_shifts-activity.png')}
                  style={PendaftarStyles.navIconImage}
                  resizeMode="contain"
                />
          </TouchableOpacity>

          <TouchableOpacity style={PendaftarStyles.navItem}
          onPress={() => navigation.navigate('Profile')}>
            <Image
                  source={require('../../assets/icons/ix_user-profile-filled.png')}
                  style={PendaftarStyles.navIconImage}
                  resizeMode="contain"
                />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />

      <Modal
        visible={isDrawerOpen}
        transparent={true}
        animationType="none"
        onRequestClose={toggleDrawer}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.drawerContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            <View style={styles.drawerContent}>

              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => handleMenuItemPress('PendaftarDashboard')}
              >
                <Image
                  source={require('../../assets/icons/fluent_navigation.png')}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuItem, styles.menuItemActive]}
                onPress={() => handleMenuItemPress('PendaftarDashboard')}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_home-rounded.png')}
                  style={[styles.menuIcon, styles.menuIconColor]}
                  resizeMode="contain"
                />
                <Text style={[styles.menuText, styles.menuText]}>Dashboard</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('TataCara')}
              >
                <Image
                  source={require('../../assets/icons/clarity_form-line.png')}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
                <Text style={styles.menuText}>Pendaftaran</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('StatusPendaftaranAwal')}
              >
                <Image
                  source={require('../../assets/icons/fluent_shifts-activity.png')}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
                <Text style={styles.menuText}>Status Pendaftaran</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => handleMenuItemPress('Profile')}
              >
                <Image
                  source={require('../../assets/icons/ix_user-profile-filled.png')}
                  style={styles.menuIcon}
                  resizeMode="contain"
                />
                <Text style={styles.menuText}>Profile</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    top: -29,
    left: 8,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    width: width * 0.7,
    backgroundColor: '#F5E6D3',
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  drawerContent: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#015023',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#DABC4E',
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFF',
  },
  menuIconColor: {
    tintColor: '#000000ff',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  notifBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  notifBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;