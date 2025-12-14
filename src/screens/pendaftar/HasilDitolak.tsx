// src/screens/pendaftar/HasilDitolak.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';
import { Profile } from '../../services/apiService'; 

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 東 DEFINISI TIPE PARAMETER MANUAL
type HasilScreenParams = {
  HasilDitolak: {
    profile: Profile;
    programName: string;
  };
};

type HasilDitolakNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'HasilDitolak'
>;

// Konstanta Warna
const COLORS = {
  PRIMARY_DARK: '#015023',
  ACCENT_LIGHT: '#DABC4E',
  ACCENT_BG: '#F5EFD3',
  WHITE: '#FFFFFF',
  SUCCESS_GREEN: '#38A169',
  ERROR_DARK: '#BE0414',
  TEXT_DARK: '#000',
  TEXT_LIGHT: '#FFF',
};

// ============================================
//  Komponen HasilDitolak
// ============================================
const HasilDitolak = () => {
  const navigation = useNavigation<HasilDitolakNavigationProp>();
  
  // 東 FIX: Gunakan tipe RouteProp manual
  const route = useRoute<RouteProp<HasilScreenParams, 'HasilDitolak'>>();
  
  // Ambil Data Profil & Program Name
  const profile = route.params?.profile;
  const programName = route.params?.programName || 'Program Studi';

  // 泊 LOGIKA INISIAL NAMA
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

  return (
    <SafeAreaView style={localStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={PendaftarStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/Rectangle 52.png')}
            style={PendaftarStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={PendaftarStyles.headerContentV2}>
              <TouchableOpacity
                style={PendaftarStyles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                  style={PendaftarStyles.navIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View>
                <Text style={localStyles.headerTitle}>Hasil Seleksi</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Bagian 'Mohon Maaf!' */}
        <View style={localStyles.welcomeSection}>
          <Text style={localStyles.welcomeTitle}>Mohon Maaf!</Text>
        </View>

        {/* Status Konfirmasi Card */}
          <View> 
            <LinearGradient
                    colors={[COLORS.ACCENT_LIGHT, COLORS.ACCENT_BG]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={localStyles.confirmationCard}
                    >
            <View style={localStyles.lulusSection}>
                <Text style={localStyles.confirmationText}>
                Mohon Maaf!{'\n'}Anda dinyatakan <Text style={localStyles.boldText}>tidak lulus seleksi</Text>
                {'\n'}pendaftaran mahasiswa baru
                </Text>
            </View>
            
            <Text style={localStyles.universityText}>
              Universitas Global Nusantara
            </Text>

            <Text style={localStyles.universityText}>
              Jangan putus asa dan tetap semangat!
            </Text>
            </LinearGradient>
          </View>

        {/* Content */}
        <View style={localStyles.content}>
          
          {/* Detail Pendaftar Card (DINAMIS) */}
          <View style={localStyles.detailCard}>
            <View style={localStyles.profileHeader}>
              {/* MODIFIKASI: Menampilkan Inisial Nama */}
              <View style={localStyles.avatarPlaceholder}>
                   <Text style={localStyles.avatarText}>
                     {getInitials(profile?.full_name || 'Calon Mahasiswa')}
                   </Text>
              </View>

              <View>
                {/* 東 Tampilkan Nama Asli */}
                <Text style={localStyles.detailName}>
                  {profile?.full_name || 'Nama Tidak Tersedia'}
                </Text>
                <Text style={localStyles.detailNumber}>
                  Nomor Peserta: {profile?.registration_number || '-'}
                </Text>
              </View>
            </View>

            {/* Detail Program & Status */}
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailLabel}>Program :</Text>
              {/* 東 Tampilkan Nama Program Asli */}
              <Text style={localStyles.detailValue}>
                {programName}
              </Text>
            </View>
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailLabel}>Tanggal lahir :</Text>
              <Text style={localStyles.detailValue}>
                {profile?.birth_date || '-'}
              </Text>
            </View>
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailLabel}>Status :</Text>
              <Text style={localStyles.statusDiterima}>
                Tidak Diterima
              </Text>
            </View>
          </View>

          {/* Tombol Kembali ke Home */}
          <TouchableOpacity
            onPress={() => navigation.navigate('PendaftarDashboard')}
          >
            <LinearGradient
                    colors={[COLORS.ACCENT_LIGHT, COLORS.ACCENT_BG]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={localStyles.homeButton}
                    >
            <Text style={localStyles.homeButtonText}>Kembali Ke Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Background logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// ============================================
//  STYLES
// ============================================
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  progressBadge: {
    backgroundColor: COLORS.ACCENT_LIGHT, 
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginVertical: 20,
    opacity: 0.80,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  nav: {
    bottom: 84,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_DARK,
    left: 75,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 50,
    alignItems: 'center',
  },
  confirmationCard: {
    borderRadius: 10,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#000',
    marginLeft: 20,
  },
  welcomeSection: {
    backgroundColor: COLORS.ERROR_DARK,
    paddingHorizontal: 100,
    paddingVertical: 10,
    marginTop: 40, 
    borderWidth: 2,
    borderColor: '#000', 
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE, 
    textAlign: 'center',
  },
  lulusSection: {
    marginBottom: 10, 
  },
  confirmationText: {
    fontSize: 14,
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  universityText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
    marginBottom: 10, 
  },
  detailCard: {
    backgroundColor: COLORS.ACCENT_BG,
    borderRadius: 15,
    padding: 15,
    width: '100%',
    marginBottom: 40,
    borderWidth: 4,
    borderColor: COLORS.ACCENT_LIGHT,
    marginTop: -10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  // 🔑 GAYA BARU UNTUK INISIAL (Kecil)
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: COLORS.ACCENT_LIGHT,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_DARK,
  },
  detailName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_DARK,
  },
  detailNumber: {
    fontSize: 12,
    color: '#666',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
  },
  statusDiterima: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.TEXT_DARK,
  },
  homeButton: {
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 50,
    width: '100%',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
  },
});

export default HasilDitolak;