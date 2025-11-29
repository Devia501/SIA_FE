import React, { useState, useRef } from 'react';
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
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import type { WebView as WebViewType } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AuthStyles from '../../styles/AuthStyles';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../contexts/AuthContext';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const SITE_KEY = '6LdYtfkrAAAAAKMaxYdc8VAgka_fhCUhEt9_QwR9';

const LoginScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showCaptchaModal, setShowCaptchaModal] = useState<boolean>(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const webviewRef = useRef<WebViewType | null>(null);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Validasi input
    if (!email.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Email dan Password tidak boleh kosong!');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Peringatan', 'Format email tidak valid! Contoh: nama@email.com');
      return;
    }

    if (!isChecked) {
      Alert.alert('Peringatan', 'Harap centang captcha terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password, recaptchaToken || '');
      // Navigasi otomatis dilakukan oleh AppNavigator melalui AuthContext
      console.log('✅ Login successful, redirecting...');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Login Gagal', error.message || 'Terjadi kesalahan saat login.');
      
      // Reset captcha jika login gagal
      setIsChecked(false);
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // HTML untuk WebView reCAPTCHA
  const captchaHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        <style>
          html, body { 
            height: 100%; 
            margin: 0; 
            padding: 0;
            display: flex; 
            align-items: center; 
            justify-content: center;
            background-color: #ffffff;
          }
          #recaptcha-container {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
        </style>
      </head>
      <body>
        <div id="recaptcha-container">
          <div class="g-recaptcha" data-sitekey="${SITE_KEY}" data-callback="onSuccess" data-error-callback="onError"></div>
        </div>
        <script>
          function onSuccess(token) {
            try {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                success: true,
                token: token 
              }));
            } catch (e) {
              console.error('Error sending message:', e);
            }
          }
          function onError() {
            try {
              window.ReactNativeWebView.postMessage(JSON.stringify({ 
                success: false,
                error: 'reCAPTCHA error occurred' 
              }));
            } catch (e) {
              console.error('Error sending error message:', e);
            }
          }
        </script>
      </body>
    </html>
  `;

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.success && data.token) {
        setRecaptchaToken(data.token);
        setIsChecked(true);
        setShowCaptchaModal(false);
        Alert.alert('Captcha', 'Verifikasi reCAPTCHA berhasil.');
        console.log('reCAPTCHA token:', data.token);
        
        // 👇 PERBAIKAN: Reset Captcha di webview setelah sukses
        webviewRef.current?.injectJavaScript('if (typeof grecaptcha !== "undefined") { grecaptcha.reset(); } true;'); 

      } else if (data.success === false) {
        Alert.alert('Error', data.error || 'Verifikasi reCAPTCHA gagal.');
        setShowCaptchaModal(false);
        // 👇 PERBAIKAN: Reset Captcha di webview setelah error
        webviewRef.current?.injectJavaScript('if (typeof grecaptcha !== "undefined") { grecaptcha.reset(); } true;'); 
      }
    } catch (e) {
      console.warn('reCAPTCHA onMessage parse error', e);
      Alert.alert('Error', 'Terjadi kesalahan saat memproses captcha.');
    }
  };

  return (
    <SafeAreaView style={AuthStyles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#DABC4E" />

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn2.png')}
        style={[AuthStyles.backgroundLogo, styles.backgroundLogoFixed]}
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
          {/* Header */}
          <View style={AuthStyles.header}>
            <Image
              source={require('../../assets/images/logo-ugn2.png')}
              style={AuthStyles.logo}
              resizeMode="contain"
            />
            <Text style={AuthStyles.headerText}>UNIVERSITAS GLOBAL NUSANTARA</Text>
          </View>

          {/* Form */}
          <View style={AuthStyles.formContainer}>
            <Text style={AuthStyles.title}>Login</Text>

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

            <Text style={AuthStyles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[AuthStyles.input, styles.inputDark, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Masukkan password"
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
          </View>

          {/* CAPTCHA */}
          <View style={styles.captchaSection}>
            <Text style={AuthStyles.label}>Captcha</Text>
            <TouchableOpacity
              style={styles.captchaContainer}
              onPress={() => !isLoading && setShowCaptchaModal(true)}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <View style={styles.checkbox}>
                {isChecked && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.captchaText}>
                {isChecked ? "Verified – I'm not a robot" : "I'm not a robot"}
              </Text>
              <Image
                source={require('../../assets/images/captcha.png')}
                style={styles.captchaIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Tombol Login */}
          <View style={AuthStyles.buttonSection}>
            <TouchableOpacity
              style={[AuthStyles.primaryButton, isLoading && { opacity: 0.6 }]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={AuthStyles.primaryButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Link ke Register */}
          <TouchableOpacity
            onPress={() => !isLoading && navigation.navigate('Register')}
            style={styles.registerLink}
            disabled={isLoading}
          >
            <Text style={styles.registerText}>
              Belum punya akun? <Text style={styles.registerTextBold}>Daftar</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal WebView reCAPTCHA */}
      <Modal
        visible={showCaptchaModal}
        animationType="slide"
        onRequestClose={() => setShowCaptchaModal(false)}
        transparent={false}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowCaptchaModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Tutup</Text>
            </TouchableOpacity>
          </View>
          <WebView
            ref={webviewRef}
            originWhitelist={['*']}
            source={{ html: captchaHtml, baseUrl: 'http://localhost' }}
            onMessage={onMessage}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            style={styles.webview}
            onError={(e) => console.warn('WebView error:', e.nativeEvent)}
            onHttpError={(e) => console.warn('WebView HTTP error:', e.nativeEvent)}
          />
        </SafeAreaView>
      </Modal>

      <View style={styles.navigationBarSpacer} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    right: 8,
    bottom: 17,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  eyeIcon: {
    width: 16,
    height: 20,
  },
  captchaSection: {
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#015023',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#015023',
    lineHeight: 20,
  },
  captchaText: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  captchaIcon: {
    width: 24,
    height: 24,
    marginLeft: 8,
  },
  registerLink: {
    marginTop: -210,
    alignSelf: 'center',
    padding: 10,
  },
  registerText: {
    color: '#fafafaff',
    fontSize: 12,
  },
  registerTextBold: {
    color: '#DABC4E',
    fontWeight: 'bold',
  },
  navigationBarSpacer: {
    height: Platform.OS === 'android' ? 48 : 0,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#015023',
    fontSize: 16,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundLogoFixed: {
    position: 'absolute',
    zIndex: 0,
  },
});

export default LoginScreen;