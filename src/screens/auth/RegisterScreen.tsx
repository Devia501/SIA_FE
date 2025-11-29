import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AuthStyles from '../../styles/AuthStyles';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen = () => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { register } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (pass: string) => {
    if (!pass) return false;
    const hasMinLength = pass.length >= 8;
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);

    return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleRegister = async () => {
    // Validasi input
    if (!fullName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Peringatan', 'Nama, Email, dan Password wajib diisi!');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Peringatan', 'Format email tidak valid! Contoh: nama@email.com');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Peringatan', 'Konfirmasi password tidak cocok!');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        'Peringatan',
        'Password harus minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka!'
      );
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        password_confirmation: confirmPassword,
        phone: phone.trim() || undefined, // Kirim phone (opsional)
      });

      Alert.alert(
        'Berhasil',
        'Registrasi berhasil! Silakan login dengan akun Anda.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form
              setFullName('');
              setEmail('');
              setPassword('');
              setConfirmPassword('');
              setPhone('');
              // Navigate to login
              navigation.navigate('Login');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registrasi Gagal', error.message || 'Terjadi kesalahan saat registrasi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={AuthStyles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#DABC4E" />

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn2.png')}
        style={AuthStyles.backgroundLogo}
        resizeMode="contain"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={AuthStyles.header}>
            <Image
              source={require('../../assets/images/logo-ugn2.png')}
              style={AuthStyles.logo}
              resizeMode="contain"
            />
            <Text style={AuthStyles.headerText}>UNIVERSITAS GLOBAL NUSANTARA</Text>
          </View>

          <View style={AuthStyles.formContainer}>
            <Text style={AuthStyles.title}>Registrasi Pendaftar</Text>
            <Text style={styles.subtitle}>Daftar sebagai calon mahasiswa</Text>

            <Text style={AuthStyles.label}>Nama Lengkap</Text>
            <TextInput
              style={AuthStyles.input}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              placeholder="Masukkan nama lengkap"
              placeholderTextColor="#999"
              editable={!isLoading}
            />

            <Text style={AuthStyles.label}>Email</Text>
            <TextInput
              style={AuthStyles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="nama@email.com"
              placeholderTextColor="#999"
              editable={!isLoading}
            />

            <Text style={AuthStyles.label}>No. Telepon (Opsional)</Text>
            <TextInput
              style={AuthStyles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="08123456789"
              placeholderTextColor="#999"
              editable={!isLoading}
            />

            <Text style={AuthStyles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[AuthStyles.input, styles.inputDark, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Min. 8 karakter"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Image
                  source={
                    showPassword
                      ? require('../../assets/icons/fi-sr-eye.png')
                      : require('../../assets/icons/fi-sr-eye-crossed.png')
                  }
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <Text style={AuthStyles.label}>Konfirmasi Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[AuthStyles.input, styles.inputDark, { flex: 1 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Ulangi password"
                placeholderTextColor="#999"
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
                disabled={isLoading}
              >
                <Image
                  source={
                    showConfirmPassword
                      ? require('../../assets/icons/fi-sr-eye.png')
                      : require('../../assets/icons/fi-sr-eye-crossed.png')
                  }
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.registerButtonSection}>
            <TouchableOpacity
              style={[AuthStyles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={AuthStyles.primaryButtonText}>Register</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => !isLoading && navigation.navigate('Login')}
            style={styles.loginLink}
            disabled={isLoading}
          >
            <Text style={styles.loginText}>
              Sudah punya akun? <Text style={styles.loginTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.navigationBarSpacer} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    marginTop: -14,
    left: 10,
  },
  inputDark: {
    backgroundColor: '#F0F0E8',
    color: '#000',
    borderColor: '#C9C9C9',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    bottom: 22,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIcon: {
    width: 16,
    height: 20,
  },
  passwordHint: {
    fontSize: 11,
    color: '#666',
    marginTop: -12,
    marginBottom: 8,
    paddingLeft: 10,
  },
  registerButtonSection: {
    paddingHorizontal: 82,
    paddingVertical: 40,
    top: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginLink: {
    marginTop: -16,
    alignSelf: 'center',
    padding: 10,
  },
  loginText: {
    color: '#ffffffff',
    fontSize: 12,
  },
  loginTextBold: {
    color: '#DABC4E',
    fontWeight: 'bold',
  },
  navigationBarSpacer: {
    height: Platform.OS === 'android' ? 48 : 0,
  },
});

export default RegisterScreen;