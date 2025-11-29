// src/screens/admin/AddNewManagerScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ManagerStyles, Colors } from '../../styles/ManagerStyles'; 
import { AdminStyles } from '../../styles/AdminStyles';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import LinearGradient from 'react-native-linear-gradient';
import { adminService, UserManagement } from '../../services/apiService';

type AddNewManagerNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'AddNewManager'>;

const AddNewManagerScreen = () => {
  const navigation = useNavigation<AddNewManagerNavigationProp>();
  const isFocused = useIsFocused();

  const [managers, setManagers] = useState<UserManagement[]>([]);
  const [allManagers, setAllManagers] = useState<UserManagement[]>([]); // 📌 Simpan semua data untuk filter lokal
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  // 📌 Fungsi mengambil data Manager dari API
  const fetchManagers = useCallback(async () => {
    try {
      console.log('🔍 Fetching managers...');
      
      // Ambil semua user tanpa filter search (filter dilakukan di frontend)
      const response = await adminService.listUsers({});
      
      console.log('📦 Raw Response:', JSON.stringify(response, null, 2));
      
      // Ambil data dari response
      const users = response.data || [];
      
      // Filter hanya manager dan admin
      const filteredManagers = users.filter((u: UserManagement) => {
        const role = u.role?.toLowerCase().trim();
        return role === 'manager' || role === 'admin';
      });
      
      console.log('✅ Filtered managers:', filteredManagers.length);
      
      setAllManagers(filteredManagers); // Simpan semua data
      setManagers(filteredManagers); // Set data awal
      
    } catch (error: any) {
      console.error('❌ Failed to fetch managers:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert('Error', `Gagal memuat data manager:\n${error.userMessage || error.message}`);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 📌 Filter data berdasarkan search text (client-side)
  useEffect(() => {
    if (searchText.trim() === '') {
      setManagers(allManagers);
    } else {
      const filtered = allManagers.filter(manager => 
        manager.name.toLowerCase().includes(searchText.toLowerCase()) ||
        manager.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setManagers(filtered);
    }
  }, [searchText, allManagers]);

  // 📌 Load data saat screen fokus
  useEffect(() => {
    if (isFocused) {
      setIsLoading(true);
      fetchManagers();
    }
  }, [isFocused, fetchManagers]);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchText(''); // Reset search saat refresh
    fetchManagers();
  };

  const handleAddManager = () => {
    navigation.navigate('AddNewManagerForm'); 
  };

  const handleEditManager = (managerId: number) => { 
    console.log('Edit Manager ID:', managerId);
    Alert.alert('Fitur Belum Tersedia', `Fitur edit untuk manager ID ${managerId} belum diimplementasikan.`);
  };

  // 📌 Logika Hapus Manager
  const handleDeleteManager = (managerId: number, managerName: string) => {
    Alert.alert(
      'Delete Manager',
      `Apakah Anda yakin ingin menghapus ${managerName}?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              await adminService.deleteUser(managerId);
              console.log('✅ Manager dihapus:', managerId);
              Alert.alert('Success', 'Manager berhasil dihapus.');
              fetchManagers(); // Refresh list
            } catch (error: any) {
              console.error('❌ Error deleting manager:', error);
              Alert.alert('Error', error.userMessage || 'Gagal menghapus manager.');
            }
          }
        },
      ]
    );
  };

  // 📌 Komponen Card Manager
  const ManagerCard = ({ manager }: { manager: UserManagement }) => {
    const isActive = manager.is_active !== false; // Default true jika undefined
    const displayRole = manager.role.charAt(0).toUpperCase() + manager.role.slice(1);
    
    // Format tanggal dengan fallback jika created_at tidak ada
    const dateJoined = manager.created_at 
      ? new Date(manager.created_at).toLocaleDateString('id-ID', {
          year: 'numeric', month: 'long', day: 'numeric'
        })
      : 'Tanggal tidak tersedia';

    return (
      <View style={[localStyles.managerCard, isActive ? localStyles.activeCard : localStyles.inactiveCard]}>
        <View style={localStyles.cardHeader}>
          <View>
            <Text style={localStyles.managerName}>{manager.name}</Text>
            <Text style={localStyles.managerRole}>{displayRole}</Text>
          </View>
          <View style={isActive ? localStyles.statusBadgeActive : localStyles.statusBadgeInactive}>
            <Text style={isActive ? localStyles.statusTextActive : localStyles.statusTextInactive}>
              {isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        
        <View style={localStyles.infoRow}>
          <Image
            source={require('../../assets/icons/Vector4.png')}
            style={localStyles.infoIcon}
            resizeMode="contain"
          />
          <Text style={localStyles.infoText}>{manager.email}</Text>
        </View>
        
        <View style={localStyles.infoRow}>
          <Image
            source={require('../../assets/icons/clarity_date-solid.png')}
            style={localStyles.infoIcon}
            resizeMode="contain"
          />
          <Text style={localStyles.infoText}>Joined: {dateJoined}</Text>
        </View>

        <View style={localStyles.actionButtons}>
          <TouchableOpacity 
            style={localStyles.editButton}
            onPress={() => handleEditManager(manager.id_user)}
          >
            <Text style={localStyles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={localStyles.deleteButton}
            onPress={() => handleDeleteManager(manager.id_user, manager.name)}
          >
            <Text style={localStyles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
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
              <TouchableOpacity
                style={ManagerStyles.headerIconContainerLeft}
                onPress={() => navigation.goBack()}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                  style={ManagerStyles.headerIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={AdminStyles.headerTitle}>Kelola Manager</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={AdminStyles.contentPadding}>
          {/* Manager Users Header */}
          <View style={localStyles.managerUsersHeader}>
            <Text style={localStyles.managerUsersText}>
              Manager Users ({managers.length})
            </Text>
          </View>

          {/* Search Bar */}
          <View style={localStyles.searchContainer}>
            <Image
              source={require('../../assets/icons/material-symbols_search-rounded.png')}
              style={localStyles.searchIcon}
              resizeMode="contain"
            />
            <TextInput
              style={localStyles.searchInput}
              placeholder="Search Manager..."
              placeholderTextColor="#666"
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Text style={localStyles.clearButton}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Manager Cards */}
          {isLoading ? (
            <View style={localStyles.centerContainer}>
              <ActivityIndicator size="large" color="#DABC4E" />
              <Text style={localStyles.loadingText}>Memuat data...</Text>
            </View>
          ) : managers.length === 0 ? (
            <View style={localStyles.centerContainer}>
              <Text style={localStyles.noDataText}>
                {searchText ? 'Tidak ada hasil pencarian' : 'Tidak ada data Manager'}
              </Text>
              {searchText && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Text style={localStyles.resetSearch}>Reset pencarian</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            managers.map((manager) => (
              <ManagerCard key={manager.id_user} manager={manager} />
            ))
          )}

          {/* Add New Manager Button */}
          <TouchableOpacity onPress={handleAddManager}>
            <LinearGradient
              colors={['#DABC4E', '#EFE3B0']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.addManagerButton}
            >
              <Image
                source={require('../../assets/icons/gridicons_add.png')}
                style={localStyles.addManagerIcon}
                resizeMode="contain"
              />
              <Text style={localStyles.addManagerText}>Tambah Manager Baru</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Spacer */}
          <View style={AdminStyles.navSpacer} />
        </View>
      </ScrollView>

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={AdminStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// Local Styles
const localStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  centerContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  resetSearch: {
    marginTop: 12,
    fontSize: 14,
    color: '#DABC4E',
    fontWeight: 'bold',
  },
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
    color: '#ffffff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 2,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#DABC4E',
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
    tintColor: '#000',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  clearButton: {
    fontSize: 20,
    color: '#666',
    paddingHorizontal: 8,
  },
  managerCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 3,
  },
  activeCard: {
    backgroundColor: '#FEFAE0',
    borderColor: '#DABC4E',
  },
  inactiveCard: {
    backgroundColor: '#FEFAE0',
    borderColor: '#DC2626',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  managerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  managerRole: {
    fontSize: 12,
    color: '#666',
  },
  statusBadgeActive: {
    backgroundColor: '#015023',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusBadgeInactive: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusTextInactive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#000',
  },
  infoText: {
    fontSize: 13,
    color: '#000',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#015023',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  addManagerButton: {
    flexDirection: 'row',
    backgroundColor: '#DABC4E',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  addManagerIcon: {
    width: 24,
    height: 24,
    tintColor: '#ffffff',
    marginRight: 8,
  },
  addManagerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default AddNewManagerScreen;