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
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStyles } from '../../styles/AdminStyles'; // Tetap pakai AdminStyles sesuai request
import { ManagerStyles, Colors } from '../../styles/ManagerStyles'; // Import Colors untuk konsistensi logic warna
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { managerService, Applicant, ApiResponse } from '../../services/managerService';

// Definisi Tipe Navigasi
type KelolaPendaftaranNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'KelolaPendaftaran'>;

// --- Komponen Badge Status (Style Asli Anda) ---
const StatusBadge = ({
  status,
}: {
  status: 'approved' | 'rejected' | 'submitted' | 'draft';
}) => {
  let backgroundColor: string;
  let text: string;

  switch (status) {
    case 'approved':
      backgroundColor = Colors.statusApproved;
      text = 'Lulus';
      break;
    case 'rejected':
      backgroundColor = Colors.statusRejected;
      text = 'Tidak Lulus';
      break;
    case 'submitted':
      backgroundColor = Colors.statusPending;
      text = 'Pending';
      break;
    case 'draft':
      backgroundColor = '#95a5a6';
      text = 'Draft';
      break;
    default:
       backgroundColor = '#95a5a6';
       text = status;
  }

  return (
    <View style={[localStyles.statusBadge, { backgroundColor }]}>
      <Text style={localStyles.statusText}>{text}</Text>
    </View>
  );
};

// --- Komponen Item List (Style Asli Anda) ---
interface RegistrationItemProps {
  data: Applicant;
  navigation: KelolaPendaftaranNavigationProp;
}

const RegistrationItem = ({ data, navigation }: RegistrationItemProps) => {
  let cardColor: string;

  switch (data.registration_status) {
    case 'approved':
      cardColor = Colors.statusApproved;
      break;
    case 'rejected':
      cardColor = Colors.statusRejected;
      break;
    case 'submitted':
    default:
      cardColor = Colors.statusPending;
      break;
  }

  const handleViewDetail = () => {
    // Navigasi ke detail
    navigation.navigate('VerifikasiDokumen', {
      id_profile: data.id_profile,
      name: data.full_name,
      email: data.email,
      program_name: data.program_name,
    } as any);
  };

  return (
    <TouchableOpacity 
      onPress={handleViewDetail} 
      style={[localStyles.itemCard, { borderColor: cardColor }]}
    > 
      <Image
        source={require('../../assets/images/profile 3.png')}
        style={localStyles.itemImage}
        resizeMode="cover"
      />
      <View style={localStyles.itemContent}>
        <Text style={localStyles.itemName}>{data.full_name}</Text>
        <Text style={localStyles.itemDetail}>{data.email}</Text>
        <Text style={localStyles.itemDetail}>
          {data.program_name} - {data.created_at}
        </Text>
      </View>

      <View style={localStyles.itemStatusContainer}>
        <StatusBadge status={data.registration_status as any} />
      </View>
    </TouchableOpacity>
  );
};

