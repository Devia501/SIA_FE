// src/screens/admin/StatistikProdiScreen.tsx

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
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { AdminStyles } from '../../styles/AdminStyles';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

type StatistikProdiNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'StatistikProdi'>;

// Data Dummy untuk Distribusi Program Studi
const PROGRAM_STUDI_DATA = [
  { 
    id: 1, 
    name: 'Teknik Informatika', 
    value: 802, 
    percent: 65, 
    color: '#DABC4E' 
  },
  { 
    id: 2, 
    name: 'Sistem Informasi', 
    value: 283, 
    percent: 23, 
    color: '#4A90E2' 
  },
  { 
    id: 3, 
    name: 'Teknik Elektro', 
    value: 185, 
    percent: 15, 
    color: '#38A169' 
  },
];

const TOTAL_PENDAFTAR = 1234;

// Data untuk Top Program Studi (ranking)
const TOP_PROGRAM_STUDI = [
  { 
    rank: 1, 
    name: 'Teknik Informatika', 
    count: 432, 
    color: '#DABC4E',
    gradientColors: ['#DABC4E', '#EFE3B0']
  },
  { 
    rank: 2, 
    name: 'Sistem Informasi', 
    count: 283, 
    color: '#DABC4E',
    gradientColors: ['#DABC4E', '#EFE3B0']
  },
  { 
    rank: 3, 
    name: 'Teknik Elektro', 
    count: 185, 
    color: '#DABC4E',
    gradientColors: ['#DABC4E', '#EFE3B0']
  },
];

// Komponen untuk Item Legend
const ProgramStudiLegendItem: React.FC<{
  name: string;
  value: number;
  percent: number;
  color: string;
}> = ({ name, value, percent, color }) => (
  <View style={localStyles.legendItem}>
    <View style={[localStyles.legendIndicator, { backgroundColor: color }]} />
    <Text style={localStyles.legendText}>{name}</Text>
    <Text style={localStyles.legendValue}>{value} ({percent}%)</Text>
  </View>
);

// Komponen untuk Top Program Studi Item
const TopProgramItem: React.FC<{
  rank: number;
  name: string;
  count: number;
  color: string;
  gradientColors: string[];
}> = ({ rank, name, count, color, gradientColors }) => (
  <LinearGradient
    colors={gradientColors}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 1 }}
    style={localStyles.topProgramItem}
  >
    <View style={localStyles.rankCircle}>
      <Text style={localStyles.rankText}>{rank}</Text>
    </View>
    <View style={localStyles.topProgramInfo}>
      <Text style={localStyles.topProgramName}>{name}</Text>
      <Text style={localStyles.topProgramCount}>{count} Pendaftar</Text>
    </View>
    <View style={localStyles.progressBarContainer}>
      <View 
        style={[
          localStyles.progressBar, 
          { width: `${(count / 432) * 100}%` }
        ]} 
      />
    </View>
  </LinearGradient>
);

const StatistikProdi = () => {
  const navigation = useNavigation<StatistikProdiNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLihatDetail = () => {
    console.log('Navigasi ke Detail Data Pendaftar');
    navigation.navigate('DataPendaftar');
  };

  return (
    <SafeAreaView style={localStyles.container} edges={['top', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.scrollContent}
      >
        {/* Header */}
        <View style={localStyles.headerContainer}>
          <View style={localStyles.headerBackground}>
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
                <Text style={localStyles.headerTitle}>Statistik Per Prodi</Text>
              </View>
            </View>
            </LinearGradient>
          </View>
        </View>

        {/* Distribusi Program Studi Card */}
        <View style={localStyles.chartCard}>
          <View style={localStyles.chartCardHeader}>
            <Text style={localStyles.chartCardTitle}>Distribusi Program Studi</Text>
            <Image
              source={require('../../assets/icons/solar_chart-bold-duotone.png')}
              style={localStyles.chartIcon}
              resizeMode="contain"
            />
          </View>

          {/* Donut Chart Container */}
          <View style={localStyles.donutChartContainer}>
            {/* Donut Chart Wrapper */}
            <View style={localStyles.donutChartWrapper}>
              {/* Base Circle dengan segmen warna */}
              <View style={localStyles.donutBase}>
                {/* Segmen Kuning/Emas (Teknik Informatika 65%) - Dominant */}
                <View style={localStyles.segmentYellow} />
                
                {/* Segmen Biru (Sistem Informasi 23%) */}
                <View style={localStyles.segmentBlue} />
                
                {/* Segmen Hijau (Teknik Elektro 15%) */}
                <View style={localStyles.segmentGreen} />
              </View>

              {/* Center Circle dengan total */}
              <View style={localStyles.donutChartCenter}>
                <Text style={localStyles.donutCenterValue}>{TOTAL_PENDAFTAR.toLocaleString()}</Text>
              </View>

              {/* Percentage Labels */}
              <View style={[localStyles.percentLabel, { top: 30, left: 15 }]}>
                <Text style={[localStyles.percentText, { color: '#38A169' }]}>15%</Text>
              </View>
              <View style={[localStyles.percentLabel, { top: 30, right: 15 }]}>
                <Text style={[localStyles.percentText, { color: '#4A90E2' }]}>20%</Text>
              </View>
              <View style={[localStyles.percentLabel, { bottom: 35 }]}>
                <Text style={[localStyles.percentText, { color: '#DABC4E' }]}>65%</Text>
              </View>
            </View>

            {/* Legend */}
            <View style={localStyles.legendContainer}>
              {PROGRAM_STUDI_DATA.map(item => (
                <ProgramStudiLegendItem
                  key={item.id}
                  name={item.name}
                  value={item.value}
                  percent={item.percent}
                  color={item.color}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Top Program Studi Card */}
        <View style={localStyles.topProgramCard}>
          <View style={localStyles.topProgramHeader}>
            <Text style={localStyles.topProgramTitle}>Top Program Studi</Text>
            <Image
              source={require('../../assets/icons/solar_cup-bold.png')}
              style={localStyles.trophyIcon}
              resizeMode="contain"
            />
          </View>

          <View style={localStyles.topProgramList}>
            {TOP_PROGRAM_STUDI.map(item => (
              <TopProgramItem
                key={item.rank}
                rank={item.rank}
                name={item.name}
                count={item.count}
                color={item.color}
                gradientColors={item.gradientColors}
              />
            ))}
          </View>
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

        {/* Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={AdminStyles.bottomNav}>
        <TouchableOpacity
          style={AdminStyles.navItem}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
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

        <TouchableOpacity
          style={AdminStyles.navItem}
          onPress={() => navigation.navigate('AddManager')}
        >
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
    backgroundColor: '#DABC4E',
    position: 'relative',
    overflow: 'hidden',
  },
  segmentYellow: {
    position: 'absolute',
    width: 250,
    height: 250,
    backgroundColor: '#DABC4E',
    borderRadius: 125,
    transform: [{ rotate: '180deg' }],
    bottom: -70,
    zIndex: 3,
  },
  segmentBlue: {
    position: 'absolute',
    width: 250,
    height: 600,
    backgroundColor: '#4A90E2',
    borderRadius: 30,
    top: -270,
    right: 150,
    transform: [{ rotate: '40deg' }],
    zIndex: 2,
  },
  segmentGreen: {
    position: 'absolute',
    width: 250,
    height: 600,
    backgroundColor: '#38A169',
    borderRadius: 30,
    top: -270,
    left: 150,
    transform: [{ rotate: '-40deg' }],
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
    padding: 16,
    gap: 12,
  },
  rankCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFE3B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
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
    width: 60,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#189653',
    borderRadius: 4,
  },
  actionButton: {
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