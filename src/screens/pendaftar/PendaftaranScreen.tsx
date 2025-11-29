// src/screens/pendaftar/PendaftaranScreen.tsx

import React, { useState, useEffect } from 'react';
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
import { pick, types } from '@react-native-documents/picker';
import LinearGradient from 'react-native-linear-gradient';


// 📌 Import Services dan Tipe Data
import { 
  registrationService, 
  publicService, 
  Profile, 
  Document, 
  Program 
} from '../../services/apiService';


// --- TIPE DATA & UTILITY ---

type PendaftaranScreenNavigationProp = NativeStackNavigationProp<PendaftarStackParamList, 'PendaftaranMahasiswa'>;

// 📌 DATA LOKAL untuk Jenis Kelamin & Kewarganegaraan
const JENIS_KELAMIN_OPTIONS = ['Laki-laki', 'Perempuan'];
const KEWARGANEGARAAN_OPTIONS = [
  'WNI (Warga Negara Indonesia)', 
  'WNA (Warga Negara Asing)'
];
const GENDER_MAP: Record<string, 'L' | 'P'> = {
  'Laki-laki': 'L',
  'Perempuan': 'P',
};

interface PickedDocument {
  uri: string;
  name: string;
  size: number;
  type: string;
  server_id?: number;
}

