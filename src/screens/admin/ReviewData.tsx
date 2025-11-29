// src/screens/admin/ReviewDataManagerScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import api from '../../services/api';
import { UserManagement } from '../../services/apiService';
import LinearGradient from 'react-native-linear-gradient';
// ============================================
// 📌 TYPE DEFINITIONS
// ============================================

/**
 * Payload Manager yang diterima dari SetPermission
 */
interface ManagerPayload {
  name: string;
  email: string;
  username: string;
  password: string;
  passwordConfirmation: string;
  noTelepon?: string;
  role: 'manager' | 'admin';
  permissions: string[];
}

/**
 * Request payload untuk API POST /admin/users
 */
interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'admin' | 'manager' | 'pendaftar';
  username?: string;
  phone?: string;
}

// Navigation Types
type ReviewDataNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'ReviewData'>;

// Props Type
interface ReviewDataProps {
  route: RouteProp<AdminStackParamList, 'ReviewData'>;
}

// ============================================
// 📌 DEFAULT DATA (Fallback)
// ============================================
const DEFAULT_MANAGER_DATA: ManagerPayload = {
  name: 'Data Tidak Ditemukan',
  email: 'error@mail.ugn.ac.id',
  username: 'error',
  password: '',
  passwordConfirmation: '',
  noTelepon: '',
  role: 'manager',
  permissions: ['Data tidak tersedia'],
};

