// src/screens/admin/StatistikPendaftaranScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Asumsi AdminStackParamList ada, jika tidak, ganti dengan tipe navigasi yang sesuai
import { AdminStackParamList } from '../../navigation/AdminNavigator'; 
import { AdminStyles } from '../../styles/AdminStyles'; 
import LinearGradient from 'react-native-linear-gradient';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 24 * 3) / 2; // (Total width - padding * 3) / 2

type StatistikPembayaranNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'StatistikPembayaran'>;

// Data Dummy
const DUMMY_DATA = {
  total: 'Rp 412M',
  disetujui: 1.156,
  pending: 234,
  ditolak: 78,
  persentase: {
    disetujui: 70,
    pending: 20,
    ditolak: 10,
  },
};

// Data untuk legenda dan warna grafik
const CHART_LEGEND = [
  { label: 'Disetujui', value: DUMMY_DATA.disetujui, percent: DUMMY_DATA.persentase.disetujui, color: '#4285F4' }, // Hijau
  { label: 'Ditolak', value: DUMMY_DATA.ditolak, percent: DUMMY_DATA.persentase.ditolak, color: '#DC2626' },    // Merah
  { label: 'Pending', value: DUMMY_DATA.pending, percent: DUMMY_DATA.persentase.pending, color: '#DABC4E' },   // Emas
];

// --- Komponen Kartu Ringkasan ---
const SummaryCard: React.FC<{
  label: string;
  value: number;
  iconSource: any;
  iconTint?: string;
}> = ({ label, value, iconSource, iconTint }) => (
  <View style={localStyles.summaryCard}>
    <Image
      source={iconSource}
      style={[localStyles.summaryIcon, iconTint && { tintColor: iconTint }]}
      resizeMode="contain"
    />
    <Text style={localStyles.summaryValue}>{value.toLocaleString()}</Text>
    <Text style={localStyles.summaryLabel}>{label}</Text>
  </View>
);

// --- Komponen Chart Legend Item ---
const LegendItem: React.FC<{
  label: string;
  value: number;
  percent: number;
  color: string;
}> = ({ label, value, percent, color }) => (
  <View style={localStyles.legendItem}>
    <View style={[localStyles.legendIndicator, { backgroundColor: color }]} />
    <Text style={localStyles.legendText}>{label}</Text>
    <Text style={localStyles.legendValue}>{value} ({percent}%)</Text>
  </View>
);


