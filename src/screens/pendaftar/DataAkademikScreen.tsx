import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal, // 🔑 Import Modal untuk Dropdown
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import PendaftaranStyles from '../../styles/PendaftaranStyles';
import { pick, types } from '@react-native-documents/picker';
import LinearGradient from 'react-native-linear-gradient';

// 📌 Import Services dan Tipe Data
import { 
    registrationService, 
    Achievement, 
    DocumentType, 
    Document,
    Profile
} from '../../services/apiService'; 

type DataPrestasiNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'DataPrestasi'
>;

interface PickedDocument {
  uri: string;
  name: string;
  size: number;
  type: string;
  server_id?: number; 
}

// PrestasiItem akan menggunakan interface Achievement dan menambahkan state lokal
interface PrestasiLocal extends Achievement {
  // Field untuk diisi di form (di-map ke field API saat submit)
  nama: string; 
  tahun: string; 
  jenis: string; 
  tingkat: string; // Mapped ke achievement_level
  penyelenggara: string; 
  peringkat: string; 
  
  file?: PickedDocument | null; 
}

interface DropdownModalProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (value: string) => void;
  selectedValue: string;
}

// 🔑 DEFINISI DROPDOWN MODAL (Diperlukan agar Dropdown berfungsi)
const DropdownModal: React.FC<DropdownModalProps> = ({ 
  visible, 
  onClose, 
  options, 
  onSelect, 
  selectedValue,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableOpacity 
      style={PendaftaranStyles.modalOverlay} 
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={PendaftaranStyles.modalContent}>
        <ScrollView style={PendaftaranStyles.modalScrollView}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                PendaftaranStyles.modalOption,
                selectedValue === option && PendaftaranStyles.modalOptionSelected
              ]}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <Text style={[
                PendaftaranStyles.modalOptionText,
                selectedValue === option && PendaftaranStyles.modalOptionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

const TINGKAT_PRESTASI_OPTIONS = [
  'Sekolah', 
  'Kecamatan', 
  'Kabupaten/Kota', 
  'Provinsi', 
  'Nasional', 
  'Internasional'
];


const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const DataPrestasiScreen = () => {
  const navigation = useNavigation<DataPrestasiNavigationProp>();
  
  const [prestasiList, setPrestasiList] = useState<PrestasiLocal[]>([]);
  
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🔑 State untuk Dropdown Tingkat Prestasi
  const [showTingkatModal, setShowTingkatModal] = useState(false);
  const [currentPrestasiIndex, setCurrentPrestasiIndex] = useState(0); 

  const [sertifikatDocTypeId, setSertifikatDocTypeId] = useState<number>(0);

  // --- LOGIKA LOAD DATA & API HELPERS ---

  useEffect(() => {
    loadInitialData();
  }, []);

  const findDocTypeId = (docTypes: DocumentType[], keywords: string[]) => {
      const doc = docTypes.find(dt => 
          keywords.some(keyword => dt.document_name.toLowerCase().includes(keyword.toLowerCase()))
      );
      return doc ? doc.id_document_type : 0;
  };

  const loadInitialData = async () => {
    try {
        // 1. Load Document Type
        const docTypes = await registrationService.getDocumentTypes();
        const sertifikatDoc = findDocTypeId(docTypes, ['sertifikat prestasi']);
        setSertifikatDocTypeId(sertifikatDoc);

        if (sertifikatDoc === 0) {
            Alert.alert('Error', 'ID Tipe Dokumen Sertifikat Prestasi tidak ditemukan.');
        }

        // 2. Load Prestasi Lama
        const achievements = await registrationService.getAchievements();

        const mappedPrestasi: PrestasiLocal[] = achievements.map(ach => ({
            ...ach,
            // Mapping field form
            nama: ach.achievement_name,
            tahun: ach.year?.toString() || '',
            jenis: ach.achievement_type || '',
            tingkat: ach.achievement_level || '',
            penyelenggara: ach.organizer || '',
            peringkat: ach.ranking || '',
            
            file: ach.certificate_path ? {
                uri: ach.certificate_path,
                name: ach.certificate_path.split('/').pop() || 'Sertifikat.pdf',
                size: 0, 
                type: 'application/pdf', 
                server_id: undefined, 
            } : null,
        }));
        
        // Jika tidak ada prestasi, beri satu form kosong
        setPrestasiList(mappedPrestasi.length > 0 ? mappedPrestasi : [
             { 
                 nama: '', tahun: '', jenis: '', tingkat: '', penyelenggara: '', peringkat: '', 
                 achievement_name: '', file: null,
                 year: undefined, achievement_type: undefined, achievement_level: undefined,
             } as PrestasiLocal
        ]);
        

    } catch (e: any) {
        if (e.response?.status === 404) {
             setPrestasiList([
                 { 
                     nama: '', tahun: '', jenis: '', tingkat: '', penyelenggara: '', peringkat: '', 
                     achievement_name: '', file: null,
                     year: undefined, achievement_type: undefined, achievement_level: undefined,
                 } as PrestasiLocal
             ]);
        } else {
            Alert.alert('Error', 'Gagal memuat data awal prestasi.');
        }
    } finally {
        setLoadingData(false);
    }
  };


  // --- HANDLERS LOKAL ---

  const handleAddPrestasi = () => {
    setPrestasiList([
      ...prestasiList,
      { 
          nama: '', tahun: '', jenis: '', tingkat: '', penyelenggara: '', peringkat: '', 
          achievement_name: '', file: null,
          year: undefined, achievement_type: undefined, achievement_level: undefined,
      } as PrestasiLocal
    ]);
  };

  const handleDeletePrestasi = (index: number) => {
    const updated = prestasiList.filter((_, i) => i !== index);
    setPrestasiList(updated.length > 0 ? updated : [
        { 
            nama: '', tahun: '', jenis: '', tingkat: '', penyelenggara: '', peringkat: '', 
            achievement_name: '', file: null,
            year: undefined, achievement_type: undefined, achievement_level: undefined,
        } as PrestasiLocal
    ]);
    Alert.alert('Sukses', 'Data prestasi berhasil dihapus');
  };

  const handleChange = (index: number, key: keyof PrestasiLocal, value: string) => {
    const updated = [...prestasiList];
    
    if (key === 'nama') {
        updated[index].achievement_name = value;
    }
    
    // 🔑 PERBAIKAN Type Assertion untuk handleChange
    (updated[index] as any)[key] = value; 
    
    setPrestasiList(updated);
  };
  
  // --- LOGIKA UPLOAD DOKUMEN ---

  const uploadFileToApi = async (
    doc: PickedDocument, 
    documentTypeId: number, 
  ): Promise<Document | null> => {
    if (documentTypeId === 0) {
        Alert.alert('Error', `ID Tipe Dokumen Sertifikat Prestasi tidak ditemukan.`);
        return null;
    }
    
    try {
      const formData = new FormData();
      formData.append('id_document_type', documentTypeId.toString());
      
      const fileToUpload = {
        uri: doc.uri,
        name: doc.name,
        type: doc.type || 'application/octet-stream', 
      };
      formData.append('file', fileToUpload as any);

      const result: Document = await registrationService.uploadDocument(formData); 
      Alert.alert('Sukses', `Sertifikat Prestasi berhasil diunggah!`);
      return result;

    } catch (error: any) {
      let errorMessage = error.userMessage || 'Gagal mengunggah dokumen. Periksa ukuran (maks 5MB) dan format.';
      Alert.alert('Error', errorMessage);
      return null;
    }
  };


  const handlePickDocument = async (index: number) => {
    try {
      const result = await pick({
        type: [types.pdf, types.images],
        allowMultiSelection: false,
      });
      if (result && result.length > 0) {
        const file = result[0];
        const newFile: PickedDocument = {
          uri: file.uri,
          name: file.name || 'Unknown',
          size: file.size || 0,
          type: file.type || '',
        };
        
        const updated = [...prestasiList];
        updated[index].file = newFile;
        setPrestasiList(updated);

        const uploadResult = await uploadFileToApi(newFile, sertifikatDocTypeId);
        
        if (uploadResult) {
            updated[index].file = { ...newFile, uri: uploadResult.file_path, server_id: uploadResult.id_document }; 
            setPrestasiList(updated);
        } else {
            updated[index].file = null;
            setPrestasiList(updated);
        }
      }
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Gagal mengunggah file prestasi');
      }
    }
  };

  const handleViewDocument = (file: PickedDocument | null | undefined) => { 
    if (!file) return;
    Alert.alert(
      'Detail File Prestasi',
      `Nama File: ${file.name}\nUkuran: ${formatFileSize(file.size)}\nTipe: ${file.type}\nServer Path: ${file.uri}`,
      [{ text: 'OK', style: 'cancel' }],
    );
  };

  const handleDeleteDocument = async (index: number) => {
      const item = prestasiList[index];
      const updated = [...prestasiList];

      if (item.file?.server_id) {
          Alert.alert(
              'Konfirmasi Hapus',
              'Anda yakin ingin menghapus file sertifikat ini dari server?',
              [
                  { text: 'Batal', style: 'cancel' },
                  {
                      text: 'Hapus',
                      onPress: async () => {
                          try {
                              await registrationService.deleteDocument(item.file!.server_id!);
                              updated[index].file = null;
                              setPrestasiList(updated);
                              Alert.alert('Sukses', 'File sertifikat berhasil dihapus dari server.');
                          } catch (error) {
                              Alert.alert('Error', 'Gagal menghapus file dari server.');
                          }
                      },
                      style: 'destructive',
                  },
              ]
          );
      } else {
          updated[index].file = null;
          setPrestasiList(updated);
          Alert.alert('Sukses', 'File sertifikat berhasil dihapus (lokal).');
      }
  };


  // --- LOGIKA SUBMIT UTAMA ---

  const handleNext = async () => {
    if (isSubmitting || loadingData) return;
    
    const validPrestasiList = prestasiList.filter(item => item.nama.trim() !== '');

    if (validPrestasiList.length > 0) {
        for (const item of validPrestasiList) {
            // 🔑 VALIDASI PENTING
            if (!item.nama.trim() || !item.tahun.trim() || !item.jenis.trim() || !item.tingkat.trim()) {
                Alert.alert('Validasi', 'Mohon lengkapi semua field prestasi (Nama, Tahun, Jenis, Tingkat).');
                return;
            }
        }
    }

    setIsSubmitting(true);
    
    try {
        // 1. Hapus semua prestasi lama
        const oldAchievements = await registrationService.getAchievements();
        await Promise.all(oldAchievements.map(ach => {
            if (ach.id_achievement) {
                return registrationService.deleteAchievement(ach.id_achievement);
            }
            return Promise.resolve();
        }));
        
        // 2. Simpan semua prestasi baru
        await Promise.all(validPrestasiList.map(async (item) => {
            const payload: Partial<Achievement> = {
                achievement_name: item.nama.trim(),
                year: parseInt(item.tahun) || undefined,
                achievement_type: item.jenis.trim(),
                achievement_level: item.tingkat.trim(), // 🔑 Tingkat Prestasi dari Dropdown
                organizer: item.penyelenggara.trim() || undefined,
                ranking: item.peringkat.trim() || undefined,
                certificate_path: item.file?.uri, 
            };
            
            await registrationService.addAchievement(payload);
        }));

        Alert.alert('Sukses', 'Data Prestasi berhasil disimpan!', [
            { text: 'OK', onPress: () => navigation.navigate('DataOrangTua') },
        ]);
    } catch (error: any) {
        const errorMessage = error.userMessage || 'Gagal menyimpan data prestasi.';
        Alert.alert('Error', errorMessage);
    } finally {
        setIsSubmitting(false);
    }
};

if (loadingData) {
    return (
      <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#DABC4E" />
          <Text style={{ marginTop: 10, color: '#666' }}>Memuat data prestasi...</Text>
        </View>
      </SafeAreaView>
    );
}


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
            <View style={PendaftaranStyles.headerTop}>
              <View style={PendaftaranStyles.headerTitleContainer}>
                <Text style={PendaftaranStyles.headerTitle}>Pendaftaran</Text>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Progress Bar */}
        <View style={PendaftaranStyles.progressContainer}>
          <View style={PendaftaranStyles.progressBar}>
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={PendaftaranStyles.progressStep} />
          </View>
        </View>

        {/* Content */}
        <View style={PendaftaranStyles.content}>
          <View style={PendaftaranStyles.sectionContainer}>
            <View style={PendaftaranStyles.sectionHeader}>
              <View style={PendaftaranStyles.numberCircle}>
                <Text style={PendaftaranStyles.numberText}>4</Text>
              </View>
              <Text style={PendaftaranStyles.sectionTitle}>Data Prestasi</Text>
            </View>

            {/* Info Badges */}
            <View
              style={styles.infoBadgeRow}
            >
              <View
                style={[styles.infoBadge, { left: 22 }]}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_info (1).png')}
                  style={styles.infoIcon}
                  resizeMode="contain"
                />
                <Text style={styles.infoText}>
                  Upload Prestasi Jika Ada
                </Text>
              </View>

              <View
                style={[styles.infoBadge, { right: 25 }]}
              >
                <Text style={styles.infoText}>
                  Bisa diisi lebih dari 1 prestasi
                </Text>
              </View>
            </View>

            {/* LOOPING PRESTASI */}
            {prestasiList.map((item, index) => (
              <View 
                key={index} 
                style={[
                  styles.prestasiItemContainer,
                  index > 0 && styles.additionalPrestasi
                ]}
              >
                {/* Judul Pembeda dan Tombol Hapus */}
                <View style={styles.prestasiHeader}>
                  <Text style={styles.prestasiTitle}>
                    {index === 0 ? 'Prestasi Utama' : `Prestasi Tambahan #${index}`}
                  </Text>
                  
                  {(index > 0 || prestasiList.length > 1) && (
                    <TouchableOpacity
                      onPress={() => handleDeletePrestasi(index)}
                      style={styles.deletePrestasiButton}
                      disabled={isSubmitting}
                    >
                      <Image
                        source={require('../../assets/icons/line-md_trash.png')}
                        style={styles.deletePrestasiIcon}
                      />
                      <Text style={styles.deletePrestasiText}>Hapus</Text>
                    </TouchableOpacity>
                  )}
                </View>


                {/* Input Fields */}
                {[
                  { label: 'Nama Prestasi', key: 'nama' },
                  { label: 'Tahun', key: 'tahun', keyboardType: 'numeric' },
                  { label: 'Jenis Prestasi', key: 'jenis' },
                  { label: 'Penyelenggara', key: 'penyelenggara' },
                  { label: 'Peringkat', key: 'peringkat' },
                ].map((field, i) => (
                  <View key={i} style={PendaftaranStyles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    <TextInput
                      style={PendaftaranStyles.input}
                      value={item[field.key as keyof PrestasiLocal] as string}
                      onChangeText={(val) => handleChange(index, field.key as keyof PrestasiLocal, val)}
                      keyboardType={field.keyboardType as any}
                      placeholder={`Masukkan ${field.label}`}
                      editable={!isSubmitting}
                    />
                  </View>
                ))}
                
                {/* 🔑 TINGKAT PRESTASI (DROPDOWN MODAL) */}
                <View style={PendaftaranStyles.formGroup}>
                    <Text style={styles.label}>Tingkat Prestasi</Text>
                    <TouchableOpacity 
                      style={PendaftaranStyles.pickerContainer}
                      onPress={() => {
                        setCurrentPrestasiIndex(index); 
                        setShowTingkatModal(true); 
                      }}
                      disabled={isSubmitting}
                    >
                      <View style={PendaftaranStyles.pickerInput}>
                        <Text style={[ 
                          PendaftaranStyles.pickerText, 
                          !item.tingkat && PendaftaranStyles.placeholderText 
                        ]}>
                          {item.tingkat || 'Pilih Tingkat Prestasi'}
                        </Text>
                      </View>
                      <Image source={require('../../assets/icons/Polygon 4.png')} style={PendaftaranStyles.dropdownIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>

                {/* Upload Sertifikat */}
                <View style={PendaftaranStyles.formGroup}>
                  <Text style={styles.label}>Upload Sertifikat Prestasi</Text>
                  <TouchableOpacity
                    style={PendaftaranStyles.uploadButton}
                    onPress={() => handlePickDocument(index)}
                    disabled={isSubmitting}
                  >
                    <View style={PendaftaranStyles.uploadContent}>
                      {item.file ? (
                        <View style={PendaftaranStyles.uploadedFileContainer}>
                          <Text style={PendaftaranStyles.uploadedFileName} numberOfLines={1}>
                            {item.file.name}
                          </Text>
                          <Text style={PendaftaranStyles.uploadedFileSize}>
                            {formatFileSize(item.file.size)}
                          </Text>
                        </View>
                      ) : (
                        <View style={PendaftaranStyles.uploadIconCircle}>
                          <Image
                            source={require('../../assets/icons/ic_baseline-plus.png')}
                            style={PendaftaranStyles.uploadIcon}
                            resizeMode="contain"
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>

                  {item.file && (
                    <View style={PendaftaranStyles.documentActions}>
                      <TouchableOpacity
                        style={PendaftaranStyles.viewButton}
                        onPress={() => handleViewDocument(item.file)}
                        disabled={isSubmitting}
                      >
                        <Image
                          source={require('../../assets/icons/fi-sr-eye.png')}
                          style={PendaftaranStyles.actionIcon}
                        />
                        <Text style={PendaftaranStyles.viewButtonText}>Lihat</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={PendaftaranStyles.deleteButton}
                        onPress={() => handleDeleteDocument(index)}
                        disabled={isSubmitting}
                      >
                        <Image
                          source={require('../../assets/icons/line-md_trash.png')}
                          style={PendaftaranStyles.actionIcon}
                        />
                        <Text style={PendaftaranStyles.deleteButtonText}>Hapus</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ))}

            {/* Add Prestasi */}
            <TouchableOpacity
              style={styles.addPrestasiButton}
              onPress={handleAddPrestasi}
              disabled={isSubmitting}
            >
              <View
                style={styles.addIconCircle}
              >
                <Image
                  source={require('../../assets/icons/ic_baseline-plus.png')}
                  style={styles.addIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.addPrestasiText}>Add Prestasi</Text>
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity
              style={PendaftaranStyles.nextButton}
              onPress={handleNext}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#DABC4E', '#F5EFD3']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={PendaftaranStyles.nextButton}
              >
                <Text style={PendaftaranStyles.nextButtonText}>
                    {isSubmitting ? 'Menyimpan...' : 'Next'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />
      
      {/* 🔑 MODAL TINGKAT PRESTASI */}
      <DropdownModal
        visible={showTingkatModal}
        onClose={() => setShowTingkatModal(false)}
        options={TINGKAT_PRESTASI_OPTIONS}
        onSelect={(value) => { 
            // Update nilai tingkat prestasi pada index yang sedang di-edit
            handleChange(currentPrestasiIndex, 'tingkat', value);
            // Update nilai achievement_level yang akan dikirim ke API
            handleChange(currentPrestasiIndex, 'achievement_level', value); 
        }}
        selectedValue={prestasiList[currentPrestasiIndex]?.tingkat || ''}
      />
    </SafeAreaView>
  );
};

// --- GAYA ---
const styles = StyleSheet.create({
  infoBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 2,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#CDBB66',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 1,
  },
  infoIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  infoText: {
    color: '#ffffffff',
    fontSize: 8,
    fontWeight: '600',
  },
  prestasiItemContainer: {
    marginBottom: 20,
    backgroundColor: '#F5F5F5', 
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  additionalPrestasi: {
    marginTop: 25,
    backgroundColor: '#FFF0D9', 
    borderColor: '#DABC4E',
    borderWidth: 2,
  },
  prestasiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#DABC4E',
  },
  prestasiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#015023',
  },
  deletePrestasiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  deletePrestasiText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 4,
  },
  deletePrestasiIcon: {
    width: 16,
    height: 16,
    tintColor: '#DC2626',
  },
  addPrestasiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5C363',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 4,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    left: 175,
  },
  addIconCircle: {
    backgroundColor: '#000',
    borderRadius: 100,
    padding: 3,
    marginRight: 6,
  },
  addIcon: {
    width: 10,
    height: 10,
    tintColor: '#E5C363',
  },
  addPrestasiText: {
    color: '#ffffffff',
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000ff',
    marginBottom: 8,
  }
});

export default DataPrestasiScreen;