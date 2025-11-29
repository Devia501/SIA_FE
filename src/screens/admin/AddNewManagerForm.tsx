// src/screens/admin/AddNewManagerFormScreen.tsx

import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import LinearGradient from 'react-native-linear-gradient';
// 📌 Import Axios Instance dan Tipe Data
import api from '../../services/api'; 
import { UserManagement } from '../../services/apiService'; 

// ============================================
// 📌 TYPE DEFINITIONS (Payload Dasar untuk Navigasi)
// ============================================
interface BaseManagerPayload {
    name: string;
    email: string;
    username: string;
    password: string;
    passwordConfirmation: string;
    noTelepon?: string;
    role: 'manager' | 'admin';
}


type AddNewManagerFormNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AddNewManagerForm'>;

const AddNewManagerForm = () => {
  const navigation = useNavigation<AddNewManagerFormNavigationProp>();

  // State untuk form
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  
  // 📌 Field yang diwajibkan oleh backend untuk Manager
  const [username, setUsername] = useState(''); 
  // 📌 Field opsional
  const [noTelepon, setNoTelepon] = useState(''); 

  // 🚨 FUNGSI ASLI ANDA: Dibiarkan di sini tetapi tidak digunakan oleh tombol Submit
  const handleSubmit = async () => {
    // ... (Logika API POST yang lama, DIBIARKAN AGAR KODE TIDAK HILANG)
    if (!namaLengkap.trim() || !email.trim() || !password || !passwordConfirmation || !username.trim()) {
      Alert.alert('Error', 'Semua field wajib (*), termasuk Username, harus diisi!');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Format email tidak valid!');
      return;
    }
    
    if (password.length < 8) {
        Alert.alert('Error', 'Password minimal 8 karakter!');
        return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Konfirmasi Password tidak cocok!');
      return;
    }
    
    const dataToSend = {
      name: namaLengkap.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: 'manager', 
      username: username.trim(),
      password_confirmation: passwordConfirmation,
    };

    setIsLoading(true);

    try {
      const response = await api.post<UserManagement>('/admin/users', dataToSend); 
      const newManager = response.data;
      
      console.log('✅ Manager berhasil ditambahkan:', newManager);
      
      Alert.alert('Success', `Manager ${newManager.name} berhasil ditambahkan!`, [
        {
          text: 'OK',
          onPress: () => navigation.navigate('AddNewManager'), 
        },
      ]);
      
      // Reset form
      setNamaLengkap('');
      setEmail('');
      setPassword('');
      setPasswordConfirmation('');
      setUsername('');
      setNoTelepon('');

    } catch (error: any) {
      console.error('❌ Error adding manager:', error.response?.data || error.message);
      
      let errorMessage = 'Gagal menambahkan Manager. Silakan coba lagi.';
      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;
        if (errors) {
            const errorMessages = Object.values(errors).flat().join('\n- ');
            errorMessage = `Validasi Gagal:\n- ${errorMessages}`;
        }
      } else if (error.response?.data?.message) {
         errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };
  // 🚨 END FUNGSI ASLI ANDA


  // 📌 FUNGSI BARU: Meneruskan data ke SetPermission
  const handleNextToPermission = () => {
    // 1. Validasi Input Wajib (Diperlukan sebelum navigasi)
    if (!namaLengkap.trim() || !email.trim() || !password || !passwordConfirmation || !username.trim()) {
      Alert.alert('Error', 'Semua field wajib (*), termasuk Username, harus diisi!');
      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Konfirmasi Password tidak cocok!');
      return;
    }
    
    // 2. Siapkan Payload Dasar untuk Navigasi
    const payload: BaseManagerPayload = {
      name: namaLengkap.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      passwordConfirmation: passwordConfirmation,
      username: username.trim(),
      noTelepon: noTelepon.trim() || undefined, // Mengirim undefined jika kosong (sesuai kebutuhan backend nullable)
      role: 'manager', 
    };

    // 3. Navigasi ke SetPermission sambil Meneruskan Payload
    navigation.navigate('SetPermission', payload as any); 
  };


  const handleCancel = () => {
    Alert.alert(
      'Batalkan',
      'Apakah Anda yakin ingin membatalkan penambahan manager?',
      [
        { text: 'Tidak', style: 'cancel' },
        { 
          text: 'Ya', 
          onPress: () => navigation.goBack()
        },
      ]
    );
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
              {/* Tombol Back */}
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
              <Image 
                  source={require('../../assets/icons/gridicons_add.png')} 
                  style={localStyles.lockIcon}
                  resizeMode="contain"/>
              <Text style={localStyles.headerTitle}>Tambah Manager Baru</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Form Content */}
        <View style={localStyles.formContainer}>
          {/* Data Manager Baru Badge */}
          <View style={localStyles.dataBadge}>
            <Text style={localStyles.dataBadgeText}>Data Manager Baru</Text>
          </View>

          {/* Info Text */}
          <View style={localStyles.infoBox}>
            <Text style={localStyles.infoText}>
              Semua field harus diisi. Username, Password, dan Konfirmasi Password wajib diisi.
            </Text>
          </View>

          {/* Form Fields */}
          {/* Nama Lengkap */}
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
          
          {/* 📌 Username (WAJIB) */}
          <View style={localStyles.fieldContainer}>
            <Text style={localStyles.fieldLabel}>Username (*)</Text>
            <TextInput
              style={localStyles.input}
              placeholder="manager_username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          {/* Email */}
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

          {/* No Telepon (Opsional) */}
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
          
          {/* Password */}
          <View style={localStyles.fieldContainer}>
            <Text style={localStyles.fieldLabel}>Password (*)</Text>
            <TextInput
              style={localStyles.input}
              placeholder="Minimal 8 Karakter"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {/* Konfirmasi Password */}
          <View style={localStyles.fieldContainer}>
            <Text style={localStyles.fieldLabel}>Konfirmasi Password (*)</Text>
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
            
            onPress={handleNextToPermission} // 📌 DIPERBAIKI: Menggunakan fungsi navigasi
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
              
              <Text style={localStyles.submitButtonText}>Lanjutkan ke Permissions</Text>
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