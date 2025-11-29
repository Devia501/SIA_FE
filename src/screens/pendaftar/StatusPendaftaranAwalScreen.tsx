import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

type StatusPendaftaranAwalScreenNavigationProp = NativeStackNavigationProp<PendaftarStackParamList, 'StatusPendaftaranAwal'>;

const StatusPendaftaranAwalScreen = () => {
  const navigation = useNavigation<StatusPendaftaranAwalScreenNavigationProp>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  
  return (
    <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[PendaftarStyles.headerContainer, styles.headertitle]}>
          <ImageBackground
            source={require('../../assets/images/Rectangle 52.png')}
            style={PendaftarStyles.waveBackground}
            resizeMode="cover"
          >
              <View style={PendaftarStyles.headerTitleContainerV3}>
                <Text style={PendaftarStyles.headerTitleV3}>Status Pendaftaran</Text>
              </View>
          </ImageBackground>
        </View>

        <View style={styles.content}>
          <View style={styles.statusCard}>
            <View style={styles.lockIconContainer}>
              <View style={styles.lockIconCircle}>
                <Image
                  source={require('../../assets/icons/material-symbols_lock.png')}
                  style={styles.lockIcon}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Text style={styles.statusText}>
              Mohon maaf, anda belum{'\n'}melakukan pendaftaran.
            </Text>
          </View>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('TataCara')}
          >
            <LinearGradient
                colors={['#DABC4E', '#F5EFD3']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.registerButton}
              >
                <Text style={styles.registerButtonText}>Daftar Sekarang</Text>
              </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={[PendaftarStyles.bottomNav, styles.nav]}>
          <TouchableOpacity 
            style={PendaftarStyles.navItem}
            onPress={() => navigation.navigate('PendaftarDashboard')}
          >
            <Image
              source={require('../../assets/icons/material-symbols_home-rounded.png')}
              style={PendaftarStyles.navIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={PendaftarStyles.navItem}
            onPress={() => navigation.navigate('TataCara')}
          >
            <Image
              source={require('../../assets/icons/clarity_form-line.png')}
              style={PendaftarStyles.navIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={PendaftarStyles.navItem}>
            <View style={PendaftarStyles.navItemActive}>
              <Image
                source={require('../../assets/icons/fluent_shifts-activity.png')}
                style={PendaftarStyles.navIconImage}
                resizeMode="contain"
              />
              <Text style={PendaftarStyles.navTextActive}>Status</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={PendaftarStyles.navItem}
          onPress={() => navigation.navigate('Profile')}>
            <Image
              source={require('../../assets/icons/ix_user-profile-filled.png')}
              style={PendaftarStyles.navIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headertitle:{
    height: 70,
  },
  nav: {
    bottom: 0,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 80,
    alignItems: 'center',
  },
  statusCard: {
    backgroundColor: '#F5E6D3',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
    borderWidth: 3,
    borderColor: '#DABC4E',
  },
  lockIconContainer: {
    marginBottom: 25,
  },
  lockIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DABC4E',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    width: 40,
    height: 40,
    tintColor: '#000',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
  },
  registerButton: {
    marginBottom: 108.8,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6, 
    alignSelf: 'center',
    width: '90%',
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default StatusPendaftaranAwalScreen;