import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LandingScreen from '../screens/auth/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Navigators
import PendaftarNavigator from './PendaftarNavigator';
import ManagerNavigator from './ManagerNavigator';
import AdminNavigator from '../navigation/AdminNavigator';

// Define the AuthStackParamList type for authentication screens
export type AuthStackParamList = {
  Splash: undefined;
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  PendaftarApp: undefined;
  ManagerApp: undefined;
  AdminApp: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AppNavigator = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  // useNavigation tetap ada, meskipun tidak digunakan untuk reset
  const navigation = useNavigation<any>(); 

  // 🛑 BLOK useEffect UNTUK navigation.reset() DIHAPUS TOTAL 🛑
  /*
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AdminApp' }],
        });
      } else if (user.role === 'manager') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'ManagerApp' }],
        });
      } else if (user.role === 'pendaftar') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'PendaftarApp' }],
        });
      }
    }
  }, [user, isLoading]);
  */

  // Tambahkan fungsi untuk merender Stack berdasarkan Role
  const RoleStack = () => {
    if (user?.role === 'admin') {
      return <Stack.Screen name="AdminApp" component={AdminNavigator} />;
    }
    if (user?.role === 'manager') {
      return <Stack.Screen name="ManagerApp" component={ManagerNavigator} />;
    }
    if (user?.role === 'pendaftar') {
      return <Stack.Screen name="PendaftarApp" component={PendaftarNavigator} />;
    }
    // Fallback yang aman jika user login tapi role-nya tidak terdeteksi
    return <Stack.Screen name="PendaftarApp" component={PendaftarNavigator} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoading ? (
        // 📌 KONDISI 1: Loading
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !isAuthenticated ? (
        // 📌 KONDISI 2: Belum Login
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // 📌 KONDISI 3: Sudah Login (Rendering Bersyarat Murni)
        <>{RoleStack()}</> // Pastikan SELALU merender satu komponen Stack.Screen
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;