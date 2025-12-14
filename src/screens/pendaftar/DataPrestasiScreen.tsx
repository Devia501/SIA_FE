// src/screens/pendaftar/DataPrestasiScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  TextInput,
  Modal, // Ditambahkan untuk Dropdown
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
import { pick, types } from '@react-native-documents/picker';
import LinearGradient from 'react-native-linear-gradient';

// 📌 IMPORT SERVICE DAN TYPES DARI API (Wajib)
import { 
  registrationService, 
  Achievement, 
  Profile 
} from '../../services/apiService'; 

type DataPrestasiNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'DataPrestasi'
>;

// 🔑 OPSI ENUM UNTUK TINGKAT PRESTASI (Berdasarkan Struktur DB)
const ACHIEVEMENT_LEVEL_OPTIONS = [
  'Sekolah', 
  'Kecamatan', 
  'Kabupaten/Kota', 
  'Provinsi', 
  'Nasional', 
  'Internasional'
];


// INTERFACE DOKUMEN 
interface PickedDocument {
  uri: string;
  name: string;
  size: number;
  type: string;
  server_id?: number; 
}

// INTERFACE PRESTASI ITEM 
interface PrestasiItem {
  id_achievement?: number; 
  achievement_name: string; 
  year?: number; 
  achievement_type?: string; 
  achievement_level?: string; // 🔑 Diubah menjadi string untuk menampung nilai ENUM
  organizer?: string; 
  ranking?: string; 
  certificate_path?: string; 
  file?: PickedDocument | null; 
}

// 📌 KOMPONEN DROPDOWN MODAL (Dibutuhkan untuk ENUM)
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


