import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Alert, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ManagerStackParamList } from '../../navigation/ManagerNavigator';
import { useAuth } from '../../contexts/AuthContext'; 
// Import styles dari ManagerStyles.ts
import { ManagerStyles, Colors } from '../../styles/ManagerStyles'; 
import LinearGradient from 'react-native-linear-gradient';
const { width } = Dimensions.get('window');

type DashboardManagerNavigationProp = NativeStackNavigationProp<ManagerStackParamList, 'ManagerDashboard'>;

const DashboardManager = () => {
  const navigation = useNavigation<DashboardManagerNavigationProp>();
  const { logout, user } = useAuth(); 

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", onPress: logout }
      ]
    );
  };

  const handleKelolaPendaftaran = () => {
    // Navigasi ke Kelola Pendaftaran (Pastikan nama route-nya benar)
    navigation.navigate('KelolaPendaftaran'); 
  };
  
  const handleSystemSettings = () => {
    // Implementasikan navigasi ke System Settings
    console.log('Navigate to System Settings');
  };

  return (
    <SafeAreaView style={ManagerStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header - Menggunakan ManagerStyles */}
        <View style={ManagerStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/App Bar - Bottom.png')}
            style={ManagerStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={ManagerStyles.headerContent}>
              <Text style={ManagerStyles.headerTitle}>Manager Dashboard</Text>
              {/* TOMBOL LOGOUT ICON di KANAN ATAS - Menggunakan ManagerStyles */}
              <TouchableOpacity
                style={ManagerStyles.headerIconContainer} // Menggunakan style umum
                onPress={handleLogout}
              >
                <Image
                  source={require('../../assets/icons/mingcute_exit-line.png')}
                  style={ManagerStyles.headerIcon} // Menggunakan style umum
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {/* AKHIR TOMBOL LOGOUT ICON */}
            </View>
          </ImageBackground>
        </View>

        {/* Content - Menggunakan ManagerStyles */}
        <View style={ManagerStyles.content}>
          {/* Today's Summary */}
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Today's Summary</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>0</Text>
            </View>
          </View>

          <Text style={styles.greetingText}>Selamat datang, {user?.name || 'manager system'}!</Text>

          {/* Total Pendaftar Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalNumber}>0</Text>
            <Text style={styles.totalLabel}>Total Pendaftar</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Diterima</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          {/* Ditolak Card */}
          <View style={styles.rejectCard}>
            <Text style={styles.rejectNumber}>0</Text>
            <Text style={styles.rejectLabel}>Ditolak</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            onPress={handleKelolaPendaftaran} // Tambahkan handler navigasi
          >
            <LinearGradient
                colors={['#DABC4E', '#EFE3B0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>Kelola Pendaftaran</Text>
              </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButtonSecondary}
            onPress={() => navigation.navigate('SystemSettings')}
          >
            <Text style={styles.actionButtonText}>System Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Padding bawah agar konten tidak tertutup bottom nav */}
        <View style={{ height: 120 }} />

        {/* Background Logo - Menggunakan ManagerStyles */}
        <Image
            source={require('../../assets/images/logo-ugn.png')}
            style={ManagerStyles.backgroundLogo}
            resizeMode="contain"
        />

      </ScrollView>

      {/* Bottom Navigation - Menggunakan ManagerStyles */}
      <View style={ManagerStyles.bottomNav}>
        <TouchableOpacity style={ManagerStyles.navItem}>
          <View style={ManagerStyles.navItemActive}>
            <Image
              source={require('../../assets/icons/material-symbols_home-rounded.png')}
              style={ManagerStyles.navIcon}
              resizeMode="contain"
            />
            <Text style={ManagerStyles.navTextActive}>Home</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={ManagerStyles.navItem} onPress={() => navigation.navigate('KelolaPendaftaran')}>
          <Image
            source={require('../../assets/icons/proicons_save-pencil.png')}
            style={ManagerStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={ManagerStyles.navItem} onPress={() => navigation.navigate('SystemSettings')}>
          <Image
            source={require('../../assets/icons/material-symbols_settings-rounded.png')}
            style={ManagerStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Style spesifik untuk DashboardManager
const styles = StyleSheet.create({
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  notificationBadge: {
    backgroundColor: Colors.textLight,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  greetingText: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 20,
  },
  totalCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.secondary,
    width: '85%',
    left: 25,
  },
  totalNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textDark,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.textDark,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textDark,
    marginTop: 4,
  },
  rejectCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.secondary,
    width: '85%',
    left: 25,
  },
  rejectNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  rejectLabel: {
    fontSize: 14,
    color: Colors.statusRejected,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e6c85fff',
    width: '85%',
    left: 25,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 100,
    borderWidth: 2,
    borderColor: Colors.secondary,
    width: '85%',
    left: 25,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
});

export default DashboardManager;