const StatistikPembayaran = () => {
  const navigation = useNavigation<StatistikPembayaranNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSwitchTab = (tab: 'pendaftaran' | 'pembayaran') => {
    // Logic untuk beralih tab, saat ini hanya tampilan
    console.log(`Switching to ${tab} statistics`);
  };

  const handleLihatDetail = () => {
    console.log('Navigasi ke Detail Data Pendaftar');
    // navigation.navigate('DetailPendaftar'); 
  };
  
  const handleStatistikPerProdi = () => {
    console.log('Navigasi ke Statistik Per Prodi');
    // navigation.navigate('StatistikProdi'); 
  };
  
  const handleHome = () => {
      // navigation.navigate('AdminHome');
      navigation.popToTop();
  };

  const handleManage = () => {
      // navigation.navigate('KelolaManager');
      console.log('Navigasi ke Kelola Manager');
  };

  const handleUserList = () => {
      // navigation.navigate('UserList');
      console.log('Navigasi ke User List');
  };


  return (
    <SafeAreaView style={localStyles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.scrollContent}
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <View >
            <LinearGradient
            colors={['#DABC4E', '#EFE3B0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={localStyles.headerBackground}
          >
            <View style={localStyles.headerContent}>
              {/* Tombol Back */}
              <TouchableOpacity
                style={localStyles.headerIconContainerLeft}
                onPress={handleBack}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                  style={localStyles.headerIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={localStyles.headerTitleContainer}>
                 <Text style={localStyles.headerTitle}>Kelola Pembayaran</Text>
              </View>
            </View>
            </LinearGradient>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={localStyles.tabContainer}>
          <TouchableOpacity 
            style={localStyles.inactiveTab}
            onPress={() => navigation.navigate('StatistikPendaftaran')}
          >
            <Text style={localStyles.inactiveTabText}>Statistik Pendaftaran</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={localStyles.activeTab}
            onPress={() => handleSwitchTab('pembayaran')}
          >
            <Text style={localStyles.activeTabText}>Statistik Pembayaran</Text>
          </TouchableOpacity>
        </View>

        {/* Ringkasan Kartu */}
        <View style={localStyles.summaryGrid}>
          {/* Total Pendaftar */}
          <SummaryCard
            label="Total Pendapatan"
            value={DUMMY_DATA.total}
            iconSource={require('../../assets/icons/Group 13893.png')}
            
          />
          {/* Disetujui */}
          <SummaryCard
            label="Diverifikasi"
            value={DUMMY_DATA.disetujui}
            iconSource={require('../../assets/icons/Group 13888.png')}
           
          />
          {/* Pending */}
          <SummaryCard
            label="Pending"
            value={DUMMY_DATA.pending}
            iconSource={require('../../assets/icons/Group 13889.png')}
            
          />
          {/* Ditolak */}
          <SummaryCard
            label="Ditolak"
            value={DUMMY_DATA.ditolak}
            iconSource={require('../../assets/icons/codex_cross.png')}
           
          />
        </View>
        
        {/* Status Pendaftaran Card (Chart) */}
        <View style={localStyles.chartCard}>
          <View style={localStyles.chartCardHeader}>
            <Text style={localStyles.chartCardTitle}>Status Pembayaran</Text>
            <Image
                source={require('../../assets/icons/fluent_payment-20-filled.png')} 
                style={localStyles.chartIcon}
                resizeMode="contain"
            />
          </View>
          
          {/* Donut Chart Container */}
          <View style={localStyles.donutChartContainer}>
            {/* Donut Chart dengan SVG-like approach */}
            <View style={localStyles.donutChartWrapper}>
              {/* Base Circle */}
              <View style={localStyles.donutBase}>
                {/* Segmen Hijau (Disetujui 70%) - Bottom */}
                <View style={[localStyles.segmentGreen]} />
                
                {/* Segmen Kuning (Pending 20%) - Right */}
                <View style={[localStyles.segmentYellow]} />
                
                {/* Segmen Merah (Ditolak 10%) - Top */}
                <View style={[localStyles.segmentRed]} />
              </View>
              
              {/* Center Circle dengan nilai */}
              <View style={localStyles.donutChartCenter}>
                <Text style={localStyles.donutCenterValue}>{DUMMY_DATA.total.toLocaleString()}</Text>
              </View>
              
              {/* Percentage Labels dengan background putih */}
              <View style={[localStyles.percentLabel, { top: 30, left: 15 }]}>
                <Text style={[localStyles.percentText, { color: '#DABC4E' }]}>20%</Text>
              </View>
              <View style={[localStyles.percentLabel, { top: 30, right: 15 }]}>
                <Text style={[localStyles.percentText, { color: '#4285F4' }]}>70%</Text>
              </View>
              <View style={[localStyles.percentLabel, { bottom: 35 }]}>
                <Text style={[localStyles.percentText, { color: '#DC2626' }]}>10%</Text>
              </View>
            </View>
            
            {/* Legend di bawah chart */}
            <View style={localStyles.legendContainer}>
              {CHART_LEGEND.map(item => (
                <LegendItem key={item.label} {...item} />
              ))}
            </View>
          </View>
        </View>
        
        {/* Action Buttons */}
        <TouchableOpacity 
          onPress={() => navigation.navigate('DataPendaftar')}
        >
            <LinearGradient
                          colors={['#DABC4E', '#EFE3B0']}
                          start={{ x: 0, y: 0.5 }}
                          end={{ x: 1, y: 1 }}
                          style={localStyles.actionButtonPrimary}
                          >
          <Text style={localStyles.actionButtonText}>Lihat Detail Data Pendaftar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

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
      
      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={localStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#015023', // Hijau tua
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Ruang untuk bottom nav
  },
  headerContainer: {
    width: '100%',
  },
  headerBackground: {
    width: '100%',
    height: 70,
    justifyContent: 'center',
    backgroundColor: '#DABC4E', // Emas/Kuning pada header
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerIconContainerLeft: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 22,
  },
  headerIcon: {
    width: 30,
    height: 30,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginRight: 28, // Untuk mengkompensasi tombol back
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 4,
  },
  activeTab: {
    backgroundColor: '#DABC4E',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#000000ff',
    right: 6,
  },
  activeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffffff',
    
  },
  inactiveTab: {
    backgroundColor: '#bbbbbbff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    right: 4,
  },
  inactiveTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000ff',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#FEFAE0',
    borderRadius: 20,
    width: (width - 44) / 2,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#FEFAE0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  chartCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  chartIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  donutChartContainer: {
    alignItems: 'center',
  },
  donutChartWrapper: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  donutBase: {
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#38A169',
    position: 'relative',
    overflow: 'hidden',
  },
  segmentRed: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: '#DC2626',
  },
  segmentGreen: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: '#4285F4',
    borderRadius: 125,
    transform: [{ rotate: '100deg' }],
    right: -60,
    zIndex: 2,
  },
  segmentYellow: {
    position: 'absolute',
    width: 250,
    height: 900,
    backgroundColor: '#DABC4E',
    borderRadius: 30,
    top: -400,
    right: 150,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  donutChartCenter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FEFAE0',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  donutCenterValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
  },
  percentLabel: {
    position: 'absolute',
    zIndex: 11,
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  percentText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  legendContainer: {
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  legendIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    backgroundColor: '#DABC4E',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  actionButtonSecondary: {
    backgroundColor: '#DABC4E',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  actionButtonIcon: {
    width: 20,
    height: 20,
    tintColor: '#000000',
  },
  actionButtonTextSecondary: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    height: 60,
    backgroundColor: '#FEFAE0',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapperActive: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#000000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  navIconImage: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  backgroundLogo: {
    position: 'absolute',
    bottom: -350,
    alignSelf: 'center',
    width: 950,
    height: 950,
    opacity: 0.15,
    zIndex: -1,
  },
});

export default StatistikPembayaran;