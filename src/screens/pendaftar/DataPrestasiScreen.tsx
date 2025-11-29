import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  TextInput,
  Alert,
  StyleSheet, // Import StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PendaftarStackParamList } from '../../navigation/PendaftarNavigator';
import PendaftarStyles from '../../styles/PendaftarStyles';
import PendaftaranStyles from '../../styles/PendaftaranStyles';
import { pick, types } from '@react-native-documents/picker';
import LinearGradient from 'react-native-linear-gradient';

type DataPrestasiNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'DataPrestasi'
>;

interface PrestasiItem {
  nama: string;
  tahun: string;
  jenis: string;
  tingkat: string;
  penyelenggara: string;
  peringkat: string;
  file?: PickedDocument | null;
}

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

const DataPrestasiScreen = () => {
  const navigation = useNavigation<DataPrestasiNavigationProp>();
  const [prestasiList, setPrestasiList] = useState<PrestasiItem[]>([
    { nama: '', tahun: '', jenis: '', tingkat: '', penyelenggara: '', peringkat: '', file: null },
  ]);

  const handleAddPrestasi = () => {
    setPrestasiList([
      ...prestasiList,
      { nama: '', tahun: '', jenis: '', tingkat: '', penyelenggara: '', peringkat: '', file: null },
    ]);
  };

  const handleDeletePrestasi = (index: number) => {
    if (prestasiList.length === 1) {
      Alert.alert('Peringatan', 'Minimal harus ada satu form prestasi.');
      return;
    }
    Alert.alert(
      'Konfirmasi Hapus',
      'Anda yakin ingin menghapus data prestasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          onPress: () => {
            const updated = prestasiList.filter((_, i) => i !== index);
            setPrestasiList(updated);
            Alert.alert('Sukses', 'Data prestasi berhasil dihapus');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleChange = (index: number, key: keyof PrestasiItem, value: string) => {
    const updated = [...prestasiList];
    updated[index][key] = value;
    setPrestasiList(updated);
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
        Alert.alert('Sukses', 'File prestasi berhasil diunggah');
      }
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Gagal mengunggah file prestasi');
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
    setPrestasiList(updated);
    Alert.alert('Sukses', 'File prestasi berhasil dihapus');
  };

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

        {/* Progress Bar (Tidak Berubah) */}
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
                  
                  {index > 0 && (
                    <TouchableOpacity
                      onPress={() => handleDeletePrestasi(index)}
                      style={styles.deletePrestasiButton}
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
                  { label: 'Tingkat Prestasi', key: 'tingkat' },
                  { label: 'Penyelenggara', key: 'penyelenggara' },
                  { label: 'Peringkat', key: 'peringkat' },
                ].map((field, i) => (
                  <View key={i} style={PendaftaranStyles.formGroup}>
                    <Text style={styles.label}>{field.label}</Text>
                    <TextInput
                      style={PendaftaranStyles.input}
                      value={item[field.key as keyof PrestasiItem] as string}
                      onChangeText={(val) => handleChange(index, field.key as keyof PrestasiItem, val)}
                      keyboardType={field.keyboardType as any}
                    />
                  </View>
                ))}

                {/* Upload Sertifikat (Tidak Berubah) */}
                <View style={PendaftaranStyles.formGroup}>
                  <Text style={styles.label}>Upload Sertifikat Prestasi</Text>
                  <TouchableOpacity
                    style={PendaftaranStyles.uploadButton}
                    onPress={() => handlePickDocument(index)}
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

            {/* Add Prestasi (Tidak Berubah) */}
            <TouchableOpacity
              style={styles.addPrestasiButton}
              onPress={handleAddPrestasi}
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

            {/* Next Button (Tidak Berubah) */}
            <TouchableOpacity
              style={PendaftaranStyles.nextButton}
              onPress={() => navigation.navigate('DataOrangTua')}
            >
              <LinearGradient
                colors={['#DABC4E', '#F5EFD3']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={PendaftaranStyles.nextButton}
              >
                <Text style={PendaftaranStyles.nextButtonText}>Next</Text>
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
    </SafeAreaView>
  );
};

// --- GAYA BARU (DIREFACTORING DARI INLINE STYLE DAN PENAMBAHAN GAYA BARU) ---
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
    backgroundColor: '#F5F5F5', // Latar belakang ringan untuk pembeda
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  additionalPrestasi: {
    marginTop: 25,
    backgroundColor: '#FFF0D9', // Latar belakang beda untuk item tambahan
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