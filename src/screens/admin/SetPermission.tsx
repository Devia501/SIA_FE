// src/screens/admin/SetPermissionScreen.tsx

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import LinearGradient from 'react-native-linear-gradient';
// ============================================
// 📌 TYPE DEFINITIONS
// ============================================
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

type BaseManagerPayload = Omit<ManagerPayload, 'permissions'>;

type SetPermissionNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'SetPermission'>;

interface SetPermissionProps {
  route: RouteProp<AdminStackParamList, 'SetPermission'>;
}

// Definisi Permission
interface Permission {
  id: string;
  label: string;
  description: string;
}

const permissionsList: Permission[] = [
  { id: 'kelolaPendaftaran', label: 'Kelola Pendaftaran', description: 'Melihat dan mengelola data pendaftar' },
  { id: 'verifikasiDokumen', label: 'Verifikasi Dokumen', description: 'Approve/reject dokumen pendaftar' },
  { id: 'validasiPembayaran', label: 'Validasi Pembayaran', description: 'Konfirmasi pembayaran pendaftar' },
  { id: 'viewReports', label: 'View Reports', description: 'Melihat laporan dan statistik' },
  { id: 'deleteData', label: 'Delete Data', description: 'Menghapus data dari sistem' },
];

// ============================================
// 📌 PERMISSION ITEM COMPONENT
// ============================================
const PermissionItem: React.FC<{
  permission: Permission;
  isChecked: boolean;
  onToggle: (id: string) => void;
}> = ({ permission, isChecked, onToggle }) => {
  const buttonStyle = isChecked ? localStyles.checkedButton : localStyles.uncheckedButton;
  const checkIconSource = isChecked
    ? require('../../assets/icons/Vector7.png')
    : require('../../assets/icons/gg_check-o.png');

  const checkIconTint = isChecked ? '#015023' : '#666';

  return (
    <TouchableOpacity
      style={[localStyles.permissionButton, buttonStyle]}
      onPress={() => onToggle(permission.id)}
      activeOpacity={0.7}
    >
      <View style={localStyles.permissionTextContainer}>
        <Text style={localStyles.permissionLabel}>{permission.label}</Text>
        <Text style={localStyles.permissionDescription}>{permission.description}</Text>
      </View>
      <Image
        source={checkIconSource}
        style={[localStyles.checkmarkIcon, { tintColor: checkIconTint }]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

// ============================================
// 📌 MAIN COMPONENT
// ============================================
const SetPermission: React.FC<SetPermissionProps> = ({ route }) => {
  const navigation = useNavigation<SetPermissionNavigationProp>();

  // 📌 Dapatkan data yang dikirim dari AddNewManagerForm
  const baseData = route.params as BaseManagerPayload;

  // State untuk melacak permission yang dipilih
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(permissionsList.map((p) => p.id)) // Default: Semua tercentang
  );

  // ============================================
  // 📌 HANDLERS
  // ============================================
  const handleTogglePermission = (id: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  /**
   * Handler untuk Review Data
   * Mengirim payload lengkap ke ReviewData screen
   */
  const handleReviewData = () => {
    // 🚨 Validasi: Pastikan data dasar ada
    if (!baseData || !baseData.name) {
      Alert.alert(
        'Error Data',
        'Data form manager tidak ditemukan. Harap kembali ke Form Edit.'
      );
      return;
    }

    // 🚨 Validasi: Pastikan minimal 1 permission dipilih
    if (selectedPermissions.size === 0) {
      Alert.alert(
        'Pilih Permission',
        'Harap pilih minimal 1 permission untuk manager baru.'
      );
      return;
    }

    // 1. Ambil label permission (untuk tampilan di ReviewData)
    const selectedPermissionsLabels = Array.from(selectedPermissions).map((id) => {
      const perm = permissionsList.find((p) => p.id === id);
      return perm ? perm.label : id;
    });

    // 2. Gabungkan data dasar dan data permission
    const finalPayload: ManagerPayload = {
      ...baseData,
      permissions: selectedPermissionsLabels,
    };

    console.log('📤 Sending to ReviewData:', {
      ...finalPayload,
      password: '***hidden***',
      passwordConfirmation: '***hidden***',
    });

    // 3. Navigasi ke ReviewData dengan payload lengkap
    navigation.navigate('ReviewData', finalPayload as any);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // ============================================
  // 📌 RENDER
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
                  source={require('../../assets/icons/mingcute_lock-fill.png')}
                  style={localStyles.lockIcon}
                  resizeMode="contain"
                />
                <Text style={localStyles.headerTitle}>Set Permissions</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={localStyles.formContainer}>
          {/* Hak Akses Manager Badge */}
          <View style={localStyles.accessBadge}>
            <Text style={localStyles.accessBadgeText}>Hak Akses Manager</Text>
          </View>

          <View style={localStyles.accessBadge2}>
            <Text style={localStyles.selectionInstruction}>
              Pilih modul yang dapat diakses oleh manager baru ({selectedPermissions.size}{' '}
              dipilih)
            </Text>
          </View>

          {/* List Permission (Dinamis) */}
          <View style={localStyles.permissionsListContainer}>
            {permissionsList.map((permission) => (
              <PermissionItem
                key={permission.id}
                permission={permission}
                isChecked={selectedPermissions.has(permission.id)}
                onToggle={handleTogglePermission}
              />
            ))}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity  onPress={handleReviewData}>
            <LinearGradient
              colors={['#DABC4E', '#EFE3B0']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.reviewButton}
              >
            <Text style={localStyles.reviewButtonText}>Review Data</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={localStyles.cancelButton} onPress={handleBack}>
            <Text style={localStyles.cancelButtonText}>Kembali</Text>
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

// ============================================
// 📌 STYLES
// ============================================
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#015023',
  },
  scrollContent: {
    flexGrow: 1,
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
  lockIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  accessBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DABC4E',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000000',
    opacity: 0.7,
  },
  accessBadge2: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEFAE0',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#DABC4E',
    opacity: 0.8,
  },
  accessBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  selectionInstruction: {
    fontSize: 14,
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  permissionsListContainer: {
    marginBottom: 30,
  },
  permissionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 15,
    borderWidth: 1,
  },
  checkedButton: {
    backgroundColor: '#FEFAE0',
    borderColor: '#DABC4E',
  },
  uncheckedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderColor: '#666',
  },
  permissionTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  permissionDescription: {
    fontSize: 12,
    color: '#000000',
    marginTop: 2,
  },
  checkmarkIcon: {
    width: 24,
    height: 24,
    opacity: 1,
  },
  reviewButton: {
    backgroundColor: '#DABC4E',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  cancelButton: {
    backgroundColor: '#DC2626',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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

export default SetPermission;