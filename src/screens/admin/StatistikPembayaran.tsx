// src/screens/admin/StatistikPembayaran.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { PieChart } from 'react-native-gifted-charts'; 

import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { AdminStyles } from '../../styles/AdminStyles';
import { managerService } from '../../services/managerService'; // ✅ Pastikan import ini ada

const { width } = Dimensions.get('window');

type StatistikPembayaranNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'StatistikPembayaran'>;

// Interface State Data (Frontend)
interface PaymentStatsData {
  totalRevenue: number;
  verified: number;
  pending: number; // Gabungan pending + waiting_verification
  rejected: number;
  percents: {
    verified: number;
    pending: number;
    rejected: number;
  };
}

const StatistikPembayaran = () => {
  const navigation = useNavigation<StatistikPembayaranNavigationProp>();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State Data Statistik
  const [stats, setStats] = useState<PaymentStatsData>({
    totalRevenue: 0,
    verified: 0,
    pending: 0,
    rejected: 0,
    percents: { verified: 0, pending: 0, rejected: 0 }
  });
  
  const [chartData, setChartData] = useState<any[]>([]);

  // --- HELPER: Format Currency ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      // ✅ PANGGIL SERVICE ASLI
      // Mengambil data dari endpoint /payments/statistics
      const response = await managerService.getPaymentStatistics();
      
      if (response.success && response.data) {
        processData(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching payment stats:', error);
      Alert.alert('Error', error.message || 'Gagal mengambil data statistik pembayaran.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- PROCESS DATA ---
  // Menerima data dari backend (PaymentController::statistics)
  const processData = (data: any) => {
    
    // 1. Mapping Data Backend ke Frontend
    // Backend mengirim: total_payments, pending, waiting_verification, verified, rejected, expired, total_amount
    const verified = data.verified || 0;
    const rejected = data.rejected || 0;
    const expired = data.expired || 0;
    
    // Gabungkan status 'pending' dan 'waiting_verification' menjadi satu kategori "Pending"
    const totalPending = (data.pending || 0) + (data.waiting_verification || 0);

    // Total Revenue diambil dari field 'total_amount'
    const totalRevenue = data.total_amount || 0;
    
    // Total transaksi untuk perhitungan persentase (bisa pakai data.total_payments atau hitung manual)
    const totalTransactions = data.total_payments || (verified + totalPending + rejected + expired);

    // 2. Hitung Persentase
    const pVerified = totalTransactions > 0 ? parseFloat(((verified / totalTransactions) * 100).toFixed(1)) : 0;
    const pPending = totalTransactions > 0 ? parseFloat(((totalPending / totalTransactions) * 100).toFixed(1)) : 0;
    const pRejected = totalTransactions > 0 ? parseFloat(((rejected / totalTransactions) * 100).toFixed(1)) : 0;

    // 3. Update State
    setStats({
        totalRevenue: totalRevenue,
        verified: verified,
        pending: totalPending,
        rejected: rejected,
        percents: {
            verified: pVerified,
            pending: pPending,
            rejected: pRejected
        }
    });

    // 4. Format Data untuk Pie Chart
    const chartDataFormatted = [
        { 
            value: verified, 
            color: '#4285F4', 
            text: pVerified > 5 ? `${Math.round(pVerified)}%` : '' 
        }, // Biru
        { 
            value: totalPending, 
            color: '#DABC4E', 
            text: pPending > 5 ? `${Math.round(pPending)}%` : '' 
        }, // Emas
        { 
            value: rejected, 
            color: '#DC2626', 
            text: pRejected > 5 ? `${Math.round(pRejected)}%` : '' 
        }, // Merah
    ];

    // Filter value 0 agar chart tidak error/jelek
    setChartData(chartDataFormatted.filter(item => item.value > 0));
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleBack = () => navigation.goBack();

  const handleSwitchTab = (tab: 'pendaftaran' | 'pembayaran') => {
     if (tab === 'pendaftaran') navigation.navigate('StatistikPendaftaran');
  };

  // --- RENDER COMPONENTS ---
  const SummaryCard: React.FC<{
    label: string;
    value: string | number;
    iconSource: any;
    iconTint?: string;
  }> = ({ label, value, iconSource, iconTint }) => (
    <View style={localStyles.summaryCard}>
      <Image
        source={iconSource}
        style={[localStyles.summaryIcon, iconTint ? { tintColor: iconTint } : {}]}
        resizeMode="contain"
      />
      <Text style={[localStyles.summaryValue, typeof value === 'string' && value.includes('Rp') ? {fontSize: 20} : {}]}>
        {value}
      </Text>
      <Text style={localStyles.summaryLabel}>{label}</Text>
    </View>
  );

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

  return (
    <SafeAreaView style={localStyles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DABC4E']} />
        }
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <View>
            <LinearGradient
            colors={['#DABC4E', '#EFE3B0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={localStyles.headerBackground}
          >
            <View style={localStyles.headerContent}>
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

        {loading ? (
             <ActivityIndicator size="large" color="#DABC4E" style={{ marginTop: 50 }} />
        ) : (
        <>
            {/* Ringkasan Kartu */}
            <View style={localStyles.summaryGrid}>
            <SummaryCard
                label="Total Pendapatan"
                value={formatCurrency(stats.totalRevenue)}
                iconSource={require('../../assets/icons/Group 13893.png')}
            />
            <SummaryCard
                label="Diverifikasi"
                value={stats.verified.toLocaleString()}
                iconSource={require('../../assets/icons/Group 13888.png')}
            />
            <SummaryCard
                label="Pending"
                value={stats.pending.toLocaleString()}
                iconSource={require('../../assets/icons/Group 13889.png')}
            />
            <SummaryCard
                label="Ditolak"
                value={stats.rejected.toLocaleString()}
                iconSource={require('../../assets/icons/codex_cross.png')}
            />
            </View>
            
            {/* Status Pembayaran Card (Chart) */}
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
                 {chartData.length > 0 ? (
                    <PieChart
                        data={chartData}
                        donut
                        radius={110}
                        innerRadius={70}
                        innerCircleColor={'#FEFAE0'}
                        textColor="#FFFFFF"
                        textSize={12}
                        fontWeight="bold"
                        centerLabelComponent={() => (
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={localStyles.donutCenterValue}>
                                    {stats.verified + stats.pending + stats.rejected}
                                </Text>
                                <Text style={{ fontSize: 12, color: '#666' }}>Total Transaksi</Text>
                            </View>
                        )}
                    />
                 ) : (
                    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                         <Text style={{ color: '#999' }}>Data Kosong</Text>
                    </View>
                 )}
                
                {/* Legend di bawah chart */}
                <View style={localStyles.legendContainer}>
                    <LegendItem label="Diverifikasi" value={stats.verified} percent={stats.percents.verified} color="#4285F4" />
                    <LegendItem label="Pending" value={stats.pending} percent={stats.percents.pending} color="#DABC4E" />
                    <LegendItem label="Ditolak" value={stats.rejected} percent={stats.percents.rejected} color="#DC2626" />
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
        </>
        )}

        {/* Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Navigation */}
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

// --- STYLES ---
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
    backgroundColor: '#DABC4E',
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
    marginRight: 28,
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
    textAlign: 'center',
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
    justifyContent: 'center',
  },
  donutCenterValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#000000',
  },
  legendContainer: {
    width: '100%',
    marginTop: 20,
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
  actionButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
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