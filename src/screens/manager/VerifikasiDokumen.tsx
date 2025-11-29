import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Modal, // Import Modal untuk dialog kustom
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ManagerStackParamList } from '../../navigation/ManagerNavigator';
// import ManagerStyles dan Colors jika memang digunakan di bagian lain file ini.
// import { ManagerStyles, Colors } from '../../styles/ManagerStyles'; 
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

type VerifikasiDokumenNavigationProp = NativeStackNavigationProp<ManagerStackParamList, 'VerifikasiDokumen'>;

// Interface untuk dokumen
interface Document {
  id: number;
  name: string;
  filename: string;
  status: 'Approved' | 'Rejected' | 'Pending';
}

// Props untuk screen ini
interface VerifikasiDokumenProps {
  route: {
    params: {
      name: string;
      email: string;
      prodi: string;
      registrationId: number;
    };
  };
}

// Data dummy dokumen
const dummyDocuments: Document[] = [
  { id: 1, name: 'KTP/Identitas', filename: 'ktp_john_doe.jpg', status: 'Pending' },
  { id: 2, name: 'Akta Kelahiran', filename: 'akta_john_doe.jpg', status: 'Pending' },
  { id: 3, name: 'Kartu Keluarga', filename: 'kk_john_doe.jpg', status: 'Rejected' },
  { id: 4, name: 'Ijazah SMA/SMK', filename: 'ijazah_john_doe.jpg', status: 'Approved' },
  { id: 5, name: 'Surat Keterangan Lulus (SKL)', filename: 'skl_john_doe.jpg', status: 'Pending' },
  { id: 6, name: 'Transkrip Nilai', filename: 'tk_john_doe.jpg', status: 'Rejected' },
];

