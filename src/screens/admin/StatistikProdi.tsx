// src/screens/admin/StatistikProdiScreen.tsx

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { PieChart } from 'react-native-gifted-charts'; 

// Imports Lokal
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { AdminStyles } from '../../styles/AdminStyles';
import { managerService, Applicant } from '../../services/managerService';

const { width } = Dimensions.get('window');

type StatistikProdiNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'StatistikProdi'>;

// 🎨 Palet Warna untuk Prodi (Agar konsisten)
const COLORS_PALETTE = ['#DABC4E', '#189653', '#4A90E2', '#E74C3C', '#9B59B6', '#34495E'];

// Interface untuk Data Statistik
interface ProdiStat {
  id: number;
  name: string;
  value: number;
  percent: number;
  color: string;
  gradientColors: string[];
}

const StatistikProdi = () => {
  const navigation = useNavigation<StatistikProdiNavigationProp>();

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalPendaftar, setTotalPendaftar] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]); // Data untuk Pie Chart
  const [prodiStats, setProdiStats] = useState<ProdiStat[]>([]); // Data untuk List & Legend

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      // 1. Ambil semua data pendaftar dari API
      const response = await managerService.getApplicants({ status: 'all' });
      
      if (response.success) {
        processData(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // --- PROCESS DATA ---
  const processData = (applicants: Applicant[]) => {
    const total = applicants.length;
    setTotalPendaftar(total);

    // Grouping by program_name
    const counts: Record<string, number> = {};
    applicants.forEach((app) => {
      const progName = app.program_name || 'Lainnya';
      counts[progName] = (counts[progName] || 0) + 1;
    });

    // Convert to Array & Sort (Highest first)
    const statsArray: ProdiStat[] = Object.keys(counts)
      .map((key, index) => {
        const count = counts[key];
        const percent = total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0;
        const color = COLORS_PALETTE[index % COLORS_PALETTE.length];
        
        return {
          id: index,
          name: key,
          value: count,
          percent: percent,
          color: color,
          gradientColors: [color, adjustColor(color, 40)], // Helper untuk gradient
        };
      })
      .sort((a, b) => b.value - a.value); // Urutkan dari terbanyak

    setProdiStats(statsArray);

    // Format Data untuk React Native Gifted Charts
    const chartFormatted = statsArray.map(item => ({
      value: item.value,
      color: item.color,
      text: `${Math.round(item.percent)}%`, // Tampilkan label persen di chart
      textColor: '#FFFFFF',
      textSize: 10,
    }));
    setChartData(chartFormatted);
  };

  // Helper simpel untuk membuat warna gradient lebih terang
  const adjustColor = (color: string, amount: number) => {
    return color; // Bisa dikembangkan logic hex manipulator jika perlu
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
  const handleLihatDetail = () => navigation.navigate('DataPendaftar');

  // --- RENDER COMPONENTS ---

  const renderLegend = () => (
    <View style={localStyles.legendContainer}>
      {prodiStats.map((item) => (
        <View key={item.id} style={localStyles.legendItem}>
          <View style={[localStyles.legendIndicator, { backgroundColor: item.color }]} />
          <Text style={localStyles.legendText} numberOfLines={1}>{item.name}</Text>
          <Text style={localStyles.legendValue}>
            {item.value} ({item.percent}%)
          </Text>
        </View>
      ))}
    </View>
  );

  const renderTopPrograms = () => (
    <View style={localStyles.topProgramList}>
      {prodiStats.map((item, index) => (
        <LinearGradient
          key={item.id}
          colors={[item.color, '#F5F5F5']} // Gradient halus dari warna prodi ke putih/abu
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={localStyles.topProgramItem}
        >
          <View style={[localStyles.rankCircle, { backgroundColor: 'rgba(255,255,255,0.6)' }]}>
            <Text style={localStyles.rankText}>{index + 1}</Text>
          </View>
          <View style={localStyles.topProgramInfo}>
            <Text style={localStyles.topProgramName}>{item.name}</Text>
            <Text style={localStyles.topProgramCount}>{item.value} Pendaftar</Text>
          </View>
          
          {/* Progress Bar Visual */}
          <View style={localStyles.progressBarContainer}>
            <View 
              style={[
                localStyles.progressBar, 
                { 
                  width: `${prodiStats.length > 0 ? (item.value / prodiStats[0].value) * 100 : 0}%`,
                  backgroundColor: item.color
                }
              ]} 
            />
          </View>
        </LinearGradient>
      ))}
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
            <LinearGradient
              colors={['#DABC4E', '#EFE3B0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={localStyles.headerBackground}
            >
              <View style={localStyles.headerContent}>
                <TouchableOpacity style={localStyles.headerIconContainerLeft} onPress={handleBack}>
                  <Image
                    source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                    style={localStyles.headerIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                <View style={localStyles.headerTitleContainer}>
                  <Text style={localStyles.headerTitle}>Statistik Per Prodi</Text>
                </View>
              </View>
            </LinearGradient>
        </View>

        {/* Content */}
        {loading ? (
          <ActivityIndicator size="large" color="#DABC4E" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* 📊 Distribusi Program Studi Card */}
            <View style={localStyles.chartCard}>
              <View style={localStyles.chartCardHeader}>
                <Text style={localStyles.chartCardTitle}>Distribusi Program Studi</Text>
                <Image
                  source={require('../../assets/icons/solar_chart-bold-duotone.png')}
                  style={localStyles.chartIcon}
                  resizeMode="contain"
                />
              </View>

              {/* Dynamic Donut Chart Container */}
              <View style={localStyles.donutChartContainer}>
                {chartData.length > 0 ? (
                  <PieChart
                    data={chartData}
                    donut
                    radius={110}
                    innerRadius={70}
                    innerCircleColor={'#FEFAE0'}
                    centerLabelComponent={() => (
                      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                         <Text style={{ fontSize: 24, fontWeight: '900', color: '#000' }}>
                            {totalPendaftar}
                         </Text>
                         <Text style={{ fontSize: 12, color: '#666' }}>Total</Text>
                      </View>
                    )}
                  />
                ) : (
                  <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                     <Text style={{ color: '#999' }}>Belum ada data pendaftar</Text>
                  </View>
                )}

                {/* Legend List */}
                {renderLegend()}
              </View>
            </View>

            {/* 🏆 Top Program Studi Card */}
            <View style={localStyles.topProgramCard}>
              <View style={localStyles.topProgramHeader}>
                <Text style={localStyles.topProgramTitle}>Ranking Program Studi</Text>
                <Image
                  source={require('../../assets/icons/solar_cup-bold.png')}
                  style={localStyles.trophyIcon}
                  resizeMode="contain"
                />
              </View>

              {chartData.length > 0 ? renderTopPrograms() : (
                 <Text style={{ textAlign: 'center', color: '#999', marginVertical: 20 }}>Data Kosong</Text>
              )}
            </View>

            {/* Action Button */}
            <TouchableOpacity onPress={handleLihatDetail}>
              <LinearGradient
                colors={['#DABC4E', '#EFE3B0']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 1 }}
                style={localStyles.actionButton}
              >
                <Text style={localStyles.actionButtonText}>Lihat Detail Data Pendaftar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={localStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

// --- STYLES (Dipertahankan 95% mirip aslinya, disesuaikan untuk Chart Library) ---
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
    marginRight: 12,
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
  
  // Chart Card Styles
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
  
  // Legend Styles
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

  // Top Program Styles
  topProgramCard: {
    backgroundColor: '#FEFAE0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  topProgramHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  topProgramTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  trophyIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  topProgramList: {
    gap: 12,
  },
  topProgramItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 12,
    gap: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  topProgramInfo: {
    flex: 1,
  },
  topProgramName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  topProgramCount: {
    fontSize: 12,
    color: '#000000',
  },
  progressBarContainer: {
    width: 50,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  actionButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
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

export default StatistikProdi;