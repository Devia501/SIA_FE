// src/screens/pendaftar/StatusPendaftaranDone.tsx

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
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';

// ✅ Import Service dan Interface Profile
import { registrationService, publicService, Profile } from '../../services/apiService';

type StatusPendaftaranDoneNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'StatusPendaftaranDone'
>;

const COLORS = {
  PRIMARY_DARK: '#015023', 
  ACCENT_LIGHT: '#DABC4E', 
  ACCENT_BG: '#F5EFD3',    
  WHITE: '#FFFFFF',
  SUCCESS_LIGHT: '#D4F1E3', 
  ERROR_DARK: '#BE0414',   
  ABU: '#999999',
};

const DOC_ID = {
    KTP: 1, AKTA: 2, KK: 3, IJAZAH: 4, TRANSKRIP: 5, SKL: 6, PRESTASI: 7,
};

const StatusPendaftaranDone = () => {
  const navigation = useNavigation<StatusPendaftaranDoneNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  
  // 📌 State untuk Profile dan Nama Program
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [programName, setProgramName] = useState<string>('');

  const [documentStatus, setDocumentStatus] = useState({
    dataDiri: false,
    dataAlamat: false,
    dataOrangTua: false,
    dataAkademik: false,
    dataPrestasi: false, 
    pembayaran: true,
  });

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
        // 1. ⚡ PERBAIKAN: Ambil Profile dan Program (Kode lama anda melewatkan ini)
        const [profile, documents, guardians, achievements, programs] = await Promise.all([
            registrationService.getProfile(),      // Ambil Profile
            registrationService.getDocuments(),
            registrationService.getGuardians(),
            registrationService.getAchievements(),
            publicService.getActivePrograms(),     // Ambil Daftar Program untuk dicocokkan
        ]);

        setProfileData(profile);

        // 2. ⚡ PERBAIKAN: Cari Nama Program Studi
        // Cek jika backend mengirim relasi 'program' (dari with('program'))
        if (profile.program && profile.program.name) {
             setProgramName(profile.program.name);
        } 
        // Fallback: Cari manual dari ID jika relasi tidak ada
        else if (profile.id_program) {
             const found = programs.find(p => p.id_program === profile.id_program);
             setProgramName(found ? found.name : 'Program Studi Tidak Ditemukan');
        }

        // Logic Dokumen (Tidak berubah)
        const hasDoc = (ids: number[]) => documents.some(d => ids.includes(d.id_document_type));

        setDocumentStatus({
            dataDiri: hasDoc([DOC_ID.KTP]) && hasDoc([DOC_ID.AKTA]),
            dataAlamat: hasDoc([DOC_ID.KK]),
            dataOrangTua: guardians.length > 0,
            dataAkademik: hasDoc([DOC_ID.IJAZAH, DOC_ID.SKL, DOC_ID.TRANSKRIP]),
            dataPrestasi: achievements && achievements.length > 0,
            pembayaran: true 
        });

    } catch (e: any) {
        console.error('Gagal memuat status:', e);
        // Jangan alert error jika 404 payment, tapi alert jika profile gagal
        if (e.message !== 'Request failed with status code 404') {
             Alert.alert('Error', 'Gagal memuat data pendaftaran.');
        }
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // 📌 Navigasi dengan Data Profile & Program
  const handleLihatHasil = () => {
      if (!profileData) return;

      if (profileData.registration_status === 'approved') {
          // @ts-ignore
          navigation.navigate('HasilDiterima', { profile: profileData, programName: programName });
      } else if (profileData.registration_status === 'rejected') {
          // @ts-ignore
          navigation.navigate('HasilDitolak', { profile: profileData, programName: programName });
      } else {
          Alert.alert("Info", "Hasil seleksi belum final. Status saat ini: " + profileData.registration_status);
      }
  };

  if (isLoading) {
      return (
        <SafeAreaView style={[localStyles.container, {justifyContent:'center', alignItems:'center'}]} edges={['top']}>
            <ActivityIndicator size="large" color={COLORS.ACCENT_LIGHT} />
        </SafeAreaView>
      );
  }

  return (
    <SafeAreaView style={localStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={PendaftarStyles.headerContainer}>
          <ImageBackground source={require('../../assets/images/Rectangle 52.png')} style={PendaftarStyles.waveBackground} resizeMode="cover">
            <View style={PendaftarStyles.headerContentV2}>
              <TouchableOpacity style={PendaftarStyles.backButton} onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')} style={[PendaftarStyles.navIconImage, { tintColor: COLORS.ACCENT_BG }]} resizeMode="contain"/>
              </TouchableOpacity>
              <View><Text style={localStyles.headerTitle}>Status Pendaftaran</Text></View>
            </View>
          </ImageBackground>
        </View>

        <View style={localStyles.content}>
          <View style={localStyles.statusCard}>
            <View style={localStyles.iconCircle}>
              <Image source={require('../../assets/icons/Group 13891.png')} style={localStyles.clockIcon} resizeMode="contain"/>
            </View>
            
            <Text style={localStyles.statusTitle}>Pendaftaran Berhasil</Text>
            <Text style={localStyles.statusTitle}>Silahkan lihat pengumuman!</Text>
            
            <TouchableOpacity onPress={handleLihatHasil}>
                <LinearGradient colors={[COLORS.ACCENT_LIGHT, COLORS.ACCENT_BG]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 1 }} style={localStyles.infoButton}>
                    <Text style={localStyles.infoButtonText}>Lihat Hasil Seleksi</Text>
                </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={localStyles.progressBadge}>
            <Text style={localStyles.progressText}>Progress</Text>
          </View>

          <View style={localStyles.progressContainer}>
             <View style={localStyles.stepContainer}>
              <View style={localStyles.stepWrapper}><View style={[localStyles.stepCircle, localStyles.stepCompleted]}><View style={localStyles.checkmark} /></View><Text style={localStyles.stepLabel}>Dokumen Diupload</Text></View>
              <View style={[localStyles.stepLine, localStyles.lineCompleted]} />
              <View style={localStyles.stepWrapper}><View style={[localStyles.stepCircle, localStyles.stepCompleted]}><View style={localStyles.checkmark} /></View><Text style={localStyles.stepLabel}>Konfirmasi{'\n'}Pembayaran</Text></View>
              <View style={[localStyles.stepLine, localStyles.lineCompleted]} />
              <View style={localStyles.stepWrapper}><View style={[localStyles.stepCircle, localStyles.stepCompleted]}><View style={localStyles.checkmark} /></View><Text style={localStyles.stepLabel}>Proses {'\n'}Seleksi</Text></View>
              <View style={[localStyles.stepLine, localStyles.lineCompleted]} />
              <View style={localStyles.stepWrapper}><View style={[localStyles.stepCircle, localStyles.stepCompleted]}><View style={localStyles.checkmark} /></View><Text style={[localStyles.stepLabel]}>Pengumuman Hasil</Text></View>
            </View>
          </View>

          <View style={localStyles.dokumenSection}>
            <Text style={localStyles.sectionTitle}>Dokumen di Upload</Text>
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
      <Image source={require('../../assets/images/logo-ugn.png')} style={PendaftarStyles.backgroundLogo} resizeMode="contain"/>
      
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

const DokumenStatusCard = ({ label, isActive }: { label: string; isActive: boolean }) => (
    <View style={[localStyles.dokumenCard, isActive && localStyles.dokumenCardActive]}>
        <View style={[localStyles.dokumenIcon, isActive ? localStyles.dokumenIconActive : localStyles.dokumenIconInactive]}>
            {isActive ? <View style={localStyles.checkmarkSmall} /> : <View style={localStyles.crossMark}><View style={localStyles.crossLine1} /><View style={localStyles.crossLine2} /></View>}
        </View>
        <Text style={[localStyles.dokumenText, { color: isActive ? COLORS.PRIMARY_DARK : '#666' }]}>{label}</Text>
    </View>
);

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.PRIMARY_DARK },
  nav: { bottom: 84 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.PRIMARY_DARK, left: 50 },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 100 },
  statusCard: { backgroundColor: COLORS.ACCENT_BG, borderRadius: 20, borderWidth: 2, borderColor: COLORS.ACCENT_LIGHT, padding: 25, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.PRIMARY_DARK, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  clockIcon: { width: 60, height: 60 },
  statusTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000ff', textAlign: 'center' },
  infoButton: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, marginTop: 15, borderWidth: 1, borderColor: '#000000ff' },
  infoButtonText: { fontSize: 12, color: '#000000ff', fontWeight: '600' },
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
  dokumenSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.WHITE, marginBottom: 15 },
  dokumenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  dokumenCard: { width: '48%', backgroundColor: COLORS.ACCENT_BG, borderRadius: 15, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: '#DABC4E' },
  dokumenCardActive: { backgroundColor: COLORS.ACCENT_BG },
  dokumenIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dokumenIconActive: { backgroundColor: '#2DB872' },
  dokumenIconInactive: { backgroundColor: '#BE0414' },
  checkmarkSmall: { width: 6, height: 12, borderBottomWidth: 2, borderRightWidth: 2, borderColor: COLORS.WHITE, transform: [{ rotate: '45deg' }], marginBottom: 3 },
  crossMark: { width: 12, height: 12, position: 'relative' },
  crossLine1: { position: 'absolute', width: 12, height: 2, backgroundColor: COLORS.WHITE, transform: [{ rotate: '45deg' }], top: 5 },
  crossLine2: { position: 'absolute', width: 12, height: 2, backgroundColor: COLORS.WHITE, transform: [{ rotate: '-45deg' }], top: 5 },
  dokumenText: { fontSize: 12, color: COLORS.PRIMARY_DARK, fontWeight: '600', flex: 1 },
});

export default StatusPendaftaranDone;