// ============================================
// 📌 MAIN COMPONENT
// ============================================
const ReviewData: React.FC<ReviewDataProps> = ({ route }) => {
  const navigation = useNavigation<ReviewDataNavigationProp>();
  const [isSaving, setIsSaving] = useState(false);

  // ============================================
  // 📌 SAFE DATA EXTRACTION
  // ============================================
  const getManagerData = (): ManagerPayload => {
    if (!route.params) {
      console.warn('⚠️ No params received in ReviewData screen');
      return DEFAULT_MANAGER_DATA;
    }

    const params = route.params as Partial<ManagerPayload>;

    if (!params.name || !params.email || !params.password) {
      console.warn('⚠️ Invalid params received:', params);
      return DEFAULT_MANAGER_DATA;
    }

    return {
      name: params.name,
      email: params.email,
      username: params.username || params.email.split('@')[0],
      password: params.password,
      passwordConfirmation: params.passwordConfirmation || params.password,
      noTelepon: params.noTelepon,
      role: params.role || 'manager',
      permissions: params.permissions || [],
    };
  };

  const managerData = getManagerData();

  // ============================================
  // 📌 HANDLERS
  // ============================================
  
  /**
   * Save Manager ke Database via API
   */
  const handleSaveManager = async (): Promise<void> => {
    setIsSaving(true);

    if (managerData.name === DEFAULT_MANAGER_DATA.name) {
        Alert.alert('Error', 'Data form tidak valid. Harap kembali ke Form Edit.');
        setIsSaving(false);
        return;
    }
    
    const dataToSend: CreateUserRequest = {
      name: managerData.name,
      email: managerData.email,
      password: managerData.password,
      password_confirmation: managerData.passwordConfirmation,
      role: managerData.role,
      username: managerData.username,
      phone: managerData.noTelepon || undefined, 
    };

    try {
      console.log('📤 Sending manager data:', {
        ...dataToSend,
        password: '***hidden***',
        password_confirmation: '***hidden***',
      });

      const response = await api.post('/admin/users', dataToSend);
      
      // 📌 PERBAIKAN: Ambil data dari response yang konsisten
      const responseData = response.data as any;
      const newManager: UserManagement = responseData.data || responseData;

      console.log('✅ Manager berhasil disimpan:', {
        id: newManager.id_user,
        name: newManager.name,
        email: newManager.email,
      });

      // 📌 PERBAIKAN: Navigasi ke KonfirmasiData dengan data yang sudah disimpan
      navigation.navigate('KonfirmasiData', {
        ...managerData,
        savedData: newManager, // Kirim data hasil API untuk ditampilkan
      } as any);

    } catch (error: any) {
      console.error('❌ Error saving manager:', error.response?.data || error.message);

      let errorMessage = 'Gagal menyimpan manager. Silakan coba lagi.';

      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        if (errors && typeof errors === 'object') {
          const errorList = Object.entries(errors)
            .map(([field, messages]) => {
              const msgArray = Array.isArray(messages) ? messages : [messages];
              const cleanField = field.replace('_', ' ').replace('password confirmation', 'konfirmasi password');
              return `• ${cleanField}: ${msgArray.join(', ')}`;
            })
            .join('\n');
          errorMessage = `Validasi Gagal:\n\n${errorList}`;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      }
      else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      else if (error.request && !error.response) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Navigate back to edit form
   */
  const handleEditData = (): void => {
    navigation.goBack();
  };

  /**
   * Cancel and return to main admin screen
   */
  const handleCancel = (): void => {
    Alert.alert(
      'Batalkan',
      'Apakah Anda yakin ingin membatalkan proses penambahan manager?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya',
          style: 'destructive',
          onPress: () => navigation.popToTop(),
        },
      ]
    );
  };

  /**
   * Navigate back one screen
   */
  const handleBack = (): void => {
    navigation.goBack();
  };

  // ============================================
  // 📌 RENDER
  // ============================================
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/App Bar - Bottom.png')}
            style={styles.waveBackground}
            resizeMode="cover"
          >
            <View style={styles.headerContent}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.headerIconContainerLeft}
                onPress={handleBack}
                disabled={isSaving}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                  style={styles.headerIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Title */}
              <View style={styles.headerTitleContainer}>
                <Image
                  source={require('../../assets/icons/Vector7.png')}
                  style={styles.checkIcon}
                  resizeMode="contain"
                />
                <Text style={styles.headerTitle}>Konfirmasi Data</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={styles.formContainer}>
          {/* Badge */}
          <View style={styles.reviewBadge}>
            <Text style={styles.reviewBadgeText}>
              Review {managerData.role === 'admin' ? 'Admin' : 'Manager'} Baru
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Image
              source={require('../../assets/icons/ic_round-warning.png')}
              style={styles.alertIcon}
              resizeMode="contain"
            />
            <Text style={styles.infoText}>
              Periksa kembali data sebelum menyimpan. Email aktivasi akan dikirim ke{' '}
              <Text style={styles.boldText}>{managerData.email}</Text>
            </Text>
          </View>

          {/* Data Card */}
          <View style={styles.dataCard}>
            {/* Data Personal Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Image
                  source={require('../../assets/icons/streamline-ultimate_paper-write-bold.png')}
                  style={styles.sectionIcon}
                  resizeMode="contain"
                />
                <Text style={styles.sectionTitle}>Data Personal</Text>
              </View>

              <DataField label="Nama" value={managerData.name} />
              <DataField label="Email" value={managerData.email} />
              <DataField label="Username" value={managerData.username} />
              <DataField label="No. HP" value={managerData.noTelepon || '-'} />
              <DataField label="Role" value={managerData.role.toUpperCase()} />
              <DataField label="Password" value="••••••••" />
            </View>

            {/* Permissions Section */}
            {managerData.permissions.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Image
                    source={require('../../assets/icons/mingcute_lock-fill.png')}
                    style={styles.sectionIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.sectionTitle}>Permissions</Text>
                </View>

                <View style={styles.permissionList}>
                  {managerData.permissions.map((permission, index) => (
                    <View key={`permission-${index}`} style={styles.permissionItem}>
                      <Image
                        source={require('../../assets/icons/Vector7.png')}
                        style={styles.permissionCheckIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.permissionText}>{permission}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            
            onPress={handleSaveManager}
            disabled={isSaving}
          >
            <LinearGradient
              colors={['#DABC4E', '#EFE3B0']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={[styles.saveButton, isSaving && styles.buttonDisabled]}
              >
            {isSaving ? (
              <ActivityIndicator color="#015023" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>
                Simpan {managerData.role === 'admin' ? 'Admin' : 'Manager'} Baru
              </Text>
            )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.editButton, isSaving && styles.buttonDisabled]}
            onPress={handleEditData}
            disabled={isSaving}
          >
            <Text style={styles.editButtonText}>Edit Data</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, isSaving && styles.buttonDisabled]}
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>

          {/* Spacer */}
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={styles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// ============================================
// 📌 HELPER COMPONENT
// ============================================
interface DataFieldProps {
  label: string;
  value: string;
}

const DataField: React.FC<DataFieldProps> = ({ label, value }) => (
  <View style={styles.dataField}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataValue}>{value}</Text>
  </View>
);

// ============================================
// 📌 STYLES
// ============================================
const styles = StyleSheet.create({
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
    marginRight: 12,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    left: 28,
  },
  checkIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 4,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  reviewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DABC4E',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    opacity: 0.8,
    borderWidth: 2,
    borderColor: '#000000ff',
  },
  reviewBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(218, 188, 78, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(218, 188, 78, 0.4)',
    alignItems: 'center',
  },
  alertIcon: {
    width: 20,
    height: 20,
    tintColor: '#DABC4E',
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#DABC4E',
  },
  dataCard: {
    backgroundColor: '#FEFAE0',
    borderRadius: 25,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    width: 20,
    height: 20,
    tintColor: '#000',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  dataField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    flex: 2,
    textAlign: 'right',
  },
  permissionList: {
    marginTop: 10,
    paddingLeft: 5,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  permissionCheckIcon: {
    width: 16,
    height: 16,
    tintColor: '#000000',
    marginRight: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#DABC4E',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000',
    minHeight: 50,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  editButton: {
    backgroundColor: '#38A169',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
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

export default ReviewData;