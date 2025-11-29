import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';

type InformasiPentingNavigationProp = NativeStackNavigationProp<PendaftarStackParamList, 'InformasiPenting'>;

const InformasiPentingScreen = () => {
  const navigation = useNavigation<InformasiPentingNavigationProp>();

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
                <Text style={PendaftarStyles.headerTitleV2}>Informasi Penting</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={PendaftarStyles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              <Text style={styles.numberText}>1. </Text>
              Satu NIK hanya dapat dipakai untuk membuat 1 (satu) akun pendaftaran, pastikan Saudara memasukkan NIK yang benar, bukan Nomor Kartu Keluarga.
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.numberText}>2. </Text>
              Saudara wajib mempunyai email untuk membuat akun Peserta Seleksi Calon Mahasiswa Baru di Universitas Global Nusantara.
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.numberText}>3. </Text>
              Email yang dipergunakan untuk membuat akun merupakan email personal yang berstatus aktif karena semua komunikasi berkaitan dengan proses seleksi akan dilakukan melalui email tersebut.
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.numberText}>4. </Text>
              Satu alamat email hanya dapat dipergunakan untuk 1 (satu) kali pembuatan akun Peserta Seleksi Calon Mahasiswa Baru di Universitas Global Nusantara.
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.numberText}>5. </Text>
              Satu akun pendaftaran hanya dapat digunakan untuk mendaftar pada 1 (satu) intake pada 1 (satu) periode pendaftaran yang sama. Saudara dapat menggunakan akun yang sama untuk mendaftar di intake yang berbeda, tetapi pada periode pendaftaran yang berbeda.
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.numberText}>6. </Text>
              Password adalah kunci yang dipergunakan untuk mengakses akun Peserta Seleksi Calon Mahasiswa Baru di Universitas Global Nusantara. Password terdiri dari (minimal) 6 digit angka dan/atau huruf dan/atau kombinasi keduanya.
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.numberText}>7. </Text>
              Proses pengisian data pendaftaran dan unggah dokumen dapat dilakukan secara bertahap selama belum dilakukan penguncian data pendaftaran.
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.numberText}>8. </Text>
              Apabila ada kendala dalam pengisian, silakan menghubungi WA : 08xx-xxxx-xxxx atau email ke ugn@ugn.ac.id atau program studi tujuan Saudara.
            </Text>
          </View>
          
          <TouchableOpacity style={styles.daftarButton}
          onPress={() => navigation.navigate('PendaftaranMahasiswa')}>
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
  infoCard: {
    backgroundColor: '#F5E6D3',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#000',
    lineHeight: 18,
    marginBottom: 10,
    textAlign: 'left',
  },
  numberText: {
    fontWeight: 'bold',
    color: '#000',
  },
  daftarButton: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 40, 
    alignSelf: 'center',
    width: '65%',
  },
  daftarButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default InformasiPentingScreen;