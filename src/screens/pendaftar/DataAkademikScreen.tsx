// src/screens/pendaftar/DataAkademikScreen.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftaranStyles from '../../styles/PendaftaranStyles';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';
import { pick, types } from '@react-native-documents/picker';

// 📌 Import Services dan Tipe Data
import { 
  registrationService, 
  Profile,
  Document, 
  DocumentType
} from '../../services/apiService'; 

type DataAkademikScreenNavigationProp = NativeStackNavigationProp<PendaftarStackParamList, 'DataAkademik'>;

// OPSI DROPDOWN
const STATUS_KELULUSAN_OPTIONS = ['Sudah Lulus', 'Belum Lulus'];
const JENIS_IJAZAH_OPTIONS = ['SMA', 'SMK', 'MA', 'Sederajat/Lainnya'];


interface PickedDocument {
  uri: string;
  name: string;
  size: number;
  type: string;
  server_id?: number; 
}

interface DropdownModalProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (value: string) => void;
  selectedValue: string;
}

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


const formatFileSize = (bytes: number | undefined): string => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const DataAkademikScreen: React.FC = () => {
  const navigation = useNavigation<DataAkademikScreenNavigationProp>();
  
  // FORM STATES
  const [sekolahAsal, setSekolahAsal] = useState('');
  const [statusLulus, setStatusLulus] = useState('');
  const [jenisIjazah, setJenisIjazah] = useState(''); // last_ijazah di DB

  // Dokumen States
  const [uploadedIjazah, setUploadedIjazah] = useState<PickedDocument | null>(null);
  const [uploadedTranskrip, setUploadedTranskrip] = useState<PickedDocument | null>(null);
  const [uploadedSKL, setUploadedSKL] = useState<PickedDocument | null>(null);
  
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal States
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showJenisIjazahModal, setShowJenisIjazahModal] = useState(false);
  
  // State untuk menyimpan data profil lama (untuk payload submission)
  const [oldProfileData, setOldProfileData] = useState<Partial<Profile>>({}); 

  const [documentTypes, setDocumentTypes] = useState<{ 
    IJAZAH: number; 
    TRANSKRIP: number; 
    SKL: number 
  }>({
    IJAZAH: 0,
    TRANSKRIP: 0,
    SKL: 0,
  });

  // Load Initial Data (Profile & Dokumen)
  useEffect(() => {
    loadInitialData();
  }, []);

  // 🔑 PENCEGAHAN BACK DENGAN ALERT 
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      // Jika user belum submit dan tidak sedang loading, tampilkan peringatan
      if (!isSubmitting) {
        Alert.alert(
          "Peringatan!", 
          "Anda harus menyimpan data di halaman ini sebelum melanjutkan atau kembali."
        );
        e.preventDefault(); // Mencegah aksi back default
      }
    });
  }, [navigation, isSubmitting]);

  const findDocType = (docTypes: DocumentType[], keywords: string[]) => {
      const doc = docTypes.find(dt => 
          keywords.some(keyword => dt.document_name.toLowerCase().includes(keyword.toLowerCase()))
      );
      return doc ? doc.id_document_type : 0;
  };
  
  const mapApiToLocalDoc = (doc: Document, docTypeId: number): PickedDocument | null => {
      if (doc.id_document_type === docTypeId) {
          return {
              uri: doc.file_path,
              name: doc.file_path.split('/').pop() || 'Dokumen.pdf',
              size: 0, 
              type: 'application/pdf', 
              server_id: doc.id_document,
          };
      }
      return null;
  };

  const loadInitialData = async () => {
    try {
      // 1️⃣ Load Document Types
      const docTypes = await registrationService.getDocumentTypes();
      const mappedDocTypes = {
        IJAZAH: findDocType(docTypes, ['ijazah']),
        TRANSKRIP: findDocType(docTypes, ['transkrip nilai']),
        SKL: findDocType(docTypes, ['skl', 'surat keterangan lulus']),
      };
      setDocumentTypes(mappedDocTypes); 

      // 2️⃣ Load Existing Profile 
      const existingProfile = await registrationService.getProfile();
      // SIMPAN SEMUA DATA PROFIL LAMA
      setOldProfileData(existingProfile); 
      
      // PRE-FILL DATA AKADEMIK
      setSekolahAsal(existingProfile.previous_school || '');
      setStatusLulus(existingProfile.graduation_status || '');
      setJenisIjazah(existingProfile.last_ijazah || ''); 

      // 3️⃣ Load Existing Documents 
      const docs = await registrationService.getDocuments();
      docs.forEach(doc => {
          if (doc.id_document_type === mappedDocTypes.IJAZAH) {
              setUploadedIjazah(mapApiToLocalDoc(doc, mappedDocTypes.IJAZAH));
          } else if (doc.id_document_type === mappedDocTypes.TRANSKRIP) {
              setUploadedTranskrip(mapApiToLocalDoc(doc, mappedDocTypes.TRANSKRIP));
          } else if (doc.id_document_type === mappedDocTypes.SKL) {
              setUploadedSKL(mapApiToLocalDoc(doc, mappedDocTypes.SKL));
          }
      });

    } catch (error: any) {
      if (error.response?.status !== 404) {
          Alert.alert('Error', 'Gagal memuat data awal akademik.');
      }
    } finally {
      setLoadingData(false);
    }
  };


  // --- LOGIKA UPLOAD DOKUMEN ---
  
  const saveCurrentProfileData = async (payloadOverride?: Partial<Profile>): Promise<boolean> => {
      // Validasi minimal field akademik
      if (!sekolahAsal.trim() || !statusLulus || !jenisIjazah) {
          // Alert sudah muncul saat user mencoba upload
          return false; 
      }
      
      // KUNCI PERBAIKAN ERROR 422: Validasi data wajib langkah 1 & 2
      if (!oldProfileData.full_name || !oldProfileData.nik || !oldProfileData.email || !oldProfileData.phone_number || !oldProfileData.province) {
          Alert.alert('Error', 'Data Identitas (Langkah 1) atau Alamat (Langkah 2) belum lengkap. Mohon kembali dan lengkapi.');
          return false;
      }
      
      // Payload harus menyertakan SEMUA field wajib (NOT NULL) dari langkah 1 dan 2
      const payload: Partial<Profile> = {
          // Data Wajib Minimal dari Langkah 1 & 2 (Diambil dari oldProfileData)
          ...oldProfileData,

          // Data Akademik Baru
          previous_school: sekolahAsal.trim(),
          graduation_status: statusLulus || undefined,
          last_ijazah: jenisIjazah || undefined, // last_ijazah digunakan untuk jenis/nomor ijazah
          
          // Gabungkan override (jika ada)
          ...payloadOverride,
      };

      try {
          await registrationService.storeProfile(payload);
          return true;
      } catch (error: any) {
          const errorMessage = error.userMessage || 'Gagal menyimpan data akademik/profil.';
          Alert.alert('Error Simpan Profil', errorMessage);
          return false;
      }
  };


  const uploadFileToApi = async (
    doc: PickedDocument, 
    documentTypeId: number, 
    docTypeLabel: string, 
    setUploadedDocState: React.Dispatch<React.SetStateAction<PickedDocument | null>>
  ) => {
    if (documentTypeId === 0) {
        Alert.alert('Error', `ID Tipe Dokumen untuk ${docTypeLabel} belum dimuat.`);
        setUploadedDocState(null);
        return;
    }

    const profileSaved = await saveCurrentProfileData();
    if (!profileSaved) return;

    try {
      // Update local state sementara
      const tempDoc: PickedDocument = { ...doc, server_id: 0 };
      setUploadedDocState(tempDoc);
      
      const formData = new FormData();
      formData.append('id_document_type', documentTypeId.toString());
      
      const fileToUpload = {
        uri: doc.uri,
        name: doc.name,
        type: doc.type || 'application/octet-stream', 
      };
      formData.append('file', fileToUpload as any);

      const result: Document = await registrationService.uploadDocument(formData); 
      
      const updatedDoc = { 
        ...doc, 
        server_id: result.id_document,
        uri: result.file_path || doc.uri,
      };
      setUploadedDocState(updatedDoc); 
      
      Alert.alert('Sukses', `${docTypeLabel} berhasil diunggah!`);

    } catch (error: any) {
      let errorMessage = error.userMessage || 'Gagal mengunggah dokumen. Periksa ukuran (maks 5MB) dan format.';
      Alert.alert('Error', errorMessage);
      setUploadedDocState(null);
    }
  };


  const handleDocumentPick = async (type: 'ijazah' | 'transkrip' | 'skl') => {
    let docTypeId = 0;
    let docTypeLabel = '';
    let setDocState: React.Dispatch<React.SetStateAction<PickedDocument | null>>;

    if (type === 'ijazah') { 
        docTypeId = documentTypes.IJAZAH; 
        docTypeLabel = 'Ijazah'; 
        setDocState = setUploadedIjazah; 
    } else if (type === 'transkrip') { 
        docTypeId = documentTypes.TRANSKRIP; 
        docTypeLabel = 'Transkrip Nilai'; 
        setDocState = setUploadedTranskrip; 
    } else { // skl
        docTypeId = documentTypes.SKL; 
        docTypeLabel = 'SKL'; 
        setDocState = setUploadedSKL; 
    }

    try {
      const result = await pick({ type: [types.pdf, types.images], allowMultiSelection: false });
      if (result && result.length > 0) {
        const file = result[0];
        const tempDoc: PickedDocument = { uri: file.uri, name: file.name || 'Unknown', size: file.size || 0, type: file.type || '' };
        await uploadFileToApi(tempDoc, docTypeId, docTypeLabel, setDocState);
      }
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') Alert.alert('Error', `Gagal memilih ${docTypeLabel}.`);
    }
  };
  
  const handleDeleteDocument = async (type: 'ijazah' | 'transkrip' | 'skl') => {
    let docState: PickedDocument | null;
    let setDocState: React.Dispatch<React.SetStateAction<PickedDocument | null>>;
    let title: string;

    if (type === 'ijazah') { docState = uploadedIjazah; setDocState = setUploadedIjazah; title = 'Ijazah'; } 
    else if (type === 'transkrip') { docState = uploadedTranskrip; setDocState = setUploadedTranskrip; title = 'Transkrip'; } 
    else { docState = uploadedSKL; setDocState = setUploadedSKL; title = 'SKL'; }

    if (!docState || !docState.server_id) {
      setDocState(null);
      Alert.alert('Info', `${title} (lokal) dihapus.`);
      return;
    }

    Alert.alert(
      'Hapus Dokumen',
      `Apakah Anda yakin ingin menghapus ${title} dari server?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await registrationService.deleteDocument(docState!.server_id!);
              setDocState(null); 
              Alert.alert('Sukses', `${title} berhasil dihapus dari server.`);
            } catch (error) {
              Alert.alert('Error', `Gagal menghapus ${title} dari server.`);
            }
          }
        }
      ]
    );
  };

  const handleViewDocument = (doc: PickedDocument | null, title: string) => {
      if (!doc) return;
      Alert.alert(
        title,
        `Nama File: ${doc.name}\nServer ID: ${doc.server_id || 'N/A'}\nURI: ${doc.uri}`,
        [{ text: 'OK', style: 'cancel' }]
      );
  };


  // --- LOGIKA SUBMIT UTAMA ---
  
  const handleNext = async () => {
    if (isSubmitting) return;

    // 1. 🔑 VALIDASI FIELD Wajib
    if (!sekolahAsal.trim() || !statusLulus || !jenisIjazah) { 
        Alert.alert('Validasi', 'Sekolah Asal, Status Kelulusan, dan Jenis Ijazah wajib diisi.');
        return; // HENTIKAN EKSEKUSI
    }
    
    // 2. 🔑 VALIDASI DOKUMEN Wajib (Transkrip/Rapor selalu wajib)
    if (!uploadedTranskrip) {
        Alert.alert('Validasi', 'Mohon unggah Transkrip Nilai atau Rapor satu tahun terakhir.');
        return; // HENTIKAN EKSEKUSI
    }

    // 3. 🔑 VALIDASI DOKUMEN Wajib (Ijazah/SKL: OR Condition)
    
    // Cek apakah minimal satu dari Ijazah ATAU SKL sudah diunggah
    const isIjazahOrSKLAda = !!uploadedIjazah || !!uploadedSKL;

    if (!isIjazahOrSKLAda) {
        Alert.alert('Validasi', 'Mohon unggah salah satu dokumen kelulusan (Ijazah atau SKL).');
        return; // HENTIKAN EKSEKUSI jika keduanya kosong
    }
    
    // Logika validasi LULUS di sini.
    
    setIsSubmitting(true);
    
    try {
        // Simpan data akademik ke Profil
        const profileSaved = await saveCurrentProfileData({ 
            previous_school: sekolahAsal.trim(), 
            graduation_status: statusLulus,
            last_ijazah: jenisIjazah, 
        });

        if (!profileSaved) {
            return;
        }
        
        Alert.alert('Sukses', 'Data Akademik berhasil disimpan!', [
            {
                text: 'OK',
                // 🔑 NAVIGASI YANG BENAR
                onPress: () => navigation.navigate('DataPrestasi'), 
            },
        ]);

    } catch (error: any) {
        const errorMessage = error.userMessage || 'Gagal menyimpan data akademik.';
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
          <Text style={{ marginTop: 10, color: '#666' }}>Memuat data akademik...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header dan Progress Bar */}
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

        {/* Progress Bar (Langkah 3 dari 5) */}
        <View style={PendaftaranStyles.progressContainer}>
          <View style={PendaftaranStyles.progressBar}>
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} /> 
            <View style={[PendaftaranStyles.progressStep]} />
            <View style={[PendaftaranStyles.progressStep]} />
          </View>
        </View>
        
        {/* Content */}
        <View style={PendaftaranStyles.content}>
          <View style={PendaftaranStyles.sectionContainer}>
            <View style={PendaftaranStyles.sectionHeader}>
              <View style={PendaftaranStyles.numberCircle}>
                <Text style={PendaftaranStyles.numberText}>3</Text>
              </View>
              <Text style={PendaftaranStyles.sectionTitle}>Data Akademik</Text>
            </View>
            
            {/* 1. Sekolah Asal */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Sekolah Asal *</Text>
              <TextInput
                style={PendaftaranStyles.input}
                value={sekolahAsal}
                onChangeText={setSekolahAsal}
                placeholder="Nama Sekolah"
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
            </View>

            {/* 2. Status Kelulusan */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Status Kelulusan (Sudah/Belum) *</Text>
              <TouchableOpacity 
                style={PendaftaranStyles.pickerContainer}
                onPress={() => setShowStatusModal(true)}
                disabled={isSubmitting}
              >
                <View style={PendaftaranStyles.pickerInput}>
                  <Text style={[PendaftaranStyles.pickerText, !statusLulus && PendaftaranStyles.placeholderText]}>
                    {statusLulus || 'Pilih Status Kelulusan'}
                  </Text>
                </View>
                <Image
                  source={showStatusModal ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')}
                  style={PendaftaranStyles.dropdownIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            
            {/* 3. Jenis Ijazah Terakhir - DIKEMBALIKAN KE DROP-DOWN */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Ijazah terakhir (SMA/SMK/MA/lainnya) *</Text>
              <TouchableOpacity 
                style={PendaftaranStyles.pickerContainer}
                onPress={() => setShowJenisIjazahModal(true)}
                disabled={isSubmitting}
              >
                <View style={PendaftaranStyles.pickerInput}>
                  <Text style={[PendaftaranStyles.pickerText, !jenisIjazah && PendaftaranStyles.placeholderText]}>
                    {jenisIjazah || 'Pilih Jenis Ijazah Terakhir'}
                  </Text>
                </View>
                <Image
                  source={showJenisIjazahModal ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')}
                  style={PendaftaranStyles.dropdownIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>


            {/* UPLOAD SECTIONS */}
            
            {/* 4. Upload Ijazah Terakhir */}
            <View style={PendaftaranStyles.formGroup}>
                <Text style={PendaftaranStyles.label}>Upload Ijazah Terakhir</Text>
                <TouchableOpacity onPress={() => handleDocumentPick('ijazah')} disabled={isSubmitting} style={PendaftaranStyles.uploadButton} >
                    <View style={PendaftaranStyles.uploadContent}>
                      {uploadedIjazah ? (
                          <View style={PendaftaranStyles.uploadedFileContainer}>
                            <Text style={PendaftaranStyles.uploadedFileName} numberOfLines={1}>{uploadedIjazah.name}</Text>
                            <Text style={PendaftaranStyles.uploadedFileSize}>{formatFileSize(uploadedIjazah.size)}</Text>
                          </View>
                        ) : (
                          <View style={PendaftaranStyles.uploadIconCircle}>
                            <Image source={require('../../assets/icons/ic_baseline-plus.png')} style={PendaftaranStyles.uploadIcon} resizeMode="contain" />
                          </View>
                        )}
                    </View>
                </TouchableOpacity>
                {uploadedIjazah && (
                    <View style={PendaftaranStyles.documentActions}>
                        <TouchableOpacity style={PendaftaranStyles.viewButton} onPress={() => handleViewDocument(uploadedIjazah, 'Detail Ijazah')} disabled={isSubmitting} >
                          <Image source={require('../../assets/icons/fi-sr-eye.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                          <Text style={PendaftaranStyles.viewButtonText}>Lihat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={PendaftaranStyles.deleteButton} onPress={() => handleDeleteDocument('ijazah')} disabled={isSubmitting} >
                          <Image source={require('../../assets/icons/line-md_trash.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                          <Text style={PendaftaranStyles.deleteButtonText}>Hapus</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>


            {/* 5. Upload SKL */}
            <View style={PendaftaranStyles.formGroup}>
                <Text style={PendaftaranStyles.label}>Upload SKL (jika ijazah belum keluar)</Text>
                <TouchableOpacity onPress={() => handleDocumentPick('skl')} disabled={isSubmitting} style={PendaftaranStyles.uploadButton} >
                    <View style={PendaftaranStyles.uploadContent}>
                      {uploadedSKL ? (
                          <View style={PendaftaranStyles.uploadedFileContainer}>
                            <Text style={PendaftaranStyles.uploadedFileName} numberOfLines={1}>{uploadedSKL.name}</Text>
                            <Text style={PendaftaranStyles.uploadedFileSize}>{formatFileSize(uploadedSKL.size)}</Text>
                          </View>
                        ) : (
                          <View style={PendaftaranStyles.uploadIconCircle}>
                            <Image source={require('../../assets/icons/ic_baseline-plus.png')} style={PendaftaranStyles.uploadIcon} resizeMode="contain" />
                          </View>
                        )}
                    </View>
                </TouchableOpacity>
                {uploadedSKL && (
                  <View style={PendaftaranStyles.documentActions}>
                    <TouchableOpacity style={PendaftaranStyles.viewButton} onPress={() => handleViewDocument(uploadedSKL, 'Detail SKL')} disabled={isSubmitting} >
                      <Image source={require('../../assets/icons/fi-sr-eye.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                      <Text style={PendaftaranStyles.viewButtonText}>Lihat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={PendaftaranStyles.deleteButton} onPress={() => handleDeleteDocument('skl')} disabled={isSubmitting} >
                      <Image source={require('../../assets/icons/line-md_trash.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                      <Text style={PendaftaranStyles.deleteButtonText}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                )}
            </View>


            {/* 6. Upload Transkrip/Rapor */}
            <View style={PendaftaranStyles.formGroup}>
                <Text style={PendaftaranStyles.label}>Upload Transkrip nilai atau rapor satu tahun terakhir</Text>
                <TouchableOpacity onPress={() => handleDocumentPick('transkrip')} disabled={isSubmitting} style={PendaftaranStyles.uploadButton} >
                    <View style={PendaftaranStyles.uploadContent}>
                      {uploadedTranskrip ? (
                          <View style={PendaftaranStyles.uploadedFileContainer}>
                            <Text style={PendaftaranStyles.uploadedFileName} numberOfLines={1}>{uploadedTranskrip.name}</Text>
                            <Text style={PendaftaranStyles.uploadedFileSize}>{formatFileSize(uploadedTranskrip.size)}</Text>
                          </View>
                        ) : (
                          <View style={PendaftaranStyles.uploadIconCircle}>
                            <Image source={require('../../assets/icons/ic_baseline-plus.png')} style={PendaftaranStyles.uploadIcon} resizeMode="contain" />
                          </View>
                        )}
                    </View>
                </TouchableOpacity>
                {uploadedTranskrip && (
                  <View style={PendaftaranStyles.documentActions}>
                    <TouchableOpacity style={PendaftaranStyles.viewButton} onPress={() => handleViewDocument(uploadedTranskrip, 'Detail Transkrip')} disabled={isSubmitting} >
                      <Image source={require('../../assets/icons/fi-sr-eye.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                      <Text style={PendaftaranStyles.viewButtonText}>Lihat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={PendaftaranStyles.deleteButton} onPress={() => handleDeleteDocument('transkrip')} disabled={isSubmitting} >
                      <Image source={require('../../assets/icons/line-md_trash.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                      <Text style={PendaftaranStyles.deleteButtonText}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                )}
            </View>
            
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
                <Text style={PendaftaranStyles.nextButtonText}>{isSubmitting ? 'Menyimpan...' : 'Next'}</Text>
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
      
      {/* Modal Status Kelulusan */}
      <DropdownModal
        visible={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        options={STATUS_KELULUSAN_OPTIONS}
        onSelect={(value) => { 
            setStatusLulus(value);
            // Bersihkan dokumen yang tidak relevan saat status berubah
            if (value === 'Sudah Lulus') {
                // Di sini kita TIDAK membersihkan SKL, karena SKL bisa jadi pengganti Ijazah
                // setUploadedSKL(null); 
            } else {
                // Di sini kita TIDAK membersihkan Ijazah
                // setUploadedIjazah(null);
            }
        }}
        selectedValue={statusLulus}
      />
      
      {/* 🔑 Modal Jenis Ijazah - DIKEMBALIKAN */}
      <DropdownModal
        visible={showJenisIjazahModal}
        onClose={() => setShowJenisIjazahModal(false)}
        options={JENIS_IJAZAH_OPTIONS}
        onSelect={setJenisIjazah}
        selectedValue={jenisIjazah}
      />
    </SafeAreaView>
  );
};

export default DataAkademikScreen;