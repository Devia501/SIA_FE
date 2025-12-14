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
  Modal, 
  ActivityIndicator, 
  Linking, 
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ManagerStackParamList } from '../../navigation/ManagerNavigator';
import LinearGradient from 'react-native-linear-gradient'; 
import { managerService } from '../../services/managerService'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// ===========================================
// 1. DEFINISI TIPE DAN INTERFACE
// ===========================================

type VerifikasiDokumenNavigationProp = NativeStackNavigationProp<ManagerStackParamList, 'VerifikasiDokumen'>;

interface DocumentItem {
  id_document: number;
  document_name: string;
  file_url: string;      
  file_path: string;     
  verification_status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

// 🆕 Interface untuk Prestasi
interface AchievementItem {
  id_achievement: number;
  achievement_name: string;
  achievement_level: string; // Nasional, Internasional, dll
  year: number;
  ranking?: string;
  file_path: string; // Sertifikat path
  certificate_url?: string;
}

interface VerifikasiDokumenProps {
  route: {
    params: {
      id_profile: number;
      name: string;
      email: string;
      program_name: string;
    };
  };
}

type DbStatus = 'Approved' | 'Rejected' | 'Pending';

interface DocumentAction {
  docId: number;
  document_name: string;
  actionType: 'Approve' | 'Reject';
}

// ===========================================
// 2. KOMPONEN CARD DOKUMEN & PRESTASI
// ===========================================

const DocumentCard = ({ 
  document, 
  onApprove, 
  onReject, 
  onView 
}: { 
  document: DocumentItem; 
  onApprove: (docId: number, docName: string) => void; 
  onReject: (docId: number, docName: string) => void;
  onView: () => void;
}) => {
  const status = document.verification_status || 'pending';
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  const fileUrl = document.file_url || document.file_path || '';
  const fileName = fileUrl.split('/').pop() || 'File Name Unavailable';

  return (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentName}>{document.document_name}</Text>
      </View>
      
      <View style={styles.documentBody}>
        <Text style={styles.fileIcon}>📄</Text>
        <Text style={styles.filename} numberOfLines={1}>{fileName}</Text>
        
        <TouchableOpacity style={styles.viewButton} onPress={onView}>
          <Image 
            source={require('../../assets/icons/fi-sr-eye.png')} 
            style={styles.viewIcon1}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.documentActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]} 
          onPress={() => onApprove(document.id_document, document.document_name)}
          disabled={isApproved || isRejected}
        >
          <View style={styles.actionButtonContent}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkMark}>✓</Text>
            </View>
            <Text style={styles.actionButtonText}>Approve</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={() => onReject(document.id_document, document.document_name)}
          disabled={isRejected || isApproved}
        >
          <View style={styles.actionButtonContent}>
            <View style={styles.crossCircle}>
              <Text style={styles.crossMark}>✕</Text>
            </View>
            <Text style={styles.actionButtonText}>Reject</Text>
          </View>
        </TouchableOpacity>

        {(isApproved || isRejected) && (
          <View style={[
            styles.statusBadgeSmall,
            isApproved ? styles.statusApproved : styles.statusRejected
          ]}>
            <Text style={styles.statusBadgeText}>
              {statusText}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const AchievementCard = ({ 
  achievement, 
  onView 
}: { 
  achievement: AchievementItem; 
  onView: () => void;
}) => {
  const fileName = achievement.file_path ? achievement.file_path.split('/').pop() : 'Sertifikat.pdf';

  return (
    <View style={[styles.documentCard, { borderColor: '#189653' }]}> 
      <View style={styles.documentHeader}>
        <Text style={styles.documentName}>{achievement.achievement_name}</Text>
        <Text style={styles.achievementDetailText}>
           {achievement.achievement_level} - {achievement.year} {achievement.ranking ? `(${achievement.ranking})` : ''}
        </Text>
      </View>
      
      <View style={styles.documentBody}>
        <Text style={styles.fileIcon}>🏆</Text>
        <Text style={styles.filename} numberOfLines={1}>{fileName}</Text>
        
        <TouchableOpacity style={styles.viewButton} onPress={onView}>
          <Image 
            source={require('../../assets/icons/fi-sr-eye.png')} 
            style={styles.viewIcon1}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Bagian Status Otomatis */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5 }}>
         <View style={[styles.statusBadgeSmall, styles.statusApproved, { position: 'relative', left: 0, top: 0 }]}>
            <Text style={styles.statusBadgeText}>Opsional - Terlampir</Text>
         </View>
      </View>
    </View>
  );
};


