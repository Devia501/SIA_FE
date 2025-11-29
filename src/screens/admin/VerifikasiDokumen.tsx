import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';

type VerifikasiDokumenNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'VerifikasiDokumen'>;

// Interface untuk dokumen yang dimodifikasi untuk menampung status detail
interface Document {
  id: number;
  name: string;
  filename: string;
  isValid: boolean;
  validationMessage: string;
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

// Data dummy dokumen disesuaikan dengan desain Figma
const dummyDocuments: Document[] = [
  { id: 1, name: 'KTP/Identitas', filename: 'ktp_john_doe.jpg', isValid: true, validationMessage: 'VALID - Clear & Readable' },
  { id: 2, name: 'Akta Kelahiran', filename: 'akta_john.pdf', isValid: false, validationMessage: 'Invalid - Data does not match' },
  { id: 3, name: 'Kartu Keluarga', filename: 'kk_john.pdf', isValid: true, validationMessage: 'VALID - Good Quality' },
  { id: 4, name: 'Ijazah / SKL', filename: 'ijazah_john.pdf', isValid: false, validationMessage: 'Invalid - Data does not match' },
  { id: 5, name: 'Transkrip Nilai', filename: 'transkrip_nilai_john.pdf', isValid: true, validationMessage: 'VALID - Good Quality' },
];

// Komponen untuk Document Card yang disesuaikan dengan desain Figma
const DocumentCard = ({ 
  document, 
}: { 
  document: Document; 
}) => {
  const statusIconSource = document.isValid
    ? require('../../assets/icons/Vector8.png') // Asumsi ikon ✓ ada
    : require('../../assets/icons/fluent_warning-12-filled.png'); // Asumsi ikon ! ada

  return (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentName}>{document.name}</Text>
      </View>
      
      <View style={styles.documentBody}>
        {/* Ikon file generik (di Figma, ini seperti ikon dokumen) */}
        <Image 
          source={require('../../assets/icons/File.png')} // Ganti dengan ikon file Anda
          style={styles.fileIcon}
          resizeMode="contain"
        />
        <View style={styles.documentTextContainer}>
            <Text style={styles.filename}>{document.filename}</Text>
            <View style={styles.validationStatus}>
                <Image 
                    source={document.isValid ? require('../../assets/icons/Vector8.png') : require('../../assets/icons/fluent_warning-12-filled.png')} 
                    style={[styles.statusCheckIcon, { 
                        tintColor: document.isValid ? '#5D7C3F' : '#E8A349' // Warna status
                    }]}
                    resizeMode="contain"
                />
                <Text style={[
                    styles.validationText, 
                    { color: document.isValid ? '#5D7C3F' : '#E8A349' }
                ]}>
                    {document.validationMessage}
                </Text>
            </View>
        </View>
      </View>
      {/* Semua status badge lama dihilangkan */}
    </View>
  );
};


const VerifikasiDokumenScreen: React.FC<VerifikasiDokumenProps> = ({ route }) => {
  const navigation = useNavigation<VerifikasiDokumenNavigationProp>();
  
  // State untuk dokumen
  const [documents] = useState<Document[]>(dummyDocuments);
  
  // Data pendaftar dari route params
  const { name } = route.params;

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
          />
        ))}

        {/* Next Button (Digunakan sebagai tombol Lanjut ke screen lain jika perlu) */}
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => {navigation.navigate('VerifikasiPembayaran'); 
          }}
        >
          <Image
            source={require('../../assets/icons/Vector5.png')} // Ikon panah kanan
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
    backgroundColor: '#DABC4E', // Tambahkan warna latar belakang untuk header agar lebih sesuai
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
    backgroundColor: '#DABC4E', 
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000000ff',
    opacity: 0.70,
  },
  applicantText: {
    color: '#ffffffff', 
    fontSize: 14,
    fontWeight: '600',
  },
  documentCard: {
    // Sesuaikan warna dan border card dengan desain Figma
    backgroundColor: '#F5EFD3', // Latar belakang transparan
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DABC4E', // Border warna emas
  },
  documentHeader: {
    marginBottom: 5,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DABC4E', // Warna teks nama dokumen
  },
  documentBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Latar belakang putih transparan
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#C4A962', // Border tipis di documentBody
  },
  documentTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  fileIcon: {
    width: 20,
    height: 20,
  },
  filename: {
    fontSize: 13,
    color: '#000000ff',
    fontWeight: '500',
  },
  validationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusCheckIcon: {
    width: 14,
    height: 14,
    marginRight: 5,
  },
  validationText: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Tombol Next/Lanjut
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
    borderColor: '#004225', // Warna border disesuaikan
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

export default VerifikasiDokumenScreen;