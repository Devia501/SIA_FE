import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';
import { pick, types } from '@react-native-documents/picker';

type RincianBiayaNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'RincianBiayaPendaftaran'
>;

interface PickedDocument {
  uri: string;
  name: string;
  size: number;
  type: string;
}

const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const RincianBiayaPendaftaranScreen = () => {
  const navigation = useNavigation<RincianBiayaNavigationProp>();

  // State untuk metode pembayaran
  const [metodePembayaran, setMetodePembayaran] = useState<'Manual' | 'Otomatis'>('Manual');

  // State untuk countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  // State untuk modal konfirmasi dan dokumen
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<PickedDocument | null>(null);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format nomor dengan leading zero
  const formatTime = (num: number) => num.toString().padStart(2, '0');

  // Handle upload dokumen
  const handleUploadDocument = async () => {
    try {
      const result = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: false,
      });
      if (result && result.length > 0) {
        const file = result[0];
        setUploadedDocument({
          uri: file.uri,
          name: file.name || 'Unknown',
          size: file.size || 0,
          type: file.type || '',
        });
      }
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Gagal mengupload dokumen');
      }
    }
  };

  // Handle konfirmasi pembayaran
  const handlePressKonfirmasi = () => {
    setShowConfirmModal(true);
  };

  // Handle submit konfirmasi
  const handleSubmitConfirmation = () => {
    if (!uploadedDocument) {
      Alert.alert('Peringatan', 'Silakan upload bukti pembayaran terlebih dahulu');
      return;
    }

    // Tutup modal konfirmasi
    setShowConfirmModal(false);

    // Navigasi setelah splash (misal 2.5 detik)
    setTimeout(() => {
      setShowSuccessSplash(false);
      // Navigasi ke halaman selanjutnya
      navigation.navigate('VerifikasiPembayaran' as any); 
    }, 2500);
  };

  return (
    <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={PendaftarStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/Rectangle 52.png')}
            style={PendaftarStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={PendaftarStyles.headerContentV2}>
              <TouchableOpacity 
                style={PendaftarStyles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                  style={PendaftarStyles.navIconImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View>
                <Text style={localStyles.headerTitle}>Rincian Biaya Pendaftaran</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Content */}
        <View style={localStyles.content}>
          {/* Ringkasan Pembayaran Card */}
          <View style={localStyles.summaryCard}>
            <Text style={localStyles.summaryTitle}>Ringkasan Pembayaran</Text>
            
            <View style={localStyles.summaryRow}>
              <Image
                source={require('../../assets/icons/Vector.png')}
                style={localStyles.summaryIcon}
                resizeMode="contain"
              />
              <Text style={localStyles.summaryLabel}>Nama Pengguna / pendaftar</Text>
            </View>

            <View style={localStyles.summaryRow}>
              <Image
                source={require('../../assets/icons/Frame.png')}
                style={localStyles.summaryIcon}
                resizeMode="contain"
              />
              <Text style={localStyles.summaryLabel}>Nomor Pengguna / pendaftar</Text>
            </View>

            <View style={localStyles.summaryRow}>
              <Image
                source={require('../../assets/icons/Vector-1.png')}
                style={localStyles.summaryIcon}
                resizeMode="contain"
              />
              <Text style={localStyles.summaryLabel}>Rp ----------</Text>
            </View>
          </View>

          {/* Batas Waktu Pembayaran */}
          <View style={localStyles.timerSection}>
            <View style={localStyles.timerBox}>
              <Text style={localStyles.timerTitle}>Batas Waktu Pembayaran</Text>
              <Text style={localStyles.timerText}>
                {formatTime(timeLeft.hours)} : {formatTime(timeLeft.minutes)} : {formatTime(timeLeft.seconds)}
              </Text>
            </View>
          </View>

          {/* Metode Pembayaran */}
          <Text style={localStyles.sectionTitle}>Metode Pembayaran</Text>
          <View style={localStyles.methodToggle}>
            <TouchableOpacity
              style={[
                localStyles.methodButton,
                metodePembayaran === 'Manual' && localStyles.methodButtonActive,
              ]}
              onPress={() => setMetodePembayaran('Manual')}
            >
              <Text style={localStyles.methodButtonText}>Manual</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                localStyles.methodButton,
                metodePembayaran === 'Otomatis' && localStyles.methodButtonActive,
              ]}
              onPress={() => setMetodePembayaran('Otomatis')}
            >
              <Text style={localStyles.methodButtonText}>Otomatis</Text>
            </TouchableOpacity>
          </View>

          {/* Detail Pembayaran Manual */}
          {metodePembayaran === 'Manual' ? (
            <>
              {/* Transfer Bank */}
              <View style={localStyles.detailCard}>
                <View style={localStyles.detailHeader}>
                  <Image
                    source={require('../../assets/icons/bank.png')}
                    style={localStyles.detailIcon}
                    resizeMode="contain"
                  />
                  <Text style={localStyles.detailTitle}>Transfer Bank</Text>
                </View>

                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Bank Name</Text>
                  <Text style={localStyles.detailValue}>Global Nusantara University</Text>
                </View>

                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Account Number</Text>
                  <Text style={localStyles.detailValue}>123456789</Text>
                </View>

                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Routing Number</Text>
                  <Text style={localStyles.detailValue}>987654321</Text>
                </View>

                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Reference</Text>
                  <Text style={localStyles.detailValue}>STU-003004</Text>
                </View>
              </View>

              {/* Pembayaran Cek */}
              <View style={localStyles.detailCard}>
                <View style={localStyles.detailHeader}>
                  <Image
                    source={require('../../assets/icons/bank.png')}
                    style={localStyles.detailIcon}
                    resizeMode="contain"
                  />
                  <Text style={localStyles.detailTitle}>Pembayaran Cek</Text>
                </View>

                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Make check payable to:</Text>
                  <Text style={localStyles.detailValue}>Global Nusantara University</Text>
                </View>

                <View style={localStyles.detailRow}>
                  <Text style={localStyles.detailLabel}>Mail to:</Text>
                  <View>
                    <Text style={localStyles.detailValue}>Admissions Office</Text>
                    <Text style={localStyles.detailValue}>10 University Ave</Text>
                    <Text style={localStyles.detailValue}>City, State 12345</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            // Placeholder untuk Pembayaran Otomatis (belum diimplementasikan)
            <View style={localStyles.detailCard}>
              <View style={localStyles.detailHeader}>
                <Image
                  source={require('../../assets/icons/Vector-1.png')}
                  style={localStyles.detailIcon}
                  resizeMode="contain"
                />
                <Text style={localStyles.detailTitle}>Pembayaran Otomatis</Text>
              </View>
              
              <View style={localStyles.placeholderContainer}>
                <Text style={localStyles.placeholderText}>
                  Fitur pembayaran otomatis akan segera tersedia
                </Text>
              </View>
            </View>
          )}

          {/* Tombol Konfirmasi */}
          <TouchableOpacity
            style={localStyles.confirmButton}
            onPress={handlePressKonfirmasi}
          >
            <LinearGradient
              colors={['#DABC4E', '#F5EFD3']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={localStyles.confirmButton}
            >
              <Text style={localStyles.confirmButtonText}>Konfirmasi Pembayaran</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Background logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />

      {/* MODAL KONFIRMASI PEMBAYARAN */}
      <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={modalStyles.overlay}>
          <LinearGradient
            colors={['#DABC4E', '#F5EFD3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={modalStyles.confirmBox}
          >
            <Text style={modalStyles.confirmTitle}>Konfirmasi Pembayaran</Text>
            <Text style={modalStyles.confirmSubtitle}>Silahkan upload bukti pembayaran (transfer/cek)</Text>

            {/* Upload Button */}
            <TouchableOpacity 
              style={modalStyles.uploadButton}
              onPress={handleUploadDocument}
            >
              {uploadedDocument ? (
                <View style={modalStyles.uploadedFileContainer}>
                  <Text style={modalStyles.uploadedFileName} numberOfLines={1}>
                    {uploadedDocument.name}
                  </Text>
                  <Text style={modalStyles.uploadedFileSize}>
                    {formatFileSize(uploadedDocument.size)}
                  </Text>
                </View>
              ) : (
                <View style={modalStyles.uploadContent}>
                  <View style={modalStyles.uploadIconCircle}>
                    <Image
                      source={require('../../assets/icons/ic_baseline-plus.png')}
                      style={modalStyles.uploadIcon}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              )}
            </TouchableOpacity>

            <View style={modalStyles.confirmButtonRow}>
              <TouchableOpacity
                style={[modalStyles.confirmButton, modalStyles.noButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={modalStyles.noButtonText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[modalStyles.confirmButton, modalStyles.yesButton]}
                onPress={handleSubmitConfirmation}
              >
                <Text style={modalStyles.yesButtonText}>Yes</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#015023',
    marginBottom: 4,
    left: 15,
  },

  // Ringkasan Pembayaran Card
  summaryCard: {
    backgroundColor: '#F5EFD3',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#DABC4E',
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#015023',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    width: 15,
    height: 15,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#000',
  },

  // Timer Section
  timerSection: {
    marginBottom: 25,
  },
  timerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#015023',
    marginBottom: 10,
    right: 70,
    bottom: 6,
  },
  timerBox: {
    backgroundColor: '#F5EFD3',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#DABC4E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
    letterSpacing: 2,
    marginBottom: 10,
  },

  // Section Title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#F5EFD3',
    marginBottom: 12,
    textAlign: 'left',
  },

  // Method Toggle
  methodToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5EFD3',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    overflow: 'hidden',
    marginBottom: 20,
    alignSelf: 'center',
    width: '80%',
  },
  methodButton: {
    flex: 1,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  methodButtonActive: {
    backgroundColor: '#DABC4E',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  // Detail Card
  detailCard: {
    backgroundColor: '#F5EFD3',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#DABC4E',
    padding: 20,
    marginBottom: 30,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#DABC4E',
  },
  detailIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  detailTitle: {
    fontSize: 14,
    color: '#015023',
    fontWeight: '600',
  },
  detailRow: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },

  // Confirm Button
  confirmButton: {
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 10,
    width: '100%',
    marginTop: -10,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000ff',
  },

  // Placeholder untuk Otomatis
  placeholderContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

// --- STYLESHEET UNTUK MODAL (Konfirmasi & Splash) ---
const modalStyles = StyleSheet.create({
  // Gaya umum untuk Overlay Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Gaya Modal Konfirmasi
  confirmBox: {
    width: '85%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000ff',
    marginBottom: 8,
    right: 34,
  },
  confirmSubtitle: {
    fontSize: 12,
    color: '#000000ff',
    fontWeight: '400',
    marginBottom: 20,
    textAlign: 'left',
  },

  // Upload Button Styles (mengikuti style DataAkademik)
  uploadButton: {
    backgroundColor: '#F5EFD3',
    borderRadius: 20,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#DABC4E',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
  },
  uploadContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  uploadIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  uploadIcon: {
    width: 35,
    height: 35,
  },
  uploadedFileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  uploadedFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#015023',
    marginBottom: 4,
    maxWidth: '90%',
    textAlign: 'center',
  },
  uploadedFileSize: {
    fontSize: 12,
    color: '#666',
  },

  confirmButtonRow: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  noButton: {
    backgroundColor: '#BE0414',
  },
  yesButton: {
    backgroundColor: '#189653',
  },
  noButtonText: {
    color: '#000000ff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  yesButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // Gaya Modal Splash Sukses
  splashOverlay: {
    flex: 1,
    backgroundColor: '#015023',
    justifyContent: 'center',
  },
  splashBackgroundImage: {
    opacity: 0.15,
    top: 202,
    width: 950,
    height: 950,
    left: -295,
  },
  splashContent: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
  },
  checkCircle: {
    width: 150,
    height: 150,
    borderRadius: 100,
    backgroundColor: '#F5EFD3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#DABC4E',
  },
  checkIcon: {
    width: 80,
    height: 80,
  },
  splashTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 14,
    color: '#FFF',
  },
});

export default RincianBiayaPendaftaranScreen;