// ===========================================
// 3. KOMPONEN MODAL (TIDAK BERUBAH)
// ===========================================

const ActionModal = ({
  isVisible,
  onClose,
  onConfirm,
  data, 
  isLoading = false,
}: {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (docId: number, reason: string | null) => void;
  data: DocumentAction | null;
  isLoading?: boolean;
}) => {
  const [reason, setReason] = useState('');
  useEffect(() => { if (isVisible) setReason(''); }, [isVisible, data]);
  if (!data) return null;

  const isReject = data.actionType === 'Reject';
  const actionText = isReject ? 'Tolak Dokumen' : 'Ya, Verifikasi';
  const title = isReject ? 'Tolak Dokumen' : 'Konfirmasi Verifikasi';
  const message = isReject 
    ? `Berikan alasan penolakan untuk dokumen (${data.document_name}).`
    : `Apakah anda yakin untuk memverifikasi dokumen (${data.document_name})?`;
    
  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <LinearGradient colors={['#F5E6C8', '#C4A962']} style={modalStyles.modalGradientBackground} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
          <Text style={modalStyles.modalTitle}>{title}</Text>
          {!isReject && (
            <View style={modalStyles.approveContent}>
              <Image source={require('../../assets/icons/Group 13886 (1).png')} style={modalStyles.mainIconSmall} resizeMode="contain" />
              <Text style={modalStyles.modalMessage}>{message}</Text>
            </View>
          )}
          {isReject && (
            <>
              <Text style={modalStyles.modalMessageSmall}>{message}</Text>
              <TextInput style={modalStyles.reasonInput} onChangeText={setReason} value={reason} multiline numberOfLines={4} placeholder="Alasan penolakan..." placeholderTextColor="#A9A9A9" />
            </>
          )}
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={modalStyles.buttonWrapper} disabled={isLoading}>
              <LinearGradient colors={['#D3D3D3', '#C0C0C0']} style={[modalStyles.buttonStyle, { borderWidth: 1 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={[modalStyles.buttonText, { color: '#000' }]}>Batal</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(data.docId, isReject ? reason : null)} style={modalStyles.buttonWrapper} disabled={isLoading || (isReject && !reason.trim())}>
              <LinearGradient colors={isReject ? ['#BE0414', '#BE0414'] : ['#189653', '#4CAF50']} style={[modalStyles.buttonStyle, { borderWidth: 1 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {isLoading ? <ActivityIndicator color='white' /> : <Text style={[modalStyles.buttonText, { color: 'white' }]}>{actionText}</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const ConfirmationModal = ({ isVisible, onClose, onConfirm, type, isLoading = false }: any) => {
  const isReject = type === 'Reject';
  const modalTitle = isReject ? 'Apakah anda yakin menolak semua dokumen pendaftar?' : 'Apakah anda yakin menyetujui semua dokumen pendaftar?';
  const actionText = isReject ? 'Reject' : 'Approve';
  
  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={modalStyles.centeredView}>
        <LinearGradient colors={['#F5E6C8', '#C4A962']} style={modalStyles.modalGradientBackground} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}>
          <Text style={modalStyles.modalTitle}>{modalTitle}</Text>
          <Image source={isReject ? require('../../assets/icons/Group 13886.png') : require('../../assets/icons/Group 13886 (1).png')} style={modalStyles.mainIcon} resizeMode="contain" />
          <View style={modalStyles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={modalStyles.buttonWrapper} disabled={isLoading}>
              <LinearGradient colors={isReject ? ['#4CAF50', '#189653'] : ['#BE0414', '#BE0414']} style={modalStyles.buttonStyle}><Text style={modalStyles.buttonText}>Batal</Text></LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={modalStyles.buttonWrapper} disabled={isLoading}>
              <LinearGradient colors={isReject ? ['#BE0414', '#BE0414'] : ['#4CAF50', '#189653']} style={modalStyles.buttonStyle}>
                {isLoading ? <ActivityIndicator color='white' /> : <Text style={[modalStyles.buttonText, { color: 'white' }]}>{actionText}</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};


// ===========================================
// 4. SCREEN UTAMA
// ===========================================

const VerifikasiDokumenScreen: React.FC<VerifikasiDokumenProps> = ({ route }) => {
  const navigation = useNavigation<VerifikasiDokumenNavigationProp>();
  const { id_profile, name, email, program_name } = route.params;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  // 🆕 State untuk Prestasi
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectModalVisible, setRejectModalVisible] = useState(false);
  const [isApproveModalVisible, setApproveModalVisible] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false); 
  const [applicantStatus, setApplicantStatus] = useState<string>('submitted');
  const [isActionModalVisible, setActionModalVisible] = useState(false);
  const [actionData, setActionData] = useState<DocumentAction | null>(null);
  const [isUpdatingIndividual, setIsUpdatingIndividual] = useState(false); 

  const fetchApplicantStatus = useCallback(async () => {
    try {
      const response = await managerService.getApplicantDetail(id_profile);
      if (response.success && response.data) {
        setApplicantStatus(response.data.registration_status);
      }
    } catch (error) {
      console.error("Gagal mengambil status pendaftar:", error);
    }
  }, [id_profile]);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchApplicantStatus(); 

      // 🆕 Ambil Dokumen DAN Prestasi secara paralel
      // Pastikan managerService.getApplicantAchievements sudah ada, 
      // jika belum, tambahkan di managerService.ts (mirip getApplicantDocuments)
      const [docsResponse, achievementsResponse] = await Promise.all([
         managerService.getApplicantDocuments(id_profile),
         managerService.getApplicantAchievements(id_profile).catch(() => ({ success: false, data: [] })) // Fallback jika endpoint error/kosong
      ]);
      
      // Handle Dokumen Wajib
      if (docsResponse.success) {
        const documentsData = docsResponse.data.documents || [];
        const mappedDocuments = documentsData.map((doc: any) => ({
          id_document: doc.id_document || doc.id || doc.document_id, 
          document_name: doc.name || 'Unknown Document', 
          file_url: doc.file_url || doc.file_path || '',
          file_path: doc.file_path || doc.file_url || '',
          verification_status: (doc.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected',
          rejection_reason: doc.rejection_reason || null,
        }));
        setDocuments(mappedDocuments);
      }

      // 🆕 Handle Dokumen Prestasi
      if (achievementsResponse.success && Array.isArray(achievementsResponse.data)) {
         setAchievements(achievementsResponse.data);
      } else {
         setAchievements([]);
      }

    } catch (error: any) {
      console.error('❌ Fetch data error:', error);
      Alert.alert('Error', error.message || 'Gagal memuat data pendaftar.');
    } finally {
      setIsLoading(false);
    }
  }, [id_profile, fetchApplicantStatus]);
  
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // --- ACTIONS ---

  const handleUpdateDocumentStatus = async (docId: number, status: 'approved' | 'rejected', notes: string | null) => {
    const dbStatus: DbStatus = status.charAt(0).toUpperCase() + status.slice(1) as DbStatus;
    try {
      setIsUpdatingIndividual(true);
      const defaultNotes = `${dbStatus} by Manager`;
      const payload = { status: dbStatus, notes: notes || (status === 'approved' ? defaultNotes : null) };
      
      await managerService.updateDocumentStatus(docId, payload);
      
      if (applicantStatus === 'submitted') {
        try {
            await managerService.updateApplicantStatus(id_profile, { status: 'reviewed', notes: 'Manager mulai memverifikasi dokumen.' });
            setApplicantStatus('reviewed'); 
        } catch (statusError) { console.error("Update status error:", statusError); }
      }
      
      setActionModalVisible(false); 
      setActionData(null); 
      fetchDocuments();
      Alert.alert('Berhasil', `Dokumen berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}.`);
      
    } catch (error: any) {
      Alert.alert('Gagal', error.message || `Gagal ${status} dokumen.`);
    } finally {
      setIsUpdatingIndividual(false);
    }
  };

  const handleApprove = (docId: number, document_name: string) => {
    setActionData({ docId, document_name, actionType: 'Approve' });
    setActionModalVisible(true);
  };
  
  const handleReject = (docId: number, document_name: string) => {
    setActionData({ docId, document_name, actionType: 'Reject' });
    setActionModalVisible(true);
  };
  
  const confirmAction = (docId: number, reason: string | null) => {
    if (!actionData) return;
    if (actionData.actionType === 'Reject' && (!reason || !reason.trim())) {
      Alert.alert('Perhatian', 'Alasan penolakan tidak boleh kosong.');
      return;
    }
    const status = actionData.actionType === 'Approve' ? 'approved' : 'rejected';
    handleUpdateDocumentStatus(docId, status, reason);
  };

  const handleView = (item: DocumentItem | AchievementItem, type: 'document' | 'achievement') => {
    const BASE_API_URL = 'http://172.27.86.208:8000/api'; 
    let FILE_ENDPOINT = '';
    let id = 0;

    if (type === 'document') {
        FILE_ENDPOINT = `/admin/document-file/${(item as DocumentItem).id_document}`;
    } else {
        // Asumsi endpoint untuk view achievement. Sesuaikan dengan route Laravel Anda
        FILE_ENDPOINT = `/admin/achievement-file/${(item as AchievementItem).id_achievement}`;
        // Jika endpoint backend belum support achievement, bisa gunakan direct link:
        // Linking.openURL(BASE_STORAGE_URL + item.file_path); return;
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

  const handleApproveAll = () => setApproveModalVisible(true);
  const confirmApproveAll = async () => {
    setIsUpdatingAll(true);
    setApproveModalVisible(false);
    try {
      const pendingDocs = documents.filter(d => d.verification_status !== 'approved');
      for (const doc of pendingDocs) {
        await managerService.updateDocumentStatus(doc.id_document, { status: 'Approved', notes: 'Approved by Manager (Bulk)' });
      }
      Alert.alert('Berhasil', 'Semua dokumen telah disetujui.');
      // @ts-ignore
      navigation.navigate('VerifikasiPembayaran', { id_profile, name, email, program_name }); 
    } catch (error: any) {
      Alert.alert('Gagal', error.message);
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const handleRejectAll = () => setRejectModalVisible(true);
  const confirmRejectAll = async () => {
    setIsUpdatingAll(true);
    setRejectModalVisible(false);
    try {
      await managerService.updateApplicantStatus(id_profile, { status: 'rejected', notes: 'Ditolak secara keseluruhan.' });
      Alert.alert('Berhasil', 'Pendaftar telah ditolak.');
      navigation.navigate('KelolaPendaftaran'); 
    } catch (error: any) {
      Alert.alert('Gagal', error.message);
    } finally {
      setIsUpdatingAll(false);
    }
  };

  const handleNext = () => {
    const hasPendingDocs = documents.some(doc => doc.verification_status === 'pending');
    if (hasPendingDocs) {
        Alert.alert(
            "Perhatian", 
            "Masih ada dokumen wajib yang berstatus 'Pending'.",
            [{ text: "Batal", style: 'cancel' }, { text: "Lanjut", onPress: () => {
                // @ts-ignore
                navigation.navigate('VerifikasiPembayaran', { id_profile, name, email, program_name });
            }}]
        );
    } else {
        // @ts-ignore
        navigation.navigate('VerifikasiPembayaran', { id_profile, name, email, program_name });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <ImageBackground source={require('../../assets/images/App Bar - Bottom.png')} style={styles.waveBackground} resizeMode="cover">
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} >
              <Image source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')} style={styles.backIcon1} resizeMode="contain" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verifikasi Dokumen</Text>
            <View style={styles.headerSpacer} />
          </View>
        </ImageBackground>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.applicantBadge}>
          <Text style={styles.applicantText}>{name} - Document Review</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color="#DABC4E" style={{ marginTop: 50 }} />
        ) : (
          <>
            {/* Bagian Dokumen Utama */}
            {documents.length > 0 ? (
                documents.map((doc) => (
                    <DocumentCard
                        key={doc.id_document}
                        document={doc}
                        onApprove={handleApprove}
                        onReject={handleReject}
                        onView={() => handleView(doc, 'document')}
                    />
                ))
            ) : (
                <Text style={{ color: '#FFF', textAlign: 'center', marginVertical: 10 }}>Tidak ada dokumen wajib.</Text>
            )}

            {/* 🆕 Bagian Dokumen Prestasi */}
            {achievements.length > 0 && (
                <View style={{ marginTop: 20 }}>
                    <View style={styles.sectionDivider}>
                        <Text style={styles.sectionTitle}>Dokumen Prestasi (Opsional)</Text>
                    </View>
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

        <View style={styles.finalActions}>
          <TouchableOpacity style={styles.approveAllButton} onPress={handleApproveAll} disabled={isUpdatingAll || isLoading}>
            <Text style={styles.approveAllText}>{isUpdatingAll ? 'Memproses...' : 'Approve All Documents'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectAllButton} onPress={handleRejectAll} disabled={isUpdatingAll || isLoading}>
            <Text style={styles.rejectAllText}>{isUpdatingAll ? 'Memproses...' : 'Reject Applicant'}</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={isUpdatingAll || isLoading}>
          <Image source={require('../../assets/icons/Vector5.png')} style={styles.nextIcon1} resizeMode="contain" />
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Image source={require('../../assets/images/logo-ugn.png')} style={styles.backgroundLogo} resizeMode="contain" />
      
      <ActionModal isVisible={isActionModalVisible} onClose={() => setActionModalVisible(false)} onConfirm={confirmAction} data={actionData} isLoading={isUpdatingIndividual} />
      <ConfirmationModal isVisible={isRejectModalVisible} onClose={() => setRejectModalVisible(false)} onConfirm={confirmRejectAll} type="Reject" isLoading={isUpdatingAll} />
      <ConfirmationModal isVisible={isApproveModalVisible} onClose={() => setApproveModalVisible(false)} onConfirm={confirmApproveAll} type="Approve" isLoading={isUpdatingAll} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... Styles lama tetap sama ...
  container: { flex: 1, backgroundColor: '#004225' },
  headerContainer: { height: 60 },
  waveBackground: { width: '100%', height: '100%', justifyContent: 'center' },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginLeft: 7, marginTop: 5 },
  backButton: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  backIcon1: { width: 24, height: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000', flex: 1, textAlign: 'center', left: 14, bottom: 4 },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  applicantBadge: { alignSelf: 'flex-start', backgroundColor: '#DABC4E', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 20, borderWidth: 2, borderColor: '#000000', opacity: 0.75 },
  applicantText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  
  // Card Style
  documentCard: { backgroundColor: '#F5E6C8', borderRadius: 15, padding: 15, marginBottom: 15, borderWidth: 2, borderStyle: 'dashed', borderColor: '#C4A962' },
  documentHeader: { marginBottom: 10 },
  documentName: { fontSize: 14, fontWeight: '600', color: '#004225' },
  achievementDetailText: { fontSize: 12, color: '#555', marginTop: 2, fontStyle: 'italic' },
  documentBody: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 12 },
  fileIcon: { fontSize: 18, marginRight: 8 },
  filename: { flex: 1, fontSize: 13, color: '#333' },
  viewButton: { padding: 5 },
  viewIcon1: { width: 18, height: 18 },
  documentActions: { flexDirection: 'row', right: 26 },
  
  // Buttons
  actionButton: { flex: 1, borderRadius: 20, paddingVertical: 8, marginHorizontal: 25 },
  approveButton: { backgroundColor: '#DABC4E' },
  rejectButton: { right: 42, backgroundColor: '#DABC4E' },
  actionButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  checkCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#189653', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  checkMark: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  crossCircle: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#BE0414', justifyContent: 'center', alignItems: 'center', marginRight: 6 },
  crossMark: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  actionButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  
  // Badges
  statusBadgeSmall: { position: 'absolute', left: 250, top: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#000000' },
  statusApproved: { backgroundColor: '#189653' },
  statusRejected: { backgroundColor: '#BE0414' },
  statusBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },

  // New Section Divider
  sectionDivider: { borderBottomWidth: 1, borderBottomColor: '#DABC4E', marginBottom: 15, paddingBottom: 5 },
  sectionTitle: { color: '#DABC4E', fontSize: 16, fontWeight: 'bold' },

  finalActions: { marginTop: 20, marginBottom: 30, paddingHorizontal: 62 },
  approveAllButton: { backgroundColor: '#189653', borderRadius: 25, paddingVertical: 6, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#000000' },
  approveAllText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  rejectAllButton: { backgroundColor: '#BE0414', borderRadius: 25, paddingVertical: 6, alignItems: 'center', borderWidth: 1, borderColor: '#000000' },
  rejectAllText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  nextButton: { alignSelf: 'flex-end', width: 46, height: 46, borderRadius: 28, backgroundColor: '#DABC4E', justifyContent: 'center', alignItems: 'center', bottom: 10, marginRight: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, borderWidth: 2, borderColor: '#000000' },
  nextIcon1: { width: 18, height: 18 },
  backgroundLogo: { position: 'absolute', bottom: -350, alignSelf: 'center', width: 950, height: 950, opacity: 0.15, zIndex: -1 },
});

// Modal Styles (Copied from original for completeness)
const modalStyles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalGradientBackground: { margin: 20, borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, borderWidth: 1, borderColor: '#000000', backgroundColor: '#F5E6C8', shadowOpacity: 0.25, width: '85%' },
  modalTitle: { marginBottom: 15, textAlign: 'center', fontSize: 18, fontWeight: 'bold', color: '#004225' },
  mainIcon: { width: 100, height: 100, marginBottom: 20 },
  approveContent: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 15, borderWidth: 2, borderColor: '#189653', borderStyle: 'dashed' },
  mainIconSmall: { width: 60, height: 60, marginBottom: 10 },
  modalMessage: { textAlign: 'center', fontSize: 16, color: '#333' },
  modalMessageSmall: { textAlign: 'center', fontSize: 14, color: '#333', marginBottom: 15 },
  reasonInput: { width: '100%', minHeight: 100, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#C4A962', padding: 10, marginBottom: 25, textAlignVertical: 'top', fontSize: 14, color: '#000', borderStyle: 'dashed' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  buttonWrapper: { flex: 1, marginHorizontal: 5 },
  buttonStyle: { borderRadius: 50, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center', borderWidth: 1, borderColor: '#000000' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
});

export default VerifikasiDokumenScreen;