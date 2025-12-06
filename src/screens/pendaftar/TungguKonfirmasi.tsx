import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';

// Service
import { registrationService, Profile, Document } from '../../services/apiService';

type TungguKonfirmasiNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'TungguKonfirmasi'
>;

// 東 STYLE ASLI ANDA
const COLORS = {
  PRIMARY_DARK: '#015023', 
  ACCENT_LIGHT: '#DABC4E', 
  ACCENT_BG: '#F5EFD3',    
  WHITE: '#FFFFFF',
  SUCCESS_LIGHT: '#D4F1E3',
  ERROR_DARK: '#BE0414',   
  ABU: '#999999',
};

// ID Dokumen untuk pengecekan simple
const DOC_ID = {
    KTP: 1, AKTA: 2, KK: 3, IJAZAH: 4, TRANSKRIP: 5, SKL: 6, PRESTASI: 7,
};

const TungguKonfirmasi = () => {
  const navigation = useNavigation<TungguKonfirmasiNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);

  // State status simple (Ada/Tidak)
  const [documentStatus, setDocumentStatus] = useState({
    dataDiri: false,
    dataAlamat: false,
    dataOrangTua: false,
    dataAkademik: false,
    dataPrestasi: false,
    pembayaran: false,
  });

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
        // 1. Panggil semua API secara paralel (termasuk getAchievements yang sudah ada di service Anda)
        const [profile, documents, guardians, achievements] = await Promise.all([
            registrationService.getProfile(),
            registrationService.getDocuments(),
            registrationService.getGuardians(),
            registrationService.getAchievements(), // ✅ Ini memanggil endpoint /registration/achievements
        ]);

        console.log('Achievements Data:', achievements); // Debugging: Cek isi data di console

        // 2. Helper untuk cek dokumen umum (KTP, KK, Ijazah, dll)
        const hasDoc = (ids: number[]) => documents.some(d => ids.includes(d.id_document_type));

        // 3. Update State
        setDocumentStatus({
            // Data Diri: Cek KTP (1) & Akta (2) di tabel documents
            dataDiri: hasDoc([DOC_ID.KTP]) && hasDoc([DOC_ID.AKTA]),
            
            // Data Alamat: Cek KK (3) di tabel documents
            dataAlamat: hasDoc([DOC_ID.KK]),
            
            // Data Orang Tua: Cek array guardians tidak kosong
            dataOrangTua: guardians.length > 0,
            
            // Data Akademik: Cek Ijazah(4)/SKL(6)/Transkrip(5) di tabel documents
            dataAkademik: hasDoc([DOC_ID.IJAZAH, DOC_ID.SKL, DOC_ID.TRANSKRIP]),
            
            // ✅ DATA PRESTASI:
            // Cek apakah array achievements (dari ApplicantAchievement) memiliki isi
            dataPrestasi: achievements && achievements.length > 0,
            
            // Pembayaran: Cek status registrasi
            pembayaran: profile.registration_status === 'submitted'
        });

    } catch (e) {
        console.error('Gagal memuat data:', e);
        // Opsional: Alert error jika perlu
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  if (isLoading) {
      return (
        <SafeAreaView style={localStyles.container} edges={['top']}>
            <ActivityIndicator size="large" color={COLORS.ACCENT_LIGHT} style={{flex: 1}}/>
        </SafeAreaView>
      )
  }

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
                  style={[PendaftarStyles.navIconImage, { tintColor: COLORS.ACCENT_BG }]} 
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View>
                <Text style={localStyles.headerTitle}>Status Pendaftaran</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={localStyles.content}>
          {/* Status Card */}
          <View style={localStyles.statusCard}>
            <View style={localStyles.iconCircle}>
              <Image
                source={require('../../assets/icons/Group 13890.png')} // Icon Jam (Pending)
                style={localStyles.clockIcon}
                resizeMode="contain"
              />
            </View>
            
            <Text style={localStyles.statusTitle}>Data Sedang Dikonfirmasi</Text>
            
            <View>
                <LinearGradient
                    colors={[COLORS.ACCENT_LIGHT, COLORS.ACCENT_BG]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                    style={localStyles.infoButton}
                >
                    <Text style={localStyles.infoButtonText}>Menunggu Data Dikonfirmasi</Text>
                </LinearGradient>
            </View>
          </View>

          {/* Progress Badge */}
          <View style={localStyles.progressBadge}>
            <Text style={localStyles.progressText}>Progress</Text>
          </View>

          {/* Progress Steps (Step 2 Active) */}
          <View style={localStyles.progressContainer}>
            <View style={localStyles.stepContainer}>
              {/* Step 1 - Completed */}
              <View style={localStyles.stepWrapper}>
                <View style={[localStyles.stepCircle, localStyles.stepCompleted]}>
                  <View style={localStyles.checkmark} />
                </View>
                <Text style={localStyles.stepLabel}>Dokumen Diupload</Text>
              </View>

              <View style={[localStyles.stepLine, localStyles.lineCompleted]} />

              {/* Step 2 - Active (Konfirmasi) */}
              <View style={localStyles.stepWrapper}>
                <View style={[localStyles.stepCircle, localStyles.stepActive]}>
                  <Image
                    source={require('../../assets/icons/bxs_map.png')}
                    style={localStyles.stepIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={localStyles.stepLabel}>Konfirmasi{'\n'}Data</Text>
              </View>

              <View style={localStyles.stepLine} />

              {/* Step 3 - Inactive */}
              <View style={localStyles.stepWrapper}>
                <View style={localStyles.stepCircle} />
                <Text style={localStyles.stepLabel}>Proses {'\n'}Seleksi</Text>
              </View>

              <View style={localStyles.stepLine} />

              {/* Step 4 - Inactive */}
              <View style={localStyles.stepWrapper}>
                <View style={localStyles.stepCircle} />
                <Text style={localStyles.stepLabel}>Pengumuman Hasil</Text>
              </View>
            </View>
          </View>

          {/* Dokumen Section - Simple List (Tanpa Dropdown/Error) */}
          <View style={localStyles.dokumenSection}>
            <Text style={localStyles.sectionTitle}>Status Upload Dokumen</Text>
            
            <View style={localStyles.dokumenGrid}>
              <DokumenStatusCard label="Data Diri" isActive={documentStatus.dataDiri} />
              <DokumenStatusCard label="Data Alamat" isActive={documentStatus.dataAlamat} />
              <DokumenStatusCard label="Data Orang Tua" isActive={documentStatus.dataOrangTua} />
              <DokumenStatusCard label="Data Akademik" isActive={documentStatus.dataAkademik} />
              <DokumenStatusCard label="Data Prestasi" isActive={documentStatus.dataPrestasi} />
              <DokumenStatusCard label="Pembayaran" isActive={documentStatus.pembayaran} />
            </View>
          </View>
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
        <TouchableOpacity style={PendaftarStyles.navItem} onPress={() => navigation.navigate('PendaftarDashboard')}>
          <Image source={require('../../assets/icons/material-symbols_home-rounded.png')} style={PendaftarStyles.navIconImage} resizeMode="contain"/>
        </TouchableOpacity>

        <TouchableOpacity style={PendaftarStyles.navItem} onPress={() => navigation.navigate('TataCara')}>
          <Image source={require('../../assets/icons/clarity_form-line.png')} style={PendaftarStyles.navIconImage} resizeMode="contain"/>
        </TouchableOpacity>

        <TouchableOpacity style={[PendaftarStyles.navItem]}>
          <View style={PendaftarStyles.navItemActive}>
            <Image source={require('../../assets/icons/fluent_shifts-activity.png')} style={PendaftarStyles.navIconImage} resizeMode="contain"/>
            <Text style={PendaftarStyles.navTextActive}>Status</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={PendaftarStyles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../../assets/icons/ix_user-profile-filled.png')} style={PendaftarStyles.navIconImage} resizeMode="contain"/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Helper Component (Style Asli dari file StatusPendaftaranDone/Proses)
const DokumenStatusCard = ({ label, isActive }: { label: string; isActive: boolean }) => {
    return (
        <View style={[
            localStyles.dokumenCard,
            isActive && localStyles.dokumenCardActive
        ]}>
            <View style={[
                localStyles.dokumenIcon,
                isActive ? localStyles.dokumenIconActive : localStyles.dokumenIconInactive
            ]}>
                {isActive ? (
                    <View style={localStyles.checkmarkSmall} />
                ) : (
                    // 東 KEMBALIKAN SILANG CSS DISINI
                    <View style={localStyles.crossMark}>
                        <View style={localStyles.crossLine1} />
                        <View style={localStyles.crossLine2} />
                    </View>
                )}
            </View>
            <Text style={[localStyles.dokumenText, { color: isActive ? COLORS.PRIMARY_DARK : '#666' }]}>{label}</Text>
        </View>
    );
};

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.PRIMARY_DARK },
  nav: { bottom: 84 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.PRIMARY_DARK, left: 50 },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 100 },
  
  // Card Styles
  statusCard: { backgroundColor: COLORS.ACCENT_BG, borderRadius: 20, borderWidth: 2, borderColor: COLORS.ACCENT_LIGHT, padding: 25, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.PRIMARY_DARK, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  clockIcon: { width: 60, height: 60 },
  statusTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000ff', textAlign: 'center' },
  infoButton: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, marginTop: 15, borderWidth: 1, borderColor: '#000000ff' },
  infoButtonText: { fontSize: 12, color: '#000000ff', fontWeight: '600' },

  // Progress
  progressBadge: { backgroundColor: COLORS.ACCENT_LIGHT, borderRadius: 15, paddingVertical: 6, paddingHorizontal: 20, alignSelf: 'flex-start', marginVertical: 20 },
  progressText: { fontSize: 14, fontWeight: 'bold', color: '#ffffffff' },
  progressContainer: { marginBottom: 30 },
  stepContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepWrapper: { alignItems: 'center', width: 70 },
  stepCircle: { width: 30, height: 30, borderRadius: 20, backgroundColor: '#E8E8E8', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 2, borderColor: '#000000ff' },
  stepCompleted: { backgroundColor: COLORS.ACCENT_LIGHT, borderColor: '#000000ff' },
  stepActive: { backgroundColor: '#000000ff', borderColor: '#000000ff' },
  checkmark: { width: 8, height: 16, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#000000ff', transform: [{ rotate: '45deg' }], marginBottom: 5 },
  stepIcon: { width: 18, height: 18, tintColor: COLORS.WHITE },
  stepLabel: { fontSize: 10, color: COLORS.WHITE, textAlign: 'center', lineHeight: 12, marginTop: 5 },
  stepLine: { position: 'absolute', height: 3, backgroundColor: COLORS.ACCENT_LIGHT, zIndex: -1, top: 15, flex: 1, marginHorizontal: 42, width: '80%', marginBottom: 35 },
  lineCompleted: { backgroundColor: COLORS.ACCENT_LIGHT },

  // Dokumen Grid (Style Asli)
  dokumenSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.WHITE, marginBottom: 15 },
  dokumenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  dokumenCard: { width: '48%', backgroundColor: COLORS.ACCENT_BG, borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: '#DABC4E' },
  dokumenCardActive: { backgroundColor: COLORS.ACCENT_BG },
  dokumenIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dokumenIconActive: { backgroundColor: '#2DB872' },
  dokumenIconInactive: { backgroundColor: '#ff0000ff' }, 
  checkmarkSmall: { width: 6, height: 12, borderBottomWidth: 2, borderRightWidth: 2, borderColor: COLORS.WHITE, transform: [{ rotate: '45deg' }], marginBottom: 3 },
  dokumenText: { fontSize: 12, color: COLORS.PRIMARY_DARK, fontWeight: '600', flex: 1 },
  crossMark: {
    width: 12,
    height: 12,
    position: 'relative',
  },
  crossLine1: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: COLORS.WHITE,
    transform: [{ rotate: '45deg' }],
    top: 5,
  },
  crossLine2: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: COLORS.WHITE,
    transform: [{ rotate: '-45deg' }],
    top: 5,
  },
});

export default TungguKonfirmasi;