// src/screens/admin/DashboardAdmin.tsx

import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator, // ✅ Tambahkan ActivityIndicator
  RefreshControl, // ✅ Tambahkan RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native'; // ✅ Tambahkan useIsFocused
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useAuth } from '../../contexts/AuthContext'; 
import LinearGradient from 'react-native-linear-gradient';
import { AdminStyles } from '../../styles/AdminStyles'; 

// ✅ IMPORT SERVICE
import { adminService, Statistics } from '../../services/managerService'; // Menggunakan tipe dari managerService (sama)

const { width } = Dimensions.get('window');

type DashboardAdminNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

const DashboardAdmin = () => {
  const navigation = useNavigation<DashboardAdminNavigationProp>();
  const { logout, user } = useAuth(); 
  const isFocused = useIsFocused(); // ✅ Hook untuk deteksi fokus layar

  // ✅ STATE BARU
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🔄 FUNGSI LOAD STATISTIK
  const loadStatistics = useCallback(async () => {
    try {
      // Menggunakan adminService.getStatistics (yang memanggil endpoint sama dengan manager)
      const response = await adminService.getStatistics();
      setStatistics(response.data);
    } catch (error: any) {
      console.error('❌ Gagal memuat statistik admin:', error);
      // Opsional: Alert error jika perlu, tapi biasanya silent fail lebih baik di dashboard
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ✅ Load data saat awal dan saat layar fokus kembali
  useEffect(() => {
    if (isFocused) {
        loadStatistics();
    }
  }, [isFocused, loadStatistics]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari akun admin?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", onPress: logout }
      ]
    );
  };

  // ✅ DATA DINAMIS
  const totalPendaftar = statistics?.total ?? 0;
  const totalApproved = statistics?.approved ?? 0;
  const totalRejected = statistics?.rejected ?? 0;
  const totalPending = statistics?.submitted ?? 0; // Pending = Submitted

  // Hitung Growth Rate Sederhana (Contoh: Disetujui / Total)
  const growthRate = totalPendaftar > 0 
    ? Math.round((totalApproved / totalPendaftar) * 100) 
    : 0;

  return (
    <SafeAreaView style={AdminStyles.container} edges={['top']}>

    {/* Header */}
        <View style={localStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/App Bar - Bottom.png')}
            style={localStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={localStyles.headerContent}>
              <Text style={localStyles.headerTitle}>Admin Dashboard</Text>
              <TouchableOpacity
                style={localStyles.logoutIconContainer}
                onPress={handleLogout}
              >
                <Image
                  source={require('../../assets/icons/mingcute_exit-line.png')}
                  style={localStyles.logoutIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DABC4E']} />
        }
      >

        {/* Content */}
        <View style={localStyles.content}>
          {/* Greeting */}
          <View style={localStyles.greetingHeader}>
            <Text style={localStyles.greetingText}>Selamat datang, {user?.name || 'Admin'}!</Text>
            <View style={localStyles.notificationBadge}>
              {/* ✅ Notifikasi jumlah pending */}
              <Text style={localStyles.notificationText}>{totalPending}</Text>
            </View>
          </View>

          {isLoading ? (
             <ActivityIndicator size="large" color="#DABC4E" style={{ marginTop: 50, marginBottom: 50 }} />
          ) : (
            <>
                {/* Total Pendaftar Card */}
                <View style={localStyles.totalCard}>
                    <Text style={localStyles.totalNumber}>{totalPendaftar}</Text>
                    <Text style={localStyles.totalLabel}>Total Pendaftar</Text>
                </View>

                {/* Stats Cards */}
                <View style={localStyles.statsRow}>
                    <View style={localStyles.statCard}>
                    <Text style={localStyles.statNumber}>{totalApproved}</Text>
                    <Text style={localStyles.statLabel}>Disetujui</Text>
                    </View>
                    <View style={localStyles.statCard}>
                    <Text style={localStyles.statNumber}>{totalPending}</Text>
                    <Text style={localStyles.statLabel}>Menunggu Review</Text>
                    </View>
                </View>

                {/* Ditolak Card */}
                <View style={localStyles.rejectCard}>
                    <Text style={localStyles.rejectNumber}>{totalRejected}</Text>
                    <Text style={localStyles.rejectLabel}>Ditolak</Text>
                </View>
            </>
          )}

          {/* Action Buttons */}
          <TouchableOpacity
            onPress={() => navigation.navigate('StatistikPendaftaran')}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#DABC4E', '#EFE3B0']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.actionButton}
              >
              <Text style={localStyles.actionButtonText}>Lihat Statistik Detail</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={localStyles.actionButtonSecondary}
            onPress={() => navigation.navigate('AddManager')}
            disabled={isLoading}
          >
            <Text style={localStyles.actionButtonText}>Kelola Manager</Text>
          </TouchableOpacity>
          
          {/* Quick Stats Card */}
          <View style={localStyles.quickStatsCard}>
            <View style={localStyles.quickStatsHeader}>
              <Image
                source={require('../../assets/icons/fluent_shifts-activity.png')}
                style={localStyles.quickStatsIcon}
                resizeMode="contain"
              />
              <Text style={localStyles.quickStatsTitle}>Quick Stats</Text>
            </View>
            
            <View style={localStyles.quickStatItem}>
              <View style={localStyles.quickStatLeft}>
                <Image
                  source={require('../../assets/icons/ant-design_form.png')}
                  style={localStyles.quickStatIcon}
                  resizeMode="contain"
                />
                <Text style={localStyles.quickStatLabel}>Total Pendaftaran</Text>
              </View>
              <Text style={localStyles.quickStatValue}>{totalPendaftar}</Text>
            </View>

            <View style={localStyles.quickStatItem}>
              <View style={localStyles.quickStatLeft}>
                <Image
                  source={require('../../assets/icons/material-symbols_info.png')}
                  style={localStyles.quickStatIcon}
                  resizeMode="contain"
                />
                <Text style={localStyles.quickStatLabel}>Acceptance Rate</Text>
              </View>
              <Text style={localStyles.quickStatValue}>{growthRate}%</Text>
            </View>
          </View>
          
          <View style={AdminStyles.navSpacer} /> 
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={AdminStyles.bottomNav}>
        <TouchableOpacity style={AdminStyles.navItem}>
          <View style={AdminStyles.navItemActive}>
            <Image
              source={require('../../assets/icons/material-symbols_home-rounded.png')}
              style={AdminStyles.navIcon}
              resizeMode="contain"
            />
            <Text style={AdminStyles.navTextActive}>Home</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={AdminStyles.navItem}
        onPress={() => navigation.navigate('StatistikPendaftaran')}>
          <Image
            source={require('../../assets/icons/proicons_save-pencil.png')}
            style={AdminStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={AdminStyles.navItem}
        onPress={() => navigation.navigate('AddManager')}>
          <Image
            source={require('../../assets/icons/f7_person-3-fill.png')}
            style={AdminStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={AdminStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// Style lokal untuk DashboardAdmin (Dipertahankan, hanya disesuaikan sedikit)
const localStyles = StyleSheet.create({
  headerContainer: {
    height: 62,
  },
  waveBackground: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 15,
    paddingHorizontal: 20, 
    position: 'relative', 
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  logoutIconContainer: {
    position: 'absolute',
    right: 20, 
    top: 15, 
    padding: 5,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000', 
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 13,
    color: '#FFF',
  },
  notificationBadge: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    minWidth: 24, // Agar bulat sempurna jika angka > 9
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  notificationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#015023',
  },
  totalCard: {
    backgroundColor: '#F5E6D3',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#DABC4E',
    width: '85%',
    left: 25,
  },
  totalNumber: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
  },
  totalLabel: {
    fontSize: 14,
    color: '#000',
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
    backgroundColor: '#DABC4E',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 11,
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
  rejectCard: {
    backgroundColor: '#F5E6D3',
    borderRadius: 20,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#DABC4E',
    width: '85%',
    left: 25,
  },
  rejectNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  rejectLabel: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#DABC4E',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#DABC4E',
    width: '85%',
    left: 25,
  },
  actionButtonSecondary: {
    backgroundColor: '#F5E6D3',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#DABC4E',
    width: '85%',
    left: 25,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  quickStatsCard: {
    backgroundColor: '#F5E6D3',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#DABC4E',
  },
  quickStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  quickStatsIcon: {
    width: 20,
    height: 20,
  },
  quickStatsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  quickStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DABC4E',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  quickStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickStatIcon: {
    width: 18,
    height: 18,
  },
  quickStatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  quickStatValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default DashboardAdmin;