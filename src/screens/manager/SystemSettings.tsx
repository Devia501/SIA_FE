// src/screens/admin/KelolaManager.tsx (AddManagerScreen.tsx)

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ImageBackground, // Tambahkan ImageBackground untuk Header
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import AdminStyles
import { ManagerStyles } from '../../styles/ManagerStyles'; 
import { AdminStyles } from '../../styles/AdminStyles'; 
import { ManagerStackParamList } from '../../navigation/ManagerNavigator'; 

// Definisi Tipe Navigasi
type SystemSettingsNavigationProp = NativeStackNavigationProp<ManagerStackParamList, 'SystemSettings'>;

const SystemSettings = () => {
  const navigation = useNavigation<SystemSettingsNavigationProp>();

  return (
    <SafeAreaView style={AdminStyles.container} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.scrollContent}>
        
        {/* Header - Menggunakan Style DashboardAdmin tanpa Logout */}
        <View style={AdminStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/App Bar - Bottom.png')}
            style={AdminStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={AdminStyles.headerContent}>
              {/* Cukup gunakan AdminStyles.headerTitle untuk judul di tengah */}
                            {/* Tombol Back */}
                            <TouchableOpacity
                              style={ManagerStyles.headerIconContainerLeft}
                              onPress={() => navigation.goBack()}
                            >
                              <Image
                                source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                                style={ManagerStyles.headerIcon}
                                resizeMode="contain"
                              />
                            </TouchableOpacity>
              <Text style={[ManagerStyles.headerTitle, localStyles.Tittle]}>System Settings</Text> 
              {/* Catatan: Tidak ada komponen <TouchableOpacity style={localStyles.logoutIconContainer}> di sini */}
            </View>
          </ImageBackground>
        </View>

        <View style={AdminStyles.contentPadding}>

          {/* Tombol Tambah Manajer */}
          <TouchableOpacity style={[AdminStyles.cardBase, localStyles.addButton]} 
          onPress={() => navigation.navigate('ManageNotification')}>
            <Image 
                source={require('../../assets/icons/Exclude.png')}
                style={localStyles.addIcon}
                resizeMode="contain"
            />
            <Text style={localStyles.addText}>Manage Notification</Text>
          </TouchableOpacity>
          
          
          {/* Spacer untuk Bottom Nav Fixed */}
          <View style={AdminStyles.navSpacer} />

        </View>
      </ScrollView>

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={AdminStyles.backgroundLogo}
        resizeMode="contain"
      />

      {/* Bottom Navigation (Fixed) */}
      <View style={AdminStyles.bottomNav}>
        <TouchableOpacity style={AdminStyles.navItem} onPress={() => navigation.navigate('ManagerDashboard')}>
          <Image
            source={require('../../assets/icons/material-symbols_home-rounded.png')}
            style={AdminStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={AdminStyles.navItem} onPress={() => navigation.navigate('KelolaPendaftaran')}>
          <Image
            source={require('../../assets/icons/proicons_save-pencil.png')}
            style={AdminStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Item Aktif: Kelola Manager */}
        <TouchableOpacity style={AdminStyles.navItem}>
          <View style={AdminStyles.navItemActive}>
            <Image
              source={require('../../assets/icons/material-symbols_settings-rounded.png')}
              style={AdminStyles.navIcon}
              resizeMode="contain"
            />
            <Text style={AdminStyles.navTextActive}>Settings</Text>
          </View>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

// Style Lokal untuk KelolaManager (Hanya yang spesifik untuk halaman ini)
const localStyles = StyleSheet.create({
  Tittle:{
    left: 12,
  },
  satu:{
    borderRadius: 23,
    top: 280,
    paddingVertical: 10,
    width: '70%',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  
  // Catatan: localStyles.topHeader Dihapus, diganti dengan AdminStyles.headerContainer

  // --- Manager Users Label ---
  managerUsersHeader: {
    alignSelf: 'flex-start',
    backgroundColor: '#015023',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#DABC4E',
  },
  managerUsersText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DABC4E',
  },

  // --- Tombol Tambah Manajer ---
  addButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 12, 
    paddingVertical: 14, 
    marginTop: 22,
  },
  addIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
    marginLeft: 12,
  },
  addText: {
    fontSize: 16,
    color: '#000',
  },

  // --- Manager Card ---
  managerCard: {
    ...AdminStyles.cardBase,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 15,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  managerIcon: {
    width: 25,
    height: 25,
    tintColor: '#000',
  },
  managerInfo: {
    alignItems: 'flex-start',
  },
  managerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  managerRole: {
    fontSize: 12,
    color: '#015023', 
    marginTop: 2,
  },
});

export default SystemSettings;