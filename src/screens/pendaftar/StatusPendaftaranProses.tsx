import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
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

// Service
import { registrationService, Profile, Document } from '../../services/apiService';
import { paymentService } from '../../services/apiService';

type StatusPendaftaranProsesNavigationProp = NativeStackNavigationProp<
  PendaftarStackParamList,
  'StatusPendaftaranProses'
>;

// 東 STYLE ASLI + TAMBAHAN UNTUK ERROR
const COLORS = {
  PRIMARY_DARK: '#015023', 
  ACCENT_LIGHT: '#DABC4E', 
  ACCENT_BG: '#F5EFD3',    
  WHITE: '#FFFFFF',
  SUCCESS_LIGHT: '#D4F1E3', 
  ERROR_DARK: '#BE0414',   
  ERROR_LIGHT_BG: '#FCDEDE', 
  ERROR_BORDER: '#C83B4F', 
  TEXT_LIGHT: '#666',
  RED_DARK: '#A83232',
  ABU: '#999999',
};

// --- LOGIC HELPER ---
interface GroupedDocument {
    label: string;
    isUploaded: boolean;
    isRejected: boolean;
    isApproved: boolean;
    documents: Document[];
}

interface RejectedDocument {
    id_document: number;
    id_document_type: number; 
    document_name: string; 
    rejection_reason: string;
    file_path: string;
}

interface PaymentInfo {
    id: number;
    status: 'pending' | 'waiting_verification' | 'verified' | 'expired' | 'rejected';
    rejection_reason?: string;
    payment_proof_file?: string;
}

const DOC_ID = { KTP: 1, AKTA: 2, KK: 3, IJAZAH: 4, TRANSKRIP: 5, SKL: 6, PRESTASI: 7 };
const DOC_GROUPS_ALL = [
    { label: "Data Diri", docTypeIds: [DOC_ID.KTP, DOC_ID.AKTA] },
    { label: "Data Alamat", docTypeIds: [DOC_ID.KK] },
    { label: "Data Akademik", docTypeIds: [DOC_ID.IJAZAH, DOC_ID.TRANSKRIP, DOC_ID.SKL] },
    { label: "Data Prestasi", docTypeIds: [DOC_ID.PRESTASI] },
    { label: "Data Orang Tua", docTypeIds: [] }, 
    { label: "Pembayaran", docTypeIds: [] }, 
];
const DOCUMENT_ID_TO_NAME: Record<number, string> = {
    1: "KTP/Kitas", 2: "Akta Kelahiran", 3: "Kartu Keluarga", 4: "Ijazah", 
    5: "Transkrip Nilai", 6: "SKL", 7: "Sertifikat Prestasi",
};

// --- COMPONENTS (Updated from TungguKonfirmasi) ---

