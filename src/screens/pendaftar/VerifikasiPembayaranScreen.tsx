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

type VerifikasiPembayaranNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'VerifikasiPembayaran'
>;

const VerifikasiPembayaranScreen = () => {
  const navigation = useNavigation<VerifikasiPembayaranNavigationProp>();

  // Navigasi ke halaman status pendaftaran
  const handleLihatStatus = () => {
    navigation.navigate('TungguKonfirmasi' as any); 
  };

  // Navigasi kembali ke Dashboard
  const handleKembaliKeHome = () => {
    navigation.navigate('PendaftarDashboard');
  };

  return (
    <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.scrollContent}>
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
                onPress={handleKembaliKeHome}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                  style={PendaftarStyles.navIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View>
                <Text style={localStyles.headerTitle}>Verifikasi Pembayaran</Text>
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
                source={require('../../assets/icons/lets-icons_time-fill.png')}
                style={localStyles.clockIcon}
                resizeMode="contain"
              />
            </View>
            
            <Text style={localStyles.statusTitle}>Menunggu pembayaran di konfirmasi</Text>
            <Text style={localStyles.statusSubtitle}>(Silahkan cek notifikasi secara berkala)</Text>
          </View>

          {/* Action Buttons */}
          <View style={localStyles.buttonContainer}>
            {/* Lihat Status Button */}
            <TouchableOpacity
              style={localStyles.statusButton}
              onPress={handleLihatStatus}
            >
              <LinearGradient
                colors={['#189653', '#2DB872']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={localStyles.gradientButton}
              >
                <Text style={localStyles.statusButtonText}>Lihat status pendaftaran</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Kembali ke Home Button */}
            <TouchableOpacity
              style={localStyles.homeButton}
              onPress={handleKembaliKeHome}
            >
              <Text style={localStyles.homeButtonText}>Kembali Ke Home</Text>
            </TouchableOpacity>
          </View>
        </View>
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

const localStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#015023',
    marginBottom: 4,
    left: 35,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 200,
    justifyContent: 'center',
  },

  // Status Card
  statusCard: {
    backgroundColor: '#F5EFD3',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#DABC4E',
    padding: 30,
    alignItems: 'center',
    marginBottom: 50,
  },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  clockIcon: {
    width: 40,
    height: 40,
  },
  statusTitle: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusSubtitle: {
    fontSize: 12,
    color: '#000000ff',
    textAlign: 'center',
    fontWeight: '600',
  },

  // Button Container
  buttonContainer: {
    gap: 30,
  },

  // Lihat Status Button
  statusButton: {
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#000',
    width: '90%',
    left: 15,
  },
  gradientButton: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000ff',
  },

  // Kembali ke Home Button
  homeButton: {
    backgroundColor: '#BE0414',
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000',
    width: '90%',
    left: 15,
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000ff',
  },
});

export default VerifikasiPembayaranScreen;