const DataPrestasiScreen = () => {
  const navigation = useNavigation<DataPrestasiNavigationProp>();
  const [prestasiList, setPrestasiList] = useState<PrestasiItem[]>([
    { achievement_name: '', year: undefined, achievement_type: '', achievement_level: '', organizer: '', ranking: '', file: null },
  ]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);

  // 🔑 STATE BARU UNTUK KONTROL MODAL TINGKAT PRESTASI
  const [showLevelModalIndex, setShowLevelModalIndex] = useState<number | null>(null); 


  // 🔑 LOGIKA PENCEGAHAN BACK & LOAD DATA AWAL
  useEffect(() => {
    loadInitialData();

    return navigation.addListener('beforeRemove', (e) => {
      Alert.alert(
        "Peringatan!", 
        "Anda harus menekan tombol 'Next' untuk melanjutkan ke halaman berikutnya (Data Orang Tua)."
      );
      e.preventDefault(); 
    });
  }, [navigation]);

  // 📌 FUNGSI LOAD DATA AWAL
  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const profile = await registrationService.getProfile();
      setProfileId(profile.id_profile || null);

      const achievements = await registrationService.getAchievements();

      if (achievements.length > 0) {
        const mappedList: PrestasiItem[] = achievements.map(item => ({
          id_achievement: item.id_achievement,
          achievement_name: item.achievement_name || '',
          year: item.year,
          achievement_type: item.achievement_type || '',
          achievement_level: item.achievement_level || '',
          organizer: item.organizer || '',
          ranking: item.ranking || '',
          certificate_path: item.certificate_path,
          file: item.certificate_path 
            ? {
                uri: item.certificate_path,
                name: item.certificate_path.split('/').pop() || 'Sertifikat.pdf',
                size: 0, 
                type: 'application/pdf', 
                server_id: item.id_achievement, 
              } 
            : null,
        }));
        setPrestasiList(mappedList);
      } else {
        setPrestasiList([
          { achievement_name: '', year: undefined, achievement_type: '', achievement_level: '', organizer: '', ranking: '', file: null },
        ]);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        Alert.alert('Error', 'Gagal memuat data prestasi.');
      }
      setPrestasiList([
        { achievement_name: '', year: undefined, achievement_type: '', achievement_level: '', organizer: '', ranking: '', file: null },
      ]);
    } finally {
      setLoadingData(false);
    }
  };


  const handleAddPrestasi = () => {
    setPrestasiList([
      ...prestasiList,
      { achievement_name: '', year: undefined, achievement_type: '', achievement_level: '', organizer: '', ranking: '', file: null },
    ]);
  };

  const handleDeletePrestasi = async (index: number) => {
    const itemToDelete = prestasiList[index];

    if (prestasiList.length === 1 && !itemToDelete.id_achievement) {
        setPrestasiList([
            { achievement_name: '', year: undefined, achievement_type: '', achievement_level: '', organizer: '', ranking: '', file: null },
        ]);
        Alert.alert('Sukses', 'Form prestasi dikosongkan.');
        return;
    }

    if (prestasiList.length === 1 && itemToDelete.id_achievement) {
        Alert.alert('Peringatan', 'Minimal harus ada satu form prestasi (kosong jika tidak ada).');
        return;
    }


    Alert.alert(
      'Konfirmasi Hapus',
      'Anda yakin ingin menghapus data prestasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          onPress: async () => {
            const updated = prestasiList.filter((_, i) => i !== index);
            
            if (updated.length === 0) {
              setPrestasiList([
                { achievement_name: '', year: undefined, achievement_type: '', achievement_level: '', organizer: '', ranking: '', file: null },
              ]);
            } else {
              setPrestasiList(updated);
            }

            if (itemToDelete.id_achievement) {
              try {
                await registrationService.deleteAchievement(itemToDelete.id_achievement);
                Alert.alert('Sukses', 'Data prestasi berhasil dihapus dari server.');
              } catch (error) {
                Alert.alert('Error', 'Gagal menghapus prestasi dari server.');
              }
            } else {
                Alert.alert('Sukses', 'Data prestasi (lokal) berhasil dihapus');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleChange = (index: number, key: keyof PrestasiItem, value: string) => {
    const updated = [...prestasiList];
    if (key === 'year') {
        const cleanValue = value.replace(/[^0-9]/g, '');
        updated[index].year = cleanValue ? parseInt(cleanValue) : undefined;
    } else {
        (updated[index] as any)[key] = value;
    }
    setPrestasiList(updated);
  };
  
  // 🔑 HANDLE SELECT UNTUK TINGKAT PRESTASI
  const handleSelectLevel = (index: number, level: string) => {
      const updated = [...prestasiList];
      updated[index].achievement_level = level;
      setPrestasiList(updated);
      setShowLevelModalIndex(null);
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
        updated[index].certificate_path = undefined; 
        setPrestasiList(updated);
        Alert.alert('Sukses', 'File prestasi berhasil dipilih. Jangan lupa klik Next untuk menyimpan.');
      }
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Gagal memilih file prestasi');
      }
    }
  };

  const handleViewDocument = (file: PickedDocument | null) => {
    if (!file) return;
    Alert.alert(
      'Detail File Prestasi',
      `Nama File: ${file.name}\nUkuran: ${formatFileSize(file.size)}\nTipe: ${file.type}`,
      [{ text: 'OK', style: 'cancel' }],
    );
  };

  const handleDeleteDocument = (index: number) => {
    const updated = [...prestasiList];
    updated[index].file = null;
    updated[index].certificate_path = undefined; 
    setPrestasiList(updated);
    Alert.alert('Sukses', 'File sertifikat dihapus (lokal). Klik Next untuk menyimpan perubahan.');
  };
  
  // 📌 LOGIKA PENYIMPANAN DATA PRESTASI DAN NAVIGASI
  const handleNext = async () => {
    if (isSaving || loadingData) return;
    setIsSaving(true);
    
    try {
        // 1. Ambil data prestasi lama
        const existingAchievements = await registrationService.getAchievements();
        
        // 2. Hapus prestasi lama (Logic Anda saat ini - hati-hati, ini menghapus semua dulu baru add lagi)
        for (const item of existingAchievements) {
            if (item.id_achievement) {
                 await registrationService.deleteAchievement(item.id_achievement);
            }
        }

        // 3. Filter data yang valid
        const validPrestasi = prestasiList.filter(item => 
            item.achievement_name.trim() !== ''
        );
        
        if (validPrestasi.length > 0) {
            for (const item of validPrestasi) {
                
                // 🛑 PERBAIKAN DISINI: GUNAKAN FORMDATA
                const formData = new FormData();

                // Append text data
                if (profileId) formData.append('id_profile', profileId.toString());
                formData.append('achievement_name', item.achievement_name.trim());
                if (item.year) formData.append('year', item.year.toString());
                if (item.achievement_type) formData.append('achievement_type', item.achievement_type);
                if (item.achievement_level) formData.append('achievement_level', item.achievement_level);
                if (item.organizer) formData.append('organizer', item.organizer);
                if (item.ranking) formData.append('ranking', item.ranking);

                // 📌 APPEND FILE FISIK
                // Cek apakah ada file baru yang dipilih user
                if (item.file && item.file.uri) {
                    const filePayload = {
                        uri: Platform.OS === 'android' ? item.file.uri : item.file.uri.replace('file://', ''),
                        name: item.file.name || 'document.pdf',
                        type: item.file.type || 'application/pdf',
                    };
                    // 'certificate_path' harus sesuai dengan nama field di validasi Backend (StoreAchievementRequest)
                    formData.append('certificate_path', filePayload as any);
                } 
                // Jika tidak ada file baru tapi ada path lama (kasus edit tanpa ganti file),
                // biasanya backend butuh penanganan khusus. 
                // Namun karena logic Anda adalah "Delete All -> Add All", 
                // maka user WAJIB upload ulang file jika logic-nya seperti ini, 
                // KECUALI Anda mengubah logic backend untuk menerima string path lama.
                
                // Panggil service dengan FormData
                // Pastikan apiService.ts Anda menerima FormData!
                await registrationService.addAchievement(formData);
            }
        }
        
        Alert.alert('Sukses', 'Data Prestasi berhasil disimpan.');
        navigation.navigate('DataOrangTua'); 

    } catch (error: any) {
        console.error("Upload Error:", error);
        const errorMessage = error.userMessage || error.response?.data?.message || 'Gagal menyimpan data prestasi.';
        Alert.alert('Error', errorMessage);
    } finally {
        setIsSaving(false);
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
        {/* Header (Tidak Berubah) */}
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

        {/* Progress Bar (Langkah 4 dari 5) */}
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

            {/* Info Badges (Tidak Berubah) */}
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

            {/* LOOPING PRESTASI DENGAN PEMBEDA */}
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
                  
                  {prestasiList.length > 1 && (
                    <TouchableOpacity
                      onPress={() => handleDeletePrestasi(index)}
                      style={styles.deletePrestasiButton}
                      disabled={isSaving}
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
                  { label: 'Nama Prestasi', key: 'achievement_name', value: item.achievement_name },
                  { label: 'Tahun', key: 'year', keyboardType: 'numeric', value: item.year?.toString() || '' },
                  { label: 'Jenis Prestasi', key: 'achievement_type', value: item.achievement_type || '' },
                  { label: 'Penyelenggara', key: 'organizer', value: item.organizer || '' },
                  { label: 'Peringkat', key: 'ranking', value: item.ranking || '' },
                ].map((field, i) => (
                  <View key={i} style={PendaftaranStyles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    <TextInput
                      style={PendaftaranStyles.input}
                      value={field.value}
                      onChangeText={(val) => handleChange(index, field.key as keyof PrestasiItem, val)}
                      keyboardType={field.keyboardType as any}
                      editable={!isSaving}
                    />
                  </View>
                ))}
                
                {/* 🔑 INPUT DROPDOWN: Tingkat Prestasi (ENUM) */}
                <View style={PendaftaranStyles.formGroup}>
                    <Text style={styles.label}>Tingkat Prestasi</Text>
                    <TouchableOpacity 
                        style={PendaftaranStyles.pickerContainer}
                        onPress={() => setShowLevelModalIndex(index)}
                        disabled={isSaving}
                    >
                        <View style={PendaftaranStyles.pickerInput}>
                            <Text style={[
                                PendaftaranStyles.pickerText, 
                                !item.achievement_level && PendaftaranStyles.placeholderText
                            ]}>
                                {item.achievement_level || 'Pilih Tingkat'}
                            </Text>
                        </View>
                        <Image
                            source={showLevelModalIndex === index ? require('../../assets/icons/Polygon 5.png') : require('../../assets/icons/Polygon 4.png')}
                            style={PendaftaranStyles.dropdownIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>


                {/* Upload Sertifikat */}
                <View style={PendaftaranStyles.formGroup}>
                  <Text style={styles.label}>Upload Sertifikat Prestasi</Text>
                  <TouchableOpacity
                    style={PendaftaranStyles.uploadButton}
                    onPress={() => handlePickDocument(index)}
                    disabled={isSaving}
                  >
                    <View style={PendaftaranStyles.uploadContent}>
                      {item.file || item.certificate_path ? ( // Cek file lokal atau path server
                        <View style={PendaftaranStyles.uploadedFileContainer}>
                          <Text style={PendaftaranStyles.uploadedFileName} numberOfLines={1}>
                            {item.file?.name || item.certificate_path?.split('/').pop() || 'File Tersimpan'}
                          </Text>
                          <Text style={PendaftaranStyles.uploadedFileSize}>
                            {formatFileSize(item.file?.size || 0)}
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

                  {(item.file || item.certificate_path) && (
                    <View style={PendaftaranStyles.documentActions}>
                      <TouchableOpacity
                        style={PendaftaranStyles.viewButton}
                        onPress={() => handleViewDocument(item.file || { uri: item.certificate_path!, name: 'File Tersimpan', size: 0, type: 'application/pdf' })}
                        disabled={isSaving}
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
                        disabled={isSaving}
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
              disabled={isSaving}
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

            {/* Next Button (Memanggil fungsi simpan/navigasi) */}
            <TouchableOpacity
              style={PendaftaranStyles.nextButton}
              onPress={handleNext}
              disabled={isSaving || loadingData}
            >
              <LinearGradient
                colors={['#DABC4E', '#F5EFD3']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={PendaftaranStyles.nextButton}
              >
                {isSaving ? (
                    <ActivityIndicator color="#000" />
                ) : (
                    <Text style={PendaftaranStyles.nextButtonText}>Next</Text>
                )}
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
      
      {/* 🔑 MODAL TINGKAT PRESTASI (GLOBAL) */}
      <DropdownModal
        visible={showLevelModalIndex !== null}
        onClose={() => setShowLevelModalIndex(null)}
        options={ACHIEVEMENT_LEVEL_OPTIONS}
        onSelect={(level) => handleSelectLevel(showLevelModalIndex!, level)}
        selectedValue={showLevelModalIndex !== null ? (prestasiList[showLevelModalIndex]?.achievement_level || '') : ''}
      />

    </SafeAreaView>
  );
};

// --- GAYA (Tidak ada perubahan pada gaya) ---
const styles = StyleSheet.create({
  // Gaya untuk Info Badges
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

  // Gaya untuk Prestasi Item
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

  // Gaya untuk Add Prestasi Button
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