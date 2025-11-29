import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

// Hapus import yang berkaitan dengan Navigation
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { AuthStackParamList } from '../navigation/AppNavigator';

// Hapus type dan interface Props karena navigation tidak lagi diterima

const SplashScreen: React.FC = () => { 
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);

  useEffect(() => {
    // Animasi fade in dan scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, // Waktu animasi
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();
    
  }, []); // Dependensi kosong

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.Image
          source={require('../assets/images/logo-ugn2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#015023',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});

export default SplashScreen;