// Helper: Dropdown Modal (Kode ini tidak diubah, aman)
const DropdownModal = ({ 
  visible, 
  onClose, 
  options, 
  onSelect, 
  selectedValue 
}: { 
  visible: boolean; 
  onClose: () => void; 
  options: string[]; 
  onSelect: (value: string) => void;
  selectedValue: string;
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

// --- KOMPONEN UTAMA ---

const PendaftaranScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<PendaftarStackParamList, 'PendaftaranMahasiswa'>>();
  
  // 📌 State untuk Program Studi (dari API)
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  
  // Form states (dipertahankan)
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [prodiPilihan1, setProdiPilihan1] = useState<number | null>(null);
  const [prodiPilihan2, setProdiPilihan2] = useState<number | null>(null);
  const [prodiPilihan3, setProdiPilihan3] = useState<number | null>(null);
  const [jenisKelamin, setJenisKelamin] = useState('');
  const [agama, setAgama] = useState('');
  const [nomorPonsel, setNomorPonsel] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [nik, setNik] = useState('');
  
  // State Dokumen
  const [uploadedDocument, setUploadedDocument] = useState<PickedDocument | null>(null);
  const [nomorRegistrasiAktaLahir, setNomorRegistrasiAktaLahir] = useState('');
  const [uploadedAktaKelahiran, setUploadedAktaKelahiran] = useState<PickedDocument | null>(null);
  const [nomorKartuKeluarga, setNomorKartuKeluarga] = useState('');
  const [uploadedKartuKeluarga, setUploadedKartuKeluarga] = useState<PickedDocument | null>(null);
  
  const [kewarganegaraan, setKewarganegaraan] = useState('');
  const [anakKeBerapa, setAnakKeBerapa] = useState('');
  const [jumlahSaudaraKandung, setJumlahSaudaraKandung] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // Modal states
  const [showProdi1Modal, setShowProdi1Modal] = useState(false);
  const [showProdi2Modal, setShowProdi2Modal] = useState(false);
  const [showProdi3Modal, setShowProdi3Modal] = useState(false);
  const [showJenisKelaminModal, setShowJenisKelaminModal] = useState(false);
  const [showKewarganegaraanModal, setShowKewarganegaraanModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // 📌 State Submission & Document Types (Default ke 0/null)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<{ 
    KTP: number; 
    AKTA: number; 
    KK: number 
  }>({
    KTP: 0,
    AKTA: 0,
    KK: 0,
  });

  // Load Initial Data (Tidak Diubah, Sudah Benar)
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // ... (Logika loadInitialData tidak diubah, sudah benar)
    try {
      // 1️⃣ Load Programs
      const programsData = await publicService.getActivePrograms();
      setPrograms(programsData);

      // 2️⃣ Load Document Types
      const docTypes = await registrationService.getDocumentTypes();

      const findDocType = (keywords: string[]) => {
        return docTypes.find((dt: any) => 
          keywords.some(keyword => 
            dt.document_name.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      };

      const ktpDoc = findDocType(['ktp', 'kitas', 'ktp atau kitas']);
      const aktaDoc = findDocType(['akta kelahiran', 'akta']);
      const kkDoc = findDocType(['kartu keluarga']);

      let mappedDocTypes = { KTP: 0, AKTA: 0, KK: 0 };

      if (ktpDoc && aktaDoc && kkDoc) {
        mappedDocTypes = {
          KTP: ktpDoc.id_document_type, 
          AKTA: aktaDoc.id_document_type,
          KK: kkDoc.id_document_type,
        };
        setDocumentTypes(mappedDocTypes); 
      } else {
        Alert.alert(
          'Error', 
          'Tipe dokumen tidak ditemukan. Hubungi admin untuk menjalankan DocumentTypeSeeder.'
        );
        return; 
      }

      // 3️⃣ Load Existing Profile 
      try {
        const existingProfile = await registrationService.getProfile();

        // Pre-fill form data
        setNamaLengkap(existingProfile.full_name || '');
        setEmail(existingProfile.email || '');
        setProdiPilihan1(existingProfile.id_program || null); 
        setProdiPilihan2(existingProfile.id_program_2 || null); 
        setProdiPilihan3(existingProfile.id_program_3 || null); 
        
        setJenisKelamin(existingProfile.gender || ''); 
        
        setAgama(existingProfile.religion || '');
        setNomorPonsel(existingProfile.phone_number || '');
        setTempatLahir(existingProfile.birth_place || '');
        setTanggalLahir(existingProfile.birth_date || '');
        setNik(existingProfile.nik || '');
        setNomorRegistrasiAktaLahir(existingProfile.birth_certificate_number || '');
        setNomorKartuKeluarga(existingProfile.no_kk || '');
        setKewarganegaraan(existingProfile.citizenship || '');
        setAnakKeBerapa(existingProfile.birth_order?.toString() || '');
        setJumlahSaudaraKandung(existingProfile.number_of_siblings?.toString() || '');

        // 4️⃣ Load Existing Documents 
        const docs = await registrationService.getDocuments();

          docs.forEach(doc => {
            if (doc.id_document_type === mappedDocTypes.KTP) {
              setUploadedDocument({ uri: doc.file_path, name: doc.file_path.split('/').pop() || 'KTP.pdf', size: 0, type: 'application/pdf', server_id: doc.id_document });
            } else if (doc.id_document_type === mappedDocTypes.AKTA) {
              setUploadedAktaKelahiran({ uri: doc.file_path, name: doc.file_path.split('/').pop() || 'Akta.pdf', size: 0, type: 'application/pdf', server_id: doc.id_document });
            } else if (doc.id_document_type === mappedDocTypes.KK) {
              setUploadedKartuKeluarga({ uri: doc.file_path, name: doc.file_path.split('/').pop() || 'KK.pdf', size: 0, type: 'application/pdf', server_id: doc.id_document });
            }
          });

      } catch (profileError: any) {
        if (profileError.response?.status !== 404) {
          Alert.alert('Error', 'Gagal memuat profil. Coba lagi nanti.');
        }
      }

    } catch (error: any) {
      Alert.alert(
        'Error', 
        'Gagal memuat data awal. Periksa koneksi atau server.'
      );
    } finally {
      setLoadingPrograms(false);
    }
  };


  // 📌 FUNGSI VALIDASI FORM (Dipertahankan)
  const validateForm = (isFinalSubmit = false): boolean => {
    if (!namaLengkap.trim()) { Alert.alert('Validasi', 'Nama lengkap harus diisi'); return false; }
    if (!email.trim() || !email.includes('@')) { Alert.alert('Validasi', 'Email harus diisi dengan format yang benar'); return false; }
    if (!prodiPilihan1) { Alert.alert('Validasi', 'Pilih minimal prodi pilihan 1'); return false; }
    if (!jenisKelamin) { Alert.alert('Validasi', 'Jenis kelamin harus dipilih'); return false; }
    if (!nomorPonsel.trim()) { Alert.alert('Validasi', 'Nomor ponsel harus diisi'); return false; }
    if (nomorPonsel.length < 10) { Alert.alert('Validasi', 'Nomor ponsel minimal 10 digit'); return false; }
    if (!tempatLahir.trim()) { Alert.alert('Validasi', 'Tempat lahir harus diisi'); return false; }
    if (!tanggalLahir.trim()) { Alert.alert('Validasi', 'Tanggal lahir harus diisi'); return false; }
    if (!tanggalLahir.match(/^\d{4}-\d{2}-\d{2}$/)) { Alert.alert('Validasi', 'Format tanggal harus YYYY-MM-DD\nContoh: 2000-12-31'); return false; }
    if (!nik.trim()) { Alert.alert('Validasi', 'NIK/Kitas harus diisi'); return false; }
    
    if (isFinalSubmit) {
      if (nik.length !== 16 && kewarganegaraan === 'WNI (Warga Negara Indonesia)') { Alert.alert('Validasi', 'NIK harus tepat 16 digit'); return false; }
      if (!uploadedDocument) { Alert.alert('Validasi', 'Upload KTP/Kitas wajib'); return false; }
    }
    return true;
  };
  
  // 📌 FUNGSI HELPER BARU: Menyimpan/Update Profil (Auto-Save Aman)
  const saveCurrentProfileData = async (): Promise<boolean> => {
      // Hanya butuh validasi minimal yang wajib NOT NULL (id_program, full_name, nik, phone, tempat/tgl lahir)
      if (!validateForm(false)) return false;

      // 🔑 PERBAIKAN: Gunakan nilai null eksplisit untuk field yang kosong
      // jika Anda mencurigai ada kolom NOT NULL tersembunyi, 
      // pastikan semua field yang diisi di form dikirim.
      
      // Jika field numeric kosong, kirim 'undefined' agar tidak dikirim ke backend 
      // (asumsi database mengizinkan NULL atau backend memiliki default)
      const citizenshipValue = kewarganegaraan.startsWith('WNI') ? 'WNI' : kewarganegaraan.startsWith('WNA') ? 'WNA' : undefined;

      const payload: Partial<Profile> = {
          // FIELD WAJIB MINIMAL (Sesuai validasi)
          id_program: prodiPilihan1!, 
          full_name: namaLengkap.trim(),
          nik: nik.trim(),
          phone_number: nomorPonsel.trim(),
          birth_place: tempatLahir.trim(),
          birth_date: tanggalLahir.trim(), 
          email: email.trim().toLowerCase(),

          // FIELD OPSIONAL
          id_program_2: prodiPilihan2 || undefined, 
          id_program_3: prodiPilihan3 || undefined, 
          gender: jenisKelamin || undefined, 
          religion: agama.trim() || undefined,
          birth_certificate_number: nomorRegistrasiAktaLahir.trim() || undefined,
          no_kk: nomorKartuKeluarga.trim() || undefined,
          citizenship: citizenshipValue,
          // Convert string to number, jika gagal, kirim undefined
          birth_order: anakKeBerapa ? parseInt(anakKeBerapa) : undefined,
          number_of_siblings: jumlahSaudaraKandung ? parseInt(jumlahSaudaraKandung) : undefined,
      };

      try {
          await registrationService.storeProfile(payload);
          return true;
      } catch (error: any) {
          // Pesan error dari backend sudah ditangani oleh interceptor apiService
          const errorMessage = error.userMessage || error.response?.data?.message || 'Gagal menyimpan data dasar profil. Periksa NIK/Email atau koneksi Anda.';
          Alert.alert('Error Simpan Profil', errorMessage);
          return false;
      }
  };
  
  // 📌 FUNGSI API UPLOAD UTAMA (Dipertahankan)
  const uploadFileToApi = async (
    doc: PickedDocument, 
    documentTypeId: number, 
    docTypeLabel: string, 
    setUploadedDocState: React.Dispatch<React.SetStateAction<PickedDocument | null>>
  ) => {
    // ... (Logika upload file tidak diubah)
    if (documentTypeId === 0) {
        Alert.alert('Error', `Tipe dokumen untuk ${docTypeLabel} belum dimuat dari server.`);
        setUploadedDocState(null);
        return;
    }

    try {
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
      let errorMessage = 'Gagal mengunggah dokumen. Periksa ukuran (maks 5MB) dan format.';
      if (error.response?.status === 422) {
        const validationErrors = error.response.data?.errors;
        if (validationErrors) {
          const firstErrorKey = Object.keys(validationErrors)[0];
          const firstErrorMessage = validationErrors[firstErrorKey][0];
          errorMessage = `Validasi Gagal: ${firstErrorMessage || 'Format tidak didukung.'}`;
        } else {
          errorMessage = error.response.data?.message || error.response.data?.error || 'Ada data yang kurang. Coba simpan profil manual terlebih dahulu.'; 
        }
      }
      Alert.alert('Error', errorMessage);
      setUploadedDocState(null);
    }
  };

  // 📌 HANDLERS: Upload Dokumen (Memanggil saveCurrentProfileData)
  const handleDocumentPick = async () => {
    // 🔑 PERBAIKAN: Panggil auto-save di sini
    const profileSaved = await saveCurrentProfileData();
    if (!profileSaved) return;

    try {
      const result = await pick({ type: [types.pdf, types.images], allowMultiSelection: false });
      if (result && result.length > 0) {
        const file = result[0];
        const tempDoc: PickedDocument = { uri: file.uri, name: file.name || 'Unknown', size: file.size || 0, type: file.type || '' };
        await uploadFileToApi(tempDoc, documentTypes.KTP, 'KTP/Kitas', setUploadedDocument);
      }
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') Alert.alert('Error', 'Gagal memilih dokumen.');
    }
  };

  const handleAktaKelahiranPick = async () => {
    // 🔑 PERBAIKAN: Panggil auto-save di sini
    const profileSaved = await saveCurrentProfileData();
    if (!profileSaved) return;

    try {
      const result = await pick({ type: [types.pdf, types.images], allowMultiSelection: false });
      if (result && result.length > 0) {
        const file = result[0];
        const tempDoc: PickedDocument = { uri: file.uri, name: file.name || 'Unknown', size: file.size || 0, type: file.type || '' };
        await uploadFileToApi(tempDoc, documentTypes.AKTA, 'Akta Kelahiran', setUploadedAktaKelahiran);
      }
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') Alert.alert('Error', 'Gagal memilih Akta Kelahiran.');
    }
  };

  const handleKartuKeluargaPick = async () => {
    // 🔑 PERBAIKAN: Panggil auto-save di sini
    const profileSaved = await saveCurrentProfileData();
    if (!profileSaved) return;

    try {
      const result = await pick({ type: [types.pdf, types.images], allowMultiSelection: false });
      if (result && result.length > 0) {
        const file = result[0];
        const tempDoc: PickedDocument = { uri: file.uri, name: file.name || 'Unknown', size: file.size || 0, type: file.type || '' };
        await uploadFileToApi(tempDoc, documentTypes.KK, 'Kartu Keluarga', setUploadedKartuKeluarga);
      }
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') Alert.alert('Error', 'Gagal memilih Kartu Keluarga.');
    }
  };

  // HANDLER: Delete Dokumen (Dipertahankan)
  const handleDeleteDocument = async (type: 'ktp' | 'akta' | 'kk') => {
    // ... (Logika delete tidak diubah)
    let docState: PickedDocument | null;
    let setDocState: React.Dispatch<React.SetStateAction<PickedDocument | null>>;
    let title: string;

    if (type === 'ktp') { docState = uploadedDocument; setDocState = setUploadedDocument; title = 'KTP/Kitas'; } 
    else if (type === 'akta') { docState = uploadedAktaKelahiran; setDocState = setUploadedAktaKelahiran; title = 'Akta Kelahiran'; } 
    else { docState = uploadedKartuKeluarga; setDocState = setUploadedKartuKeluarga; title = 'Kartu Keluarga'; }

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
      `Nama File: ${doc.name}\nServer ID: ${doc.server_id || 'N/A'}`,
      [{ text: 'OK', style: 'cancel' }]
    );
  };

  // 📌 FUNGSI NEXT UTAMA (Menyimpan Profile Final)
  const handleNext = async () => {
    if (isSubmitting) return;
    
    // Validasi form (menggunakan validasi final)
    if (!validateForm(true)) return;

    setIsSubmitting(true);
    
    // 🔑 PERBAIKAN: Menggunakan payload yang sama dengan saveCurrentProfileData
    const citizenshipValue = kewarganegaraan.startsWith('WNI') ? 'WNI' : kewarganegaraan.startsWith('WNA') ? 'WNA' : undefined;

    const payload: Partial<Profile> = {
        // FIELD WAJIB MINIMAL (Sesuai validasi)
        id_program: prodiPilihan1!, 
        full_name: namaLengkap.trim(),
        nik: nik.trim(),
        phone_number: nomorPonsel.trim(),
        birth_place: tempatLahir.trim(),
        birth_date: tanggalLahir.trim(), 
        email: email.trim().toLowerCase(),

        // FIELD OPSIONAL
        id_program_2: prodiPilihan2 || undefined, 
        id_program_3: prodiPilihan3 || undefined, 
        gender: jenisKelamin || undefined, 
        religion: agama.trim() || undefined,
        birth_certificate_number: nomorRegistrasiAktaLahir.trim() || undefined,
        no_kk: nomorKartuKeluarga.trim() || undefined,
        citizenship: citizenshipValue,
        // Convert string to number, jika gagal, kirim undefined
        birth_order: anakKeBerapa ? parseInt(anakKeBerapa) : undefined,
        number_of_siblings: jumlahSaudaraKandung ? parseInt(jumlahSaudaraKandung) : undefined,
    };

    try {
      await registrationService.storeProfile(payload);
      Alert.alert('Sukses', 'Data identitas berhasil disimpan!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('DataAlamat'),
        },
      ]);
    } catch (error: any) {
      const errorMessage = error.userMessage || error.response?.data?.message || 'Gagal menyimpan data identitas';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }

  };

  // Helper: Get program name by ID (Dipertahankan)
  const getProgramNameById = (id: number | null): string => {
    if (!id) return 'Pilih Program Studi';
    const program = programs.find(p => p.id_program === id);
    return program?.name || 'Pilih Program Studi';
  };

  if (loadingPrograms) {
    // ... (Loading state dipertahankan)
    return (
      <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#DABC4E" />
          <Text style={{ marginTop: 10, color: '#666' }}>Memuat data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ... (UI tidak diubah) */}
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
            <View style={[PendaftaranStyles.progressStep, currentStep >= 1 && PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, currentStep >= 2 && PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, currentStep >= 3 && PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, currentStep >= 4 && PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, currentStep >= 5 && PendaftaranStyles.progressStepActive]} />
          </View>
        </View>

        {/* Content */}
        <View style={PendaftaranStyles.content}>
          {/* Identitas Mahasiswa */}
          <View style={PendaftaranStyles.sectionContainer}>
            <View style={PendaftaranStyles.sectionHeader}>
              <View style={PendaftaranStyles.numberCircle}>
                <Text style={PendaftaranStyles.numberText}>1</Text>
              </View>
              <Text style={PendaftaranStyles.sectionTitle}>Identitas Mahasiswa</Text>
            </View>

            {/* Input fields... (Nama Lengkap, Email, Prodi, Jenis Kelamin, Agama, Ponsel, TTL, NIK) */}
             <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Nama Lengkap *</Text>
              <TextInput
                style={PendaftaranStyles.input}
                value={namaLengkap}
                onChangeText={setNamaLengkap}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
            </View>

            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Email *</Text>
              <TextInput
                style={PendaftaranStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="contoh@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>
          </View>
          {/* Pilihan Program Studi */}
          <View style={PendaftaranStyles.prodiSection}>
            <View style={PendaftaranStyles.prodiCard}>
              <Text style={PendaftaranStyles.prodiSectionTitle}>Pilihan Program Studi *</Text>
              
              <View style={PendaftaranStyles.prodiFormGroup}>
                <Text style={PendaftaranStyles.prodiLabel}>Prodi Pilihan 1</Text>
                <TouchableOpacity 
                  style={PendaftaranStyles.pickerContainer}
                  onPress={() => { setShowProdi1Modal(true); setOpenDropdown('prodi1'); }}
                  disabled={isSubmitting}
                >
                  <View style={PendaftaranStyles.pickerInput}>
                    <Text style={[ PendaftaranStyles.pickerText, !prodiPilihan1 && PendaftaranStyles.placeholderText ]}>
                      {getProgramNameById(prodiPilihan1)}
                    </Text>
                  </View>
                  <Image source={openDropdown === 'prodi1' ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')} style={PendaftaranStyles.dropdownIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>

              <View style={PendaftaranStyles.prodiFormGroup}>
                <Text style={PendaftaranStyles.prodiLabel}>Prodi Pilihan 2 (Opsional)</Text>
                <TouchableOpacity 
                  style={PendaftaranStyles.pickerContainer}
                  onPress={() => { setShowProdi2Modal(true); setOpenDropdown('prodi2'); }}
                  disabled={isSubmitting}
                >
                  <View style={PendaftaranStyles.pickerInput}>
                    <Text style={[ PendaftaranStyles.pickerText, !prodiPilihan2 && PendaftaranStyles.placeholderText ]}>
                      {getProgramNameById(prodiPilihan2)}
                    </Text>
                  </View>
                  <Image source={openDropdown === 'prodi2' ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')} style={PendaftaranStyles.dropdownIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>

              <View style={PendaftaranStyles.prodiFormGroup}>
                <Text style={PendaftaranStyles.prodiLabel}>Prodi Pilihan 3 (Opsional)</Text>
                <TouchableOpacity 
                  style={PendaftaranStyles.pickerContainer}
                  onPress={() => { setShowProdi3Modal(true); setOpenDropdown('prodi3'); }}
                  disabled={isSubmitting}
                >
                  <View style={PendaftaranStyles.pickerInput}>
                    <Text style={[ PendaftaranStyles.pickerText, !prodiPilihan3 && PendaftaranStyles.placeholderText ]}>
                      {getProgramNameById(prodiPilihan3)}
                    </Text>
                  </View>
                  <Image source={openDropdown === 'prodi3' ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')} style={PendaftaranStyles.dropdownIcon} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Jenis Kelamin */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Jenis Kelamin *</Text>
            <TouchableOpacity 
              style={PendaftaranStyles.pickerContainer}
              onPress={() => { setShowJenisKelaminModal(true); setOpenDropdown('jenisKelamin'); }}
              disabled={isSubmitting}
            >
              <View style={PendaftaranStyles.pickerInput}>
                <Text style={[ PendaftaranStyles.pickerText, !jenisKelamin && PendaftaranStyles.placeholderText ]}>
                  {jenisKelamin || 'Pilih Jenis Kelamin'}
                </Text>
              </View>
              <Image source={openDropdown === 'jenisKelamin' ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')} style={PendaftaranStyles.dropdownIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          {/* Agama */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Agama</Text>
            <TextInput style={PendaftaranStyles.input} value={agama} onChangeText={setAgama} placeholder="Masukkan agama" placeholderTextColor="#999" editable={!isSubmitting} />
          </View>

          {/* Nomor Ponsel */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Nomor Ponsel *</Text>
            <TextInput style={PendaftaranStyles.input} value={nomorPonsel} onChangeText={setNomorPonsel} placeholder="08xxxxxxxxxx" placeholderTextColor="#999" keyboardType="phone-pad" editable={!isSubmitting} />
          </View>

          {/* Tempat Lahir */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Tempat Lahir *</Text>
            <TextInput style={PendaftaranStyles.input} value={tempatLahir} onChangeText={setTempatLahir} placeholder="Masukkan tempat lahir" placeholderTextColor="#999" editable={!isSubmitting} />
          </View>

          {/* Tanggal Lahir */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Tanggal Lahir *</Text>
            <TextInput style={PendaftaranStyles.input} value={tanggalLahir} onChangeText={setTanggalLahir} placeholder="YYYY-MM-DD" placeholderTextColor="#999" editable={!isSubmitting} />
          </View>

          {/* NIK/Kitas */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>NIK/Kitas (WNA) *</Text>
            <TextInput style={PendaftaranStyles.input} value={nik} onChangeText={setNik} placeholder="Masukkan NIK/Kitas" placeholderTextColor="#999" keyboardType="numeric" editable={!isSubmitting} />
          </View>

          {/* Upload KTP/Kitas */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Upload KTP/Kitas (PDF/Image) *</Text>
            <TouchableOpacity onPress={handleDocumentPick} disabled={isSubmitting} style={PendaftaranStyles.uploadButton} >
              <View style={PendaftaranStyles.uploadContent}>
                {uploadedDocument ? (
                  <View style={PendaftaranStyles.uploadedFileContainer}>
                    <Text style={PendaftaranStyles.uploadedFileName} numberOfLines={1}>{uploadedDocument.name}</Text>
                    <Text style={PendaftaranStyles.uploadedFileSize}>{formatFileSize(uploadedDocument.size)}</Text>
                  </View>
                ) : (
                  <View style={PendaftaranStyles.uploadIconCircle}>
                    <Image source={require('../../assets/icons/ic_baseline-plus.png')} style={PendaftaranStyles.uploadIcon} resizeMode="contain" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            {uploadedDocument && (
              <View style={PendaftaranStyles.documentActions}>
                <TouchableOpacity style={PendaftaranStyles.viewButton} onPress={() => handleViewDocument(uploadedDocument, 'Detail KTP/Kitas')} disabled={isSubmitting} >
                  <Image source={require('../../assets/icons/fi-sr-eye.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                  <Text style={PendaftaranStyles.viewButtonText}>Lihat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={PendaftaranStyles.deleteButton} onPress={() => handleDeleteDocument('ktp')} disabled={isSubmitting} >
                  <Image source={require('../../assets/icons/line-md_trash.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                  <Text style={PendaftaranStyles.deleteButtonText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Nomor Registrasi Akta Lahir */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Nomor Registrasi Akta Lahir</Text>
            <TextInput style={PendaftaranStyles.input} value={nomorRegistrasiAktaLahir} onChangeText={setNomorRegistrasiAktaLahir} placeholder="Masukkan nomor registrasi" placeholderTextColor="#999" editable={!isSubmitting} />
          </View>

          {/* Upload Akta Kelahiran */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Upload Akta Kelahiran (PDF/Image)</Text>
            <TouchableOpacity onPress={handleAktaKelahiranPick} disabled={isSubmitting} style={PendaftaranStyles.uploadButton} >
              <View style={PendaftaranStyles.uploadContent}>
                {uploadedAktaKelahiran ? (
                  <View style={PendaftaranStyles.uploadedFileContainer}>
                    <Text style={PendaftaranStyles.uploadedFileName} numberOfLines={1}>{uploadedAktaKelahiran.name}</Text>
                    <Text style={PendaftaranStyles.uploadedFileSize}>{formatFileSize(uploadedAktaKelahiran.size)}</Text>
                  </View>
                ) : (
                  <View style={PendaftaranStyles.uploadIconCircle}>
                    <Image source={require('../../assets/icons/ic_baseline-plus.png')} style={PendaftaranStyles.uploadIcon} resizeMode="contain" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            {uploadedAktaKelahiran && (
              <View style={PendaftaranStyles.documentActions}>
                <TouchableOpacity style={PendaftaranStyles.viewButton} onPress={() => handleViewDocument(uploadedAktaKelahiran, 'Detail Akta Kelahiran')} disabled={isSubmitting} >
                  <Image source={require('../../assets/icons/fi-sr-eye.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                  <Text style={PendaftaranStyles.viewButtonText}>Lihat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={PendaftaranStyles.deleteButton} onPress={() => handleDeleteDocument('akta')} disabled={isSubmitting} >
                  <Image source={require('../../assets/icons/line-md_trash.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                  <Text style={PendaftaranStyles.deleteButtonText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Nomor Kartu Keluarga */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Nomor Kartu Keluarga</Text>
            <TextInput style={PendaftaranStyles.input} value={nomorKartuKeluarga} onChangeText={setNomorKartuKeluarga} placeholder="Masukkan nomor KK" placeholderTextColor="#999" keyboardType="numeric" editable={!isSubmitting} />
          </View>

          {/* Upload Kartu Keluarga */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Upload Kartu Keluarga (PDF/Image)</Text>
            <TouchableOpacity onPress={handleKartuKeluargaPick} disabled={isSubmitting} style={PendaftaranStyles.uploadButton} >
              <View style={PendaftaranStyles.uploadContent}>
                {uploadedKartuKeluarga ? (
                  <View style={PendaftaranStyles.uploadedFileContainer}>
                    <Text style={PendaftaranStyles.uploadedFileName} numberOfLines={1}>{uploadedKartuKeluarga.name}</Text>
                    <Text style={PendaftaranStyles.uploadedFileSize}>{formatFileSize(uploadedKartuKeluarga.size)}</Text>
                  </View>
                ) : (
                  <View style={PendaftaranStyles.uploadIconCircle}>
                    <Image source={require('../../assets/icons/ic_baseline-plus.png')} style={PendaftaranStyles.uploadIcon} resizeMode="contain" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            {uploadedKartuKeluarga && (
              <View style={PendaftaranStyles.documentActions}>
                <TouchableOpacity style={PendaftaranStyles.viewButton} onPress={() => handleViewDocument(uploadedKartuKeluarga, 'Detail Kartu Keluarga')} disabled={isSubmitting} >
                  <Image source={require('../../assets/icons/fi-sr-eye.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                  <Text style={PendaftaranStyles.viewButtonText}>Lihat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={PendaftaranStyles.deleteButton} onPress={() => handleDeleteDocument('kk')} disabled={isSubmitting} >
                  <Image source={require('../../assets/icons/line-md_trash.png')} style={PendaftaranStyles.actionIcon} resizeMode="contain" />
                  <Text style={PendaftaranStyles.deleteButtonText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Kewarganegaraan */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Kewarganegaraan</Text>
            <TouchableOpacity onPress={() => { setShowKewarganegaraanModal(true); setOpenDropdown('kewarganegaraan'); }} disabled={isSubmitting} style={PendaftaranStyles.pickerContainer} >
              <View style={PendaftaranStyles.pickerInput}>
                <Text style={[ PendaftaranStyles.pickerText, !kewarganegaraan && PendaftaranStyles.placeholderText ]}>
                  {kewarganegaraan || 'Pilih Kewarganegaraan'}
                </Text>
              </View>
              <Image source={openDropdown === 'kewarganegaraan' ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')} style={PendaftaranStyles.dropdownIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          {/* Anak ke Berapa */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Anak ke Berapa</Text>
            <TextInput style={PendaftaranStyles.input} value={anakKeBerapa} onChangeText={setAnakKeBerapa} placeholder="Contoh: 1" placeholderTextColor="#999" keyboardType="numeric" editable={!isSubmitting} />
          </View>

          {/* Jumlah Saudara Kandung */}
          <View style={PendaftaranStyles.formGroup}>
            <Text style={PendaftaranStyles.label}>Jumlah Saudara Kandung</Text>
            <TextInput style={PendaftaranStyles.input} value={jumlahSaudaraKandung} onChangeText={setJumlahSaudaraKandung} placeholder="Contoh: 2" placeholderTextColor="#999" keyboardType="numeric" editable={!isSubmitting} />
          </View>

          {/* Next Button */}
          <TouchableOpacity onPress={handleNext} disabled={isSubmitting} style={PendaftaranStyles.nextButton} >
            <LinearGradient
              colors={['#DABC4E', '#F5EFD3']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={PendaftaranStyles.nextButton}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={PendaftaranStyles.nextButtonText}>Next</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Background Logo */}
      <Image source={require('../../assets/images/logo-ugn.png')} style={PendaftarStyles.backgroundLogo} resizeMode="contain" />

      {/* Modals (Tidak diubah, sudah benar) */}
      <DropdownModal 
        visible={showProdi1Modal} 
        onClose={() => setShowProdi1Modal(false)} 
        options={programs.map(p => p.name)} 
        onSelect={(value) => { 
          const selected = programs.find(p => p.name === value); 
          if (selected) {
            setProdiPilihan1(selected.id_program);
          }
        }} 
        selectedValue={getProgramNameById(prodiPilihan1)} 
      />
      <DropdownModal visible={showProdi2Modal} onClose={() => setShowProdi2Modal(false)} options={programs.map(p => p.name)} onSelect={(value) => { const selected = programs.find(p => p.name === value); if (selected) setProdiPilihan2(selected.id_program); }} selectedValue={getProgramNameById(prodiPilihan2)} />
      <DropdownModal visible={showProdi3Modal} onClose={() => setShowProdi3Modal(false)} options={programs.map(p => p.name)} onSelect={(value) => { const selected = programs.find(p => p.name === value); if (selected) setProdiPilihan3(selected.id_program); }} selectedValue={getProgramNameById(prodiPilihan3)} />
      <DropdownModal visible={showJenisKelaminModal} onClose={() => setShowJenisKelaminModal(false)} options={JENIS_KELAMIN_OPTIONS} onSelect={setJenisKelamin} selectedValue={jenisKelamin} />
      <DropdownModal visible={showKewarganegaraanModal} onClose={() => setShowKewarganegaraanModal(false)} options={KEWARGANEGARAAN_OPTIONS} onSelect={setKewarganegaraan} selectedValue={kewarganegaraan} />
    </SafeAreaView>
  );
};

export default PendaftaranScreen;