// Komponen untuk Document Card (TIDAK DIUBAH)
const DocumentCard = ({ 
  document, 
  onApprove, 
  onReject, 
  onView 
}: { 
  document: Document; 
  onApprove: () => void; 
  onReject: () => void;
  onView: () => void;
}) => {
  return (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentName}>{document.name}</Text>
      </View>
      
      <View style={styles.documentBody}>
        <Text style={styles.fileIcon}>📄</Text>
        <Text style={styles.filename}>{document.filename}</Text>
        
        <TouchableOpacity style={styles.viewButton} onPress={onView}>
          <Image 
            source={require('../../assets/icons/fi-sr-eye.png')} 
            style={styles.viewIcon1}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.documentActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]} 
          onPress={onApprove}
        >
          <View style={styles.actionButtonContent}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <Text style={styles.actionButtonText}>Approve</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={onReject}
        >
          <View style={styles.actionButtonContent}>
            <View style={styles.crossCircle}>
              <Text style={styles.crossMark}>✕</Text>
            </View>
            <Text style={styles.actionButtonText}>Reject</Text>
          </View>
        </TouchableOpacity>

        {/* Status Badge */}
        {document.status !== 'Pending' && (
          <View style={[
            styles.statusBadgeSmall,
            document.status === 'Approved' ? styles.statusApproved : styles.statusRejected
          ]}>
            <Text style={styles.statusBadgeText}>
              {document.status === 'Approved' ? 'Approved' : 'Rejected'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// --- KOMPONEN MODAL BARU DENGAN GRADIENT PADA BACKGROUND MODAL ---
const ConfirmationModal = ({
  isVisible,
  onClose,
  onConfirm,
  type, // 'Reject' atau 'Approve'
}: {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'Reject' | 'Approve';
}) => {
  const isReject = type === 'Reject';
  const modalTitle = isReject
    ? 'Apakah anda yakin menolak semua dokumen pendaftar?'
    : 'Apakah anda yakin menyetujui semua dokumen pendaftar?';
  const actionText = isReject ? 'Reject' : 'Approve';
  const noteText = isReject
    ? '*pendaftar akan otomatis dinyatakan tidak lulus seleksi pendaftaran mahasiswa baru universitas global nusantara.'
    : '';
    
  // Warna gradient untuk tombol
  const rejectGradientColors = ['#BE0414', '#BE0414']; // Merah untuk Reject/Tolak
  const approveGradientColors = ['#4CAF50', '#189653']; // Hijau untuk Approve
  const cancelGradientColors = ['#4CAF50', '#189653']; // Hijau untuk Batal (default design)
  const cancelGradientColors1 = ['#BE0414', '#BE0414']; // Merah untuk Batal (sesuai permintaan)

  // Warna gradient untuk latar belakang modal
  const modalBackgroundGradient = ['#F5E6C8', '#C4A962']; 

  const confirmColors = isReject ? rejectGradientColors : approveGradientColors;

  // LOGIKA WARNA TOMBOL 'BATAL'
  // Jika Reject Modal: Batal = Hijau (cancelGradientColors) 
  // Jika Approve Modal: Batal = Merah (cancelGradientColors1) - Sesuai permintaan
  const batalColors = isReject ? cancelGradientColors : cancelGradientColors1;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.centeredView}>
        {/* MENGGANTI View dengan LinearGradient untuk latar belakang modal */}
        <LinearGradient
            colors={modalBackgroundGradient}
            style={modalStyles.modalGradientBackground} // Style yang mengandung border, padding, dll.
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
          <Text style={modalStyles.modalTitle}>{modalTitle}</Text>
          
          <Image 
            // ASUMSI path ikon sudah sesuai
            source={isReject 
              ? require('../../assets/icons/Group 13886.png') // Ikon X Merah 
              : require('../../assets/icons/Group 13886 (1).png') // Ikon V Hijau
            }
            style={modalStyles.mainIcon}
            resizeMode="contain"
          />

          {/* Catatan di modal Approve berwarna Hijau (atau warna utama aplikasi) */}
          <Text style={[modalStyles.modalNote, { color: isReject ? '#BE0414' : '#189653' }]}>
            {noteText}
          </Text>
          
          <View style={modalStyles.buttonContainer}>
            {/* Tombol Batal */}
            <TouchableOpacity onPress={onClose} style={modalStyles.buttonWrapper}>
                <LinearGradient
                    colors={batalColors} // Menggunakan logika warna batal yang baru
                    style={modalStyles.buttonStyle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={modalStyles.buttonText}>Batal</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Tombol Aksi (Reject/Approve) */}
            <TouchableOpacity onPress={onConfirm} style={modalStyles.buttonWrapper}>
                <LinearGradient
                    colors={confirmColors}
                    style={modalStyles.buttonStyle}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Text style={[modalStyles.buttonText, { color: 'white' }]}>{actionText}</Text>
                </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};
// --- AKHIR KOMPONEN MODAL BARU ---

const VerifikasiDokumenScreen: React.FC<VerifikasiDokumenProps> = ({ route }) => {
  const navigation = useNavigation<VerifikasiDokumenNavigationProp>();
  
  // State baru untuk Modal
  const [isRejectModalVisible, setRejectModalVisible] = useState(false);
  const [isApproveModalVisible, setApproveModalVisible] = useState(false);
  
  // State untuk dokumen
  const [documents, setDocuments] = useState<Document[]>(dummyDocuments);
  
  // Data pendaftar dari route params
  const { name, email, prodi, registrationId } = route.params;

  const handleApprove = (docId: number) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, status: 'Approved' as const } : doc
      )
    );
  };

  const handleReject = (docId: number) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === docId ? { ...doc, status: 'Rejected' as const } : doc
      )
    );
  };

  const handleView = (document: Document) => {
    Alert.alert('View Document', `Viewing: ${document.filename}`);
  };

  // --- MODIFIKASI FUNGSI UNTUK MENAMPILKAN MODAL CUSTOM ---
  const handleApproveAll = () => {
    setApproveModalVisible(true);
  };

  const confirmApproveAll = () => {
    setDocuments(prev => 
      prev.map(doc => ({ ...doc, status: 'Approved' as const }))
    );
    setApproveModalVisible(false);
    
    // NAVIGASI BARU: Ke VerifikasiPembayaran setelah Approve All
    navigation.navigate('VerifikasiPembayaran'); 
  };

  const handleRejectAll = () => {
    setRejectModalVisible(true);
  };

  const confirmRejectAll = () => {
    setDocuments(prev => 
      prev.map(doc => ({ ...doc, status: 'Rejected' as const }))
    );
    setRejectModalVisible(false);
    
    // NAVIGASI BARU: Kembali ke KelolaPendaftaran
    // Karena pendaftar ditolak, kita kembali ke list utama.
    // Kita anggap status di KelolaPendaftaran akan ter-update
    navigation.navigate('KelolaPendaftaran'); 
    // Catatan: Jika KelolaPendaftaranScreen.tsx memiliki logika untuk 
    // langsung mengaktifkan filter 'Rejected', logika itu harus ada di sana.
  };
  // --- AKHIR MODIFIKASI FUNGSI ---

  const handleNext = () => {
    // Fungsi Next button hanya jika semua sudah diverifikasi satu per satu
    Alert.alert('Success', 'Document verification completed!');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('../../assets/images/App Bar - Bottom.png')}
          style={styles.waveBackground}
          resizeMode="cover"
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Image
                source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                style={styles.backIcon1}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Verifikasi Dokumen</Text>
            <View style={styles.headerSpacer} />
          </View>
        </ImageBackground>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Applicant Name Badge */}
        <View style={styles.applicantBadge}>
          <Text style={styles.applicantText}>{name} - Document Review</Text>
        </View>

        {/* Documents List */}
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onApprove={() => handleApprove(doc.id)}
            onReject={() => handleReject(doc.id)}
            onView={() => handleView(doc)}
          />
        ))}

        {/* Action Buttons */}
        <View style={styles.finalActions}>
          <TouchableOpacity 
            style={styles.approveAllButton}
            onPress={handleApproveAll} // Mengganti dengan pemanggil modal
          >
            <Text style={styles.approveAllText}>Approve All</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.rejectAllButton}
            onPress={handleRejectAll} // Mengganti dengan pemanggil modal
          >
            <Text style={styles.rejectAllText}>Reject All</Text>
          </TouchableOpacity>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Image
            source={require('../../assets/icons/Vector5.png')}
            style={styles.nextIcon1}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={styles.backgroundLogo}
        resizeMode="contain"
      />
      
      {/* --- MODAL CUSTOM --- */}
      <ConfirmationModal
        isVisible={isRejectModalVisible}
        onClose={() => setRejectModalVisible(false)}
        onConfirm={confirmRejectAll}
        type="Reject"
      />
      
      <ConfirmationModal
        isVisible={isApproveModalVisible}
        onClose={() => setApproveModalVisible(false)}
        onConfirm={confirmApproveAll}
        type="Approve"
      />
      {/* --- AKHIR MODAL CUSTOM --- */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004225',
  },
  headerContainer: {
    height: 60,
  },
  waveBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginLeft: 7,
    marginTop: 5,
  },
  backButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon1: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
    flex: 1,
    textAlign: 'center',
    left: 14,
    bottom: 4,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  applicantBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DABC4E',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000000ff',
    opacity: 0.75,
  },
  applicantText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  documentCard: {
    backgroundColor: '#F5E6C8',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C4A962',
  },
  documentHeader: {
    marginBottom: 10,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004225',
  },
  documentBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  fileIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  filename: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  viewButton: {
    padding: 5,
  },
  viewIcon1: {
    width: 18,
    height: 18,
  },
  documentActions: {
    flexDirection: 'row',
    right: 26,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 8,
    marginHorizontal: 25,
  },
  approveButton: {
    backgroundColor: '#DABC4E',
  },
  rejectButton: {
    right: 42,
    backgroundColor: '#DABC4E',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#189653',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  checkMark: {
    color: '#ffffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  crossCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#BE0414',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  crossMark: {
    color: '#ffffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadgeSmall: {
    position: 'absolute',
    left: 250,
    top: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  statusApproved: {
    backgroundColor: '#189653',
  },
  statusRejected: {
    backgroundColor: '#BE0414',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  finalActions: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 62,
  },
  approveAllButton: {
    backgroundColor: '#189653',
    borderRadius: 25,
    paddingVertical: 6,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  approveAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rejectAllButton: {
    backgroundColor: '#BE0414',
    borderRadius: 25,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  rejectAllText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    alignSelf: 'flex-end',
    width: 46,
    height: 46,
    borderRadius: 28,
    backgroundColor: '#DABC4E',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 10,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#000000ff',
  },
  nextIcon1: {
    width: 18,
    height: 18,
  },
  backgroundLogo: {
    position: 'absolute',
    bottom: -350,
    alignSelf: 'center',
    width: 950,
    height: 950,
    opacity: 0.15,
    zIndex: -1
  },
});

// --- STYLES BARU UNTUK MODAL KUSTOM ---
const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Background gelap transparan
  },
  modalGradientBackground: { // STYLE BARU UNTUK LINEAR GRADIENT MODAL
    margin: 20,
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    borderWidth: 1,
    borderColor: '#000000ff',
    backgroundColor: '#e6c85fff',
    shadowOpacity: 0.25,
    width: '85%', // Lebar modal
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004225', // Warna teks judul
  },
  mainIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  modalNote: {
    textAlign: 'center',
    marginBottom: 25,
    fontSize: 12,
    fontStyle: 'italic',
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
  // Style dasar tombol (LinearGradient)
  buttonStyle: {
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
// --- AKHIR STYLES BARU ---

export default VerifikasiDokumenScreen;