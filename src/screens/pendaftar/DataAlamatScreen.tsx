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
  // BackHandler dihapus
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftaranStyles from '../../styles/PendaftaranStyles';
import PendaftarStyles from '../../styles/PendaftarStyles';
import LinearGradient from 'react-native-linear-gradient';

// 📌 Import Services dan Tipe Data
import { 
  registrationService, 
  publicService, 
  Profile,
  Region // Asumsi Region interface ada di apiService.ts
} from '../../services/apiService'; 

type DataAlamatScreenNavigationProp = NativeStackNavigationProp<PendaftarStackParamList, 'DataAlamat'>;


interface DropdownModalProps {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (value: string) => void;
  selectedValue: string;
  isLoading?: boolean;
}

const DropdownModal: React.FC<DropdownModalProps> = ({ 
  visible, 
  onClose, 
  options, 
  onSelect, 
  selectedValue,
  isLoading = false,
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
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 150 }}>
            <ActivityIndicator size="large" color="#DABC4E" />
            <Text style={{ marginTop: 10 }}>Memuat data...</Text>
          </View>
        ) : (
          <ScrollView style={PendaftaranStyles.modalScrollView}>
            {options.length === 0 && <Text style={{ padding: 20 }}>Data tidak ditemukan.</Text>}
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
        )}
      </View>
    </TouchableOpacity>
  </Modal>
);

