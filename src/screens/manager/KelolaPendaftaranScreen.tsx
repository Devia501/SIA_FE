import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ManagerStackParamList } from '../../navigation/ManagerNavigator';
import { ManagerStyles, Colors } from '../../styles/ManagerStyles';
import { managerService, Applicant } from '../../services/managerService.ts'; // 🆕 Import managerService

type KelolaPendaftaranNavigationProp = NativeStackNavigationProp<
  ManagerStackParamList,
  'KelolaPendaftaran'
>;

// Komponen untuk Status Badge
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
      backgroundColor = '#95a5a6'; // Gray color for draft
      text = 'Draft';
      break;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <Text style={styles.statusText}>{text}</Text>
    </View>
  );
};

// Komponen untuk Item Pendaftar
interface RegistrationItemProps {
  data: Applicant;
  navigation: KelolaPendaftaranNavigationProp;
  onStatusUpdate: () => void; // 🆕 Callback untuk refresh setelah update
}

const RegistrationItem = ({
  data,
  navigation,
  onStatusUpdate,
}: RegistrationItemProps) => {
  const [loading, setLoading] = useState(false);

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

  // 🆕 Handle Approve
  const handleApprove = async () => {
    Alert.alert(
      'Konfirmasi Approve',
      `Apakah Anda yakin ingin menyetujui pendaftar ${data.full_name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Setujui',
          onPress: async () => {
            setLoading(true);
            try {
              await managerService.updateApplicantStatus(data.id_profile, {
                status: 'approved',
                notes: 'Disetujui oleh manager',
              });
              Alert.alert('Berhasil', 'Pendaftar berhasil disetujui');
              onStatusUpdate(); // Refresh data
            } catch (error: any) {
              Alert.alert('Gagal', error.message || 'Gagal menyetujui pendaftar');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // 🆕 Handle Reject
  const handleReject = async () => {
    Alert.alert(
      'Konfirmasi Reject',
      `Apakah Anda yakin ingin menolak pendaftar ${data.full_name}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Tolak',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await managerService.updateApplicantStatus(data.id_profile, {
                status: 'rejected',
                notes: 'Ditolak oleh manager',
              });
              Alert.alert('Berhasil', 'Pendaftar berhasil ditolak');
              onStatusUpdate(); // Refresh data
            } catch (error: any) {
              Alert.alert('Gagal', error.message || 'Gagal menolak pendaftar');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.itemCard, { borderColor: cardColor }]}>
      <Image
        source={require('../../assets/images/profile 3.png')}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{data.full_name}</Text>
        <Text style={styles.itemDetail}>{data.email}</Text>
        <Text style={styles.itemDetail}>
          {data.program_name} - {data.created_at}
        </Text>
      </View>

      <View style={styles.itemStatusContainer}>
        <StatusBadge status={data.registration_status} />

        {/* 🆕 Action Buttons - hanya tampil jika status masih submitted */}
        {data.registration_status === 'submitted' && !loading && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={handleApprove}
            >
              <Text style={styles.actionBtnText}>✓</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={handleReject}
            >
              <Text style={styles.actionBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && <ActivityIndicator size="small" color={Colors.secondary} />}
      </View>
    </View>
  );
};

