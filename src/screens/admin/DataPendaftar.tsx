import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { ManagerStyles, Colors } from '../../styles/ManagerStyles'; 
import { AdminStyles } from '../../styles/AdminStyles';

type DataPendaftarNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'DataPendaftar'>;

// Interface untuk tipe data pendaftar
interface Registration {
  id: number;
  name: string;
  email: string;
  prodi: string;
  date: string;
  status: 'Approved' | 'Rejected' | 'Pending';
  icon: any;
}

// Data dummy untuk list pendaftar
const dummyRegistrations: Registration[] = [
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'johndoe@gmail.com', 
    prodi: 'Teknik Informatika', 
    date: '15 Des 2024', 
    status: 'Pending', 
    icon: require('../../assets/images/profile 3.png') 
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane.smith@email.com', 
    prodi: 'Sistem Informasi', 
    date: '14 Des 2024', 
    status: 'Approved', 
    icon: require('../../assets/images/profile 3.png') 
  },
  { 
    id: 3, 
    name: 'Bob Wilson', 
    email: 'bob.wilson@email.com', 
    prodi: 'Teknik Elektro', 
    date: '13 Des 2024', 
    status: 'Rejected', 
    icon: require('../../assets/images/profile 3.png') 
  },
];

// Komponen untuk Status Badge
const StatusBadge = ({ status }: { status: 'Approved' | 'Rejected' | 'Pending' }) => {
  let backgroundColor: string;
  let text: string;
  
  switch (status) {
    case 'Approved':
      backgroundColor = Colors.statusApproved;
      text = 'Lulus';
      break;
    case 'Rejected':
      backgroundColor = Colors.statusRejected;
      text = 'Tidak Lulus';
      break;
    case 'Pending':
      backgroundColor = Colors.statusPending;
      text = 'Pending';
      break;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor }]}>
      <Text style={styles.statusText}>{text}</Text>
    </View>
  );
};

// Komponen untuk Item Pendaftar - DIPERBAIKI dengan props navigation
interface RegistrationItemProps {
  data: Registration;
  navigation: DataPendaftarNavigationProp;
}

const RegistrationItem = ({ data, navigation }: RegistrationItemProps) => {
  let cardColor: string;

  switch (data.status) {
    case 'Approved':
      cardColor = Colors.statusApproved;
      break;
    case 'Rejected':
      cardColor = Colors.statusRejected;
      break;
    case 'Pending':
    default:
      cardColor = Colors.statusPending;
      break;
  }

  return (
    <TouchableOpacity 
      style={[styles.itemCard, { borderColor: cardColor }]} 
      onPress={() => navigation.navigate('VerifikasiDokumen', {
        name: data.name,
        email: data.email,
        prodi: data.prodi,
        registrationId: data.id
      })}
    >
      <Image source={data.icon} style={styles.itemImage} resizeMode="cover" />
      <View style={styles.itemContent}>
        <Text style={styles.itemName}>{data.name}</Text>
        <Text style={styles.itemDetail}>{data.email}</Text>
        <Text style={styles.itemDetail}>{data.prodi} - {data.date}</Text>
      </View>
      <View style={styles.itemStatusContainer}>
        <StatusBadge status={data.status} />
      </View>
    </TouchableOpacity>
  );
};

const DataPendaftar = () => {
  const navigation = useNavigation<DataPendaftarNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Approved' | 'Rejected' | 'Pending'>('All');

  // Filter registrations berdasarkan search dan status
  const filteredRegistrations = dummyRegistrations.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.prodi.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <SafeAreaView style={ManagerStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={ManagerStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/App Bar - Bottom.png')}
            style={ManagerStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={ManagerStyles.headerContent}>
              {/* Tombol Back */}
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
              
              <Text style={[ManagerStyles.headerTitle, styles.headerTitle]}>Kelola Pendaftaran</Text>
              
              {/* Spacer untuk balance */}
              <View style={{ width: 40 }} />
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={ManagerStyles.content}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Daftar Pendaftar</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>0</Text>
            </View>
            <Text style={styles.notificationText1}>new</Text>
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

          {/* Filter/Status Buttons */}
          <View style={styles.filterContainer}>
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                styles.filterButtonLulus,
                activeFilter === 'Approved' && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(activeFilter === 'Approved' ? 'All' : 'Approved')}
            >
              <Image source={require('../../assets/icons/Vector2.png')} style={styles.filterIcon} />
              <Text style={styles.filterText}>Lulus</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                styles.filterButtonTidakLulus,
                activeFilter === 'Rejected' && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(activeFilter === 'Rejected' ? 'All' : 'Rejected')}
            >
              <Image source={require('../../assets/icons/Vector3.png')} style={styles.filterIcon} />
              <Text style={styles.filterText}>Tidak Lulus</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.filterButton, 
                styles.filterButtonPending,
                activeFilter === 'Pending' && styles.filterButtonActive
              ]}
              onPress={() => setActiveFilter(activeFilter === 'Pending' ? 'All' : 'Pending')}
            >
              <Image source={require('../../assets/icons/weui_time-filled.png')} style={styles.filterIcon} />
              <Text style={styles.filterText}>Pending</Text>
            </TouchableOpacity>
          </View>
          
          {/* List Pendaftar - DIPERBAIKI dengan pass navigation */}
          <View style={styles.listContainer}>
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((item) => (
                <RegistrationItem key={item.id} data={item} navigation={navigation} />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada data pendaftar</Text>
              </View>
            )}
          </View>
          
          {/* Padding bawah agar konten tidak tertutup bottom nav */}
          <View style={{ height: 120 }} /> 
        </View>
      </ScrollView>

      {/* Background Logo - DIPINDAHKAN KE LUAR ScrollView */}
      <Image
          source={require('../../assets/images/logo-ugn.png')}
          style={ManagerStyles.backgroundLogo}
          resizeMode="contain"
      />

      {/* Bottom Navigation - Fixed Position */}
            <View style={AdminStyles.bottomNav}>
                    <TouchableOpacity style={AdminStyles.navItem}
                    onPress={() => navigation.navigate('AdminDashboard')}>
                        <Image
                          source={require('../../assets/icons/material-symbols_home-rounded.png')}
                          style={AdminStyles.navIcon}
                          resizeMode="contain"
                        />
                    </TouchableOpacity>
            
                    <TouchableOpacity style={AdminStyles.navItemActive}>
                      <Image
                        source={require('../../assets/icons/proicons_save-pencil.png')}
                        style={AdminStyles.navIcon}
                        resizeMode="contain"
                      />
                      <Text style={AdminStyles.navTextActive}>Manage</Text>
                    </TouchableOpacity>
            
                    <TouchableOpacity style={AdminStyles.navItem}
                    onPress={() => navigation.navigate('AddManager')}>
                      <Image
                        source={require('../../assets/icons/f7_person-3-fill.png')}
                        style={AdminStyles.navIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // --- Notifikasi Badge di Header ---
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
  // --- Search Bar ---
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
  // --- Filter Buttons ---
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
  // --- List Item ---
  listContainer: {
    // Container untuk list items
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
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  // --- Empty State ---
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

export default DataPendaftar;