const DataAlamatScreen: React.FC = () => {
  const navigation = useNavigation<DataAlamatScreenNavigationProp>();
  
  // 🔑 STATES UNTUK DATA DINAMIS (API)
  const [provinsiList, setProvinsiList] = useState<Region[]>([]);
  const [kotaList, setKotaList] = useState<Region[]>([]);
  const [loadingRegion, setLoadingRegion] = useState(true); 
  const [loadingCities, setLoadingCities] = useState(false); 
  
  // 🔑 STATES UNTUK NILAI YANG DIPILIH (Object)
  const [selectedProvinsi, setSelectedProvinsi] = useState<Region | null>(null);
  const [selectedKota, setSelectedKota] = useState<Region | null>(null);

  // Form states (diisi manual)
  const [kecamatan, setKecamatan] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kodePos, setKodePos] = useState('');
  const [namaDusun, setNamaDusun] = useState('');
  const [alamatLengkap, setAlamatLengkap] = useState('');
  const [currentStep] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states
  const [showProvinsiModal, setShowProvinsiModal] = useState(false);
  const [showKotaKabupatenModal, setShowKotaKabupatenModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);


  // 🔑 PENCEGAHAN BACK DENGAN ALERT (Tanpa BackHandler)
  // Ini hanya akan muncul jika user mencoba menekan tombol back di header bawaan navigasi
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


  // 1. Load Semua Provinsi saat komponen mount
  useEffect(() => {
      const loadProvinces = async () => {
          try {
              const data = await publicService.getProvinces();
              setProvinsiList(data);
          } catch (e) {
              Alert.alert('Error', 'Gagal memuat daftar provinsi. Periksa API atau koneksi.');
          } finally {
              setLoadingRegion(false);
          }
      };
      loadProvinces();
  }, []);

  // 2. Load Kota/Kabupaten setiap kali Provinsi dipilih
  useEffect(() => {
      const provinceId = selectedProvinsi?.id_province || selectedProvinsi?.id; 

      if (selectedProvinsi && provinceId) {
          setLoadingCities(true); 
          const loadCities = async () => {
              try {
                  const data = await publicService.getCities(provinceId!); 
                  setKotaList(data);
              } catch (e) {
                  Alert.alert('Error', 'Gagal memuat daftar kota/kabupaten.');
              } finally {
                  setLoadingCities(false); 
              }
          };
          loadCities();
      } else {
          setKotaList([]);
      }
      setSelectedKota(null); 
  }, [selectedProvinsi]);

  
  // --- HANDLER SELECTION ---

  const handleSelectProvinsi = (provinsiName: string) => {
      const prov = provinsiList.find(p => p.name === provinsiName);
      
      setSelectedProvinsi(prov || null); 
      setSelectedKota(null); 
      
      setKecamatan('');
      setKelurahan('');
      setKodePos('');
  };

  const handleSelectKota = (kotaName: string) => {
      const kota = kotaList.find(c => c.name === kotaName);
      setSelectedKota(kota || null);
      
      setKecamatan('');
      setKelurahan('');
  };
  
  // --- LOGIKA SUBMIT ---

  const handleNext = async () => {
    if (isSubmitting) return;

    if (!selectedProvinsi || !selectedKota || !kecamatan.trim() || !alamatLengkap.trim()) {
        Alert.alert('Validasi', 'Provinsi, Kota/Kabupaten, Kecamatan, dan Alamat Lengkap wajib diisi.');
        return;
    }
    
    setIsSubmitting(true);
    
    try {
        // 1. 🔑 AMBIL DATA PROFIL LAMA (untuk melengkapi payload)
        const oldProfile = await registrationService.getProfile();

        // 2. Siapkan Payload Gabungan
        const payload: Partial<Profile> = {
            // Data wajib lama yang dikirim kembali
            id_program: oldProfile.id_program, 
            full_name: oldProfile.full_name,
            gender: oldProfile.gender,
            nik: oldProfile.nik,
            birth_place: oldProfile.birth_place,
            
            // 🛑 PERBAIKAN: Jamin field date/email adalah string kosong jika null/undefined
            email: oldProfile.email || '', 
            birth_date: oldProfile.birth_date || '', 
            phone_number: oldProfile.phone_number,
            
            // Data alamat baru
            province: selectedProvinsi.name,
            city_regency: selectedKota.name,
            kecamatan: kecamatan.trim(),
            kelurahan: kelurahan.trim(),
            postal_code: kodePos.trim(),
            dusun: namaDusun.trim(),
            full_address: alamatLengkap.trim(),
        };

        // 3. Kirim data gabungan ke API storeProfile (updateOrCreate)
        await registrationService.storeProfile(payload);

        Alert.alert('Sukses', 'Data Alamat berhasil disimpan!', [
            {
                text: 'OK',
                // 🔑 NAVIGASI TERKUNCI: Hanya terjadi setelah API sukses dan user klik OK
                onPress: () => navigation.navigate('DataAkademik'),
            },
        ]);
    } catch (error: any) {
        // Tangani Error 422/500
        const errorMessage = error.userMessage || error.response?.data?.message || 'Gagal menyimpan data alamat. Pastikan Profil Dasar terisi.';
        Alert.alert('Error', errorMessage);
    } finally {
        setIsSubmitting(false);
    }
  };


  if (loadingRegion) {
    return (
      <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#DABC4E" />
          <Text style={{ marginTop: 10, color: '#666' }}>Memuat data wilayah...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

        <View style={PendaftaranStyles.progressContainer}>
          <View style={PendaftaranStyles.progressBar}>
            <View style={[PendaftaranStyles.progressStep, currentStep >= 1 && PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, currentStep >= 2 && PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, currentStep >= 3 && PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, currentStep >= 4 && PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, currentStep >= 5 && PendaftaranStyles.progressStepActive]} />
          </View>
        </View>

        <View style={PendaftaranStyles.content}>
          <View style={PendaftaranStyles.sectionContainer}>
            <View style={PendaftaranStyles.sectionHeader}>
              <View style={PendaftaranStyles.numberCircle}>
                <Text style={PendaftaranStyles.numberText}>2</Text>
              </View>
              <Text style={PendaftaranStyles.sectionTitle}>Data Alamat</Text>
            </View>

            {/* Provinsi Dropdown */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Provinsi *</Text>
              <TouchableOpacity 
                style={PendaftaranStyles.pickerContainer}
                onPress={() => {
                  setShowProvinsiModal(true);
                  setOpenDropdown('provinsi');
                }}
                disabled={isSubmitting || loadingRegion}
              >
                <View style={PendaftaranStyles.pickerInput}>
                  <Text style={[PendaftaranStyles.pickerText, !selectedProvinsi && PendaftaranStyles.placeholderText]}>
                    {selectedProvinsi?.name || 'Pilih Provinsi'}
                  </Text>
                </View>
                <Image
                  source={
                    showProvinsiModal
                      ? require('../../assets/icons/Polygon 5.png')
                      : require('../../assets/icons/Polygon 4.png')
                  }
                  style={PendaftaranStyles.dropdownIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Kota/Kabupaten Dropdown */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Kota/Kabupaten *</Text>
              <TouchableOpacity 
                style={PendaftaranStyles.pickerContainer}
                onPress={() => {
                  if (!selectedProvinsi) {
                    Alert.alert('Peringatan', 'Pilih Provinsi terlebih dahulu.');
                    return;
                  }
                  setShowKotaKabupatenModal(true);  
                  setOpenDropdown('kotaKabupaten');
                }}
                disabled={!selectedProvinsi || isSubmitting || loadingRegion}
              >
                <View style={PendaftaranStyles.pickerInput}>
                  <Text style={[PendaftaranStyles.pickerText, !selectedKota && PendaftaranStyles.placeholderText]}>
                    {selectedKota?.name || 'Pilih Kota/Kabupaten'}
                  </Text>
                </View>
                <Image
                  source={
                    showKotaKabupatenModal  
                      ? require('../../assets/icons/Polygon 5.png')
                      : require('../../assets/icons/Polygon 4.png')
                  }
                  style={PendaftaranStyles.dropdownIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Input Manual: Kecamatan */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Kecamatan *</Text>
              <TextInput
                style={PendaftaranStyles.input}
                value={kecamatan}
                onChangeText={setKecamatan}
                placeholder="Masukkan Nama Kecamatan"
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
            </View>

            {/* Input Manual: Kelurahan */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Kelurahan</Text>
              <TextInput
                style={PendaftaranStyles.input}
                value={kelurahan}
                onChangeText={setKelurahan}
                placeholder="Masukkan Nama Kelurahan/Desa"
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
            </View>

            {/* Input Manual: Kode Pos */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Kode Pos</Text>
              <TextInput
                style={PendaftaranStyles.input}
                value={kodePos}
                onChangeText={setKodePos}
                placeholder=""
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isSubmitting}
              />
            </View>

            {/* Input Manual: Nama Dusun */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Nama Dusun</Text>
              <TextInput
                style={PendaftaranStyles.input}
                value={namaDusun}
                onChangeText={setNamaDusun}
                placeholder=""
                placeholderTextColor="#999"
                editable={!isSubmitting}
              />
            </View>

            {/* Input Manual: Alamat Lengkap */}
            <View style={PendaftaranStyles.formGroup}>
              <Text style={PendaftaranStyles.label}>Alamat Lengkap *</Text>
              <TextInput
                style={[PendaftaranStyles.input, { height: 80, textAlignVertical: 'top' }]}
                value={alamatLengkap}
                onChangeText={setAlamatLengkap}
                placeholder="Jalan, Nomor Rumah, RT/RW"
                placeholderTextColor="#999"
                multiline
                editable={!isSubmitting}
              />
            </View>

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

      {/* Modal Provinsi */}
      <DropdownModal
        visible={showProvinsiModal}
        onClose={() => setShowProvinsiModal(false)}
        options={provinsiList.map(p => p.name)}
        onSelect={handleSelectProvinsi}
        selectedValue={selectedProvinsi?.name || ''}
      />

      {/* Modal Kota/Kabupaten */}
      <DropdownModal
        visible={showKotaKabupatenModal}
        onClose={() => setShowKotaKabupatenModal(false)}
        options={kotaList.map(c => c.name)}
        onSelect={handleSelectKota}
        selectedValue={selectedKota?.name || ''}
        isLoading={loadingCities}
      />

    </SafeAreaView>
  );
};

export default DataAlamatScreen;