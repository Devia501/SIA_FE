// src/screens/pendaftar/VerifikasiPembayaranBerhasil.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';
import VerifikasiDokumenScreen from '../manager/VerifikasiDokumen';

type VerifikasiDokumenNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'VerifikasiDokumenScreen'
>;

// 📌 Konstanta Warna (Sesuai tema hijau gelap)
const COLORS = {
  PRIMARY_DARK: '#015023', 
  ACCENT_LIGHT: '#DABC4E', 
  ACCENT_BG: '#F5EFD3', 
  WHITE: '#FFFFFF',
  SUCCESS_GREEN: '#38A169', 
};

const VerifikasiDokumen = () => {
  const navigation = useNavigation<VerifikasiDokumenNavigationProp>();
  
  // 📌 Data Dummy: Ganti dengan data asli dari API
  const nomorPeserta = '140072569877'; 

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
                  style={[PendaftarStyles.navIconImage]} 
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View>
                {/* 📌 Judul Header */}
                <Text style={localStyles.headerTitle}>Verifikasi Dokumen</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={localStyles.content}>
          {/* Status Konfirmasi Pembayaran Card */}
          <View style={localStyles.confirmationCard}>
            <View style={localStyles.checkCircle}>
              <Image
                source={require('../../assets/icons/complete (1).png')} // Ikon centang
                style={localStyles.checkIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={localStyles.confirmationText}>
              Dokumen berhasil diupload
            </Text>
          </View>

          {/* Info Nomor Peserta */}
          <View style={localStyles.infoBox}>
            <Image
              source={require('../../assets/icons/Exclude.png')}
              style={localStyles.infoIcon}
              resizeMode="contain"
            />
            <Text style={localStyles.infoText}>
              Terima kasih telah mendaftar sebagai calon mahasiswa, berikut nomor peserta anda.
            </Text>
          </View>

          {/* Nomor Peserta Badge */}
          <View style={localStyles.pesertaBadge}>
            <Text style={localStyles.pesertaNumber}>{nomorPeserta}</Text>
          </View>

          {/* Tombol Aksi */}
          <TouchableOpacity 
            style={localStyles.statusButton}
            onPress={() => navigation.navigate('TungguKonfirmasi')} 
          >
            <Text style={localStyles.statusButtonText}>Lihat status pendaftaran</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Background logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />

      {/* Bottom Navigation */}
      <View style={[PendaftarStyles.bottomNav, localStyles.nav]}>
        <TouchableOpacity 
          style={PendaftarStyles.navItem}
          onPress={() => navigation.navigate('PendaftarDashboard')}
        >
          <Image
            source={require('../../assets/icons/material-symbols_home-rounded.png')}
            style={PendaftarStyles.navIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={PendaftarStyles.navItem}
          onPress={() => navigation.navigate('TataCara')}
        >
          <Image
            source={require('../../assets/icons/clarity_form-line.png')}
            style={PendaftarStyles.navIconImage}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={[PendaftarStyles.navItem]}>
          <View style={PendaftarStyles.navItemActive}>
            <Image
              source={require('../../assets/icons/fluent_shifts-activity.png')}
              style={PendaftarStyles.navIconImage}
              resizeMode="contain"
            />
            <Text style={PendaftarStyles.navTextActive}>Status</Text>
          </View>
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
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY_DARK,
  },
  nav: {
    bottom: 84,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_DARK, // Teks gelap di header emas
    left: 40,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 50,
    alignItems: 'center',
  },

  // Confirmation Card
  confirmationCard: {
    backgroundColor: COLORS.ACCENT_BG, // Krem
    borderRadius: 20,
    padding: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: COLORS.ACCENT_LIGHT,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.ACCENT_LIGHT, // Emas
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkIcon: {
    width: 130,
    height: 130, // Hijau Tua
  },
  confirmationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },

  // Info Box
  infoBox: {
    backgroundColor: COLORS.ACCENT_LIGHT,
    borderRadius: 15,
    padding: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ffffffff',
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
    lineHeight: 18,
  },

  // Nomor Peserta Badge
  pesertaBadge: {
    backgroundColor: COLORS.ACCENT_BG,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DABC4E',
  },
  pesertaNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

  // Tombol Status
  statusButton: {
    backgroundColor: COLORS.SUCCESS_GREEN,
    borderRadius: 16,
    paddingVertical: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 100, 
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  
  // Bottom Nav Styles (Meniru tampilan)
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.ACCENT_BG,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  navIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.PRIMARY_DARK,
  },
});

export default VerifikasiDokumen;