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
  Modal,
  ActivityIndicator,
  TextInput,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Styles & Services
import { ManagerStyles } from '../../styles/ManagerStyles'; 
import { AdminStyles } from '../../styles/AdminStyles'; 
import { ManagerStackParamList } from '../../navigation/ManagerNavigator'; 
import { managerService, PaymentDetail } from '../../services/managerService';

type VerifikasiPembayaranNavigationProp = NativeStackNavigationProp<ManagerStackParamList, 'VerifikasiPembayaran'>;

// ============================================
// 1. KOMPONEN MODAL AKSI (VERIFIKASI/TOLAK)
// ============================================
interface ActionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (reason: string | null) => void;
  actionType: 'Verify' | 'Reject' | null;
  isLoading: boolean;
}

const ActionModal: React.FC<ActionModalProps> = ({ isVisible, onClose, onConfirm, actionType, isLoading }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isVisible) setReason('');
  }, [isVisible]);

  if (!actionType) return null;

  const isReject = actionType === 'Reject';
  const title = isReject ? 'Tolak Pembayaran' : 'Verifikasi Pembayaran';
  const message = isReject 
    ? 'Berikan alasan penolakan pembayaran ini.'
    : 'Apakah Anda yakin data pembayaran ini valid dan sesuai?';
  const buttonText = isReject ? 'Tolak Pembayaran' : 'Ya, Verifikasi';
  const confirmColors = isReject ? ['#BE0414', '#BE0414'] : ['#189653', '#4CAF50'];

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={localStyles.modalCenteredView}>
        <LinearGradient
          colors={['#F5E6C8', '#C4A962']}
          style={localStyles.modalGradientBackground}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <Text style={localStyles.modalTitle}>{title}</Text>
          
          {!isReject ? (
             <View style={localStyles.approveContent}>
                <Image source={require('../../assets/icons/Group 13886 (1).png')} style={localStyles.mainIconSmall} resizeMode="contain"/>
                <Text style={localStyles.modalMessage}>{message}</Text>
             </View>
          ) : (
            <>
              <Text style={localStyles.modalMessageSmall}>{message}</Text>
              <TextInput
                style={localStyles.reasonInput}
                onChangeText={setReason}
                value={reason}
                multiline
                numberOfLines={3}
                placeholder="Contoh: Nominal tidak sesuai / Bukti buram"
                placeholderTextColor="#A9A9A9"
              />
            </>
          )}

          <View style={localStyles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={localStyles.buttonWrapper} disabled={isLoading}>
              <LinearGradient colors={['#D3D3D3', '#C0C0C0']} style={localStyles.buttonStyle}>
                <Text style={[localStyles.buttonText, {color:'#000'}]}>Batal</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => onConfirm(isReject ? reason : null)} 
              style={localStyles.buttonWrapper} 
              disabled={isLoading || (isReject && !reason.trim())}
            >
              <LinearGradient colors={confirmColors} style={localStyles.buttonStyle}>
                {isLoading ? <ActivityIndicator color='white'/> : <Text style={localStyles.buttonText}>{buttonText}</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

// ============================================
// 2. MAIN SCREEN
// ============================================
const VerifikasiPembayaran = () => {
  const navigation = useNavigation<VerifikasiPembayaranNavigationProp>();
  // @ts-ignore
  const route = useRoute<any>();
  const { id_profile, name } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  
  // State Modal Aksi
  const [showActionModal, setShowActionModal] = useState(false);
  const [currentAction, setCurrentAction] = useState<'Verify' | 'Reject' | null>(null);

  // 1. FETCH DATA PEMBAYARAN
  const fetchPayment = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await managerService.getApplicantPayment(id_profile);
      if (response.success && response.data) {
        setPayment(response.data);
      } else {
        Alert.alert("Info", "Pendaftar ini belum melakukan pembayaran atau data tidak ditemukan.");
        navigation.goBack();
      }
    } catch (error: any) {
        // Jika 404, berarti belum upload
        console.log("Payment fetch error:", error);
        Alert.alert("Info", "Data pembayaran tidak ditemukan.");
        navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [id_profile, navigation]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  // 2. HANDLER TOMBOL UI
  const triggerVerify = () => {
    setCurrentAction('Verify');
    setShowActionModal(true);
  };

  const triggerReject = () => {
    setCurrentAction('Reject');
    setShowActionModal(true);
  };

  // 3. EKSEKUSI API VERIFIKASI / TOLAK PEMBAYARAN
  const executePaymentAction = async (reason: string | null) => {
    if (!payment) return;
    setIsProcessing(true);
    try {
      const status = currentAction === 'Verify' ? 'verified' : 'rejected';
      
      await managerService.verifyPayment(payment.id, {
        status: status,
        rejection_reason: reason || undefined
      });

      Alert.alert("Sukses", `Pembayaran berhasil di-${status === 'verified' ? 'verifikasi' : 'tolak'}.`);
      setShowActionModal(false);
      fetchPayment(); // Refresh data
    } catch (error: any) {
      Alert.alert("Gagal", error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. HANDLER VIEW IMAGE (SECURE)
  const handleViewFullImage = async () => {
    if (!payment?.payment_proof_file) {
      Alert.alert("Error", "File bukti transfer tidak tersedia.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      // Asumsi API endpoint untuk file private
      // Sesuaikan URL ini dengan route di Laravel: Route::get('admin/payment-file/{id}', ...)
      const BASE_URL = 'http://172.27.86.208:8000/api'; 
      const url = `${BASE_URL}/admin/payment-file/${payment.id}?token=${token}`;
      
      Linking.openURL(url).catch(err => {
        console.error("Failed opening URL:", err);
        Alert.alert("Error", "Tidak dapat membuka gambar.");
      });
    } catch (e) {
      console.error(e);
    }
  };

  // 5. HANDLER FINAL DECISION (LULUS/TIDAK LULUS PENDAFTAR)
  const handleFinalDecision = async (status: 'approved' | 'rejected') => {
    if (!payment || payment.status !== 'verified') {
        Alert.alert("Perhatian", "Pastikan pembayaran sudah diverifikasi (status: verified) sebelum meluluskan pendaftar.");
        return;
    }

    Alert.alert(
      "Konfirmasi",
      `Apakah Anda yakin menyatakan pendaftar ini ${status === 'approved' ? 'LULUS' : 'TIDAK LULUS'}?`,
      [
        { text: "Batal", style: 'cancel' },
        { 
          text: "Ya, Lanjutkan", 
          onPress: async () => {
            setIsProcessing(true);
            try {
              await managerService.updateApplicantStatus(id_profile, {
                status: status,
                notes: status === 'approved' ? 'Lulus Seleksi Administrasi & Pembayaran' : 'Tidak Lulus Seleksi'
              });
              Alert.alert("Sukses", `Status pendaftar diperbarui menjadi: ${status.toUpperCase()}`);
              navigation.navigate('KelolaPendaftaran'); // Kembali ke list
            } catch (error: any) {
              Alert.alert("Gagal", error.message);
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
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
        {/* Header */}
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
                <Text style={localStyles.headerTitle}>Verifikasi Pembayaran</Text> 
                <View style={ManagerStyles.headerIconContainerLeft} />
              </View>
            </ImageBackground>
          </View>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.scrollContent}>
          
          {/* Label Verifikasi Pembayaran */}
          <View style={localStyles.verifikasiLabelContainer}>
            <Text style={localStyles.verifikasiLabelText}>Verifikasi Pembayaran: {name}</Text>
          </View>
          
          {/* CARD 1: Detail Pembayaran */}
          <View style={[localStyles.cardBase, localStyles.paymentDetailCard]}>
            <View style={[localStyles.statusContainer, 
                payment?.status === 'verified' ? {backgroundColor: '#189653'} : 
                payment?.status === 'rejected' ? {backgroundColor: '#BE0414'} : {}
            ]}>
              <Text style={localStyles.statusText}>{payment?.status?.toUpperCase() || 'UNKNOWN'}</Text>
            </View>
            
            <Text style={localStyles.paymentName}>{payment?.payment_code}</Text>
            
            {/* Detail List */}
            <View style={localStyles.detailRow}>
              <Image source={require('../../assets/icons/material-symbols_money-bag-rounded.png')} style={localStyles.detailIcon} />
              <Text style={localStyles.detailText}>Jumlah: Rp {payment?.paid_amount?.toLocaleString()}</Text>
            </View>
            <View style={localStyles.detailRow}>
              <Image source={require('../../assets/icons/mingcute_bank-fill.png')} style={localStyles.detailIcon} />
              <Text style={localStyles.detailText}>Metode: {payment?.payment_method_name || 'Bank Transfer'}</Text>
            </View>
            <View style={localStyles.detailRow}>
              <Image source={require('../../assets/icons/stash_data-date-duotone.png')} style={localStyles.detailIcon} />
              <Text style={localStyles.detailText}>Tanggal: {payment?.payment_date}</Text>
            </View>

            {/* Tombol Aksi (Hanya muncul jika belum verified/rejected) */}
            {payment?.status !== 'verified' && payment?.status !== 'rejected' && (
                <View style={localStyles.actionButtonContainer}>
                <TouchableOpacity style={localStyles.verifyButton} onPress={triggerVerify}>
                    <Text style={localStyles.verifyButtonText}>Verifikasi</Text>
                </TouchableOpacity>
                <TouchableOpacity style={localStyles.tolakButton} onPress={triggerReject}>
                    <Text style={localStyles.tolakButtonText}>Tolak</Text>
                </TouchableOpacity>
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
                <Text style={localStyles.receiptInfoText}>Pengirim: {payment?.sender_account_holder || '-'}</Text>
                <Text style={localStyles.receiptInfoText}>Bank: {payment?.sender_bank || '-'} ({payment?.sender_account_number || '-'})</Text>
            </View>

            <TouchableOpacity style={localStyles.viewImageButton} onPress={handleViewFullImage}>
              <Image source={require('../../assets/icons/material-symbols_search-rounded.png')} style={localStyles.magnifyIcon} />
              <Text style={localStyles.viewImageText}>Lihat Bukti Full</Text>
            </TouchableOpacity>
          </View>

          {/* Pemisah Pilihan */}
          <View>
            <LinearGradient
                colors={['#F5EFD3', '#DABC4E']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0.5 }}
                style={localStyles.verifikasiLabelContainer1}
            >
            <Text style={localStyles.choiceSeparator}>Keputusan Akhir Pendaftaran</Text>
            </LinearGradient>
          </View>

          {/* CARD 3: Final Acceptance (Hanya aktif jika pembayaran verified) */}
          <View style={[localStyles.cardBase, localStyles.finalActionCard, 
             (payment?.status !== 'verified') && {opacity: 0.5} 
          ]}>
            <TouchableOpacity 
                style={localStyles.acceptPendaftarButton} 
                onPress={() => handleFinalDecision('approved')}
                disabled={payment?.status !== 'verified' || isProcessing}
            >
              <Text style={localStyles.acceptPendaftarText}>LULUSKAN PENDAFTAR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={localStyles.rejectPendaftarButton} 
                onPress={() => handleFinalDecision('rejected')}
                disabled={isProcessing}
            >
              <Text style={localStyles.rejectPendaftarText}>TIDAK LULUS</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
        
        {/* Modal Konfirmasi Verify/Reject */}
        <ActionModal 
            isVisible={showActionModal}
            actionType={currentAction}
            onClose={() => setShowActionModal(false)}
            onConfirm={executePaymentAction}
            isLoading={isProcessing}
        />

        {/* Logo Background */}
        <Image
          source={require('../../assets/images/logo-ugn.png')}
          style={AdminStyles.backgroundLogo}
          resizeMode="contain"
        />
    </SafeAreaView>
    );
};
  
// Style Lokal
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
  verifikasiLabelContainer1:{
    alignSelf: 'center',
    backgroundColor: '#DABC4E',
    borderRadius: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#e9bf26ff',
    marginTop: 10, 
  },
  verifikasiLabelContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#DABC4E',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000000ff',
    marginTop: 10, 
    opacity: 0.75,
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
    marginBottom: 8,
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
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  verifyButton: {
    backgroundColor: '#189653',
    borderRadius: 25,
    paddingVertical: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tolakButton: {
    backgroundColor: '#BE0414',
    borderRadius: 25,
    paddingVertical: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  tolakButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  receiptPreviewCard: {
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
    color: '#000000ff',
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
  choiceSeparator: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000ff', 
    marginBottom: 15,
    textAlign: 'center',
    top: 6,
  },
  finalActionCard: {
    alignItems: 'stretch',
    padding: 20,
  },
  acceptPendaftarButton: {
    backgroundColor: '#189653',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  acceptPendaftarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectPendaftarButton: {
    backgroundColor: '#BE0414',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  rejectPendaftarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // MODAL STYLES
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  modalGradientBackground: {
    margin: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
    borderWidth: 1,
    borderColor: '#000',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004225',
    marginBottom: 15,
    textAlign: 'center',
  },
  approveContent: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#189653',
    borderStyle: 'dashed',
  },
  mainIconSmall: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  modalMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  modalMessageSmall: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  reasonInput: {
    width: '100%',
    minHeight: 80,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C4A962',
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  buttonStyle: {
    borderRadius: 50,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
  
export default VerifikasiPembayaran;