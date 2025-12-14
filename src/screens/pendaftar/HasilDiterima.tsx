// src/screens/pendaftar/HasilDiterima.tsx

import React, { useState, useMemo } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';
import { Profile } from '../../services/apiService'; 

// Aktifkan LayoutAnimation untuk Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// 📌 DEFINISI TIPE PARAMETER
type HasilScreenParams = {
  HasilDiterima: {
    profile: Profile;
    programName: string;
  };
};

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
// 東 Komponen Modal
// ============================================
interface ClaimSuccessModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ClaimSuccessModal: React.FC<ClaimSuccessModalProps> = ({ isVisible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={localStyles.centeredView}>
        <LinearGradient
          colors={[COLORS.ACCENT_LIGHT, COLORS.ACCENT_BG]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={localStyles.modalView}
        >
          <View style={localStyles.modalIconCircle}>
            <Image
              source={require('../../assets/icons/Group 13892.png')} 
              style={localStyles.modalIcon}
              resizeMode="contain"
            />
          </View>
          
          <Text style={localStyles.modalTitle}>Klaim Akun Berhasil</Text>
          <Text style={localStyles.modalText}>
            Silahkan lihat email anda untuk
          </Text>
          <Text style={localStyles.modalText}>
            informasi lebih lanjut!
          </Text>
          
          <TouchableOpacity onPress={onClose}>
            <LinearGradient
              colors={[COLORS.ACCENT_LIGHT, COLORS.ACCENT_BG]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={localStyles.modalButtonOk}
            >
              <Text style={localStyles.modalButtonTextOk}>OK</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};

// ============================================
//  Komponen HasilDiterima
// ============================================
const HasilDiterima = () => {
  const navigation = useNavigation<NativeStackNavigationProp<PendaftarStackParamList>>();
  
  // 📌 FIX: Gunakan tipe RouteProp manual
  const route = useRoute<RouteProp<HasilScreenParams, 'HasilDiterima'>>();
  
  // Ambil Data dari Params
  const profile = route.params?.profile;
  const programName = route.params?.programName || 'Program Studi';

  // ✅ UseMemo untuk Email
  const generatedEmails = useMemo(() => {
    const baseName = profile?.full_name?.toLowerCase().replace(/\s+/g, '') || 'mahasiswa';
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 1000);
    
    return [
      `${baseName}@mail.ugn.ac.id`,
      `${baseName}${year}@mail.ugn.ac.id`,
      `${baseName}${randomNum}@mail.ugn.ac.id`,
    ];
  }, [profile]); 

  const [isClaimDropdownOpen, setIsClaimDropdownOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(generatedEmails[0]);
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsClaimDropdownOpen(!isClaimDropdownOpen);
  };

  const handleKlaimAkun = () => {
    if (!selectedEmail) {
      Alert.alert('Peringatan', 'Pilih salah satu email untuk klaim akun.');
      return;
    }
    setIsClaimDropdownOpen(false);
    setIsModalVisible(true);
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

        {/* Bagian 'Selamat!' */}
        <View style={localStyles.welcomeSection}>
          <Text style={localStyles.welcomeTitle}>Selamat! 🎉</Text>
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
                Anda dinyatakan <Text style={localStyles.boldText}>lulus seleksi</Text>
                {'\n'}pendaftaran mahasiswa baru
                </Text>
            </View>
            
            <Text style={localStyles.universityText}>
              Universitas Global Nusantara
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
                <Text style={localStyles.detailName}>
                  {profile?.full_name || 'Nama Pendaftar'}
                </Text>
                <Text style={localStyles.detailNumber}>
                  Nomor Peserta: {profile?.registration_number || '-'}
                </Text>
              </View>
            </View>

            {/* Detail Program & Status */}
            <View style={localStyles.detailRow}>
              <Text style={localStyles.detailLabel}>Program :</Text>
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
                Diterima
              </Text>
            </View>
          </View>

          <View style={localStyles.progressBadge}>
            <Text style={localStyles.progressText}>Reminders</Text>
          </View>

          {/* 東 DROPDOWN: Klaim Akun Mahasiswa */}
          <View style={localStyles.dropdownContainer}>
            <TouchableOpacity
              style={localStyles.dropdownHeader}
              onPress={toggleDropdown}
              activeOpacity={0.8}
            >
              <Image
                source={require('../../assets/icons/Exclude.png')}
                style={localStyles.notificationIcon}
                resizeMode="contain"
              />
              <Text style={localStyles.dropdownHeaderText}>
                Klik Untuk Klaim Akun Mahasiswa
              </Text>
              <Image
                source={require('../../assets/icons/Polygon 4.png')}
                style={[
                  localStyles.dropdownArrow,
                  isClaimDropdownOpen && localStyles.dropdownArrowRotated,
                ]}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Dropdown Content */}
            {isClaimDropdownOpen && (
              <View style={localStyles.dropdownContent}>
                <Text style={localStyles.emailInstruction}>
                  @Email Universitas
                </Text>
                <Text style={localStyles.emailSubInstruction}>
                  Silakan pilih email universitas yang ingin Anda gunakan.
                </Text>

                {/* Opsi Email Radio Button */}
                <View style={localStyles.statusCard}>
                {generatedEmails.map((email, index) => (
                  <TouchableOpacity
                    key={index}
                    style={localStyles.emailOption}
                    onPress={() => setSelectedEmail(email)}
                    activeOpacity={0.7}
                  >
                    <View style={localStyles.radioOuter}>
                      {selectedEmail === email && (
                        <View style={localStyles.radioInner} />
                      )}
                    </View>
                    <Text style={localStyles.emailOptionText}>{email}</Text>
                  </TouchableOpacity>
                ))}
                </View>

                {/* Tombol Klaim */}
                <View style={localStyles.buttonRow}>
                  <TouchableOpacity style={localStyles.buttonCancel}
                  onPress={() => setIsClaimDropdownOpen(false)}>
                    <Text style={localStyles.buttonCancelText}>
                      Clear Choice
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={localStyles.buttonConfirm}
                    onPress={handleKlaimAkun}
                  >
                    <Text style={localStyles.buttonConfirmText}>
                      Konfirmasi
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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

      {/* Panggil Komponen Modal */}
      <ClaimSuccessModal 
        isVisible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
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
    backgroundColor: COLORS.SUCCESS_GREEN,
    paddingHorizontal: 100,
    paddingVertical: 20,
    marginTop: 40, 
    borderWidth: 2,
    borderColor: COLORS.ACCENT_LIGHT,
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
    fontSize: 16,
    color: COLORS.TEXT_DARK,
    textAlign: 'center',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
  },
  universityText: {
    fontSize: 16,
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
    color: COLORS.SUCCESS_GREEN,
  },
  dropdownContainer: {
    width: '100%',
    backgroundColor: COLORS.ACCENT_BG,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DABC4E',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: COLORS.ACCENT_BG,
    borderRadius: 15,
  },
  notificationIcon: {
    width: 16,
    height: 16,
    tintColor: COLORS.TEXT_DARK,
    marginRight: 10,
  },
  dropdownHeaderText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.TEXT_DARK,
    lineHeight: 18,
  },
  dropdownArrow: {
    width: 20,
    height: 20,
    marginLeft: 10,
  },
  dropdownArrowRotated: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownContent: {
    paddingHorizontal: 15,
    paddingBottom: 15,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: COLORS.WHITE,
    backgroundColor: COLORS.ACCENT_BG,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  emailInstruction: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.PRIMARY_DARK,
    marginTop: 5,
    marginLeft: 4,
  },
  emailSubInstruction: {
    fontSize: 10,
    color: '#666',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 6,
  },
  statusCard: {
    backgroundColor: '#DABC4E', 
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.ACCENT_LIGHT, 
    padding: 12,
    alignItems: 'flex-start',
  },
  emailOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#000',
  },
  emailOptionText: {
    fontSize: 14,
    color: COLORS.TEXT_DARK,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 10,
    marginTop: 15,
  },
  buttonCancel: {
    backgroundColor: COLORS.ERROR_DARK,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonCancelText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
  buttonConfirm: {
    backgroundColor: COLORS.SUCCESS_GREEN,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonConfirmText: {
    fontSize: 14,
    color: COLORS.WHITE,
    fontWeight: 'bold',
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  modalView: {
    margin: 20,
    borderRadius: 15,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    borderWidth: 2,
    borderColor: '#000',
  },
  modalIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalIcon: {
    width: 80,
    height: 80,
  },
  modalTitle: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_DARK,
  },
  modalText: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.TEXT_DARK,
    lineHeight: 20,
  },
  modalButtonOk: {
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 30,
    elevation: 2,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#000',
  },
  modalButtonTextOk: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default HasilDiterima;