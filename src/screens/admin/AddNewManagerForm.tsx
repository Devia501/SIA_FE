// src/screens/admin/AddNewManagerFormScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ImageBackground,
  TextInput,
  Alert,
  ActivityIndicator, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'; // 📌 Tambah useRoute
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import LinearGradient from 'react-native-linear-gradient';
import { UserManagement } from '../../services/apiService'; 

// ============================================
// 📌 TYPE DEFINITIONS
// ============================================
interface BaseManagerPayload {
    id_user?: number; // 📌 Tambahan untuk Edit
    name: string;
    email: string;
    username: string;
    password?: string; // Optional saat edit
    passwordConfirmation?: string;
    noTelepon?: string;
    role: 'manager' | 'admin';
    isEditMode?: boolean; // 📌 Penanda Edit Mode
}

// Definisi tipe route untuk menerima params
type AddNewManagerFormRouteProp = RouteProp<{ 
  AddNewManagerForm: { manager?: UserManagement } 
}, 'AddNewManagerForm'>;

type AddNewManagerFormNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AddNewManagerForm'>;

const AddNewManagerForm = () => {
  const navigation = useNavigation<AddNewManagerFormNavigationProp>();
  const route = useRoute<AddNewManagerFormRouteProp>(); // 📌 Hook route

  // Cek apakah ada data manager yang dikirim (Edit Mode)
  const managerToEdit = route.params?.manager;
  const isEditMode = !!managerToEdit;

  // State untuk form
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [username, setUsername] = useState(''); 
  const [noTelepon, setNoTelepon] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); 

  // 📌 EFFECT: Pre-fill data jika Edit Mode
  useEffect(() => {
    if (managerToEdit) {
      navigation.setOptions({ headerTitle: 'Edit Manager' }); // Opsional: Ubah judul header native
      
      setNamaLengkap(managerToEdit.name || '');
      setEmail(managerToEdit.email || '');
      // Username mungkin tidak ada di listUsers response standar, sesuaikan jika ada
      // Jika backend tidak kirim username di list, form ini mungkin akan kosong username-nya
      setUsername((managerToEdit as any).username || ''); 
      setNoTelepon(managerToEdit.phone_number || '');
      // Password dikosongkan karena terenkripsi
    }
  }, [managerToEdit, navigation]);

  // 📌 FUNGSI NAVIGASI: Meneruskan data ke SetPermission
  const handleNextToPermission = () => {
    // 1. Validasi Input Wajib
    if (!namaLengkap.trim() || !email.trim() || !username.trim()) {
      Alert.alert('Error', 'Nama, Email, dan Username wajib diisi!');
      return;
    }

    // 📌 Validasi Password Khusus
    // Jika Mode Buat Baru: Password Wajib
    // Jika Mode Edit: Password Opsional (hanya diisi jika ingin mengganti)
    if (!isEditMode && !password) {
        Alert.alert('Error', 'Password wajib diisi untuk manager baru!');
        return;
    }

    // Jika password diisi (baik mode baru atau edit), validasi konfirmasi
    if (password || passwordConfirmation) {
        if (password.length < 8) {
            Alert.alert('Error', 'Password minimal 8 karakter!');
            return;
        }
        if (password !== passwordConfirmation) {
            Alert.alert('Error', 'Konfirmasi Password tidak cocok!');
            return;
        }
    }
    
    // 2. Siapkan Payload
    const payload: BaseManagerPayload = {
      id_user: managerToEdit?.id_user, // Kirim ID jika edit
      name: namaLengkap.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim(),
      noTelepon: noTelepon.trim() || undefined,
      role: 'manager',
      isEditMode: isEditMode, // Kirim flag edit
    };

    // Hanya kirim password jika diisi
    if (password) {
        payload.password = password;
        payload.passwordConfirmation = passwordConfirmation;
    }

    console.log('📦 Sending Payload to Permission:', payload);

    // 3. Navigasi ke SetPermission
    // @ts-ignore
    navigation.navigate('SetPermission', payload); 
  };

  const handleCancel = () => {
    navigation.goBack();
  };

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
              <TouchableOpacity
                style={localStyles.headerIconContainerLeft}
                onPress={() => navigation.goBack()}
                disabled={isLoading} 
              >
                <Image
                  source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                  style={localStyles.headerIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {!isEditMode && (
  <Image 
      source={require('../../assets/icons/gridicons_add.png')} 
      style={localStyles.lockIcon}
      resizeMode="contain"
  />
)}

<Text 
  style={[
    localStyles.headerTitle, 
    // 👇 Tambahkan kondisi ini:
    isEditMode && { 
      textAlign: 'center', 
      marginRight: 52, // Menyeimbangkan Back Button (40px) + Margin (12px)
      left: 0          // Reset posisi 'left' bawaan agar benar-benar tengah
    }
  ]}
>
  {isEditMode ? 'Edit Manager' : 'Tambah Manager Baru'}
</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Form Content */}
        <View style={localStyles.formContainer}>
          <View style={localStyles.dataBadge}>
            <Text style={localStyles.dataBadgeText}>
                {isEditMode ? 'Edit Data Manager' : 'Data Manager Baru'}
            </Text>
          </View>

          <View style={localStyles.infoBox}>
            <Text style={localStyles.infoText}>
              {isEditMode 
                ? 'Kosongkan password jika tidak ingin mengubahnya.' 
                : 'Semua field wajib (*). Username & Password wajib diisi.'}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={localStyles.fieldContainer}>
            <Text style={localStyles.fieldLabel}>Nama Lengkap (*)</Text>
            <TextInput
              style={localStyles.input}
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#999"
              value={namaLengkap}
              onChangeText={setNamaLengkap}
              editable={!isLoading}
            />
          </View>
          
          <View style={localStyles.fieldContainer}>
            <Text style={localStyles.fieldLabel}>Username (*)</Text>
            <TextInput
              style={[localStyles.input, isEditMode && { backgroundColor: '#e0e0e0' }]} // Opsional: Visual disable
              placeholder="manager_username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading} // Bisa diubah false jika username tidak boleh diedit
            />
          </View>

          <View style={localStyles.fieldContainer}>
            <Text style={localStyles.fieldLabel}>Email (*)</Text>
            <TextInput
              style={localStyles.input}
              placeholder="email@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={localStyles.fieldContainer}>
            <Text style={localStyles.fieldLabel}>No Telepon (Opsional)</Text>
            <TextInput
              style={localStyles.input}
              placeholder="+62 812-3456-7890"
              placeholderTextColor="#999"
              value={noTelepon}
              onChangeText={setNoTelepon}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
          </View>
          
          {/* Password (Label dinamis) */}
          <View style={localStyles.fieldContainer}>
            <Text style={localStyles.fieldLabel}>
                {isEditMode ? 'Password Baru (Opsional)' : 'Password (*)'}
            </Text>
            <TextInput
              style={localStyles.input}
              placeholder={isEditMode ? "Isi hanya jika ingin ganti password" : "Minimal 8 Karakter"}
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <View style={localStyles.fieldContainer}>
            <Text style={localStyles.fieldLabel}>
                {isEditMode ? 'Konfirmasi Password Baru' : 'Konfirmasi Password (*)'}
            </Text>
            <TextInput
              style={localStyles.input}
              placeholder="Ulangi Password"
              placeholderTextColor="#999"
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {/* Action Buttons */}
          <TouchableOpacity 
            onPress={handleNextToPermission}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#DABC4E', '#EFE3B0']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.submitButton}
            >
            {isLoading ? (
              <ActivityIndicator color="#015023" />
            ) : (
              <Text style={localStyles.submitButtonText}>
                  {isEditMode ? 'Simpan Perubahan' : 'Lanjutkan ke Permissions'}
              </Text>
            )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={localStyles.cancelButton}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Text style={localStyles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

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
  },
headerContainer: {
width: '100%',
},
fieldLabel: {
  marginBottom: 8,
  color: '#ffffffff',
},
waveBackground: {
width: '100%',
height: 80,
justifyContent: 'center',
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
lockIcon: {
width: 24,
height: 24,
},
headerIcon: {
width: 24,
height: 24,
},
headerTitle: {
fontSize: 20,
fontWeight: 'bold',
color: '#000000ff',
flex: 1,
left: 6,
bottom: 2,
},
formContainer: {
flex: 1,
paddingHorizontal: 24,
paddingTop: 20,
},
dataBadge: {
alignSelf: 'flex-start',
backgroundColor: '#DABC4E',
borderRadius: 18,
paddingHorizontal: 16,
paddingVertical: 8,
marginBottom: 16,
borderWidth: 2,
borderColor: '#000000ff',
opacity: 0.8,
},
dataBadgeText: {
fontSize: 14,
fontWeight: 'bold',
color: '#ffffffff',
},
infoBox: {
backgroundColor: 'rgba(218, 188, 78, 0.2)',
borderRadius: 12,
padding: 12,
marginBottom: 24,
borderWidth: 1,
borderColor: 'rgba(218, 188, 78, 0.4)',
},
infoText: {
fontSize: 13,
color: '#FFFFFF',
lineHeight: 18,
},
fieldContainer: {
marginBottom: 20,
},
FieldLabel: {
fontSize: 14,
fontWeight: '600',
color: '#FFFFFF',
marginBottom: 8,
},
input: {
backgroundColor: '#FEFAE0',
borderRadius: 18,
paddingHorizontal: 16,
paddingVertical: 14,
fontSize: 14,
color: '#000',
borderWidth: 1,
borderColor: '#DABC4E',
},
submitButton: {
backgroundColor: '#DABC4E',
borderRadius: 25,
paddingVertical: 14,
alignItems: 'center',
justifyContent: 'center',
marginTop: 24,
marginBottom: 12,
borderWidth: 2,
borderColor: '#000000ff',
},
submitButtonText: {
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
borderColor: '#000000ff',
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
opacity: 0.20,
zIndex: -1,
},
});

export default AddNewManagerForm;