const KelolaPendaftaranScreen = () => {
  const navigation = useNavigation<KelolaPendaftaranNavigationProp>();

  // 🆕 State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'approved' | 'rejected' | 'submitted'
  >('all');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 🆕 Fetch applicants dari API
  const fetchApplicants = async () => {
    try {
      const filters: any = {};

      if (activeFilter !== 'all') {
        filters.status = activeFilter;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery;
      }

      const response = await managerService.getApplicants(filters);

      if (response.success) {
        setApplicants(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching applicants:', error);
      Alert.alert('Error', 'Gagal memuat data pendaftar');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🆕 Load data saat pertama kali
  useEffect(() => {
    fetchApplicants();
  }, [activeFilter, searchQuery]);

  // 🆕 Reload saat screen di-focus
  useFocusEffect(
    useCallback(() => {
      fetchApplicants();
    }, [activeFilter, searchQuery])
  );

  // 🆕 Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchApplicants();
  };

  // 🆕 Filter button handler
  const handleFilterPress = (
    filter: 'all' | 'approved' | 'rejected' | 'submitted'
  ) => {
    setActiveFilter(activeFilter === filter ? 'all' : filter);
  };

  return (
    <SafeAreaView style={ManagerStyles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.secondary]}
            tintColor={Colors.secondary}
          />
        }
      >
        {/* Header */}
        <View style={ManagerStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/App Bar - Bottom.png')}
            style={ManagerStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={ManagerStyles.headerContent}>
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

              <Text style={[ManagerStyles.headerTitle, styles.headerTitle]}>
                Kelola Pendaftaran
              </Text>

              <View style={{ width: 40 }} />
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={ManagerStyles.content}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Daftar Pendaftar</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{applicants.length}</Text>
            </View>
            <Text style={styles.notificationText1}>total</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Image
              source={require('../../assets/icons/material-symbols_search-rounded.png')}
              style={styles.searchIcon}
              resizeMode="contain"
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, email, prodi..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                styles.filterButtonLulus,
                activeFilter === 'approved' && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterPress('approved')}
            >
              <Image
                source={require('../../assets/icons/Vector2.png')}
                style={styles.filterIcon}
              />
              <Text style={styles.filterText}>Lulus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                styles.filterButtonTidakLulus,
                activeFilter === 'rejected' && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterPress('rejected')}
            >
              <Image
                source={require('../../assets/icons/Vector3.png')}
                style={styles.filterIcon}
              />
              <Text style={styles.filterText}>Tidak Lulus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                styles.filterButtonPending,
                activeFilter === 'submitted' && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterPress('submitted')}
            >
              <Image
                source={require('../../assets/icons/weui_time-filled.png')}
                style={styles.filterIcon}
              />
              <Text style={styles.filterText}>Pending</Text>
            </TouchableOpacity>
          </View>

          {/* List Pendaftar */}
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.secondary} />
                <Text style={styles.loadingText}>Memuat data...</Text>
              </View>
            ) : applicants.length > 0 ? (
              applicants.map((item) => (
                <RegistrationItem
                  key={item.id_profile}
                  data={item}
                  navigation={navigation}
                  onStatusUpdate={fetchApplicants} // 🆕 Pass refresh callback
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada data pendaftar</Text>
              </View>
            )}
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={ManagerStyles.backgroundLogo}
        resizeMode="contain"
      />

      {/* Bottom Navigation */}
      <View style={ManagerStyles.bottomNav}>
        <TouchableOpacity
          style={ManagerStyles.navItem}
          onPress={() => navigation.navigate('ManagerDashboard')}
        >
          <Image
            source={require('../../assets/icons/material-symbols_home-rounded.png')}
            style={ManagerStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity style={ManagerStyles.navItem}>
          <View style={ManagerStyles.navItemActive}>
            <Image
              source={require('../../assets/icons/proicons_save-pencil.png')}
              style={ManagerStyles.navIcon}
              resizeMode="contain"
            />
            <Text style={ManagerStyles.navTextActive}>Manage</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={ManagerStyles.navItem}
          onPress={() => navigation.navigate('SystemSettings')}
        >
          <Image
            source={require('../../assets/icons/material-symbols_settings-rounded.png')}
            style={ManagerStyles.navIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerTitle: {
    left: 30,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    left: 72,
  },
  notificationText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  notificationText1: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    paddingVertical: 10,
  },
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
    borderColor: Colors.textLight,
  },
  filterButtonLulus: {
    backgroundColor: Colors.backgroundLight,
  },
  filterButtonTidakLulus: {
    backgroundColor: Colors.backgroundLight,
  },
  filterButtonPending: {
    backgroundColor: Colors.backgroundLight,
  },
  filterIcon: {
    width: 16,
    height: 16,
    marginRight: 5,
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  listContainer: {},
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textLight,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 8,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: Colors.textDark,
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
    marginBottom: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  // 🆕 Action Buttons Styles
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  approveBtn: {
    backgroundColor: Colors.statusApproved,
    borderColor: '#00aa00',
  },
  rejectBtn: {
    backgroundColor: Colors.statusRejected,
    borderColor: '#cc0000',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    opacity: 0.7,
  },
});

export default KelolaPendaftaranScreen;