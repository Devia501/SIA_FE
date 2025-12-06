import React, { useState, useEffect, useCallback } from 'react';
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
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator'; 
import LinearGradient from 'react-native-linear-gradient'; 

// ✅ GUNAKAN SVG AGAR DIAGRAM PRESISI & DINAMIS
import Svg, { G, Circle, Text as SvgText } from 'react-native-svg';

// ✅ IMPORT SERVICE
import apiService from '../../services/apiService'; 

const { width } = Dimensions.get('window');

type StatistikPendaftaranNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'StatistikPendaftaran'>;

// Definisi Tipe Data Lokal (Agar tidak error import)
interface Statistics {
  total: number;
  submitted: number;
  approved: number;
  rejected: number;
}

// =========================================================
// 🎨 KOMPONEN DONUT CHART SVG (DINAMIS & MIRIP FIGMA)
// =========================================================
const DonutChart = ({ 
  data, 
  total,
  radius = 80, 
  strokeWidth = 45 
}: { 
  data: { color: string, value: number, percentStr: string }[], 
  total: number,
  radius?: number,
  strokeWidth?: number
}) => {
  const halfCircle = radius + strokeWidth;
  const size = halfCircle * 2;
  const circumference = 2 * Math.PI * radius;
  let currentAngle = -90; // Mulai dari atas (jam 12)

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', height: size + 20 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${halfCircle}, ${halfCircle}`}>
          {/* Background Abu-abu jika data 0 */}
          {total === 0 && (
             <Circle cx="50%" cy="50%" r={radius} stroke="#E0E0E0" strokeWidth={strokeWidth} fill="transparent" />
          )}

          {/* Render Potongan Donat */}
          {data.map((item, index) => {
            if (item.value === 0) return null;
            
            const strokeDashoffset = circumference - (item.value / total) * circumference;
            const angle = (item.value / total) * 360;
            
            const circle = (
              <Circle
                key={`slice-${index}`}
                cx="50%" cy="50%" r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                rotation={currentAngle + 90}
                origin={`${halfCircle}, ${halfCircle}`}
              />
            );
            currentAngle += angle;
            return circle;
          })}
        </G>
      </Svg>

      {/* Angka Total di Tengah */}
      <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000' }}>{total}</Text>
      </View>

      {/* Label Persentase Mengambang (Bubbles) */}
      {(() => {
        let labelAngle = -90;
        return data.map((item, index) => {
          if (item.value === 0) return null;
          
          const angle = (item.value / total) * 360;
          const middleAngle = labelAngle + (angle / 2);
          const radian = (middleAngle * Math.PI) / 180;
          
          // Posisi label (Radius + setengah stroke + sedikit offset)
          const labelRadius = radius; 
          const x = halfCircle + labelRadius * Math.cos(radian);
          const y = halfCircle + labelRadius * Math.sin(radian);
          
          labelAngle += angle;

          return (
            <View 
              key={`label-${index}`}
              style={[
                localStyles.floatingLabel, 
                { 
                  left: x - 20, 
                  top: y - 15,
                }
              ]}
            >
              <Text style={[localStyles.percentText, { color: '#000' }]}>
                {item.percentStr}%
              </Text>
            </View>
          );
        });
      })()}
    </View>
  );
};

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

// --- Komponen Legend Item ---
const LegendItem: React.FC<{
  label: string;
  value: number;
  percent: string;
  color: string;
}> = ({ label, value, percent, color }) => (
  <View style={localStyles.legendItem}>
    <View style={[localStyles.legendIndicator, { backgroundColor: color }]} />
    <Text style={localStyles.legendText}>{label}</Text>
    <Text style={localStyles.legendValue}>{value} ({percent}%)</Text>
  </View>
);

