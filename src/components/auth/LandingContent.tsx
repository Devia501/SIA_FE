import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

interface LandingContentProps {
  onLogin: () => void;
  onRegister: () => void;
}

const LandingContent: React.FC<LandingContentProps> = ({ onLogin, onRegister }) => {
  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo-ugn.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>UNIVERSITAS GLOBAL NUSANTARA</Text>
      </View>

      {/* Buttons Section */}
      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={onLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={onRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: height * 0.48,
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 1,
  },
  buttonSection: {
    width: '100%',
    gap: 15,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  loginButton: {
    backgroundColor: '#D4A853',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#F5F5DC',
  },
  registerButtonText: {
    color: '#2d5a3d',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LandingContent;