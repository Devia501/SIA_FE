// src/screens/admin/KonfirmasiDataManagerScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ImageBackground,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AdminStackParamList } from '../../navigation/AdminNavigator';
import { UserManagement } from '../../services/apiService';
import LinearGradient from 'react-native-linear-gradient';
// ============================================
// 📌 TYPE DEFINITIONS
// ============================================

// Tipe data yang diterima dari ReviewData (setelah save berhasil)
interface KonfirmasiDataParams {
  name: string;
  email: string;
  username: string;
  role: 'manager' | 'admin';
  savedData: UserManagement; // Data hasil API
}

// Props untuk komponen
interface KonfirmasiDataProps {
  route: RouteProp<AdminStackParamList, 'KonfirmasiData'>;
}

// Tipe untuk navigasi
type KonfirmasiDataNavigationProp = NativeStackNavigationProp<
  AdminStackParamList,
  'KonfirmasiData'
>;

// ============================================
// 📌 MAIN COMPONENT
// ============================================
const KonfirmasiData: React.FC<KonfirmasiDataProps> = ({ route }) => {
  const navigation = useNavigation<KonfirmasiDataNavigationProp>();

  // 📌 Ambil data dari route params
  const params = route.params as KonfirmasiDataParams;
  const savedData = params?.savedData;

  // Fallback jika tidak ada data
  if (!savedData) {
    return (
      <SafeAreaView style={[localStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#FFFFFF', fontSize: 16, marginBottom: 20 }}>
          Data tidak ditemukan
        </Text>
        <TouchableOpacity
          style={localStyles.userListButton}
          onPress={() => navigation.navigate('AddNewManager' as any)}
        >
          <Text style={localStyles.userListButtonText}>Kembali ke User List</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Format data untuk ditampilkan
  const displayData = {
    name: savedData.name,
    username: savedData.username ? `@${savedData.username}` : savedData.email.split('@')[0],
    email: savedData.email,
    role: savedData.role.charAt(0).toUpperCase() + savedData.role.slice(1),
    createdAt: new Date(savedData.created_at).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  // ============================================
  // 📌 HANDLERS NAVIGASI
  // ============================================

  const handleKirimUlangEmail = () => {
    Alert.alert(
      'Kirim Ulang Email',
      `Email aktivasi telah dikirim ulang ke alamat ${displayData.email}.`
    );
  };

  const handleBackToUserList = () => {
    navigation.navigate('AddNewManager' as any);
  };

  const handleTambahManagerLagi = () => {
    navigation.navigate('AddNewManagerForm' as any);
  };

  const handleBack = () => {
    navigation.navigate('AddNewManager' as any);
  };

  // ============================================
  // 📌 RENDER LAYAR SUKSES
  // ============================================
  return (
    <SafeAreaView style={localStyles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.scrollContent}
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/App Bar - Bottom.png')}
            style={localStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={localStyles.headerContent}>
              {/* Tombol Back */}
              <TouchableOpacity
                style={localStyles.headerIconContainerLeft}
                onPress={handleBack}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                  style={localStyles.headerIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={localStyles.headerTitleContainer}>
                <Image
                  source={require('../../assets/icons/lets-icons_check-fill.png')}
                  style={localStyles.checkIcon}
                  resizeMode="contain"
                />
                <Text style={localStyles.headerTitle}>Manager Dibuat</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={localStyles.formContainer}>
          {/* Checkmark Circle */}
          <View style={localStyles.successCircle}>
            <Image
              source={require('../../assets/icons/complete.png')}
              style={localStyles.successCheck}
              resizeMode="contain"
            />
          </View>

          {/* Success Message */}
          <Text style={localStyles.successTitle}>Manager Berhasil Dibuat!</Text>
          <Text style={localStyles.successSubtitle}>
            Manager baru telah ditambahkan ke sistem.
          </Text>

          {/* Summary Card */}
          <View style={localStyles.summaryCard}>
            <Text style={localStyles.summaryName}>{displayData.name}</Text>
            <Text style={localStyles.summaryUsername}>
              {displayData.username}
            </Text>

            <View style={localStyles.summaryDetail}>
              <Image
                source={require('../../assets/icons/majesticons_mail.png')}
                style={localStyles.summaryIcon}
                resizeMode="contain"
              />
              <Text style={localStyles.summaryDetailText}>
                {displayData.email}
              </Text>
            </View>

            <View style={localStyles.summaryDetail}>
              <Image
                source={require('../../assets/icons/majesticons_key.png')}
                style={localStyles.summaryIcon}
                resizeMode="contain"
              />
              <Text style={localStyles.summaryDetailText}>
                {displayData.role}
              </Text>
            </View>

            <View style={localStyles.summaryDetail}>
              <Image
                source={require('../../assets/icons/clarity_date-solid (1).png')}
                style={localStyles.summaryIcon}
                resizeMode="contain"
              />
              <Text style={localStyles.summaryDetailText}>
                Created : {displayData.createdAt}
              </Text>
            </View>
          </View>

          {/* Email Sent Badge */}
          <TouchableOpacity
            style={localStyles.emailBadge}
            onPress={() =>
              Alert.alert(
                'Informasi',
                `Email aktivasi dikirim ke ${displayData.email}`
              )
            }
          >
            <Image
              source={require('../../assets/icons/lets-icons_check-fill (1).png')}
              style={localStyles.emailBadgeIcon}
              resizeMode="contain"
            />
            <Text style={localStyles.emailBadgeText}>
              Email aktivasi telah dikirim ke: {displayData.email}
            </Text>
          </TouchableOpacity>

          {/* Next Steps Card */}
          <View style={localStyles.stepsCard}>
            <Text style={localStyles.stepsTitle}>Langkah Selanjutnya</Text>
            <View style={localStyles.stepsList}>
              <Text style={localStyles.stepItem}>
                1. Manager akan menerima email aktivasi
              </Text>
              <Text style={localStyles.stepItem}>
                2. Manager perlu verifikasi email
              </Text>
              <Text style={localStyles.stepItem}>
                3. Manager dapat login setelah verifikasi
              </Text>
              <Text style={localStyles.stepItem}>
                4. Password akan di-set saat aktivasi
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            
            onPress={handleBackToUserList}
          >
            <LinearGradient
              colors={['#DABC4E', '#EFE3B0']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.userListButton}
              >
            <Text style={localStyles.userListButtonText}>
              Kembali ke User List
            </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={localStyles.addMoreButton}
            onPress={handleTambahManagerLagi}
          >
            <Text style={localStyles.addMoreButtonText}>
              Tambah Manager Lagi
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={localStyles.resendEmailButton}
            onPress={handleKirimUlangEmail}
          >
            <Text style={localStyles.resendEmailButtonText}>
              Kirim Ulang Email
            </Text>
          </TouchableOpacity>

          {/* Spacer */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={localStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#015023',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContainer: {
    width: '100%',
  },
  waveBackground: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    backgroundColor: '#DABC4E',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerIconContainerLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 28,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    left: 10,
  },
  checkIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  successCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#38A169',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#DABC4E',
    marginBottom: 20,
  },
  successCheck: {
    width: 150,
    height: 150,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14,
    color: '#DABC4E',
    marginBottom: 30,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FEFAE0',
    borderRadius: 25,
    padding: 24,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 3,
    borderColor: '#DABC4E',
  },
  summaryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DABC4E',
    marginBottom: 4,
  },
  summaryUsername: {
    fontSize: 14,
    color: '#000',
    marginBottom: 15,
  },
  summaryDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  summaryIcon: {
    width: 16,
    height: 16,
    tintColor: '#000',
    marginRight: 8,
  },
  summaryDetailText: {
    fontSize: 13,
    color: '#000',
  },
  emailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38A169',
    borderRadius: 20,
    width: '80%',
    paddingVertical: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#DABC4E',
  },
  emailBadgeIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    marginLeft: 22,
  },
  emailBadgeText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  emailBadgeTextBold: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  stepsCard: {
    backgroundColor: '#FEFAE0',
    borderRadius: 25,
    padding: 24,
    marginBottom: 30,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 3,
    borderColor: '#DABC4E',
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#015023',
    marginBottom: 10,
  },
  stepsList: {
    paddingLeft: 0,
  },
  stepItem: {
    fontSize: 13,
    color: '#000',
    lineHeight: 20,
  },
  userListButton: {
    backgroundColor: '#DABC4E',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000',
    paddingHorizontal: 80,
  },
  userListButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addMoreButton: {
    backgroundColor: '#38A169',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    width: '100%',
    borderWidth: 2,
    borderColor: '#000000',
  },
  addMoreButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resendEmailButton: {
    backgroundColor: '#ffffffff',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#000000',
  },
  resendEmailButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  backgroundLogo: {
    position: 'absolute',
    bottom: -350,
    alignSelf: 'center',
    width: 950,
    height: 950,
    opacity: 0.2,
    zIndex: -1,
  },
});

export default KonfirmasiData;