const KelolaPendaftaran = () => {
  const navigation = useNavigation<KelolaPendaftaranNavigationProp>();

  // --- Logic Integrasi (State & API) ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'approved' | 'rejected' | 'submitted' | 'draft'
  >('all');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplicants = async () => {
    try {
      const filters: any = {};
      if (activeFilter !== 'all') filters.status = activeFilter;
      if (searchQuery.trim()) filters.search = searchQuery;

      const response: ApiResponse<Applicant[]> = await managerService.getApplicants(filters);

      if (response.success) {
        setApplicants(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching applicants:', error);
      Alert.alert('Error', error.message || 'Gagal memuat data pendaftar');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [activeFilter, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchApplicants();
    }, [activeFilter, searchQuery])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplicants();
  };

  const handleFilterPress = (
    filter: 'all' | 'approved' | 'rejected' | 'submitted' | 'draft'
  ) => {
    setActiveFilter(activeFilter === filter ? 'all' : filter);
  };

  return (
    <SafeAreaView style={AdminStyles.container} edges={['top', 'bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.secondary]}
            tintColor={Colors.secondary}
          />
        }
      >
        
        {/* --- HEADER (Style Asli Admin yang kamu minta) --- */}
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
              
              <Text style={AdminStyles.headerTitle}>Monitoring Pendaftaran</Text> 
            </View>
          </ImageBackground>
        </View>

        {/* --- CONTENT (Container Style Lokal Anda) --- */}
        <View style={localStyles.contentContainer}>
            
            {/* Summary Header */}
            <View style={localStyles.summaryHeader}>
                <Text style={localStyles.summaryTitle}>Daftar Pendaftar</Text>
                <View style={localStyles.notificationBadge}>
                  {/* Integrasi Data Total */}
                  <Text style={localStyles.notificationText}>{applicants.length}</Text>
                </View>
                <Text style={localStyles.notificationText1}>total</Text>
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
                  placeholder="Search by name, email, prodi..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
            </View>

            {/* Filter Buttons */}
            <View style={localStyles.filterContainer}>
                <TouchableOpacity
                  style={[
                    localStyles.filterButton,
                    localStyles.filterButtonLulus,
                    activeFilter === 'approved' && localStyles.filterButtonActive,
                  ]}
                  onPress={() => handleFilterPress('approved')}
                >
                  <Image
                    source={require('../../assets/icons/Vector2.png')}
                    style={localStyles.filterIcon}
                  />
                  <Text style={localStyles.filterText}>Lulus</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    localStyles.filterButton,
                    localStyles.filterButtonTidakLulus,
                    activeFilter === 'rejected' && localStyles.filterButtonActive,
                  ]}
                  onPress={() => handleFilterPress('rejected')}
                >
                  <Image
                    source={require('../../assets/icons/Vector3.png')}
                    style={localStyles.filterIcon}
                  />
                  <Text style={localStyles.filterText}>Tidak Lulus</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    localStyles.filterButton,
                    localStyles.filterButtonPending,
                    activeFilter === 'submitted' && localStyles.filterButtonActive,
                  ]}
                  onPress={() => handleFilterPress('submitted')}
                >
                  <Image
                    source={require('../../assets/icons/weui_time-filled.png')}
                    style={localStyles.filterIcon}
                  />
                  <Text style={localStyles.filterText}>Pending</Text>
                </TouchableOpacity>
            </View>

            {/* List Pendaftar */}
            <View style={localStyles.listContainer}>
                {loading ? (
                  <View style={localStyles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.secondary} />
                    <Text style={localStyles.loadingText}>Memuat data...</Text>
                  </View>
                ) : applicants.length > 0 ? (
                  applicants.map((item) => (
                    <RegistrationItem
                      key={item.id_profile}
                      data={item}
                      navigation={navigation}
                    />
                  ))
                ) : (
                  <View style={localStyles.emptyContainer}>
                    <Text style={localStyles.emptyText}>Tidak ada data pendaftar</Text>
                  </View>
                )}
            </View>
        </View>

      </ScrollView>

      {/* Logo Background Asli Admin */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={AdminStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// --- STYLE LOKAL (TIDAK DIUBAH SAMA SEKALI) ---
const localStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20, // Padding konten agar tidak mepet layar
    marginTop: 20,
  },
  
  // Header Summary
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight, 
  },
  notificationBadge: {
    backgroundColor: '#DABC4E',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    left: 268,
    position: 'absolute', // Style asli user
  },
  notificationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  notificationText1: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffffff', 
    marginLeft: 'auto',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
    elevation: 2, 
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    paddingVertical: 10,
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  filterButtonActive: {
    borderWidth: 2,
    borderColor: '#000',
  },
  filterButtonLulus: { backgroundColor: '#F0FFF4' },
  filterButtonTidakLulus: { backgroundColor: '#FFF5F5' },
  filterButtonPending: { backgroundColor: '#FFFFF0' },
  filterIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },

  // List Item Styles
  listContainer: {},
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 8, 
    elevation: 3,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  itemDetail: {
    fontSize: 12,
    color: '#666',
  },
  itemStatusContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 10,
  },
  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minWidth: 70,
    alignItems: 'center',
    marginBottom: 0, 
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Loading & Empty States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    opacity: 0.7,
  },
});

export default KelolaPendaftaran;