// 1. REJECTION MODAL (Updated Style) - Untuk Dokumen
const RejectionModal = ({ isVisible, onClose, document, onUploadUlang, isPayment = false, onPaymentUploadUlang }: any) => {
    if (!document) return null;
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => { if (isVisible) { setSelectedFile(null); setIsUploading(false); }}, [isVisible]);

    const handlePickFile = async () => {
        try {
            const result = await pick({ type: [types.pdf, types.images], allowMultiSelection: false });
            if (result && result.length > 0) {
                const file = result[0];
                if (file.size && file.size > 5 * 1024 * 1024) { Alert.alert("Peringatan", "Ukuran > 5MB."); return; }
                setSelectedFile({ uri: file.uri, name: file.name, type: file.type });
            }
        } catch (error) {}
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        
        setIsUploading(true);
        try {
            if (isPayment) {
                // Upload bukti pembayaran
                const formData = new FormData();
                formData.append('payment_proof', { 
                    uri: selectedFile.uri, 
                    name: selectedFile.name, 
                    type: selectedFile.type 
                } as any);
                
                if (onPaymentUploadUlang) {
                    await onPaymentUploadUlang(document.id, formData);
                }
            } else {
                // Upload dokumen biasa
                const formData = new FormData();
                formData.append('id_document_type', document.id_document_type.toString());
                formData.append('file', { 
                    uri: selectedFile.uri, 
                    name: selectedFile.name, 
                    type: selectedFile.type 
                } as any);
                
                if (onUploadUlang) {
                    await onUploadUlang(document.id_document_type, formData);
                }
            }
            
            onClose();
        } catch (e: any) {
            Alert.alert("Error", e.message || "Gagal mengunggah file");
        } finally { 
            setIsUploading(false); 
        }
    };

    return (
        <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <View style={localStyles.modalCenteredView}>
                <LinearGradient colors={['#F5E6C8', '#C4A962']} style={localStyles.modalGradientBackground}>
                    <View style={localStyles.modalHeaderRed}>
                        <Text style={localStyles.modalTitleRed}>
                            {isPayment ? 'Bukti Pembayaran Ditolak' : 'Dokumen Ditolak'}
                        </Text>
                        <Text style={localStyles.modalSubtitle}>
                            {isPayment ? 'Bukti Pembayaran' : document.document_name}
                        </Text>
                    </View>

                    <View style={localStyles.rejectionInfoCard}>
                        <View style={localStyles.infoIconCircle}>
                            <Text style={localStyles.infoIconText}>i</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={localStyles.rejectionReasonTitle}>Alasan Penolakan:</Text>
                            <Text style={localStyles.rejectionReasonText}>
                                {document.rejection_reason || 'Dokumen tidak valid.'}
                            </Text>
                        </View>
                    </View>

                    <View style={localStyles.uploadSection}>
                        <View style={localStyles.uploadBox}>
                            <Image source={require('../../assets/icons/Union.png')} style={localStyles.uploadIconSmall1} />
                            <Text style={localStyles.uploadTitle}>
                                {isPayment ? 'Upload Bukti Pembayaran Baru' : 'Upload Dokumen Baru'}
                            </Text>
                            <Text style={localStyles.uploadSubtitle}>
                                Pilih file (PDF, JPG, PNG maks 5MB)
                            </Text>
                            
                            {selectedFile ? (
                                <View style={localStyles.fileSelectedBox}>
                                    <Text style={localStyles.fileSelectedText} numberOfLines={1}>
                                        {selectedFile.name}
                                    </Text>
                                    <TouchableOpacity onPress={handlePickFile}>
                                         <Text style={localStyles.changeFileText}>Ganti File</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    style={localStyles.fileSelectButton} 
                                    onPress={handlePickFile} 
                                    disabled={isUploading}
                                >
                                    <Text style={localStyles.fileSelectButtonText}>Pilih File</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View style={localStyles.modalButtonContainer}>
                        <TouchableOpacity 
                            onPress={onClose} 
                            disabled={isUploading} 
                            style={localStyles.modalButtonWrapper}
                        >
                             <LinearGradient 
                                colors={['#D3D3D3', '#C0C0C0']} 
                                style={localStyles.modalButton}
                             >
                                <Text style={localStyles.modalButtonTextGrey}>Batal</Text>
                             </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleUpload} 
                            disabled={!selectedFile || isUploading} 
                            style={localStyles.modalButtonWrapper}
                        >
                             <LinearGradient 
                                colors={isUploading || !selectedFile ? ['#A9A9A9', '#7F7F7F'] : ['#189653', '#4CAF50']} 
                                style={localStyles.modalButton}
                             >
                                {isUploading ? (
                                    <ActivityIndicator size="small" color={COLORS.WHITE} />
                                ) : (
                                    <Image source={require('../../assets/icons/Union.png')} style={localStyles.uploadIconSmall}/>
                                )}
                                <Text style={localStyles.modalButtonTextGreen}>
                                    {isUploading ? 'Mengunggah...' : 'Upload Ulang'}
                                </Text>
                             </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </Modal>
    );
};

