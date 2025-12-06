// src/screens/admin/KelolaManager.tsx (AddManagerScreen.tsx)

import React, { useState, useEffect, useCallback } from 'react';
import { // Tambahkan ActivityIndicator dan RefreshControl
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ImageBackground, 
  ActivityIndicator,
  RefreshControl,
  Alert, // Tambahkan Alert untuk notifikasi error
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
// Import Services dan Styles
import { AdminStyles } from '../../styles/AdminStyles'; 
import { AdminStackParamList } from '../../navigation/AdminNavigator'; 
import { ManagerStyles, Colors } from '../../styles/ManagerStyles'; // Diperlukan untuk header icons
import { adminService, UserManagement } from '../../services/apiService'; // Import API Service

// Definisi Tipe Navigasi
type AddManagerScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AddManager'>;

// Komponen Card Manajer Dinamis
interface ManagerCardProps {
  manager: UserManagement; // Menggunakan tipe dari apiService
  onPress: (managerId: number) => void;
}

const ManagerCard: React.FC<ManagerCardProps> = ({ manager, onPress }) => (
  <TouchableOpacity 
    style={[localStyles.managerCard, { width: '100%', alignSelf: 'center' }]} 
    onPress={() => onPress(manager.id_user)}
  >
    <Image 
      source={require('../../assets/icons/ix_user-profile-filled.png')} 
      style={localStyles.managerIcon}
      resizeMode="contain"
    />
    <View style={localStyles.managerInfo}>
      <Text style={localStyles.managerName}>{manager.name}</Text>
      <Text style={localStyles.managerRole}>{manager.role.toUpperCase()}</Text>
    </View>
  </TouchableOpacity>
);

const AddManagerScreen = () => { // Ganti nama komponen menjadi AddManagerScreen
  const navigation = useNavigation<AddManagerScreenNavigationProp>();
  const isFocused = useIsFocused();
  
  // State untuk data dan loading
  const [managers, setManagers] = useState<UserManagement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 📌 Fungsi Mengambil Data dari API
  const fetchManagers = useCallback(async () => {
    try {
      // Panggil API Laravel untuk mendapatkan daftar user dengan role 'manager' atau 'admin'
      const response = await adminService.listUsers({ 
        role: 'manager,admin', // Sesuaikan dengan kebutuhan filtering di backend
      });
      // Filter di frontend jika backend tidak mendukung filtering role
      const filteredManagers = response.data.filter(u => u.role === 'manager' || u.role === 'admin');
      setManagers(filteredManagers);
    } catch (error) {
      console.error('❌ Failed to fetch managers:', error);
      Alert.alert('Error', 'Gagal memuat data manager. Periksa koneksi API.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Panggil saat komponen dimuat atau fokus
  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      fetchManagers();
    }
  }, [isFocused, fetchManagers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchManagers();
  };

  const handleViewManager = (managerId: number) => {
    // Navigasi ke halaman detail atau edit, atau langsung ke halaman CRUD
    console.log(`Lihat detail manajer ID: ${managerId}`);
    navigation.navigate('AddNewManager'); // Arahkan ke halaman CRUD untuk aksi lanjutan
  };
  
  const handleAddNewManager = () => {
     navigation.navigate('AddNewManager'); 
  };

  return (
    <SafeAreaView style={AdminStyles.container} edges={['top', 'bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DABC4E']} tintColor="#DABC4E" />
        }
      >
        
        {/* Header */}
        <View style={AdminStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/App Bar - Bottom.png')}
            style={AdminStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={AdminStyles.headerContent}>
              <Text style={AdminStyles.headerTitle}>Kelola Manager</Text> 
            </View>
          </ImageBackground>
        </View>

        <View style={AdminStyles.contentPadding}>
          
          {/* Manager Users Header (dengan jumlah data) */}
          <View style={localStyles.managerUsersHeader}>
            <Text style={localStyles.managerUsersText}>Manager Users</Text>
          </View>

          {/* Tombol Tambah Manajer (Arahkan ke layar CRUD) */}
          <TouchableOpacity 
            style={[AdminStyles.cardBase, localStyles.addButton]} 
            onPress={handleAddNewManager}
          >
            <Image 
                source={require('../../assets/icons/gridicons_add.png')}
                style={localStyles.addIcon}
                resizeMode="contain"
            />
            <Text style={localStyles.addText}>Add new manager</Text>
          </TouchableOpacity>
          
          {/* Daftar Manajer Dinamis */}
          {isLoading ? (
            <ActivityIndicator size="large" color="#DABC4E" style={{ marginTop: 30 }} />
          ) : managers.length === 0 ? (
            <Text style={localStyles.noDataText}>Tidak ada data Manager ditemukan.</Text>
          ) : (
            managers.map((manager) => (
              <ManagerCard
                key={manager.id_user}
                manager={manager}
                onPress={handleViewManager}
              />
            ))
          )}
          
          {/* Spacer untuk Bottom Nav Fixed */}
          <View style={AdminStyles.navSpacer} />

          <TouchableOpacity 
                onPress={() => navigation.navigate('AdminDashboard')}
              >
                <LinearGradient
                    colors={['#DABC4E', '#EFE3B0']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 1 }}
                    style={localStyles.actionButtonPrimary}
                    >
                <Text style={localStyles.actionButtonTextSecondary}>Kembali ke Dashboard</Text>
                </LinearGradient>
              </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={AdminStyles.backgroundLogo}
        resizeMode="contain"
      />

      {/* Bottom Navigation (Fixed) */}
      <View style={AdminStyles.bottomNav}>
        <TouchableOpacity style={AdminStyles.navItem} onPress={() => navigation.navigate('AdminDashboard')}>
          <Image
            source={require('../../assets/icons/material-symbols_home-rounded.png')}
            style={AdminStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={AdminStyles.navItem}
        onPress={() => navigation.navigate('StatistikPendaftaran')}>
          <Image
            source={require('../../assets/icons/proicons_save-pencil.png')}
            style={AdminStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Item Aktif: Kelola Manager */}
        <TouchableOpacity style={AdminStyles.navItem}>
          <View style={AdminStyles.navItemActive}>
            <Image
              source={require('../../assets/icons/f7_person-3-fill.png')}
              style={AdminStyles.navIcon}
              resizeMode="contain"
            />
            <Text style={AdminStyles.navTextActive}>Manager</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Style Lokal
const localStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  actionButtonTextSecondary: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffffff',
    marginRight: 8,
  },

  actionButtonPrimary: {
    flexDirection: 'row',
    backgroundColor: '#DABC4E',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  
  // --- Manager Users Label ---
  managerUsersHeader: {
    alignSelf: 'flex-start',
    backgroundColor: '#DABC4E',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000000ff',
    opacity: 0.75,
  },
  managerUsersText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffffff',
  },

  // --- Tombol Tambah Manajer ---
  addButton: {
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 12, 
    paddingVertical: 14, 
    marginBottom: 20, // Tambah margin bawah
    backgroundColor: '#DABC4E',
    borderColor: '#015023',
  },
  addIcon: {
    width: 24,
    height: 24,
    tintColor: '#000',
    marginRight: 10,
  },
  addText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },

  // --- Manager Card ---
  managerCard: {
    ...AdminStyles.cardBase,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 15,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10, // Tambah margin
  },
  managerIcon: {
    width: 25,
    height: 25,
    tintColor: '#000',
  },
  managerInfo: {
    alignItems: 'flex-start',
  },
  managerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  managerRole: {
    fontSize: 12,
    color: '#015023', 
    marginTop: 2,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AddManagerScreen;