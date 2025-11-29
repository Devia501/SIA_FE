import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
// ASUMSI path styles dan navigator
import { ManagerStyles } from '../../styles/ManagerStyles'; // Tetap biarkan, karena digunakan di header
import { AdminStyles } from '../../styles/AdminStyles'; 
import { AdminStackParamList } from '../../navigation/AdminNavigator'; 

// Definisi Tipe Navigasi
type VerifikasiPembayaranNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'VerifikasiPembayaran'>;

// Data Dummy untuk Pembayaran
const paymentData = {
  name: "John Doe",
  amount: "Rp 550.000",
  method: "Bank Transfer (BCA)",
  txn: "#TXN123456789",
  date: "15 Dec 2024, 14:30",
  status: "Pending",
  receiptFrom: "John Doe (123-456-789)",
  receiptTo: "SIA Account (987-654-321)",
  receiptAmount: "Rp 550.000",
  receiptImage: require('../../assets/icons/File.png'), // ASUMSI Anda memiliki gambar receipt
};

// ============================================
// Komponen Modal View Image (Dikoreksi)
// ============================================
interface ImageViewModalProps {
  isVisible: boolean;
  onClose: () => void;
}
const ImageViewModal: React.FC<ImageViewModalProps> = ({ isVisible, onClose }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={localStyles.modalCenteredView}>
        {/* Modal Card dengan Gradient Background */}
        <LinearGradient
          colors={['#DABC4E', '#F5EFD3']} // Gradient yang mendekati warna emas/krem
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={localStyles.imageModalView}
        >
          {/* Placeholder Gambar Bukti Transfer */}
          <View style={localStyles.imagePlaceholder}>
            {/* Mengganti logic Image rotation yang error dengan cross-box yang stabil */}
            <View style={localStyles.crossBox}>
                <View style={localStyles.crossLine1} />
                <View style={localStyles.crossLine2} />
            </View>
          </View>
          
          {/* Tombol Done (Menggunakan LinearGradient) */}
          <TouchableOpacity onPress={onClose} style={localStyles.modalDoneButtonContainer}>
            <LinearGradient
              colors={['#DABC4E', '#F5EFD3']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={localStyles.modalDoneButton}
            >
              <Text style={localStyles.modalDoneButtonText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );
};


const VerifikasiPembayaran = () => {
  const navigation = useNavigation<VerifikasiPembayaranNavigationProp>();
  const [isImageModalVisible, setIsImageModalVisible] = useState(false); // State Modal Gambar
  
  // Fungsi untuk aksi verifikasi
  const handleVerify = () => {
    Alert.alert("Verifikasi", "Dokumen pembayaran siap untuk diverifikasi.");
  };

  // Fungsi untuk aksi tolak
  const handleTolak = () => {
    Alert.alert("Tolak", "Konfirmasi tolak pembayaran.");
  };

  // Fungsi untuk aksi Accept Pendaftar
  const handleAccept = () => {
    Alert.alert("Lulus", "Pendaftar dinyatakan lulus.");
    // TODO: Tambahkan navigasi ke halaman selanjutnya atau API call
  };

  // Fungsi untuk aksi Reject Pendaftar
  const handleReject = () => {
    Alert.alert("Tidak Lulus", "Pendaftar dinyatakan tidak lulus.");
    // TODO: Tambahkan navigasi ke halaman selanjutnya atau API call
  };

  // Fungsi untuk melihat gambar penuh (Diperbarui untuk menampilkan modal)
  const handleViewFullImage = () => {
    // Alert.alert("Lihat Gambar", "Membuka gambar bukti transfer penuh."); // Dihapus, diganti dengan modal
    setIsImageModalVisible(true);
  };

  return (
      <SafeAreaView style={AdminStyles.container} edges={['top', 'bottom']}>
        {/* Background Logo */}
        <Image
          source={require('../../assets/images/logo-ugn.png')}
          style={AdminStyles.backgroundLogo}
          resizeMode="contain"
        />

        {/* Header */}
          <View style={AdminStyles.headerContainer}>
            <ImageBackground
              source={require('../../assets/images/App Bar - Bottom.png')}
              style={AdminStyles.waveBackground}
              resizeMode="cover"
            >
              <View style={AdminStyles.headerContent}>
                {/* Tombol Back */}
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
                <View style={ManagerStyles.headerIconContainerLeft} /> {/* Spacer */}
              </View>
            </ImageBackground>
          </View>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={localStyles.scrollContent}>
          
          

          {/* Label Verifikasi Pembayaran */}
          <View style={localStyles.verifikasiLabelContainer}>
            <Text style={localStyles.verifikasiLabelText}>Payment Verification</Text>
          </View>
          
          {/* CARD 1: Detail Pembayaran */}
          <View style={[localStyles.cardBase, localStyles.paymentDetailCard]}>
            <View style={localStyles.statusContainer}>
              <Text style={localStyles.statusText}>{paymentData.status}</Text>
            </View>
            <Text style={localStyles.paymentName}>{paymentData.name}</Text>
            
            {/* Detail List */}
            <View style={localStyles.detailRow}>
              <Image source={require('../../assets/icons/material-symbols_money-bag-rounded.png')} style={localStyles.detailIcon} />
              <Text style={localStyles.detailText}>Jumlah: {paymentData.amount}</Text>
            </View>
            <View style={localStyles.detailRow}>
              <Image source={require('../../assets/icons/mingcute_bank-fill.png')} style={localStyles.detailIcon} />
              <Text style={localStyles.detailText}>Method: {paymentData.method}</Text>
            </View>
            <View style={localStyles.detailRow}>
              <Image source={require('../../assets/icons/famicons_pricetags.png')} style={localStyles.detailIcon} />
              <Text style={localStyles.detailText}>TXN: {paymentData.txn}</Text>
            </View>
            <View style={localStyles.detailRow}>
              <Image source={require('../../assets/icons/stash_data-date-duotone.png')} style={localStyles.detailIcon} />
              <Text style={localStyles.detailText}>Date: {paymentData.date}</Text>
            </View>
          </View>

          {/* CARD 2: Transfer Receipt Preview */}
          <View style={[localStyles.cardBase, localStyles.receiptPreviewCard]}>
            <View style={localStyles.receiptHeader}>
              <Image source={require('../../assets/icons/File.png')} style={localStyles.receiptFileIcon} />
              <Text style={localStyles.receiptHeaderText}>Transfer Receipt Preview</Text>
            </View>

            <View style={localStyles.receiptInfoContainer}>
                <Text style={localStyles.receiptInfoText}>From : {paymentData.receiptFrom}</Text>
                <Text style={localStyles.receiptInfoText}>To : {paymentData.receiptTo}</Text>
                <Text style={localStyles.receiptInfoText}>Jumlah: {paymentData.receiptAmount}</Text>
            </View>

            <TouchableOpacity style={localStyles.viewImageButton} onPress={handleViewFullImage}>
              <Image source={require('../../assets/icons/material-symbols_search-rounded.png')} style={localStyles.magnifyIcon} />
              <Text style={localStyles.viewImageText}>View Full Image</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
        
        {/* Panggil Komponen Modal */}
        <ImageViewModal
            isVisible={isImageModalVisible}
            onClose={() => setIsImageModalVisible(false)}
        />
    </SafeAreaView>
    );
};
  
// Style Lokal untuk Verifikasi Pembayaran
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
    color: '#000000ff', // Ubah warna judul jika perlu
    left: 8,
  },

  // --- Label Verifikasi Pembayaran ---
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
  
  // --- Style Dasar Card ---
  cardBase: {
    width: '100%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    backgroundColor: '#F5E6C8', // Warna latar belakang card
    borderWidth: 3,
    borderColor: '#C4A962', // Border kuning/emas
    alignItems: 'flex-start',
  },
  
  // --- CARD 1: Detail Pembayaran ---
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
    marginTop: 10,
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#D32F2F',
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

  // --- CARD 2: Transfer Receipt Preview ---
  receiptPreviewCard: {
    // Styling tambahan jika diperlukan
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

  // --- Style yang tidak relevan dengan AdminNavigator (Dihapus) ---
  // verifikasiLabelContainer1, choiceSeparator, finalActionCard, accept/reject buttons

  // ============================================
  // 東 STYLES MODAL VIEW IMAGE (Final)
  // ============================================
  modalCenteredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  imageModalView: {
    // Menggunakan LinearGradient sebagai background
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%', 
    height: '60%', 
    borderWidth: 3,
    borderColor: '#004225', 
  },
  imagePlaceholder: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F5EFD3', 
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00000050',
    overflow: 'hidden',
    position: 'relative', // Penting untuk penempatan cross line
  },
  // Gaya untuk membuat kotak silang (X)
  crossBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossLine1: {
    position: 'absolute',
    width: '80%', // Sesuaikan lebar agar terlihat bagus
    height: 2,
    backgroundColor: '#000000',
    transform: [{ rotate: '45deg' }],
  },
  crossLine2: {
    position: 'absolute',
    width: '80%', // Sesuaikan lebar agar terlihat bagus
    height: 2,
    backgroundColor: '#000000',
    transform: [{ rotate: '-45deg' }],
  },
  modalDoneButtonContainer: {
    width: '80%',
  },
  modalDoneButton: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 30,
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  modalDoneButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  // Style yang tidak relevan (dihapus/diabaikan)
  satu: {},
  managerUsersHeader: {},
  managerUsersText: {},
  addButton: {},
  addIcon: {},
  addText: {},
  managerCard: {},
  managerIcon: {},
  managerInfo: {},
  managerName: {},
  managerRole: {},
});
  
export default VerifikasiPembayaran;