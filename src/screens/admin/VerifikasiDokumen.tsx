import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { managerService } from '../../services/managerService'; // Integrasi Service
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===========================================
// 1. DEFINISI TIPE DAN INTERFACE
// ===========================================

type VerifikasiDokumenNavigationProp = NativeStackNavigationProp<AdminStackParamList, 'VerifikasiDokumen'>;

// Interface Data Asli (Sama dengan Manager)
interface DocumentItem {
  id_document: number;
  document_name: string;
  file_url: string;      
  file_path: string;     
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

interface AchievementItem {
  id_achievement: number;
  achievement_name: string;
  achievement_level: string;
  year: number;
  ranking?: string;
  file_path: string;
}

interface VerifikasiDokumenProps {
  route: {
    params: {
      id_profile: number; // Menggunakan id_profile untuk fetch API
      name: string;
      email: string;
      program_name: string;
    };
  };
}

// ===========================================
// 2. KOMPONEN CARD
// ===========================================

// Card Dokumen (Style Admin, Data Real)
const DocumentCard = ({ 
  document, 
  onView 
}: { 
  document: DocumentItem; 
  onView: () => void;
}) => {
  const isApproved = document.verification_status === 'approved';
  const isRejected = document.verification_status === 'rejected';
  
  // Logika Tampilan Status
  let statusText = 'PENDING - Menunggu Review';
  let statusColor = '#E8A349'; // Kuning/Orange
  let iconSource = require('../../assets/icons/fluent_warning-12-filled.png');

  if (isApproved) {
    statusText = 'VALID - Terverifikasi';
    statusColor = '#5D7C3F'; // Hijau
    iconSource = require('../../assets/icons/Vector8.png');
  } else if (isRejected) {
    statusText = `INVALID - ${document.rejection_reason || 'Ditolak'}`;
    statusColor = '#BE0414'; // Merah
    iconSource = require('../../assets/icons/fluent_warning-12-filled.png');
  }

  const fileName = document.file_path ? document.file_path.split('/').pop() : 'File Name Unavailable';

  return (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentName}>{document.document_name}</Text>
      </View>
      
      <View style={styles.documentBody}>
        <Image 
          source={require('../../assets/icons/File.png')} 
          style={styles.fileIcon}
          resizeMode="contain"
        />
        <View style={styles.documentTextContainer}>
            <Text style={styles.filename} numberOfLines={1}>{fileName}</Text>
            <View style={styles.validationStatus}>
                <Image 
                    source={iconSource} 
                    style={[styles.statusCheckIcon, { tintColor: statusColor }]}
                    resizeMode="contain"
                />
                <Text style={[styles.validationText, { color: statusColor }]}>
                    {statusText}
                </Text>
            </View>
        </View>

        {/* Tombol Lihat File */}
        <TouchableOpacity style={styles.viewButton} onPress={onView}>
          <Image 
            source={require('../../assets/icons/fi-sr-eye.png')} 
            style={styles.viewIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Card Prestasi (Style Admin)
const AchievementCard = ({ 
  achievement, 
  onView 
}: { 
  achievement: AchievementItem; 
  onView: () => void;
}) => {
  const fileName = achievement.file_path ? achievement.file_path.split('/').pop() : 'Sertifikat';

  return (
    <View style={[styles.documentCard, { borderColor: '#189653' }]}>
      <View style={styles.documentHeader}>
        <Text style={[styles.documentName, { color: '#189653' }]}>{achievement.achievement_name}</Text>
        <Text style={{ fontSize: 10, color: '#666', fontStyle: 'italic' }}>
           {achievement.achievement_level} - {achievement.year}
        </Text>
      </View>
      
      <View style={styles.documentBody}>
        <Image 
          source={require('../../assets/icons/File.png')} 
          style={styles.fileIcon}
          resizeMode="contain"
        />
        <View style={styles.documentTextContainer}>
            <Text style={styles.filename} numberOfLines={1}>{fileName}</Text>
            <View style={styles.validationStatus}>
                <Image 
                    source={require('../../assets/icons/Vector8.png')} 
                    style={[styles.statusCheckIcon, { tintColor: '#5D7C3F' }]}
                    resizeMode="contain"
                />
                <Text style={[styles.validationText, { color: '#5D7C3F' }]}>
                    Opsional - Terlampir
                </Text>
            </View>
        </View>

        <TouchableOpacity style={styles.viewButton} onPress={onView}>
          <Image 
            source={require('../../assets/icons/fi-sr-eye.png')} 
            style={styles.viewIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ===========================================
// 3. SCREEN UTAMA
// ===========================================

const VerifikasiDokumenScreen: React.FC<VerifikasiDokumenProps> = ({ route }) => {
  const navigation = useNavigation<VerifikasiDokumenNavigationProp>();
  const { id_profile, name, email, program_name } = route.params;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi Fetch Data (Sama dengan Manager)
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const [docsResponse, achievementsResponse] = await Promise.all([
         managerService.getApplicantDocuments(id_profile),
         managerService.getApplicantAchievements(id_profile).catch(() => ({ success: false, data: [] }))
      ]);
      
      if (docsResponse.success) {
        const documentsData = docsResponse.data.documents || [];
        const mappedDocuments = documentsData.map((doc: any) => ({
          id_document: doc.id_document || doc.id || doc.document_id, 
          document_name: doc.name || 'Unknown Document', 
          file_url: doc.file_url || doc.file_path || '',
          file_path: doc.file_path || doc.file_url || '',
          verification_status: (doc.status || 'pending').toLowerCase(),
          rejection_reason: doc.rejection_reason || null,
        }));
        setDocuments(mappedDocuments);
      }

      if (achievementsResponse.success && Array.isArray(achievementsResponse.data)) {
         setAchievements(achievementsResponse.data);
      } else {
         setAchievements([]);
      }

    } catch (error: any) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Gagal memuat data dokumen.');
    } finally {
      setIsLoading(false);
    }
  }, [id_profile]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Fungsi Buka File (Sama dengan Manager)
  const handleView = (item: DocumentItem | AchievementItem, type: 'document' | 'achievement') => {
    const BASE_API_URL = 'http://172.27.86.208:8000/api'; 
    let FILE_ENDPOINT = '';

    if (type === 'document') {
        FILE_ENDPOINT = `/admin/document-file/${(item as DocumentItem).id_document}`;
    } else {
        FILE_ENDPOINT = `/admin/achievement-file/${(item as AchievementItem).id_achievement}`;
    }
    
    AsyncStorage.getItem('token').then(token => {
        if (token) {
            const authenticatedUrl = `${BASE_API_URL}${FILE_ENDPOINT}?token=${token}`; 
            Linking.openURL(authenticatedUrl).catch(err => {
                Alert.alert("Gagal", "Tidak dapat membuka dokumen.");
            });
        } else {
             Alert.alert('Gagal', 'Token otentikasi tidak ditemukan.');
        }
    }).catch(err => {
         Alert.alert('Error', 'Gagal mendapatkan token.');
    });
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
            
            <Text style={styles.headerTitle}>Monitoring Dokumen</Text>
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

        {isLoading ? (
             <ActivityIndicator size="large" color="#DABC4E" style={{ marginTop: 50 }} />
        ) : (
            <>
                {/* Documents List */}
                {documents.length > 0 ? (
                    documents.map((doc) => (
                    <DocumentCard
                        key={doc.id_document}
                        document={doc}
                        onView={() => handleView(doc, 'document')}
                    />
                    ))
                ) : (
                    <Text style={{ color: '#FFF', textAlign: 'center', marginBottom: 20 }}>Tidak ada dokumen wajib.</Text>
                )}

                {/* Achievements List */}
                {achievements.length > 0 && (
                    <View style={{ marginTop: 10 }}>
                         <Text style={{ color: '#DABC4E', fontWeight: 'bold', marginBottom: 10, fontSize: 16 }}>Dokumen Prestasi</Text>
                         {achievements.map((ach) => (
                            <AchievementCard
                                key={ach.id_achievement}
                                achievement={ach}
                                onView={() => handleView(ach, 'achievement')}
                            />
                        ))}
                    </View>
                )}
            </>
        )}

        {/* Next Button */}
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => {
              // Navigasi ke VerifikasiPembayaran (Pastikan route ini ada di AdminNavigator)
              // @ts-ignore
              navigation.navigate('VerifikasiPembayaran', { id_profile, name, email, program_name }); 
          }}
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
    backgroundColor: '#DABC4E', 
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
    backgroundColor: '#F5EFD3', 
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#DABC4E', 
  },
  documentHeader: {
    marginBottom: 5,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DABC4E', 
  },
  documentBody: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)', 
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#C4A962', 
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
  // Style tambahan untuk tombol View
  viewButton: {
    padding: 5,
    marginLeft: 5,
  },
  viewIcon: {
    width: 20,
    height: 20,
    tintColor: '#333',
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
    borderColor: '#004225', 
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