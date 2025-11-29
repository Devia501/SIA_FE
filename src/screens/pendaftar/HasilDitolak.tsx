// src/screens/pendaftar/HasilDiterima.tsx

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
  Modal, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

// Data Dummy Pendaftar
const DUMMY_USER_DATA = {
  name: 'Sarah Johnson',
  nomorPeserta: '140072569877',
  program: 'Ilmu Komputer',
  tanggalLahir: '31/12/2006',
  status: 'Tidak Diterima',
  emailOptions: [
    'sarahjohnson@mail.ugn.ac.id',
    'sarahjohnson2006@mail.ugn.ac.id',
    'sarahjohnson128@mail.ugn.ac.id',
  ],
};

// ============================================
//  Komponen HasilDitolak
// ============================================
const HasilDitolak = () => {
  const navigation = useNavigation<HasilDitolakNavigationProp>();
  const [isClaimDropdownOpen, setIsClaimDropdownOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(
    DUMMY_USER_DATA.emailOptions[0]
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsClaimDropdownOpen(!isClaimDropdownOpen);
  };

  const handleKlaimAkun = () => {
    if (!selectedEmail) {
      Alert.alert('Peringatan', 'Pilih salah satu email untuk klaim akun.');
      return;
    }
    
    // Tampilkan modal sukses dan tutup dropdown
    setIsClaimDropdownOpen(false);
    setIsModalVisible(true);
    // Lakukan panggilan API klaim di sini (jika ada)
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

        {/* Bagian 'Selamat!' yang dipisah */}
        <View style={localStyles.welcomeSection}>
          <Text style={localStyles.welcomeTitle}>Mohon Maaf!</Text>
        </View>

        {/* Status Konfirmasi Card - Teks Kelulusan */}
          <View> 
            <LinearGradient
                    colors={[COLORS.ACCENT_LIGHT, COLORS.ACCENT_BG]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={localStyles.confirmationCard}
                    >
            {/* Bagian utama teks kelulusan */}
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
          

          {/* Detail Pendaftar Card */}
          <View style={localStyles.detailCard}>
            <View style={localStyles.profileHeader}>
              <Image
                source={require('../../assets/images/profile 3.png')}
                style={localStyles.profilePic}
                resizeMode="cover"
              />
              <View>
                <Text style={localStyles.detailName}>
                  {DUMMY_USER_DATA.name}
                </Text>
                <Text style={localStyles.detailNumber}>
                  Nomor Peserta: {DUMMY_USER_DATA.nomorPeserta}
                </Text>
              </View>
            </View>

            {/* Detail Program & Status */}
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailLabel}>Program :</Text>
              <Text style={localStyles.detailValue}>
                {DUMMY_USER_DATA.program}
              </Text>
            </View>
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailLabel}>Tanggal lahir :</Text>
              <Text style={localStyles.detailValue}>
                {DUMMY_USER_DATA.tanggalLahir}
              </Text>
            </View>
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailLabel}>Status :</Text>
              <Text style={localStyles.statusDiterima}>
                {DUMMY_USER_DATA.status}
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
    backgroundColor: COLORS.ACCENT_LIGHT, // Emas
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


  // Confirmation Card - Selamat
  confirmationCard: {
    //backgroundColor: COLORS.ACCENT_BG,
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
  
  // Gaya untuk memisahkan 'Selamat!'
  welcomeSection: {
    // Styling untuk container Selamat!
    backgroundColor: COLORS.ERROR_DARK,
    paddingHorizontal: 100,
    paddingVertical: 10,
    marginTop: 40, 
    borderWidth: 2,
    borderColor: '#000', // Menggunakan konstanta warna emas
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.WHITE, // Warna teks putih
    textAlign: 'center',
  },
  lulusSection: {
    // Container untuk teks kelulusan agar terpisah
    marginBottom: 10, // Jarak dari teks kelulusan ke nama universitas
  },

  // confirmationTitle yang asli sudah dihapus dan diganti dengan welcomeTitle
  confirmationText: {
    fontSize: 14,
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
    lineHeight: 20,
    // marginBottom: 5, // Dihapus karena sudah ada margin di lulusSection
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

  // Detail Pendaftar Card
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
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 2,
    borderColor: COLORS.ACCENT_LIGHT,
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

  // Tombol Kembali ke Home
  homeButton: {
    //backgroundColor: COLORS.SUCCESS_GREEN,
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