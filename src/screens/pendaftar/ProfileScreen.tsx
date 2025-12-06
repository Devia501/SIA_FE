import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

const DEFAULT_AVATAR_PATH = require('../../assets/images/profile 1.png');

const { width } = Dimensions.get('window');

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'Profile'
>;

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

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout, setUser } = useAuth();
  const userName = user?.name || 'Calon Mahasiswa';
  const userEmail = user?.email || '';

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [loadingEmail, setLoadingEmail] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  const [profilePhoto, setProfilePhoto] = useState(DEFAULT_AVATAR_PATH); 
  
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

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", onPress: logout }
      ]
    );
  };
  
  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Gagal memilih gambar.');
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        setProfilePhoto(source); 
        Alert.alert('Sukses (Tampilan)', 'Foto berhasil diganti. Perlu koneksi API untuk menyimpan.');
      }
    });
  };

  const handleChangeEmail = async () => {
    // Validasi input
    if (!newEmail || !emailPassword) {
      Alert.alert('Peringatan', 'Email dan password harus diisi.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('Peringatan', 'Format email tidak valid.');
      return;
    }

    if (newEmail === userEmail) {
      Alert.alert('Peringatan', 'Email baru sama dengan email lama.');
      return;
    }

    setLoadingEmail(true);
    
    try {
      const response = await authService.changeEmail({
        email: newEmail,
        password: emailPassword,
      });
      
      // @ts-ignore
      if (response.success) {
        // @ts-ignore
        if (response.data?.user && setUser) {
          // @ts-ignore
          setUser(response.data.user);
        }
        
        // @ts-ignore
        Alert.alert('Berhasil', response.message || 'Email berhasil diubah');
        setShowEmailModal(false);
        
        setNewEmail('');
        setEmailPassword('');
      }
    } catch (error: any) {
      Alert.alert(
        'Gagal', 
        error.message || 'Gagal mengubah email. Silakan coba lagi.'
      );
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleChangePassword = async () => {
    // Validasi input
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Peringatan', 'Semua field harus diisi.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Peringatan', 'Password baru dan konfirmasi tidak cocok.');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Peringatan', 'Password baru minimal 8 karakter.');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Peringatan', 'Password baru harus berbeda dengan password lama.');
      return;
    }

    setLoadingPassword(true);
    
    try {
      const response = await authService.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmNewPassword,
      });
      
      // @ts-ignore
      if (response.success) {
        Alert.alert(
          'Berhasil', 
          // @ts-ignore
          response.message || 'Password berhasil diubah',
          [
            {
              text: 'OK',
              onPress: () => {
                setShowPasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
              }
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Gagal', 
        error.message || 'Gagal mengubah password. Silakan coba lagi.'
      );
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        <View style={styles.topSection}>
          <ImageBackground
            source={require('../../assets/images/Rectangle 63.png')}
            style={PendaftarStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={styles.headerRow}>
              <Text style={styles.pageTitle}>Profile</Text>

              <TouchableOpacity
                style={styles.logoutIconContainer}
                onPress={handleLogout}
              >
                <Image
                  source={require('../../assets/icons/mingcute_exit-line.png')}
                  style={styles.logoutIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Image
                  source={profilePhoto}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
                <TouchableOpacity style={styles.editIconButton} onPress={handleChoosePhoto}>
                  <Image
                    source={require('../../assets/icons/bxs_pencil.png')}
                    style={styles.editIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userName}</Text> 
                <View style={styles.roleBadge}>
                  <Image
                    source={require('../../assets/icons/material-symbols_person-rounded.png')}
                    style={styles.roleIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.roleText}>Calon Mahasiswa</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.accountSection}>
          <LinearGradient
            colors={['#F5EFD3', '#DABC4E']}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.accountSection}
          >
            <Text style={styles.sectionTitle}>Account</Text>
          </LinearGradient>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowEmailModal(true)}>
              <Image
                source={require('../../assets/icons/Intersect.png')}
                style={styles.buttonIcon}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>Change Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => setShowPasswordModal(true)}>
              <Image
                source={require('../../assets/icons/material-symbols_lock.png')}
                style={styles.buttonIcon}
                resizeMode="contain"
              />
              <Text style={styles.buttonText}>Change Password</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal Change Email */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showEmailModal}
        onRequestClose={() => !loadingEmail && setShowEmailModal(false)}
      >
        <View style={modalStyles.centeredView}>
          <LinearGradient
            colors={['#DABC4E', '#f3efdfff']}
            start={{ x: 1, y: 0.5 }}
            end={{ x: 0.5, y: 1 }}
            style={modalStyles.modalView}
          >
            <Text style={modalStyles.modalTitle}>Change Email</Text>
            
            <Text style={modalStyles.inputLabel}>Current Email</Text>
            <TextInput
              style={[modalStyles.input, { backgroundColor: '#E0E0E0' }]}
              value={userEmail}
              editable={false}
            />
            
            <Text style={modalStyles.inputLabel}>New Email</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Enter new email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={newEmail}
              onChangeText={setNewEmail}
              placeholderTextColor="#999"
              editable={!loadingEmail}
            />
            
            <Text style={modalStyles.inputLabel}>Password (for verification)</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={emailPassword}
              onChangeText={setEmailPassword}
              placeholderTextColor="#999"
              editable={!loadingEmail}
            />
            
            <TouchableOpacity 
              onPress={handleChangeEmail}
              disabled={loadingEmail}
            >
              <LinearGradient
                colors={['#DABC4E', '#EFE3B0']}
                start={{ x: 0.5, y: 1 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                  modalStyles.changeButton,
                  loadingEmail && { opacity: 0.6 }
                ]}
              >
                {loadingEmail ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={modalStyles.changeButtonText}>Change</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={modalStyles.closeButton} 
              onPress={() => setShowEmailModal(false)}
              disabled={loadingEmail}
            >
              <Text style={modalStyles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* Modal Change Password */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPasswordModal}
        onRequestClose={() => !loadingPassword && setShowPasswordModal(false)}
      >
        <View style={modalStyles.centeredView}>
          <LinearGradient
            colors={['#DABC4E', '#f3efdfff']}
            start={{ x: 0.5, y: 1 }}
            end={{ x: 1, y: 0.5 }}
            style={modalStyles.modalView}
          >
            <Text style={modalStyles.modalTitle}>Change Password</Text>
            
            <Text style={modalStyles.inputLabel}>Current Password</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Enter current password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholderTextColor="#999"
              editable={!loadingPassword}
            />
            
            <Text style={modalStyles.inputLabel}>New Password</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Enter new password (min. 8 characters)"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholderTextColor="#999"
              editable={!loadingPassword}
            />
            
            <Text style={modalStyles.inputLabel}>Confirm New Password</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Confirm new password"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholderTextColor="#999"
              editable={!loadingPassword}
            />
            
            <TouchableOpacity 
              onPress={handleChangePassword}
              disabled={loadingPassword}
            >
              <LinearGradient
                colors={['#DABC4E', '#EFE3B0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 0.5, y: 1 }}
                style={[
                  modalStyles.changeButton,
                  loadingPassword && { opacity: 0.6 }
                ]}
              >
                {loadingPassword ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={modalStyles.changeButtonText}>Change</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={modalStyles.closeButton} 
              onPress={() => setShowPasswordModal(false)}
              disabled={loadingPassword}
            >
              <Text style={modalStyles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* Bottom Nav Section */}
      <View style={[PendaftarStyles.bottomNav, styles.nav]}>
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

        <TouchableOpacity style={PendaftarStyles.navItem}>
          <View style={PendaftarStyles.navItemActive}>
            <Image
              source={require('../../assets/icons/ix_user-profile-filled.png')}
              style={PendaftarStyles.navIconImage}
              resizeMode="contain"
            />
            <Text style={PendaftarStyles.navTextActive}>Profile</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', 
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 5,
    fontSize: 12,
    color: '#015023',
  },
  input: {
    height: 48,
    width: '100%',
    borderColor: '#000000ff',
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#333',
  },
  changeButton: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 70,
    elevation: 2,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
    minHeight: 48,
    justifyContent: 'center',
  },
  changeButtonText: {
    color: '#ffffffff',
    fontWeight: '400',
    textAlign: 'center',
    fontSize: 18,
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#015023',
  },
  topSection: {
    position: 'relative',
    zIndex: -1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#DABC4E',
    marginTop: 20,
    marginLeft: 20,
    textShadowColor: '#000000ff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  logoutIconContainer: {
    padding: 10,
    marginTop: 20,
  },
  logoutIcon: {
    width: 24,
    height: 24, 
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 20,
    marginLeft: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#070707ff',
  },
  editIconButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DABC4E',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    width: 16,
    height: 16,
    tintColor: '#000',
  },
  profileInfo: {
    flex: 1,
    marginTop: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DABC4E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    gap: 6,
  },
  roleIcon: {
    width: 18,
    height: 18,
    tintColor: '#000',
  },
  roleText: {
    fontSize: 12,
    color: '#000',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  accountSection: {
    marginTop: 20,
    marginLeft: 18,
    bottom: 80,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffffff',
    paddingHorizontal: 38,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonContainer: {
    gap: 16,
  },
  actionButton: {
    bottom: 120,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5E6D3',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 12,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
    alignItems: 'center',
    marginLeft: 65,
  },
  buttonText: {
    alignItems: 'center',
    fontSize: 15,
    color: '#000',
  },
  nav: {
    bottom: 83,
  }
});

export default ProfileScreen;