const StatistikPendaftaran = () => {
  const navigation = useNavigation<StatistikPendaftaranNavigationProp>();
  const isFocused = useIsFocused();

  // STATE DATA
  const [stats, setStats] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // FETCH DATA
  const loadStatistics = useCallback(async () => {
    try {
      // Menggunakan adminService dari apiService.ts
      const response = await apiService.admin.getRegistrationStatistics();
      // Mapping response agar sesuai tipe
      const data: Statistics = {
        total: response.total_registrations || 0,
        submitted: response.submitted || 0,
        approved: response.approved || 0,
        rejected: response.rejected || 0
      };
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      // Fallback data jika API belum siap/error (agar tidak blank)
      setStats({ total: 0, submitted: 0, approved: 0, rejected: 0 });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (isFocused) loadStatistics(); }, [isFocused, loadStatistics]);
  const onRefresh = () => { setRefreshing(true); loadStatistics(); };

  // DATA PROCESSING
  const total = stats?.total ?? 0;
  const approved = stats?.approved ?? 0;
  const rejected = stats?.rejected ?? 0;
  const pending = stats?.submitted ?? 0;

  const getPercentStr = (val: number) => (total === 0 ? '0' : ((val / total) * 100).toFixed(1).replace('.0', ''));

  // Data Chart (Urutan warna: Hijau -> Merah -> Kuning, sesuai desain)
  const chartData = [
    { color: '#2DB872', value: approved, percentStr: getPercentStr(approved) }, // Hijau
    { color: '#BE0414', value: rejected, percentStr: getPercentStr(rejected) }, // Merah
    { color: '#DABC4E', value: pending, percentStr: getPercentStr(pending) },   // Kuning
  ];

  return (
    <SafeAreaView style={localStyles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#DABC4E']} />}
      >
        {/* Header (Style Asli) */}
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
                onPress={() => navigation.goBack()}
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

        {/* Tab Selector (Style Asli) */}
        <View style={localStyles.tabContainer}>
          <TouchableOpacity style={localStyles.activeTab}>
            <Text style={localStyles.activeTabText}>Statistik Pendaftaran</Text>
          </TouchableOpacity>
          <TouchableOpacity style={localStyles.inactiveTab}>
            <Text style={localStyles.inactiveTabText}>Statistik Pembayaran</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
            <ActivityIndicator size="large" color="#DABC4E" style={{ marginTop: 50 }} />
        ) : (
            <>
                {/* Ringkasan Kartu (Style Asli) */}
                <View style={localStyles.summaryGrid}>
                    <SummaryCard label="Total Pendaftar" value={total} iconSource={require('../../assets/icons/Group 13887.png')} />
                    <SummaryCard label="Disetujui" value={approved} iconSource={require('../../assets/icons/Group 13888.png')} />
                    <SummaryCard label="Pending" value={pending} iconSource={require('../../assets/icons/Group 13889.png')} />
                    <SummaryCard label="Ditolak" value={rejected} iconSource={require('../../assets/icons/codex_cross.png')} />
                </View>
                
                {/* Status Pendaftaran Card */}
                <View style={localStyles.chartCard}>
                    <View style={localStyles.chartCardHeader}>
                        <Text style={localStyles.chartCardTitle}>Status Pendaftaran</Text>
                        {/* Icon Chart */}
                        <Image source={require('../../assets/icons/solar_chart-bold-duotone.png')} style={localStyles.chartIcon} resizeMode="contain" />
                    </View>
                    
                    {/* ✅ DIAGRAM SVG DINAMIS */}
                    <View style={{ marginVertical: 10 }}>
                        <DonutChart 
                            data={chartData} 
                            total={total} 
                            radius={80} 
                            strokeWidth={45} 
                        />
                    </View>
                    
                    {/* Legend Dinamis */}
                    <View style={localStyles.legendContainer}>
                        <LegendItem label="Disetujui" value={approved} percent={getPercentStr(approved)} color="#2DB872" />
                        <LegendItem label="Ditolak" value={rejected} percent={getPercentStr(rejected)} color="#BE0414" />
                        <LegendItem label="Pending" value={pending} percent={getPercentStr(pending)} color="#DABC4E" />
                    </View>
                </View>
            </>
        )}
        
        {/* Action Buttons (Style Asli) */}
        <TouchableOpacity onPress={() => navigation.navigate('StatistikProdi')} disabled={isLoading}>
          <LinearGradient colors={['#DABC4E', '#EFE3B0']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 1 }} style={localStyles.actionButtonPrimary}>
            <Text style={localStyles.actionButtonText}>Statistik Per Prodi</Text>
            <Image source={require('../../assets/icons/streamline-sharp_graduation-cap-remix.png')} style={localStyles.actionButtonIcon} resizeMode="contain" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('DataPendaftar')} disabled={isLoading}>
          <LinearGradient colors={['#DABC4E', '#EFE3B0']} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 1 }} style={localStyles.actionButtonPrimary}>
            <Text style={localStyles.actionButtonTextSecondary}>Lihat Detail Data Pendaftar</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Navigation (Style Asli) */}
      <View style={localStyles.bottomNavContainer}>
          <TouchableOpacity style={localStyles.navButton} onPress={() => navigation.navigate('AdminDashboard')}>
              <View style={localStyles.navIconWrapper}>
                <Image source={require('../../assets/icons/material-symbols_home-rounded.png')} style={localStyles.navIcon} resizeMode="contain" />
              </View>
          </TouchableOpacity>
  
          <TouchableOpacity style={localStyles.navButtonActive}>
            <View style={localStyles.navIconWrapperActive}>
                <Image source={require('../../assets/icons/proicons_save-pencil.png')} style={localStyles.navIcon} resizeMode="contain" />
                <Text style={localStyles.navTextActive}>Manage</Text>
            </View>
          </TouchableOpacity>
  
          <TouchableOpacity style={localStyles.navButton} onPress={() => navigation.navigate('AddManager')}>
            <View style={localStyles.navIconWrapper}>
                <Image source={require('../../assets/icons/f7_person-3-fill.png')} style={localStyles.navIcon} resizeMode="contain" />
            </View>
          </TouchableOpacity>
      </View>
      
      <Image source={require('../../assets/images/logo-ugn.png')} style={localStyles.backgroundLogo} resizeMode="contain" />
    </SafeAreaView>
  );
};

// ============================================
// 🎨 STYLES (ASLI DARI FILE ANDA + STYLE LABEL CHART)
// ============================================
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#015023',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
  
  // STYLE LABEL MENGAMBANG (BUBBLE)
  floatingLabel: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 10,
  },
  percentText: {
    fontSize: 12,
    fontWeight: 'bold',
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
    borderWidth: 2,
    borderColor: '#DABC4E',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: '#DABC4E',
    borderWidth: 1,
    borderColor: '#000000',
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  navTextActive: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default StatistikPendaftaran;