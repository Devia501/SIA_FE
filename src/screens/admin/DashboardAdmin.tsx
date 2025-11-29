// src/screens/admin/DashboardAdmin.tsx (Setelah dikurangi styles umum)

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
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useAuth } from '../../contexts/AuthContext'; 
import LinearGradient from 'react-native-linear-gradient';
// Import AdminStyles yang baru
import { AdminStyles } from '../../styles/AdminStyles'; 

const { width } = Dimensions.get('window');

type DashboardAdminNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AdminDashboard'>;

const DashboardAdmin = () => {
  const navigation = useNavigation<DashboardAdminNavigationProp>();
  const { logout, user } = useAuth(); 

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
              {/* TOMBOL LOGOUT ICON di KANAN ATAS */}
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
              {/* AKHIR TOMBOL LOGOUT ICON */}
            </View>
          </ImageBackground>
        </View>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Content */}
        <View style={localStyles.content}>
          {/* Greeting */}
          <View style={localStyles.greetingHeader}>
            {/* Menggunakan data user?.name */}
            <Text style={localStyles.greetingText}>Selamat datang, {user?.name || 'admin system'}!</Text>
            <View style={localStyles.notificationBadge}>
              <Text style={localStyles.notificationText}>0</Text>
            </View>
          </View>

          {/* Total Pendaftar Card */}
          <View style={localStyles.totalCard}>
            <Text style={localStyles.totalNumber}>0</Text>
            <Text style={localStyles.totalLabel}>Total Pendaftar</Text>
          </View>

          {/* Stats Cards */}
          <View style={localStyles.statsRow}>
            <View style={localStyles.statCard}>
              <Text style={localStyles.statNumber}>0</Text>
              <Text style={localStyles.statLabel}>Disetujui</Text>
            </View>
            <View style={localStyles.statCard}>
              <Text style={localStyles.statNumber}>0</Text>
              <Text style={localStyles.statLabel}>Menunggu Review</Text>
            </View>
          </View>

          {/* Ditolak Card */}
          <View style={localStyles.rejectCard}>
            <Text style={localStyles.rejectNumber}>0</Text>
            <Text style={localStyles.rejectLabel}>Ditolak</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
          onPress={() => navigation.navigate('StatistikPendaftaran')}>
            <LinearGradient
              colors={['#DABC4E', '#EFE3B0']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.actionButton}
              >
              <Text style={localStyles.actionButtonText}>Kelola Pendaftaran</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={localStyles.actionButtonSecondary}
            onPress={() => navigation.navigate('AddManager')}
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
              <Text style={localStyles.quickStatValue}>Rp 0</Text>
            </View>

            <View style={localStyles.quickStatItem}>
              <View style={localStyles.quickStatLeft}>
                <Image
                  source={require('../../assets/icons/material-symbols_info.png')}
                  style={localStyles.quickStatIcon}
                  resizeMode="contain"
                />
                <Text style={localStyles.quickStatLabel}>Growth Rate</Text>
              </View>
              <Text style={localStyles.quickStatValue}>0%</Text>
            </View>
          </View>
          
          {/* Tambahkan padding di bawah agar konten tidak tertutup bottom nav fixed. */}
          <View style={AdminStyles.navSpacer} /> 
        </View>
      </ScrollView>

      {/* Bottom Navigation - Fixed Position */}
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
      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={AdminStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// Style lokal untuk DashboardAdmin
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
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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