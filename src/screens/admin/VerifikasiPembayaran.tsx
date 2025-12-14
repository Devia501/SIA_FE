import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Styles & Services
import { ManagerStyles } from '../../styles/ManagerStyles'; 
import { AdminStyles } from '../../styles/AdminStyles'; 
import { AdminStackParamList } from '../../navigation/AdminNavigator'; 
import { managerService, PaymentDetail } from '../../services/managerService';

type VerifikasiPembayaranNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'VerifikasiPembayaran'>;

const VerifikasiPembayaran = () => {
  const navigation = useNavigation<VerifikasiPembayaranNavigationProp>();
  // @ts-ignore
  const route = useRoute<any>();
  const { id_profile, name } = route.params; // Mengambil id_profile dari navigasi

  const [isLoading, setIsLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  
  // 1. FETCH DATA PEMBAYARAN (REAL DATA)
  const fetchPayment = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await managerService.getApplicantPayment(id_profile);
      if (response.success && response.data) {
        setPayment(response.data);
      } else {
        // Jika belum ada data pembayaran
        setPayment(null);
      }
    } catch (error: any) {
        console.log("Payment fetch error:", error);
        // Tetap set null agar tidak error, UI akan menampilkan "Belum ada data"
        setPayment(null);
    } finally {
      setIsLoading(false);
    }
  }, [id_profile]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  // 2. HANDLER VIEW IMAGE (SECURE - SAMA SEPERTI MANAGER)
  const handleViewFullImage = async () => {
    if (!payment?.payment_proof_file) {
      Alert.alert("Info", "File bukti transfer tidak tersedia.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const BASE_URL = 'http://172.27.86.208:8000/api'; 
      // Endpoint admin untuk melihat file
      const url = `${BASE_URL}/admin/payment-file/${payment.id}?token=${token}`;
      
      Linking.openURL(url).catch(err => {
        console.error("Failed opening URL:", err);
        Alert.alert("Error", "Tidak dapat membuka gambar.");
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Gagal memproses permintaan.");
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[AdminStyles.container, {justifyContent:'center', alignItems:'center'}]}>
        <ActivityIndicator size="large" color="#DABC4E" />
      </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={AdminStyles.container} edges={['top', 'bottom']}>
        <Image
          source={require('../../assets/images/logo-ugn.png')}
          style={AdminStyles.backgroundLogo}
          resizeMode="contain"
        />

          <View style={AdminStyles.headerContainer}>
            <ImageBackground
              source={require('../../assets/images/App Bar - Bottom.png')}
              style={AdminStyles.waveBackground}
              resizeMode="cover"
            >
              <View style={AdminStyles.headerContent}>
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
                <Text style={localStyles.headerTitle}>Monitoring Pembayaran</Text> 
                <View style={ManagerStyles.headerIconContainerLeft} />
              </View>
            </ImageBackground>
          </View>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.scrollContent}>
          
          {/* Label Verifikasi Pembayaran */}
          <View style={localStyles.verifikasiLabelContainer}>
            <Text style={localStyles.verifikasiLabelText}>Status Pembayaran: {name}</Text>
          </View>
          
          {payment ? (
            <>
              {/* CARD 1: Detail Pembayaran */}
              <View style={[localStyles.cardBase, localStyles.paymentDetailCard]}>
                {/* Badge Status Dinamis */}
                <View style={[localStyles.statusContainer, 
                    payment.status === 'verified' ? {backgroundColor: '#189653'} : 
                    payment.status === 'rejected' ? {backgroundColor: '#BE0414'} : 
                    {backgroundColor: '#DABC4E'}
                ]}>
                  <Text style={localStyles.statusText}>
                    {payment.status ? payment.status.toUpperCase() : 'PENDING'}
                  </Text>
                </View>
                
                <Text style={localStyles.paymentName}>{payment.payment_code || 'Kode Pembayaran'}</Text>
                
                {/* Detail List */}
                <View style={localStyles.detailRow}>
                  <Image source={require('../../assets/icons/material-symbols_money-bag-rounded.png')} style={localStyles.detailIcon} />
                  <Text style={localStyles.detailText}>Jumlah: Rp {payment.paid_amount ? payment.paid_amount.toLocaleString() : '-'}</Text>
                </View>
                <View style={localStyles.detailRow}>
                  <Image source={require('../../assets/icons/mingcute_bank-fill.png')} style={localStyles.detailIcon} />
                  <Text style={localStyles.detailText}>Metode: {payment.payment_method_name || 'Transfer Bank'}</Text>
                </View>
                <View style={localStyles.detailRow}>
                  <Image source={require('../../assets/icons/stash_data-date-duotone.png')} style={localStyles.detailIcon} />
                  <Text style={localStyles.detailText}>Tanggal: {payment.payment_date || '-'}</Text>
                </View>

                {/* Pesan Reject (Jika ada) */}
                {payment.status === 'rejected' && payment.rejection_reason && (
                    <View style={{marginTop: 10, padding: 8, backgroundColor: '#FFEBEE', borderRadius: 8, width: '100%'}}>
                        <Text style={{color: '#BE0414', fontSize: 12}}>Alasan Penolakan: {payment.rejection_reason}</Text>
                    </View>
                )}
              </View>

              {/* CARD 2: Transfer Receipt Preview */}
              <View style={[localStyles.cardBase, localStyles.receiptPreviewCard]}>
                <View style={localStyles.receiptHeader}>
                  <Image source={require('../../assets/icons/File.png')} style={localStyles.receiptFileIcon} />
                  <Text style={localStyles.receiptHeaderText}>Bukti Transfer</Text>
                </View>

                <View style={localStyles.receiptInfoContainer}>
                    <Text style={localStyles.receiptInfoText}>Pengirim: {payment.sender_account_holder || '-'}</Text>
                    <Text style={localStyles.receiptInfoText}>Bank: {payment.sender_bank || '-'} ({payment.sender_account_number || '-'})</Text>
                </View>

                <TouchableOpacity style={localStyles.viewImageButton} onPress={handleViewFullImage}>
                  <Image source={require('../../assets/icons/material-symbols_search-rounded.png')} style={localStyles.magnifyIcon} />
                  <Text style={localStyles.viewImageText}>Lihat Bukti Transfer</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Tampilan jika data tidak ditemukan
            <View style={[localStyles.cardBase, {alignItems: 'center', justifyContent: 'center', minHeight: 150}]}>
                <Image source={require('../../assets/icons/fluent_warning-12-filled.png')} style={{width: 40, height: 40, tintColor: '#DABC4E', marginBottom: 10}} />
                <Text style={{color: '#000', fontWeight: 'bold'}}>Belum ada data pembayaran</Text>
                <Text style={{color: '#666', fontSize: 12, textAlign: 'center'}}>Pendaftar belum mengunggah bukti pembayaran.</Text>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
    </SafeAreaView>
    );
};
  
// Style Lokal (Sama persis dengan Admin Style asli Anda)
const localStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    ...AdminStyles.headerTitle,
    textAlign: 'center',
    flex: 1,
    color: '#000000ff', 
    left: 8,
  },
  verifikasiLabelContainer: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: '#DABC4E', 
    borderWidth: 2,
    borderColor: '#000000ff',
    opacity: 0.70,
  },
  verifikasiLabelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  cardBase: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#F5E6C8', 
    borderWidth: 3,
    borderColor: '#C4A962', 
    alignItems: 'flex-start',
  },
  paymentDetailCard: {
    alignItems: 'stretch',
    paddingTop: 10,
  },
  statusContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#DABC4E', 
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    position: 'absolute',
    right: 15,
    top: 15,
    borderWidth: 1,
    borderColor: '#00000050',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paymentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
    marginTop: 35, 
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailIcon: {
    width: 14,
    height: 14,
    marginRight: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#000000',
  },
  receiptPreviewCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DABC4E',
  },
  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  receiptFileIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#004225',
  },
  receiptHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004225',
  },
  receiptInfoContainer: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  receiptInfoText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 3,
  },
  viewImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#DABC4E',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal:10,
    width: '80%',
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  magnifyIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  viewImageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
});
  
export default VerifikasiPembayaran;