// 2. DROPDOWN CARD (Updated Style & Logic from TungguKonfirmasi)
const DropdownCard = ({ group, onRejectedDocumentPress, onRejectedPaymentPress }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    let icon;
    let iconColor;
    let countRejected = 0;

    if (group.label === "Pembayaran") {
        const statusPembayaran = group.isApproved ? 'approved' : group.isRejected ? 'rejected' : 'pending';
        icon = statusPembayaran === 'approved' ? '✓' : (statusPembayaran === 'rejected' ? '✕' : '•');
        iconColor = statusPembayaran === 'approved' ? '#2DB872' : 
                    statusPembayaran === 'rejected' ? COLORS.ERROR_DARK : '#DABC4E';
        
        // Jika pembayaran ditolak, hitung sebagai 1
        if (statusPembayaran === 'rejected') {
            countRejected = 1;
        }
    } else {
        countRejected = group.documents.filter((d:any) => d.verification_status === 'rejected').length;
        
        if (group.isRejected) { 
             icon = '✕';
             iconColor = COLORS.ERROR_DARK;
        } else if (group.isApproved) {
             icon = '✓';
             iconColor = '#2DB872';
        } else {
             icon = '•'; // Pending
             iconColor = '#DABC4E';
        }
    }

    const isClickable = countRejected > 0;

    return (
        <View style={localStyles.dokumenGridItem}>
            <TouchableOpacity 
                style={[
                    localStyles.dokumenCardDropdown, 
                    group.isRejected ? localStyles.dokumenCardInactive : localStyles.dokumenCardActive
                ]}
                onPress={() => isClickable && setIsExpanded(!isExpanded)}
                disabled={!isClickable} 
            >
                <View style={[localStyles.dokumenIcon, { backgroundColor: iconColor }]}>
                    {icon === '✓' ? (
                        <View style={localStyles.checkmarkSmall} />
                    ) : icon === '✕' ? (
                        <Text style={localStyles.crossMarkText}>✕</Text>
                    ) : (
                        <Text style={localStyles.pendingText}>•</Text>
                    )}
                </View>
                
                <Text style={localStyles.dokumenText}>{group.label}</Text>
                
                {isClickable && (
                    <>
                        <View style={localStyles.rejectedCountCircle}>
                            <Text style={localStyles.rejectedCountText}>{countRejected}</Text>
                        </View>
                        <Image 
                            source={require('../../assets/icons/Polygon 4.png')} 
                            style={[localStyles.dropdownIcon, isExpanded && localStyles.dropdownIconExpanded]} 
                            resizeMode="contain"
                        />
                    </>
                )}
            </TouchableOpacity>

            {isExpanded && isClickable && (
                <View style={localStyles.dropdownContent}>
                    {/* Tampilkan dokumen yang ditolak */}
                    {group.label !== "Pembayaran" && 
                     group.documents.filter((d:any) => d.verification_status === 'rejected').map((doc:any, idx:number) => (
                        <TouchableOpacity 
                            key={idx} 
                            style={[localStyles.docItem, localStyles.docItemRejected]}
                            onPress={() => onRejectedDocumentPress({
                                id_document: doc.id_document, 
                                id_document_type: doc.id_document_type,
                                document_name: DOCUMENT_ID_TO_NAME[doc.id_document_type], 
                                rejection_reason: doc.rejection_reason, 
                                file_path: doc.file_path
                            })}
                        >
                            <View style={localStyles.docIconRejected}>
                                <Text style={localStyles.docIconText}>✕</Text>
                            </View>
                            <Text style={localStyles.docItemLabel}>{DOCUMENT_ID_TO_NAME[doc.id_document_type]}</Text>
                            <Text style={localStyles.docItemActionText}>Tap untuk diperbaiki!</Text>
                        </TouchableOpacity>
                    ))}
                    
                    {/* Tampilkan pembayaran yang ditolak */}
                    {group.label === "Pembayaran" && group.isRejected && group.paymentInfo && (
                        <TouchableOpacity 
                            style={[localStyles.docItem, localStyles.docItemRejected]}
                            onPress={() => onRejectedPaymentPress(group.paymentInfo)}
                        >
                            <View style={localStyles.docIconRejected}>
                                <Text style={localStyles.docIconText}>✕</Text>
                            </View>
                            <Text style={localStyles.docItemLabel}>Bukti Pembayaran</Text>
                            <Text style={localStyles.docItemActionText}>Tap untuk diperbaiki!</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
};

// --- MAIN SCREEN ---

const StatusPendaftaranProses = () => {
  const navigation = useNavigation<StatusPendaftaranProsesNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [hasRejected, setHasRejected] = useState(false);
  const [groupedDocuments, setGroupedDocuments] = useState<GroupedDocument[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isRejectionModalVisible, setIsRejectionModalVisible] = useState(false);
  const [selectedRejectedDoc, setSelectedRejectedDoc] = useState<RejectedDocument | null>(null);
  const [selectedRejectedPayment, setSelectedRejectedPayment] = useState<PaymentInfo | null>(null);

  const loadStatusData = useCallback(async () => {
  setIsLoading(true);
  try {
      // Load profile
      const profile = await registrationService.getProfile();
      
      // Load documents
      const documents = await registrationService.getDocuments();
      
      // Load payment info
      let paymentData = null;
      try {
          const paymentResponse = await paymentService.getMyPayment();
          console.log('💳 Raw payment response:', paymentResponse); // ✅ Debugging
          if (paymentResponse && paymentResponse.payment) {
              paymentData = {
                  id: paymentResponse.payment.id,
                  status: paymentResponse.payment.status,
                  rejection_reason: paymentResponse.payment.rejection_reason,
                  payment_proof_file: paymentResponse.payment.payment_proof_file
              };
              console.log('💳 Processed payment data:', paymentData); // ✅ Debugging
          }
      } catch (error) {
          console.log('Payment data error:', error);
      }

      let foundRejected = false;
      const newGroupedDocuments: GroupedDocument[] = [];

      DOC_GROUPS_ALL.forEach(group => {
          const groupDocs: Document[] = [];
          let isRejectedByAdmin = false;
          let isApprovedByAdmin = true;
          let hasFiles = false;

          documents.forEach(doc => {
              if (group.docTypeIds.includes(doc.id_document_type)) {
                  groupDocs.push(doc); 
                  hasFiles = true;
                  if (doc.verification_status === 'rejected') isRejectedByAdmin = true;
                  if (doc.verification_status !== 'approved') isApprovedByAdmin = false;
              }
          });

          if (group.label === "Pembayaran") {
              // Cek status pembayaran
              if (paymentData) {
                  isRejectedByAdmin = paymentData.status === 'rejected';
                  isApprovedByAdmin = paymentData.status === 'verified';
                  hasFiles = !!paymentData.payment_proof_file;
                  
                  console.log(`💳 Payment status: ${paymentData.status}, rejected: ${isRejectedByAdmin}, reason: ${paymentData.rejection_reason}`); // ✅ Debugging
              } else {
                  isRejectedByAdmin = false;
                  isApprovedByAdmin = false;
                  hasFiles = false;
              }
          } else if (group.label === "Data Prestasi") {
               const hasPrestasiDocs = groupDocs.length > 0;
               if (!hasPrestasiDocs) {
                   isRejectedByAdmin = true;
                   isApprovedByAdmin = false;
               } else {
                   isRejectedByAdmin = isRejectedByAdmin; // Keep existing status
                   isApprovedByAdmin = !isRejectedByAdmin;
               }
          }

          if (isRejectedByAdmin) foundRejected = true;
          
          const groupData: GroupedDocument = { 
              label: group.label, 
              isUploaded: hasFiles, 
              isRejected: isRejectedByAdmin, 
              isApproved: isApprovedByAdmin, 
              documents: groupDocs 
          };
          
          // Tambahkan paymentInfo khusus untuk group Pembayaran
          if (group.label === "Pembayaran" && paymentData) {
              (groupData as any).paymentInfo = paymentData;
          }
          
          newGroupedDocuments.push(groupData);
      });

      const others = newGroupedDocuments.filter(g => g.label !== "Pembayaran");
      const payment = newGroupedDocuments.find(g => g.label === "Pembayaran");
      setGroupedDocuments(others.concat(payment ? [payment] : []));
      setHasRejected(foundRejected || (payment?.isRejected || false));
      setPaymentInfo(paymentData);

  } catch (e: any) { 
      Alert.alert("Error", e.message); 
  } finally { 
      setIsLoading(false); 
  }
}, []);

  const handleUploadUlang = async (id: number, formData: FormData) => {
    setIsUploading(true);
    try { 
        await registrationService.uploadDocument(formData); 
        await loadStatusData(); 
        Alert.alert("Sukses", "Dokumen terkirim."); 
    }
    catch (e: any) { 
        Alert.alert("Gagal", e.message); 
        throw e; 
    } finally { 
        setIsUploading(false); 
    }
  };

  const handlePaymentUploadUlang = async (paymentId: number, formData: FormData) => {
    setIsUploading(true);
    try {
        await paymentService.uploadProof(paymentId, formData);
        await loadStatusData();
        Alert.alert("Sukses", "Bukti pembayaran berhasil diunggah.");
    } catch (e: any) {
        Alert.alert("Gagal", e.message || "Gagal mengunggah bukti pembayaran");
        throw e;
    } finally {
        setIsUploading(false);
    }
  };

  useEffect(() => { 
    loadStatusData(); 
  }, [loadStatusData]);

  if (isLoading || isUploading) return <ActivityIndicator size="large" style={{flex:1, backgroundColor: COLORS.PRIMARY_DARK}} color={COLORS.ACCENT_LIGHT}/>;

  let statusTitle = "Proses Seleksi";
  let statusColor = COLORS.ACCENT_LIGHT;
  if (hasRejected) { 
    statusTitle = "Perbaikan Diperlukan"; 
    statusColor = COLORS.ERROR_DARK; 
  }

  return (
    <SafeAreaView style={localStyles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={PendaftarStyles.headerContainer}>
          <ImageBackground source={require('../../assets/images/Rectangle 52.png')} style={PendaftarStyles.waveBackground} resizeMode="cover">
            <View style={PendaftarStyles.headerContentV2}>
              <TouchableOpacity style={PendaftarStyles.backButton} onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')} style={[PendaftarStyles.navIconImage, { tintColor: COLORS.ACCENT_BG }]} resizeMode="contain"/>
              </TouchableOpacity>
              <View><Text style={localStyles.headerTitle}>Status Pendaftaran</Text></View>
            </View>
          </ImageBackground>
        </View>

        <View style={localStyles.content}>
          <View style={[localStyles.statusCard, {borderColor: statusColor}]}>
            <View style={localStyles.iconCircle}>
              <Image source={require('../../assets/icons/Group 13890.png')} style={localStyles.clockIcon} resizeMode="contain"/>
            </View>
            <Text style={localStyles.statusTitle}>{statusTitle}</Text>
            <Text style={localStyles.statusTitle}>Sedang Di Proses</Text>
            <View>
                <LinearGradient colors={[COLORS.WHITE, COLORS.ABU]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 1 }} style={localStyles.infoButton}>
                    <Text style={localStyles.infoButtonText}>Menunggu Hasil Seleksi</Text>
                </LinearGradient>
            </View>
          </View>

          <View style={localStyles.progressBadge}><Text style={localStyles.progressText}>Progress</Text></View>
          
          <View style={localStyles.progressContainer}>
            <View style={localStyles.stepContainer}>
              {/* Step 1 & 2 Completed */}
              <View style={localStyles.stepWrapper}>
                <View style={[localStyles.stepCircle, localStyles.stepCompleted]}><View style={localStyles.checkmark} /></View><Text style={localStyles.stepLabel}>Dokumen Diupload</Text>
              </View>
              <View style={[localStyles.stepLine, localStyles.lineCompleted]} />
              <View style={localStyles.stepWrapper}>
                <View style={[localStyles.stepCircle, localStyles.stepCompleted]}><View style={localStyles.checkmark} /></View><Text style={localStyles.stepLabel}>Konfirmasi{'\n'}Data</Text>
              </View>
              <View style={[localStyles.stepLine, localStyles.lineCompleted]} />
              
              {/* Step 3 Active */}
              <View style={localStyles.stepWrapper}>
                <View style={[localStyles.stepCircle, localStyles.stepActive]}><Image source={require('../../assets/icons/bxs_map.png')} style={localStyles.stepIcon} resizeMode="contain"/></View><Text style={localStyles.stepLabel}>Proses {'\n'}Seleksi</Text>
              </View>
              <View style={localStyles.stepLine} />
              
              <View style={localStyles.stepWrapper}>
                <View style={localStyles.stepCircle} /><Text style={localStyles.stepLabel}>Pengumuman Hasil</Text>
              </View>
            </View>
          </View>

          <View style={localStyles.dokumenSection}>
            <Text style={localStyles.sectionTitle}>Hasil Verifikasi Dokumen</Text>
            
            {/* ALERT PENOLAKAN SAMA PERSIS */}
            {hasRejected && (
                <View style={localStyles.rejectionAlert}>
                    <View style={localStyles.infoIconCircleRed}>
                        <Text style={localStyles.infoIconText}>i</Text>
                    </View>
                    <Text style={localStyles.rejectionAlertText}>
                        Ada dokumen atau data yang ditolak/belum lengkap! Klik kartu berlogo ✕ untuk melihat dan memperbaikinya.
                    </Text>
                </View>
            )}

            <View style={localStyles.dokumenGrid}>
              {groupedDocuments.map((group, idx) => (
                <DropdownCard 
                  key={idx} 
                  group={group} 
                  onRejectedDocumentPress={(doc:any) => { 
                    setSelectedRejectedDoc(doc); 
                    setSelectedRejectedPayment(null);
                    setIsRejectionModalVisible(true); 
                  }} 
                  onRejectedPaymentPress={(payment:any) => {
                    setSelectedRejectedPayment(payment);
                    setSelectedRejectedDoc(null);
                    setIsRejectionModalVisible(true);
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal untuk dokumen atau pembayaran yang ditolak */}
      <RejectionModal 
        isVisible={isRejectionModalVisible} 
        onClose={() => {
          setIsRejectionModalVisible(false);
          setSelectedRejectedDoc(null);
          setSelectedRejectedPayment(null);
        }} 
        document={selectedRejectedDoc || selectedRejectedPayment} 
        onUploadUlang={handleUploadUlang}
        isPayment={!!selectedRejectedPayment}
        onPaymentUploadUlang={selectedRejectedPayment ? 
          (paymentId: number, formData: FormData) => handlePaymentUploadUlang(paymentId, formData) : 
          undefined
        }
      />

      <Image source={require('../../assets/images/logo-ugn.png')} style={PendaftarStyles.backgroundLogo} resizeMode="contain"/>

      <View style={[PendaftarStyles.bottomNav, localStyles.nav]}>
        <TouchableOpacity style={PendaftarStyles.navItem} onPress={() => navigation.navigate('PendaftarDashboard')}>
          <Image source={require('../../assets/icons/material-symbols_home-rounded.png')} style={PendaftarStyles.navIconImage} resizeMode="contain"/>
        </TouchableOpacity>
        <TouchableOpacity style={PendaftarStyles.navItem} onPress={() => navigation.navigate('TataCara')}>
          <Image source={require('../../assets/icons/clarity_form-line.png')} style={PendaftarStyles.navIconImage} resizeMode="contain"/>
        </TouchableOpacity>
        <TouchableOpacity style={[PendaftarStyles.navItem]}>
          <View style={PendaftarStyles.navItemActive}>
            <Image source={require('../../assets/icons/fluent_shifts-activity.png')} style={PendaftarStyles.navIconImage} resizeMode="contain"/>
            <Text style={PendaftarStyles.navTextActive}>Status</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={PendaftarStyles.navItem} onPress={() => navigation.navigate('Profile')}>
          <Image source={require('../../assets/icons/ix_user-profile-filled.png')} style={PendaftarStyles.navIconImage} resizeMode="contain"/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.PRIMARY_DARK },
  nav: { bottom: 84 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.PRIMARY_DARK, left: 50 },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 100 },

  // Base Styles
  statusCard: { backgroundColor: COLORS.ACCENT_BG, borderRadius: 20, borderWidth: 2, borderColor: COLORS.ACCENT_LIGHT, padding: 25, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.PRIMARY_DARK, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  clockIcon: { width: 60, height: 60 },
  statusTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000ff', textAlign: 'center' },
  infoButton: { borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, marginTop: 15, borderWidth: 1, borderColor: '#000000ff' },
  infoButtonText: { fontSize: 12, color: '#000000ff', fontWeight: '600' },
  
  progressBadge: { backgroundColor: COLORS.ACCENT_LIGHT, borderRadius: 15, paddingVertical: 6, paddingHorizontal: 20, alignSelf: 'flex-start', marginVertical: 20 },
  progressText: { fontSize: 14, fontWeight: 'bold', color: '#ffffffff' },
  progressContainer: { marginBottom: 30 },
  stepContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepWrapper: { alignItems: 'center', width: 70 },
  stepCircle: { width: 30, height: 30, borderRadius: 20, backgroundColor: '#E8E8E8', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 2, borderColor: '#000000ff' },
  stepCompleted: { backgroundColor: COLORS.ACCENT_LIGHT, borderColor: '#000000ff' },
  stepActive: { backgroundColor: '#000000ff', borderColor: '#000000ff' },
  checkmark: { width: 8, height: 16, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#000000ff', transform: [{ rotate: '45deg' }], marginBottom: 5 },
  stepIcon: { width: 18, height: 18, tintColor: COLORS.WHITE },
  stepLabel: { fontSize: 10, color: COLORS.WHITE, textAlign: 'center', lineHeight: 12, marginTop: 5 },
  stepLine: { position: 'absolute', height: 3, backgroundColor: COLORS.ACCENT_LIGHT, zIndex: -1, top: 15, flex: 1, marginHorizontal: 42, width: '80%', marginBottom: 35 },
  lineCompleted: { backgroundColor: COLORS.ACCENT_LIGHT },

  dokumenSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.WHITE, marginBottom: 15 },
  dokumenGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },

  // --- STYLE TAMBAHAN (Updated to match TungguKonfirmasi exactly) ---
  dokumenGridItem: { width: '48%', marginBottom: 5 },
  dokumenCardDropdown: { backgroundColor: COLORS.ACCENT_BG, borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderStyle: 'dashed', borderColor: '#DABC4E', height: 60 },
  dokumenCardActive: { borderColor: '#DABC4E' },
  dokumenCardInactive: { borderColor: COLORS.ERROR_DARK },
  dokumenIcon: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  checkmarkSmall: { width: 6, height: 12, borderBottomWidth: 2, borderRightWidth: 2, borderColor: COLORS.WHITE, transform: [{ rotate: '45deg' }], marginBottom: 3 },
  crossMarkText: { color: COLORS.WHITE, fontWeight: 'bold', fontSize: 14, lineHeight: 18 },
  pendingText: { color: COLORS.WHITE, fontWeight: 'bold', fontSize: 20, lineHeight: 20, marginTop: -3 },
  rejectedCountCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.ERROR_DARK, justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  rejectedCountText: { color: COLORS.WHITE, fontSize: 10, fontWeight: 'bold' },
  dropdownIcon: { width: 15, height: 15, transform: [{ rotate: '0deg' }] },
  dropdownIconExpanded: { transform: [{ rotate: '180deg' }] },
  dropdownContent: { backgroundColor: COLORS.ACCENT_BG, borderRadius: 10, marginTop: 2, padding: 5, borderWidth: 1, borderColor: '#C4A962' },
  docItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, marginBottom: 3 },
  docItemRejected: { backgroundColor: COLORS.ERROR_LIGHT_BG, borderColor: COLORS.ERROR_DARK, borderWidth: 1, borderStyle: 'dashed' },
  docIconRejected: { width: 15, height: 15, borderRadius: 10, backgroundColor: COLORS.ERROR_DARK, justifyContent: 'center', alignItems: 'center', marginRight: 5 },
  docIconText: { color: COLORS.WHITE, fontWeight: 'bold', fontSize: 10 },
  docItemLabel: { fontSize: 8, color: '#000', flex: 1 },
  docItemActionText: { fontSize: 6, color: COLORS.ERROR_DARK, fontWeight: 'bold' },
  dokumenText: { fontSize: 12, color: COLORS.PRIMARY_DARK, fontWeight: '600', flex: 1 },
  
  rejectionAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.ERROR_LIGHT_BG, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: COLORS.ERROR_BORDER, marginBottom: 15, gap: 10 },
  infoIconCircleRed: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.ERROR_BORDER, justifyContent: 'center', alignItems: 'center' },
  rejectionAlertText: { flex: 1, fontSize: 10, color: COLORS.ERROR_DARK, fontWeight: '500' },
  infoIconText: { color: COLORS.WHITE, fontSize: 12, fontWeight: 'bold' },

  // Modal Styles (Matches TungguKonfirmasi)
  modalCenteredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  modalGradientBackground: { margin: 20, borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, width: '85%' },
  modalHeaderRed: { width: '100%', backgroundColor: COLORS.ERROR_DARK, padding: 15, borderRadius: 10, marginBottom: 20, alignItems: 'flex-start' },
  modalTitleRed: { fontSize: 18, fontWeight: 'bold', color: COLORS.WHITE, marginBottom: 5 },
  modalSubtitle: { fontSize: 14, color: COLORS.WHITE },
  
  rejectionInfoCard: { flexDirection: 'row', backgroundColor: COLORS.ERROR_LIGHT_BG, borderRadius: 10, borderWidth: 1, borderColor: COLORS.ERROR_DARK, padding: 15, width: '100%', gap: 10, marginBottom: 20 },
  infoIconCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.ERROR_DARK, justifyContent: 'center', alignItems: 'center' },
  rejectionReasonTitle: { fontSize: 12, fontWeight: 'bold', color: COLORS.ERROR_DARK, marginBottom: 2 },
  rejectionReasonText: { fontSize: 14, color: '#333' },
  
  uploadSection: { width: '100%', marginBottom: 25 },
  uploadBox: { borderWidth: 2, borderColor: COLORS.ACCENT_LIGHT, borderStyle: 'dashed', borderRadius: 10, padding: 20, alignItems: 'center' },
  uploadIconSmall1: { width: 18, height: 18, marginBottom: 5 },
  uploadTitle: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  uploadSubtitle: { fontSize: 12, color: COLORS.TEXT_LIGHT, marginBottom: 10 },
  
  fileSelectButton: { backgroundColor: COLORS.ACCENT_LIGHT, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 25 },
  fileSelectButtonText: { color: COLORS.WHITE, fontWeight: 'bold', fontSize: 14 },
  fileSelectedBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: COLORS.WHITE, borderRadius: 5, borderWidth: 1, borderColor: COLORS.ACCENT_LIGHT },
  fileSelectedText: { fontSize: 12, color: COLORS.PRIMARY_DARK, flexShrink: 1, marginRight: 10 },
  changeFileText: { fontSize: 10, color: COLORS.RED_DARK, fontWeight: 'bold' },

  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButtonWrapper: { flex: 1, marginHorizontal: 5 },
  modalButton: { borderRadius: 50, paddingVertical: 10, paddingHorizontal: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 5 },
  modalButtonTextGrey: { color: COLORS.TEXT_LIGHT, fontWeight: 'bold', fontSize: 12 },
  modalButtonTextGreen: { color: COLORS.WHITE, fontWeight: 'bold', fontSize: 12 },
  uploadIconSmall: { width: 18, height: 18, tintColor: COLORS.WHITE },
});

export default StatusPendaftaranProses;