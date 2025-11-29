import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardAdmin from '../screens/admin/DashboardAdmin';
import AddManagerScreen from '../screens/admin/AddManagerScreen';
import AddNewManager from '../screens/admin/AddNewManager';
import AddNewManagerForm from '../screens/admin/AddNewManagerForm';
import SetPermission from '../screens/admin/SetPermission';
import KelolaPendaftaran from '../screens/admin/KelolaPendaftaran';
import ReviewData from '../screens/admin/ReviewData';
import KonfirmasiData from '../screens/admin/KonfirmasiData';
import StatistikPendaftaran from '../screens/admin/StatistikPendaftaran';
import DataPendaftar from '../screens/admin/DataPendaftar';
import VerifikasiDokumen from '../screens/admin/VerifikasiDokumen';
import VerifikasiPembayaran from '../screens/admin/VerifikasiPembayaran';
import StatistikPembayaran from '../screens/admin/StatistikPembayaran';
import StatistikProdi from '../screens/admin/StatistikProdi';
// Import screen lain untuk admin di sini

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AddManager: undefined;
  AddNewManager: undefined;
  AddNewManagerForm: undefined;
  SetPermission: undefined;
  KelolaPendaftaran: undefined;
  ReviewData: undefined;
  KonfirmasiData: undefined;
  StatistikPendaftaran: undefined;
  DataPendaftar: undefined;
  VerifikasiDokumen: {
    name: string;
    email: string;
    prodi: string;
    registrationId: number;
  };
  VerifikasiPembayaran: undefined;
  StatistikPembayaran: undefined;
  StatistikProdi: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 400,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="AdminDashboard" component={DashboardAdmin} />
      <Stack.Screen name="AddManager" component={AddManagerScreen} />
      <Stack.Screen name="AddNewManager" component={AddNewManager} />
      <Stack.Screen name="AddNewManagerForm" component={AddNewManagerForm} />
      <Stack.Screen name="SetPermission" component={SetPermission} />
      <Stack.Screen name="KelolaPendaftaran" component={KelolaPendaftaran} />
      <Stack.Screen name="ReviewData" component={ReviewData} />
      <Stack.Screen name="KonfirmasiData" component={KonfirmasiData} />
      <Stack.Screen name="StatistikPendaftaran" component={StatistikPendaftaran} />
      <Stack.Screen name="DataPendaftar" component={DataPendaftar} />
      <Stack.Screen name="VerifikasiDokumen" component={VerifikasiDokumen} />
      <Stack.Screen name="VerifikasiPembayaran" component={VerifikasiPembayaran} />
      <Stack.Screen name="StatistikPembayaran" component={StatistikPembayaran} />
      <Stack.Screen name="StatistikProdi" component={StatistikProdi} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;