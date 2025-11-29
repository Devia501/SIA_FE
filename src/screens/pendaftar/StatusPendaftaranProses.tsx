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

type StatusPendaftaranProsesNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'StatusPendaftaranProses'
>;

// 📌 Konstanta Warna untuk Tema Hijau
const COLORS = {
  PRIMARY_DARK: '#015023', // Hijau Tua
  ACCENT_LIGHT: '#DABC4E', // Kuning/Emas
  ACCENT_BG: '#F5EFD3',    // Krem Terang
  WHITE: '#FFFFFF',
  SUCCESS_LIGHT: '#D4F1E3', // Hijau muda untuk dokumen active
  ERROR_DARK: '#BE0414',   // Merah untuk cross mark
  ABU: '#999999',
};

const StatusPendaftaranProses = () => {
  const navigation = useNavigation<StatusPendaftaranProsesNavigationProp>();

  // Status dokumen (true = sudah upload, false = belum upload)
  const [documentStatus] = React.useState({
    dataDiri: true,
    dataAlamat: true,
    dataOrangTua: true,
    dataAkademik: true,
    dataPrestasi: false, // Belum upload
    pembayaran: true,
  });

  return (
    // 📌 GANTI: Background container menjadi hijau gelap
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
                  // 📌 TINT ICON: Sesuaikan dengan background terang (F5EFD3)
                  style={[PendaftarStyles.navIconImage, { tintColor: COLORS.ACCENT_BG }]} 
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View>
                {/* 📌 GANTI: Warna teks header menjadi terang */}
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
                source={require('../../assets/icons/Group 13890.png')}
                style={localStyles.clockIcon}
                resizeMode="contain"
              />
            </View>
            
            <Text style={localStyles.statusTitle}>Pendaftaran Sedang</Text>
            <Text style={localStyles.statusTitle}>Di Proses</Text>
            
            <TouchableOpacity 
                onPress={() => navigation.navigate('StatusPendaftaranDone')}
            >
                <LinearGradient
                    colors={[COLORS.WHITE, COLORS.ABU]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                    style={localStyles.infoButton}
                >
                    <Text style={localStyles.infoButtonText}>Menunggu Hasil Seleksi</Text>
                </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Progress Badge */}
          <View style={localStyles.progressBadge}>
            <Text style={localStyles.progressText}>Progress</Text>
          </View>

          {/* Progress Steps */}
          <View style={localStyles.progressContainer}>
            <View style={localStyles.stepContainer}>
              {/* Step 1 - Completed */}
              <View style={localStyles.stepWrapper}>
                <View style={[localStyles.stepCircle, localStyles.stepCompleted]}>
                  <View style={localStyles.checkmark} />
                </View>
                <Text style={localStyles.stepLabel}>Dokumen Diupload</Text>
              </View>

              {/* Line 1-2 */}
              <View style={[localStyles.stepLine, localStyles.lineCompleted]} />

              {/* Step 2 - Completed */}
              <View style={localStyles.stepWrapper}>
                <View style={[localStyles.stepCircle, localStyles.stepCompleted]}>
                  <View style={localStyles.checkmark} />
                </View>
                <Text style={localStyles.stepLabel}>Konfirmasi{'\n'}Pembayaran</Text>
              </View>

              {/* Line 2-3 */}
              <View style={localStyles.stepLine} />

              {/* Step 3 - Active */}
              <View style={localStyles.stepWrapper}>
                <View style={[localStyles.stepCircle, localStyles.stepActive]}>
                  <Image
                    source={require('../../assets/icons/bxs_map.png')}
                    style={localStyles.stepIcon}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[localStyles.stepLabel]}>Proses {'\n'}Seleksi</Text>
              </View>

              {/* Line 3-4 */}
              <View style={localStyles.stepLine} />

              {/* Step 4 - Inactive */}
              <View style={localStyles.stepWrapper}>
                <View style={localStyles.stepCircle} />
                <Text style={localStyles.stepLabel}>Pengumuman Hasil</Text>
              </View>
            </View>
          </View>

          {/* Dokumen Section */}
          <View style={localStyles.dokumenSection}>
            <Text style={localStyles.sectionTitle}>Dokumen di Upload</Text>
            
            <View style={localStyles.dokumenGrid}>
              {/* Data Diri */}
              <DokumenStatusCard label="Data Diri" isActive={documentStatus.dataDiri} />
              {/* Data Alamat */}
              <DokumenStatusCard label="Data Alamat" isActive={documentStatus.dataAlamat} />
              {/* Data Orang Tua */}
              <DokumenStatusCard label="Data Orang Tua" isActive={documentStatus.dataOrangTua} />
              {/* Data Akademik */}
              <DokumenStatusCard label="Data Akademik" isActive={documentStatus.dataAkademik} />
              {/* Data Prestasi */}
              <DokumenStatusCard label="Data Prestasi" isActive={documentStatus.dataPrestasi} />
              {/* Pembayaran */}
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

// 📌 Helper Component Dokumen Status
interface DokumenStatusCardProps {
    label: string;
    isActive: boolean;
}

const DokumenStatusCard: React.FC<DokumenStatusCardProps> = ({ label, isActive }) => {
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
    color: COLORS.PRIMARY_DARK, // Teks header di background emas, jadi warna gelap
    left: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // Status Card
  statusCard: {
    backgroundColor: COLORS.ACCENT_BG, // Krem
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.ACCENT_LIGHT, // Emas
    padding: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.PRIMARY_DARK, // Hijau Tua
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  clockIcon: {
    width: 60,
    height: 60,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000ff', // Teks gelap
    textAlign: 'center',
  },
  infoButton: {
    //backgroundColor: COLORS.ACCENT_LIGHT, 
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 15,
    borderWidth: 1, // Tambahkan border
    borderColor: '#000000ff',
  },
  infoButtonText: {
    fontSize: 12,
    color: '#000000ff',
    fontWeight: '600',
  },

  // Progress Badge
  progressBadge: {
    backgroundColor: COLORS.ACCENT_LIGHT, // Emas
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginVertical: 20,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffffff',
  },

  // Progress Steps
  progressContainer: {
    marginBottom: 30,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    alignItems: 'center',
    width: 70,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2, // Tambahkan border
    borderColor: '#000000ff', // Border abu-abu
  },
  stepCompleted: {
    backgroundColor: COLORS.ACCENT_LIGHT, // Emas
    borderColor: '#000000ff',
  },
  stepActive: {
    backgroundColor: '#000000ff', // Hijau Tua
    borderColor: '#000000ff',
  },
  checkmark: {
    width: 8,
    height: 16,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#000000ff', // Checkmark gelap
    transform: [{ rotate: '45deg' }],
    marginBottom: 5,
  },
  stepIcon: {
    width: 18,
    height: 18,
    tintColor: COLORS.WHITE,
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.WHITE,
    textAlign: 'center',
    lineHeight: 12,
    marginTop: 5, // Tambahkan margin atas setelah lingkaran
  },
  stepLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: COLORS.ACCENT_LIGHT,
    zIndex: -1, 
    top: 15, 
    flex: 1, 
    marginHorizontal: 42, 
    width: '80%', 
    marginBottom: 35, 
  },
  lineCompleted: {
    backgroundColor: COLORS.ACCENT_LIGHT, // Garis selesai emas
  },

  // Dokumen Section
  dokumenSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.WHITE, // 📌 GANTI: Judul section menjadi putih
    marginBottom: 15,
  },
  dokumenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  dokumenCard: {
    width: '48%',
    backgroundColor: COLORS.ACCENT_BG,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DABC4E',
    
  },
  dokumenCardActive: {
    backgroundColor: COLORS.ACCENT_BG, 
  },
  dokumenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dokumenIconActive: {
    backgroundColor: '#2DB872', // Hijau solid untuk icon aktif
  },
  dokumenIconInactive: {
    backgroundColor: '#BE0414', // Merah solid untuk icon tidak aktif
  },
  checkmarkSmall: {
    width: 6,
    height: 12,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.WHITE,
    transform: [{ rotate: '45deg' }],
    marginBottom: 3,
  },
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
  dokumenText: {
    fontSize: 12,
    color: COLORS.PRIMARY_DARK,
    fontWeight: '600',
    flex: 1,
  },
});

export default StatusPendaftaranProses;