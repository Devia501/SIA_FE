import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardManager from '../screens/manager/DashboardManager';
import KelolaPendaftaranScreen from '../screens/manager/KelolaPendaftaranScreen';
import VerifikasiDokumenScreen from '../screens/manager/VerifikasiDokumen';
import SystemSettings from '../screens/manager/SystemSettings';
import ManageNotification from '../screens/manager/ManageNotification';
import VerifikasiPembayaran from '../screens/manager/VerifikasiPembayaran';

export type ManagerStackParamList = {
  ManagerDashboard: undefined;
  KelolaPendaftaran: undefined;
  VerifikasiDokumen: {
    name: string;
    email: string;
    prodi: string;
    registrationId: number;
  };
  SystemSettings: undefined;
  ManageNotification: undefined;
  VerifikasiPembayaran: undefined;
};

const Stack = createNativeStackNavigator<ManagerStackParamList>();

const ManagerNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ManagerDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 400,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="ManagerDashboard" component={DashboardManager} />
      <Stack.Screen name="KelolaPendaftaran" component={KelolaPendaftaranScreen} />
      <Stack.Screen name="VerifikasiDokumen" component={VerifikasiDokumenScreen} />
      <Stack.Screen name="SystemSettings" component={SystemSettings} />
      <Stack.Screen name="ManageNotification" component={ManageNotification} />
      <Stack.Screen name="VerifikasiPembayaran" component={VerifikasiPembayaran} />
    </Stack.Navigator>
  );
};

export default ManagerNavigator;