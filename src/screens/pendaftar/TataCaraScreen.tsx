import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';

type TataCaraNavigationProp = NativeStackNavigationProp<PendaftarStackParamList, 'TataCara'>;

// 🔑 LOGIKA STATUS DARI DASHBOARD (SIMULASI API)
interface Profile {
  registration_status?: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected';
}
type RegistrationStatus = Profile['registration_status'];

const registrationService = {
  // Mock function: Ganti dengan implementasi API yang sebenarnya dari file apiService Anda
  getProfile: async (): Promise<Profile> => {
    // Simulasi status belum mendaftar (kosongan)
    throw new Error('404'); // <--- GANTI INI: Simulasi status 'kosongan'
    // return { registration_status: 'submitted' }; 
  }
};
// END LOGIKA STATUS MOCK

const TataCaraScreen = () => {
  const navigation = useNavigation<TataCaraNavigationProp>();
  
  // 🔑 STATUS STATE BARU
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  // 泊 FUNGSI NAVIGASI STATUS DINAMIS
  const handleStatusNavigation = useCallback(async () => {
    setIsStatusLoading(true);
    try {
        const profile = await registrationService.getProfile();
        const status = profile.registration_status;
  
    if (!status) { 
        navigation.navigate('StatusPendaftaranAwal' as any);
    } else if (status === 'submitted') {
        navigation.navigate('TungguKonfirmasi' as any);
    } else {
        navigation.navigate('StatusPendaftaranDone' as any);
    }
    } catch (e: any) { // Pastikan tipe e adalah any
        
        // ✅ PERUBAHAN INTI: Cek jika pesan error mengandung '404'
        const isExpectedError = (e.message && e.message.includes('404')) || 
                                (e.message && e.message.includes('Profil tidak ditemukan'));

        if (!isExpectedError) {
            // Cetak error ke konsol hanya jika ini BUKAN error 404/Profil tidak ditemukan yang disimulasikan
            console.error("Gagal cek status pendaftaran:", e);
        }

        // Navigasi ke StatusPendaftaranAwal (ini yang menangani status 'kosongan')
        navigation.navigate('StatusPendaftaranAwal' as any);
    } finally {
        setIsStatusLoading(false);
    }
  }, [navigation]);

  return (
    <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={PendaftarStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/Rectangle 58.png')}
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
              
              <View style={PendaftarStyles.headerTitleContainerV2}>
                <Text style={PendaftarStyles.headerTitleV2}>Tata Cara Pendaftaran</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={PendaftarStyles.content}>
          <View style={styles.stepsGrid}>
            <View style={styles.row}>
              <View style={styles.stepCard}>
                <View style={[styles.iconCircle, styles.iconGreen]}>
                  <Image
                    source={require('../../assets/icons/mingcute_location-3-fill.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.cardTitle, styles.cardTitleWhite]}>Membuat akun pendaftaran</Text>
              </View>

              <View style={styles.arrowHorizontal}>
                <Image
                    source={require('../../assets/icons/entypo_flow-line.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
              </View>

              <View style={[styles.stepCard, styles.cardWhite]}>
                <View style={[styles.iconCircle, styles.iconGreen]}>
                  <Image
                    source={require('../../assets/icons/material-symbols_mail.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.cardTitle, styles.cardTitleBlack]}>Memperoleh email verifikasi akun pendaftaran</Text>
              </View>
            </View>

            <View style={styles.arrowDownContainer}>
              <Image
                source={require('../../assets/icons/fluent_arrow-step-in-16-filled.png')}
                style={PendaftarStyles.navIconImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.stepCard, styles.cardWhite]}>
                <View style={[styles.iconCircle, styles.iconGreen]}>
                  <Image
                    source={require('../../assets/icons/fluent_payment-20-filled.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.cardTitle, styles.cardTitleBlack]}>Membayar biaya pendaftaran</Text>
              </View>

              <View style={styles.arrowHorizontal}>
                <Image
                    source={require('../../assets/icons/entypo_flow-line.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
              </View>

              <View style={[styles.stepCard, styles.cardWhite]}>
                <View style={[styles.iconCircle, styles.iconGreen]}>
                  <Image
                    source={require('../../assets/icons/material-symbols_upload-rounded.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.cardTitle, styles.cardTitleBlack, styles.smallText]}>Log in untuk memilih jalur, prodi tujuan, dan melengkapi data serta mengunggah dokumen</Text>
              </View>
            </View>

            <View style={styles.arrowDownContainer1}>
              <Image
                source={require('../../assets/icons/fluent_arrow-step-in-16-filled.png')}
                style={PendaftarStyles.navIconImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.stepCard, styles.cardWhite]}>
                <View style={[styles.iconCircle, styles.iconGreen]}>
                  <Image
                    source={require('../../assets/icons/Group.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.cardTitle, styles.cardTitleBlack]}>Verifikasi dokumen secara online oleh prodi dan DPP</Text>
              </View>

              <View style={styles.arrowHorizontal}>
                <Image
                    source={require('../../assets/icons/entypo_flow-line.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
              </View>

              <View style={[styles.stepCard, styles.cardWhite]}>
                <View style={[styles.iconCircle, styles.iconGreen]}>
                  <Image
                    source={require('../../assets/icons/solar_cup-bold.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.cardTitle, styles.cardTitleBlack]}>Tes Substansif/ {'\n'} Seleksi oleh Prodi</Text>
              </View>
            </View>

            <View style={styles.curvedArrowContainer}>
              <Image
                source={require('../../assets/icons/Arrow 1.png')}
                style={styles.curvedArrowIcon}
                resizeMode="contain"
              />
            </View>

            <View style={styles.finalStepContainer}>
              <View style={[styles.stepCard, styles.cardGold, styles.finalCard]}>
                <View style={[styles.iconCircle, styles.iconWhite]}>
                  <Image
                    source={require('../../assets/icons/Exclude.png')}
                    style={PendaftarStyles.navIconImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={[styles.cardTitle, styles.cardTitleBlack]}>Pengumuman {'\n'} Hasil Seleksi</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.daftarButton}
          onPress={() => navigation.navigate('InformasiPenting' as any)}>
            <LinearGradient
                colors={['#DABC4E', '#F5EFD3']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.daftarButton}
              >
                <Text style={styles.daftarButtonText}>Daftar</Text>
              </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Bottom Nav Section */}
        <View style={[PendaftarStyles.bottomNav, styles.nav]}>
          <TouchableOpacity style={PendaftarStyles.navItem}
          onPress={() => navigation.navigate('PendaftarDashboard')}>
            <Image
                  source={require('../../assets/icons/material-symbols_home-rounded.png')}
                  style={PendaftarStyles.navIconImage}
                  resizeMode="contain"
                />
          </TouchableOpacity>

          <TouchableOpacity style={PendaftarStyles.navItem}>
            <View style={PendaftarStyles.navItemActive}>
              <Image
                  source={require('../../assets/icons/clarity_form-line.png')}
                  style={PendaftarStyles.navIconImage}
                  resizeMode="contain"
                />
              <Text style={PendaftarStyles.navTextActive}>Daftar</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={PendaftarStyles.navItem}
            onPress={handleStatusNavigation} 
            disabled={isStatusLoading}
          >
            {isStatusLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Image
                source={require('../../assets/icons/fluent_shifts-activity.png')}
                style={PendaftarStyles.navIconImage}
                resizeMode="contain"
              />
            )}
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
      </ScrollView>

      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  nav: {
    bottom:20.5,
  },
  stepsGrid: {
    marginTop: 22,
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    position: 'relative',
  },
  cardWhite: {
    backgroundColor: '#F5E6D3',
  },
  cardGold: {
    backgroundColor: '#D4AF37',
  },
  iconCircle: {
    bottom: 32,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: '#000',
    opacity:0.9,
  },
  iconGreen: {
    backgroundColor: '#FFF',
  },
  iconWhite: {
    backgroundColor: '#FFF',
  },
  cardTitle: {
    fontSize: 12,
    bottom: 12,
    color: '#ffffffff',
    textAlign: 'center',
    marginTop: -20,
  },
  cardTitleWhite: {
    color: '#ffffffff',
  },
  cardTitleBlack: {
    color: '#000',
  },
  smallText: {
    fontSize: 9,
    lineHeight: 12,
  },
  arrowHorizontal: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  arrowDownContainer: {
    alignItems: 'flex-start',
    paddingLeft: 270,
    marginVertical: 5,
  },
  arrowDownContainer1: {
    alignItems: 'flex-start',
    paddingLeft: 95,
    marginVertical: 5,
  },
  arrowDownText: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  curvedArrowContainer: {
    alignItems: 'flex-end',
    paddingRight: 2,
    marginVertical: 12,
  },
  curvedArrowIcon: {
    width: 70,
    height: 70,
  },
  
  finalStepContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  finalCard: {
    width: '60%',
  },
  daftarButton: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 7,
    marginBottom: 50, 
    alignSelf: 'center',
    width: '60%',
  },
  daftarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
});

export default TataCaraScreen;