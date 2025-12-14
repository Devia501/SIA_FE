// src/screens/admin/StatistikPendaftaranScreen.tsx

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { PieChart } from 'react-native-gifted-charts'; // ✅ Gunakan library chart agar dinamis

// Imports Lokal
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { AdminStyles } from '../../styles/AdminStyles';
import { managerService, Applicant } from '../../services/managerService';

const { width } = Dimensions.get('window');

type StatistikPendaftaranNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'StatistikPendaftaran'>;

// Interface State Data
interface StatusData {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  percents: {
    approved: number;
    pending: number;
    rejected: number;
  };
}

const StatistikPendaftaran = () => {
  const navigation = useNavigation<StatistikPendaftaranNavigationProp>();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StatusData>({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    percents: { approved: 0, pending: 0, rejected: 0 }
  });
  const [chartData, setChartData] = useState<any[]>([]);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      // Kita ambil list applicant untuk kalkulasi manual agar akurat sesuai kategori
      const response = await managerService.getApplicants({ status: 'all' });
      
      if (response.success) {
        processData(response.data);
      }
    } catch (error) {
      console.error('Error fetching registration stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- PROCESS DATA ---
  const processData = (applicants: Applicant[]) => {
    let approved = 0;
    let rejected = 0;
    let pending = 0; // Gabungan submitted + reviewed
    let total = 0;

    applicants.forEach((app) => {
        // Abaikan draft jika tidak ingin dihitung
        if (app.registration_status === 'draft') return;

        total++;
        if (app.registration_status === 'approved') {
            approved++;
        } else if (app.registration_status === 'rejected') {
            rejected++;
        } else if (['submitted', 'reviewed'].includes(app.registration_status)) {
            pending++;
        }
    });

    // Hitung Persentase
    const pApproved = total > 0 ? parseFloat(((approved / total) * 100).toFixed(1)) : 0;
    const pRejected = total > 0 ? parseFloat(((rejected / total) * 100).toFixed(1)) : 0;
    const pPending = total > 0 ? parseFloat(((pending / total) * 100).toFixed(1)) : 0;

    setStats({
        total,
        approved,
        rejected,
        pending,
        percents: {
            approved: pApproved,
            rejected: pRejected,
            pending: pPending
        }
    });

    // Format Data untuk Pie Chart
    // Urutan warna disesuaikan dengan legend (Hijau, Merah, Emas)
    const chartDataFormatted = [
        { value: approved, color: '#38A169', text: pApproved > 5 ? `${Math.round(pApproved)}%` : '' }, // Hijau
        { value: pending, color: '#DABC4E', text: pPending > 5 ? `${Math.round(pPending)}%` : '' },  // Emas
        { value: rejected, color: '#DC2626', text: pRejected > 5 ? `${Math.round(pRejected)}%` : '' }, // Merah
    ];

    // Filter value 0 agar tidak merusak chart
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

  // --- HANDLERS ---
  const handleBack = () => navigation.goBack();
  const handleSwitchTab = (tab: 'pendaftaran' | 'pembayaran') => {
    // Logic tab, jika ingin pindah screen
    if(tab === 'pembayaran') navigation.navigate('StatistikPembayaran');
  };

  // --- RENDER HELPERS ---
  const SummaryCard: React.FC<{
    label: string;
    value: number;
    iconSource: any;
    iconTint?: string;
  }> = ({ label, value, iconSource, iconTint }) => (
    <View style={localStyles.summaryCard}>
      <Image
        source={iconSource}
        style={[localStyles.summaryIcon, iconTint ? { tintColor: iconTint } : {}]}
        resizeMode="contain"
      />
      <Text style={localStyles.summaryValue}>{value.toLocaleString()}</Text>
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
                 <Text style={localStyles.headerTitle}>Kelola Pendaftaran</Text>
              </View>
            </View>
            </LinearGradient>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={localStyles.tabContainer}>
          <TouchableOpacity 
            style={localStyles.activeTab}
            onPress={() => handleSwitchTab('pendaftaran')}
          >
            <Text style={localStyles.activeTabText}>Statistik Pendaftaran</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={localStyles.inactiveTab}
            onPress={() => navigation.navigate('StatistikPembayaran')}
          >
            <Text style={localStyles.inactiveTabText}>Statistik Pembayaran</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
             <ActivityIndicator size="large" color="#DABC4E" style={{ marginTop: 50 }} />
        ) : (
        <>
            {/* Ringkasan Kartu */}
            <View style={localStyles.summaryGrid}>
            <SummaryCard
                label="Total Pendaftar"
                value={stats.total}
                iconSource={require('../../assets/icons/Group 13887.png')}
            />
            <SummaryCard
                label="Disetujui"
                value={stats.approved}
                iconSource={require('../../assets/icons/Group 13888.png')}
            />
            <SummaryCard
                label="Pending"
                value={stats.pending}
                iconSource={require('../../assets/icons/Group 13889.png')}
            />
            <SummaryCard
                label="Ditolak"
                value={stats.rejected}
                iconSource={require('../../assets/icons/codex_cross.png')}
            />
            </View>
            
            {/* Status Pendaftaran Card (Chart) */}
            <View style={localStyles.chartCard}>
            <View style={localStyles.chartCardHeader}>
                <Text style={localStyles.chartCardTitle}>Status Pendaftaran</Text>
                <Image
                    source={require('../../assets/icons/solar_chart-bold-duotone.png')} 
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
                                <Text style={localStyles.donutCenterValue}>{stats.total}</Text>
                                <Text style={{ fontSize: 12, color: '#666' }}>Total</Text>
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
                    <LegendItem label="Disetujui" value={stats.approved} percent={stats.percents.approved} color="#38A169" />
                    <LegendItem label="Pending" value={stats.pending} percent={stats.percents.pending} color="#DABC4E" />
                    <LegendItem label="Ditolak" value={stats.rejected} percent={stats.percents.rejected} color="#DC2626" />
                </View>
            </View>
            </View>
            
            {/* Action Buttons */}
            <TouchableOpacity 
            onPress={() => navigation.navigate('StatistikProdi')}
            >
            <LinearGradient
                colors={['#DABC4E', '#EFE3B0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 1 }}
                style={localStyles.actionButtonPrimary}
                >
            <Text style={localStyles.actionButtonText}>Statistik Per Prodi</Text>
            <Image
                source={require('../../assets/icons/streamline-sharp_graduation-cap-remix.png')}
                style={localStyles.actionButtonIcon}
                resizeMode="contain"
            />
            </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
            onPress={() => navigation.navigate('DataPendaftar')}
            >
            <LinearGradient
                colors={['#DABC4E', '#EFE3B0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 1 }}
                style={localStyles.actionButtonPrimary}
                >
            <Text style={localStyles.actionButtonTextSecondary}>Lihat Detail Data Pendaftar</Text>
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

export default StatistikPendaftaran;