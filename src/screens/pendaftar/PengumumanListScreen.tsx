import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  Dimensions,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { publicService, AnnouncementResult } from '../../services/apiService';
import LinearGradient from 'react-native-linear-gradient';
import PendaftarStyles from '../../styles/PendaftarStyles';

const { width } = Dimensions.get('window');

const PengumumanListScreen = () => {
  const navigation = useNavigation();
  const [data, setData] = useState<AnnouncementResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchData(1, true);
  }, []);

  const fetchData = async (pageNum: number, refresh = false) => {
    try {
      if (refresh) setLoading(true);
      
      const response = await publicService.getAnnouncementResults({
        page: pageNum,
        search: search
      });

      if (refresh) {
        setData(response.data);
      } else {
        setData(prev => [...prev, ...response.data]);
      }

      setHasMore(pageNum < response.meta.last_page);
      setPage(pageNum);
    } catch (error) {
      console.error("Gagal memuat pengumuman:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchData(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchData(page + 1);
    }
  };

  const renderItem = ({ item }: { item: AnnouncementResult }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.programContainer}>
             <Image 
                source={require('../../assets/icons/clarity_form-line.png')} 
                style={styles.cardIcon} 
                resizeMode="contain"
             />
             <Text style={styles.programText}>{item.program.name}</Text>
        </View>
        <Text style={styles.regNumber}>{item.registration_number}</Text>
      </View>
      
      <View style={styles.divider} />
      
      <Text style={styles.nameText}>{item.name}</Text>
      
      <View style={styles.badgeContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>LULUS SELEKSI</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* HEADER DENGAN BACKGROUND WAVE */}
      <View style={styles.headerContainer}>
        <LinearGradient
                colors={['#DABC4E', '#F5EFD3']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerContainer}
              >
            <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>Pengumuman Kelulusan</Text>
            </View>
        </LinearGradient>    
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
            <Image
                source={require('../../assets/icons/ant-design_form.png')} // Atau icon search jika ada
                style={{width: 20, height: 20, tintColor: '#999', marginRight: 8}}
                resizeMode="contain"
            />
            <TextInput
            style={styles.searchInput}
            placeholder="Cari Nama... "
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            />
        </View>
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
           <Text style={styles.searchButtonText}>Cari</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.registration_number}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada data ditemukan.</Text>
            </View>
          )
        }
        ListFooterComponent={loading ? <ActivityIndicator size="large" color="#015023" style={{marginTop: 20}} /> : null}
      />

      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#015023' // Warna background bersih
  },
  
  // HEADER STYLES (MATCHING DASHBOARD)
  headerContainer: {
    height: 60, // Sesuaikan tinggi header
    width: '100%',
    overflow: 'hidden',
    elevation: 4,
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 50,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    marginRight: 15,
  },
  navIcon: {
    width: 20,
    height: 20,
    tintColor: '#015023',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#015023', // Warna hijau utama
    fontFamily: 'System', 
  },

  // SEARCH STYLES
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    color: '#333',
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#DABC4E', // Hijau Utama
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderRadius: 12,
    height: 50,
    elevation: 2,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // CARD STYLES
  listContent: { 
    padding: 20,
    paddingTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: '#DABC4E', // Aksen Emas (Secondary Color)
    elevation: 3, // Shadow Android
    shadowColor: '#000', // Shadow iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  programContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardIcon: {
    width: 16,
    height: 16,
    tintColor: '#666',
  },
  programText: { 
    fontSize: 12, 
    color: '#666', 
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  regNumber: { 
    fontSize: 12, 
    color: '#999',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  nameText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#015023', // Hijau Utama untuk Nama
    marginBottom: 12,
  },
  badgeContainer: { 
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  badge: {
    backgroundColor: '#E8F5E9', // Hijau muda soft
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#015023', // Border hijau utama
  },
  badgeText: { 
    color: '#015023', 
    fontSize: 12, 
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  
  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#666',
    fontSize: 14,
  },
});

export default PengumumanListScreen;