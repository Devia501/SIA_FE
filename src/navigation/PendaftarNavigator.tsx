import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/pendaftar/DashboardScreen';
import TataCaraScreen from '../screens/pendaftar/TataCaraScreen';
import InformasiPentingScreen from '../screens/pendaftar/InformasiPentingScreen';
import StatusPendaftaranAwalScreen from '../screens/pendaftar/StatusPendaftaranAwalScreen';
import ProfileScreen from '../screens/pendaftar/ProfileScreen';
import PendaftaranScreen from '../screens/pendaftar/PendaftaranScreen';
import DataAlamatScreen from '../screens/pendaftar/DataAlamatScreen';
import DataAkademikScreen from '../screens/pendaftar/DataAkademikScreen';
import DataPrestasiScreen from '../screens/pendaftar/DataPrestasiScreen';
import DataOrangTuaScreen from '../screens/pendaftar/DataOrangTuaScreen';
import RincianBiayaPendaftaranScreen from '../screens/pendaftar/RincianBiayaPendaftaranScreen';
import VerifikasiPembayaranScreen from '../screens/pendaftar/VerifikasiPembayaranScreen';
import TungguKonfirmasi from '../screens/pendaftar/TungguKonfirmasi';
import VerifikasiPembayaranBerhasil from '../screens/pendaftar/VerifikasiPembayaranBerhasil';
import StatusPendaftaranProses from '../screens/pendaftar/StatusPendaftaranProses';
import StatusPendaftaranDone from '../screens/pendaftar/StatusPendaftaranDone';
import HasilDiterima from '../screens/pendaftar/HasilDiterima';
import HasilDitolak from '../screens/pendaftar/HasilDitolak';
import NotificationScreen from '../screens/pendaftar/NotificationScreen';

export type PendaftarStackParamList = {
  PendaftarDashboard: undefined;
  Notifications: undefined;
  TataCara: undefined;
  InformasiPenting: undefined;
  StatusPendaftaranAwal: undefined;
  Profile: undefined;
  PendaftaranMahasiswa: undefined;
  DataAlamat: undefined;
  DataAkademik: undefined;
  DataPrestasi: undefined;
  DataOrangTua: undefined;
  RincianBiayaPendaftaran: undefined;
  VerifikasiPembayaran: undefined;
  TungguKonfirmasi: undefined;
  VerifikasiPembayaranBerhasil: undefined;
  StatusPendaftaranProses: undefined;
  StatusPendaftaranDone: undefined;
  HasilDiterima: undefined;
  HasilDitolak: undefined;
};

const Stack = createNativeStackNavigator<PendaftarStackParamList>();

const PendaftarNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="PendaftarDashboard"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 400,
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen name="PendaftarDashboard" component={DashboardScreen} />
      
      {/* Notifications Screen - with custom header */}
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          headerShown: true,
          headerTitle: 'Notifikasi',
          headerStyle: {
            backgroundColor: '#015023',
          },
          headerTintColor: '#DABC4E',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          animation: 'slide_from_right',
        }}
      />
      
      <Stack.Screen name="TataCara" component={TataCaraScreen} />
      <Stack.Screen name="InformasiPenting" component={InformasiPentingScreen} />
      <Stack.Screen name="StatusPendaftaranAwal" component={StatusPendaftaranAwalScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PendaftaranMahasiswa" component={PendaftaranScreen} />
      <Stack.Screen name="DataAlamat" component={DataAlamatScreen} />
      <Stack.Screen name="DataAkademik" component={DataAkademikScreen} />
      <Stack.Screen name="DataPrestasi" component={DataPrestasiScreen} />
      <Stack.Screen name="DataOrangTua" component={DataOrangTuaScreen} />
      <Stack.Screen name="RincianBiayaPendaftaran" component={RincianBiayaPendaftaranScreen} />
      <Stack.Screen name="VerifikasiPembayaran" component={VerifikasiPembayaranScreen} />
      <Stack.Screen name="TungguKonfirmasi" component={TungguKonfirmasi} />
      <Stack.Screen name="VerifikasiPembayaranBerhasil" component={VerifikasiPembayaranBerhasil} />
      <Stack.Screen name="StatusPendaftaranProses" component={StatusPendaftaranProses} />
      <Stack.Screen name="StatusPendaftaranDone" component={StatusPendaftaranDone} />
      <Stack.Screen name="HasilDiterima" component={HasilDiterima} />
      <Stack.Screen name="HasilDitolak" component={HasilDitolak} />
    </Stack.Navigator>
  );
};

export default PendaftarNavigator;