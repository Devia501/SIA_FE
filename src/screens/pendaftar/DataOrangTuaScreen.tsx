import React, { useEffect, useState, useCallback } from 'react';
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
  StyleSheet, 
  ActivityIndicator, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import PendaftaranStyles from '../../styles/PendaftaranStyles';
import LinearGradient from 'react-native-linear-gradient';

// 📌 Import Services dan Tipe Data
import { registrationService, Guardian, Profile } from '../../services/apiService'; 

type DataOrangTuaNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'DataOrangTua'
>;

// 🔑 CONSTANTS MAPPING UNTUK MENGATASI ENUM DB LARAVEL
const RELATIONSHIP_MAP_TO_DB: Record<string, 'Father' | 'Mother' | 'Guardian'> = {
    'Ayah': 'Father',
    'Ibu': 'Mother',
    'Wali': 'Guardian',
};

const RELATIONSHIP_MAP_TO_ID: Record<string, 'Ayah' | 'Ibu' | 'Wali'> = {
    'Father': 'Ayah',
    'Mother': 'Ibu',
    'Guardian': 'Wali',
};


// --- Dropdown Modal Component (Tetap Sama) ---
const DropdownModal = ({
  visible,
  onClose,
  options,
  onSelect,
  selectedValue,
}: {
  visible: boolean;
  onClose: () => void;
  options: string[];
  onSelect: (value: string) => void;
  selectedValue: string;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity
      style={PendaftaranStyles.modalOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={PendaftaranStyles.modalContent}>
        <ScrollView style={PendaftaranStyles.modalScrollView}>
          {options.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={[
                PendaftaranStyles.modalOption,
                selectedValue === option && PendaftaranStyles.modalOptionSelected,
              ]}
              onPress={() => {
                onSelect(option);
                onClose();
              }}
            >
              <Text style={[
                PendaftaranStyles.modalOptionText,
                selectedValue === option && PendaftaranStyles.modalOptionTextSelected,
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

const penghasilanOptions = [
  'Kurang dari Rp 1.000.000',
  'Rp 1.000.000 - Rp 3.000.000',
  'Rp 3.000.000 - Rp 5.000.000',
  'Lebih dari Rp 5.000.000',
];

// 🔑 Tipe Data Lokal yang disesuaikan dengan Guardian API
interface GuardianLocal {
    id_guardian?: number; // ID dari API (untuk Update/Delete)
    nama: string;
    alamat: string; // Mapped ke address
    nomor: string; // Mapped ke phone_number
    pekerjaan: string; // Mapped ke occupation
    pendidikan: string; // Mapped ke last_education
    penghasilan: string; // Mapped ke income_range
}

const DataOrangTuaScreen = () => {
  const navigation = useNavigation<DataOrangTuaNavigationProp>();

  const [activeTab, setActiveTab] = useState<'Orang Tua' | 'Wali'>('Orang Tua');
  const [activeParent, setActiveParent] = useState<'Ayah' | 'Ibu'>('Ayah');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE MODAL ---
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  // ------------------------------

  // 🔑 STATE UTAMA (Menggunakan GuardianLocal)
  const [ayah, setAyah] = useState<GuardianLocal>({
    nama: '', alamat: '', nomor: '', pekerjaan: '', pendidikan: '', penghasilan: '',
  });

  const [ibu, setIbu] = useState<GuardianLocal>({
    nama: '', alamat: '', nomor: '', pekerjaan: '', pendidikan: '', penghasilan: '',
  });

  const [wali, setWali] = useState<GuardianLocal>({
    nama: '', alamat: '', nomor: '', pekerjaan: '', pendidikan: '', penghasilan: '',
  });

  const [showPenghasilanModal, setShowPenghasilanModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // 🔑 LOGIKA KUNCI NAVIGASI MUNDUR (BEFORE REMOVE)
  useEffect(() => {
    return navigation.addListener('beforeRemove', (e) => {
      // Mencegah navigasi mundur selama proses pendaftaran belum diselesaikan (tombol Selesai belum ditekan)
      if (!isSubmitting) {
        Alert.alert(
          "Peringatan!", 
          "Anda harus menyimpan data di halaman ini sebelum melanjutkan atau kembali. Tekan tombol Selesai untuk menyimpan."
        );
        e.preventDefault(); 
      }
    });
  }, [navigation, isSubmitting]); 


  // --- LOGIKA LOAD DATA DARI API ---
  useEffect(() => {
      loadInitialData();
  }, []);

  const mapApiToLocal = (apiData: Guardian): GuardianLocal => {
    // 🔑 Mapping kembali nilai ENUM dari DB (Father, Mother, Guardian) ke ID (Ayah, Ibu, Wali)
    const localRelationship = apiData.relationship_type 
        ? RELATIONSHIP_MAP_TO_ID[apiData.relationship_type] || apiData.relationship_type 
        : '';
        
    return {
      id_guardian: apiData.id_guardian,
      nama: apiData.full_name || '',
      alamat: apiData.address || '',
      nomor: apiData.phone_number || '',
      pekerjaan: apiData.occupation || '',
      pendidikan: apiData.last_education || '',
      penghasilan: apiData.income_range || '',
    };
  };
  
  const mapLocalToApi = (localData: GuardianLocal, relationship: string): Partial<Guardian> => {
    // 🔑 Mapping nilai ID (Ayah, Ibu, Wali) ke ENUM DB (Father, Mother, Guardian)
    const dbRelationship = RELATIONSHIP_MAP_TO_DB[relationship.trim()] || relationship.trim();

    return {
      id_guardian: localData.id_guardian,
      // Gunakan nilai yang sudah diterjemahkan
      relationship_type: dbRelationship, 
      full_name: localData.nama.trim(),
      address: localData.alamat.trim() || undefined,
      phone_number: localData.nomor.trim() || undefined,
      occupation: localData.pekerjaan.trim() || undefined,
      last_education: localData.pendidikan.trim() || undefined,
      income_range: localData.penghasilan || undefined,
    };
  };


  const loadInitialData = async () => {
      try {
          const guardians = await registrationService.getGuardians();
          
          guardians.forEach(g => {
              const localData = mapApiToLocal(g);
              
              const localLabel = RELATIONSHIP_MAP_TO_ID[g.relationship_type] || g.relationship_type;

              if (localLabel === 'Ayah') setAyah(localData);
              else if (localLabel === 'Ibu') setIbu(localData);
              else if (localLabel === 'Wali') setWali(localData);
          });
          
      } catch (e: any) {
          if (e.response?.status !== 404) {
             Alert.alert('Error', e.userMessage || 'Gagal memuat data orang tua/wali.');
          }
      } finally {
          setIsLoading(false);
      }
  };
  
  // --- HANDLER LOKAL ---

  useEffect(() => {
    if (!showPenghasilanModal) {
      setOpenDropdown(null);
    }
  }, [showPenghasilanModal]);

  const handleChange = (
    role: 'ayah' | 'ibu' | 'wali',
    key: keyof GuardianLocal,
    value: string,
  ) => {
    if (role === 'ayah') setAyah({ ...ayah, [key]: value });
    else if (role === 'ibu') setIbu({ ...ibu, [key]: value });
    else setWali({ ...wali, [key]: value });
  };

  const handleSelectPenghasilan = (value: string) => {
    if (activeTab === 'Orang Tua') {
      if (activeParent === 'Ayah') setAyah({ ...ayah, penghasilan: value });
      else setIbu({ ...ibu, penghasilan: value });
    } else {
      setWali({ ...wali, penghasilan: value });
    }
  };
  
  // helper to get current form object & setter
  const currentForm = (): GuardianLocal => {
    if (activeTab === 'Orang Tua') {
      return activeParent === 'Ayah' ? ayah : ibu;
    }
    return wali;
  };

  // --- LOGIKA VALIDASI DAN SUBMIT API ---
  
  const validateForm = (data: GuardianLocal, role: string): boolean => {
      if (data.nama.trim() === '') {
          return true; // Dibiarkan kosong jika tidak wajib diisi
      }

      if (data.nomor.trim() && data.nomor.length < 8) {
          Alert.alert('Validasi', `Nomor Ponsel ${role} minimal 8 digit.`);
          return false;
      }
      return true;
  };
  
  const saveGuardian = async (localData: GuardianLocal, relationship: 'Ayah' | 'Ibu' | 'Wali', setter: React.Dispatch<React.SetStateAction<GuardianLocal>>) => {
      const isNameEmpty = localData.nama.trim() === '';

      if (isNameEmpty) {
          // LOGIKA HAPUS: Jika nama dikosongkan tapi data lama ada di server
          if (localData.id_guardian) {
              await registrationService.deleteGuardian(localData.id_guardian);
              // Reset state lokal setelah hapus
              setter({ 
                  nama: '', alamat: '', nomor: '', pekerjaan: '', pendidikan: '', penghasilan: '',
                  id_guardian: undefined
              });
          }
          return;
      }
      
      // Lanjutkan dengan validasi (hanya jika nama diisi)
      if (!validateForm(localData, relationship)) {
          throw new Error('Validasi gagal.');
      }
      
      const apiPayload = mapLocalToApi(localData, relationship);
      
      if (localData.id_guardian) {
          // UPDATE
          const updatedGuardian = await registrationService.updateGuardian(localData.id_guardian, apiPayload);
          setter(mapApiToLocal(updatedGuardian));
      } else {
          // ADD BARU
          const newGuardian = await registrationService.addGuardian(apiPayload);
          setter(mapApiToLocal(newGuardian));
      }
  };

  const handlePressSelesai = async () => {
      if (isSubmitting || isLoading) return;
      
      setIsSubmitting(true);
      
      try {
          // 1. Simpan/Update/Hapus Ayah
          await saveGuardian(ayah, 'Ayah', setAyah);
          // 2. Simpan/Update/Hapus Ibu
          await saveGuardian(ibu, 'Ibu', setIbu);
          // 3. Simpan/Update/Hapus Wali
          await saveGuardian(wali, 'Wali', setWali);

          // 4. Setelah sukses semua, tampilkan modal konfirmasi
          setIsSubmitting(false); // Atur ini ke false untuk sementara
          setShowConfirmModal(true);
          
      } catch (error: any) {
          setIsSubmitting(false);
          if (error.message !== 'Validasi gagal.') {
              const errorMessage = error.userMessage || 'Gagal menyimpan data orang tua/wali.';
              Alert.alert('Error', errorMessage);
          }
      }
  };

  const handleSubmitConfirmation = async () => {
    // 1. Tutup modal konfirmasi
    setShowConfirmModal(false);
    
    // 🔑 LANGKAH KRITIS: SUBMIT FINAL PENDAFTARAN
    try {
        await registrationService.submitRegistration();
        
        // **HAPUS LISTENER SEMENTARA:** Hapus listener beforeRemove agar navigasi maju bisa berjalan
        // Tanpa ini, navigasi maju (navigate) akan terblokir.
        navigation.removeListener('beforeRemove', () => {}); 

    } catch (e: any) {
        Alert.alert('Error Submit', e.userMessage || 'Gagal finalisasi pendaftaran.');
        return; 
    }

    // 2. Tampilkan splash screen berhasil
    setShowSuccessSplash(true);

    // 3. Atur timeout untuk navigasi setelah splash (misal 2.5 detik)
    setTimeout(() => {
      setShowSuccessSplash(false);
      // Navigasi ke halaman berikutnya (Rincian Biaya)
      navigation.navigate('RincianBiayaPendaftaran' as any); 
    }, 2500); 
  };
  
  // --- TAMPILAN LOADING ---
  if (isLoading) {
    return (
        <SafeAreaView style={PendaftarStyles.container} edges={['top']}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#DABC4E" />
                <Text style={{ marginTop: 10, color: '#666' }}>Memuat data orang tua...</Text>
            </View>
        </SafeAreaView>
    );
  }

  // --- RENDER UTAMA ---
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

        <View style={PendaftaranStyles.progressContainer}>
          <View style={PendaftaranStyles.progressBar}>
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
            <View style={[PendaftaranStyles.progressStep, PendaftaranStyles.progressStepActive]} />
          </View>
        </View>

        {/* Content */}
        <View style={PendaftaranStyles.content}>
          <View style={PendaftaranStyles.sectionContainer}>
            <View style={PendaftaranStyles.sectionHeader}>
              <View style={PendaftaranStyles.numberCircle}>
                <Text style={PendaftaranStyles.numberText}>5</Text>
              </View>
              <Text style={PendaftaranStyles.sectionTitle}>Data Orang Tua/Wali</Text>
            </View>

            {/* Tabs Orang Tua / Wali */}
            <View style={localStyles.mainTabContainer}>
              <TouchableOpacity
                style={[
                  localStyles.mainTabButton,
                  activeTab === 'Orang Tua' && localStyles.mainTabActive,
                ]}
                onPress={() => setActiveTab('Orang Tua')}
                disabled={isSubmitting}
              >
                <Text style={localStyles.mainTabText}>Orang Tua</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  localStyles.mainTabButton,
                  activeTab === 'Wali' && localStyles.mainTabActive,
                ]}
                onPress={() => setActiveTab('Wali')}
                disabled={isSubmitting}
              >
                <Text style={localStyles.mainTabText}>Wali</Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            {activeTab === 'Orang Tua' && (
              <>
                {/* Tabs Ayah / Ibu */}
                <View style={localStyles.subTabContainer}>
                  <TouchableOpacity
                    style={[
                      localStyles.subTabButton,
                      activeParent === 'Ayah' && localStyles.subTabActive,
                    ]}
                    onPress={() => setActiveParent('Ayah')}
                    disabled={isSubmitting}
                  >
                    <Text style={localStyles.subTabText}>Ayah</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      localStyles.subTabButton,
                      activeParent === 'Ibu' && localStyles.subTabActive,
                    ]}
                    onPress={() => setActiveParent('Ibu')}
                    disabled={isSubmitting}
                  >
                    <Text style={localStyles.subTabText}>Ibu</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Badge Active Parent */}
                <View style={localStyles.activeParentBadge}>
                  <Text style={localStyles.activeParentText}>{activeParent}</Text>
                </View>

                {/* fields Ayah/Ibu */}
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Nama {activeParent} Kandung</Text><TextInput style={PendaftaranStyles.input} value={currentForm().nama} onChangeText={(val) => handleChange(activeParent === 'Ayah' ? 'ayah' : 'ibu', 'nama', val)} editable={!isSubmitting}/></View>
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Alamat {activeParent} Kandung</Text><TextInput style={PendaftaranStyles.input} value={currentForm().alamat} onChangeText={(val) => handleChange(activeParent === 'Ayah' ? 'ayah' : 'ibu', 'alamat', val)} editable={!isSubmitting}/></View>
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Nomor Ponsel {activeParent} Kandung</Text><TextInput style={PendaftaranStyles.input} keyboardType="phone-pad" value={currentForm().nomor} onChangeText={(val) => handleChange(activeParent === 'Ayah' ? 'ayah' : 'ibu', 'nomor', val)} editable={!isSubmitting}/></View>
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Pekerjaan {activeParent} Kandung</Text><TextInput style={PendaftaranStyles.input} value={currentForm().pekerjaan} onChangeText={(val) => handleChange(activeParent === 'Ayah' ? 'ayah' : 'ibu', 'pekerjaan', val)} editable={!isSubmitting}/></View>
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Pendidikan {activeParent} Kandung</Text><TextInput style={PendaftaranStyles.input} value={currentForm().pendidikan} onChangeText={(val) => handleChange(activeParent === 'Ayah' ? 'ayah' : 'ibu', 'pendidikan', val)} editable={!isSubmitting}/></View>
                <View style={PendaftaranStyles.formGroup}>
                  <Text style={PendaftaranStyles.label}>Penghasilan {activeParent} Kandung</Text>
                  <TouchableOpacity style={PendaftaranStyles.pickerContainer} onPress={() => {setShowPenghasilanModal(true); setOpenDropdown('penghasilan');}} disabled={isSubmitting}>
                    <View style={PendaftaranStyles.pickerInput}>
                      <Text style={[PendaftaranStyles.pickerText, !(currentForm().penghasilan) && PendaftaranStyles.placeholderText,]}>{currentForm().penghasilan || 'Pilih Penghasilan'}</Text>
                    </View>
                    <Image source={openDropdown === 'penghasilan' ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')} style={PendaftaranStyles.dropdownIcon} resizeMode="contain"/>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Wali form */}
            {activeTab === 'Wali' && (
              <>
                {/* fields Wali */}
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Nama Wali</Text><TextInput style={PendaftaranStyles.input} value={wali.nama} onChangeText={(val) => handleChange('wali', 'nama', val)} editable={!isSubmitting}/></View>
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Alamat Wali</Text><TextInput style={PendaftaranStyles.input} value={wali.alamat} onChangeText={(val) => handleChange('wali', 'alamat', val)} editable={!isSubmitting}/></View>
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Nomor Ponsel Wali</Text><TextInput style={PendaftaranStyles.input} keyboardType="phone-pad" value={wali.nomor} onChangeText={(val) => handleChange('wali', 'nomor', val)} editable={!isSubmitting}/></View>
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Pekerjaan Wali</Text><TextInput style={PendaftaranStyles.input} value={wali.pekerjaan} onChangeText={(val) => handleChange('wali', 'pekerjaan', val)} editable={!isSubmitting}/></View>
                <View style={PendaftaranStyles.formGroup}><Text style={PendaftaranStyles.label}>Pendidikan Wali</Text><TextInput style={PendaftaranStyles.input} value={wali.pendidikan} onChangeText={(val) => handleChange('wali', 'pendidikan', val)} editable={!isSubmitting}/></View>
                
                <View style={PendaftaranStyles.formGroup}>
                  <Text style={PendaftaranStyles.label}>Penghasilan Wali</Text>
                  <TouchableOpacity style={PendaftaranStyles.pickerContainer} onPress={() => {setShowPenghasilanModal(true); setOpenDropdown('penghasilan');}} disabled={isSubmitting}>
                    <View style={PendaftaranStyles.pickerInput}>
                      <Text style={[PendaftaranStyles.pickerText,!wali.penghasilan && PendaftaranStyles.placeholderText,]}>{wali.penghasilan || 'Pilih Penghasilan'}</Text>
                    </View>
                    <Image source={openDropdown === 'penghasilan' ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')} style={PendaftaranStyles.dropdownIcon} resizeMode="contain"/>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Tombol Selesai */}
            <TouchableOpacity
              style={localStyles.submitButton}
              onPress={handlePressSelesai} 
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#DABC4E', '#F5EFD3']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={localStyles.submitButton}
              >
                {isSubmitting ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={localStyles.submitButtonText}>Selesai</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* background logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={PendaftarStyles.backgroundLogo}
        resizeMode="contain"
      />

      {/* Dropdown modal for penghasilan */}
      <DropdownModal
        visible={showPenghasilanModal}
        onClose={() => setShowPenghasilanModal(false)}
        options={penghasilanOptions}
        onSelect={handleSelectPenghasilan}
        selectedValue={
          activeTab === 'Orang Tua'
            ? activeParent === 'Ayah'
              ? ayah.penghasilan
              : ibu.penghasilan
            : wali.penghasilan
        }
      />
      
      {/* 1. MODAL KONFIRMASI DATA */}
      <Modal visible={showConfirmModal} transparent animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={modalStyles.overlay}>
          <LinearGradient
            colors={['#DABC4E', '#F5EFD3']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={modalStyles.confirmBox}
          >
            <Image
              source={require('../../assets/icons/streamline-block_content-confirm-file.png')} 
              style={modalStyles.confirmIcon}
              resizeMode="contain"
            />
            <Text style={modalStyles.confirmTitle}>Konfirmasi Data</Text>
            <Text style={modalStyles.confirmSubtitle}>Apakah kamu yakin?</Text>
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

      {/* 2. SUCCESS SPLASH SCREEN */}
      <Modal visible={showSuccessSplash} transparent animationType="fade" statusBarTranslucent>
        <ImageBackground
          source={require('../../assets/images/logo-ugn.png')} 
          style={modalStyles.splashOverlay}
          imageStyle={modalStyles.splashBackgroundImage}
          resizeMode="contain"
        >
          <View style={modalStyles.splashContent}>
            <View style={modalStyles.checkCircle}>
              <Image
                source={require('../../assets/icons/emojione-v1_left-check-mark.png')} 
                style={modalStyles.checkIcon}
                resizeMode="contain"
              />
            </View>
            <Text style={modalStyles.splashTitle}>Selamat, data berhasil dikonfirmasi!</Text>
            <Text style={modalStyles.splashSubtitle}>Redirect ke halaman pembayaran...</Text>
          </View>
        </ImageBackground>
      </Modal>
    </SafeAreaView>
    
  );
};

// --- STYLESHEET LOKAL ---
const localStyles = StyleSheet.create({
  // Gaya untuk Tabs Orang Tua / Wali (Main Tabs)
  mainTabContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#A8A350', // Background tab container
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000',
    overflow: 'hidden',
    marginTop: 10,
    width: '90%', 
  },
  mainTabButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTabActive: {
    backgroundColor: '#E5C363', 
  },
  mainTabText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14, 
  },

  // Gaya untuk Tabs Ayah / Ibu (Sub Tabs)
  subTabContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#fddaace0',
    borderRadius: 20, 
    borderWidth: 1,
    borderColor: '#000',
    overflow: 'hidden',
    marginTop: 20,
    width: '70%', 
  },
  subTabButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabActive: {
    backgroundColor: '#fddaacff', 
  },
  subTabText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 12, 
  },

  // Gaya untuk Badge Active Parent
  activeParentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#C8C9A9',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 20,
  },
  activeParentText: {
    color: '#000',
    fontWeight: '600',
  },

  // Gaya untuk Tombol Selesai
  submitButton: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 30,
    marginBottom: 20, 
    alignSelf: 'center',
    width: '60%', 
  },
  submitButtonText: {
    color: '#000', // Warna hitam agar terlihat kontras dengan LinearGradient
    fontWeight: '600',
    fontSize: 16,
  }
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
    width: '80%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  confirmIcon: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#015023',
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: '#000000ff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  confirmButtonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 6,
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
  },
  yesButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
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

export default DataOrangTuaScreen;