import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ImageBackground,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import api from '../../services/api';
import { ManagerStyles } from '../../styles/ManagerStyles'; 
import { AdminStyles } from '../../styles/AdminStyles'; 
import { ManagerStackParamList } from '../../navigation/ManagerNavigator'; 

type ManageNotificationNavigationProp = NativeStackNavigationProp<
  ManagerStackParamList, 
  'ManageNotification'
>;

// Options untuk dropdown
const TARGET_AUDIENCE_OPTIONS = [
  'All Applicants',
  'Pending Applicants',
  'Approved Applicants',
  'Rejected Applicants',
];

const NOTIFICATION_TYPES = [
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Important', value: 'important' },
  { label: 'Success', value: 'success' },
];

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
  selectedValue 
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableOpacity 
      style={localStyles.modalOverlay} 
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        style={localStyles.modalContent}
        onPress={(e) => e.stopPropagation()}
      >
        <ScrollView style={localStyles.modalScrollView}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                localStyles.modalOption,
                selectedValue === option && localStyles.modalOptionSelected
              ]}
              onPress={() => {
                console.log('Selected option:', option);
                onSelect(option);
                onClose();
              }}
            >
              <Text style={[
                localStyles.modalOptionText,
                selectedValue === option && localStyles.modalOptionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

const ManageNotification: React.FC = () => {
  const navigation = useNavigation<ManageNotificationNavigationProp>();
  const [targetAudience, setTargetAudience] = useState('All Applicants');
  const [notificationType, setNotificationType] = useState('info');
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [showTargetAudienceModal, setShowTargetAudienceModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('showTargetAudienceModal:', showTargetAudienceModal);
    console.log('showTypeModal:', showTypeModal);
  }, [showTargetAudienceModal, showTypeModal]);

  const handleSendNotification = async () => {
    console.log('🔘 Send button pressed!');
    console.log('Title:', messageTitle);
    console.log('Content:', messageContent);
    
    // Validasi input
    if (!messageTitle.trim()) {
      Alert.alert('Error', 'Please enter a message title');
      return;
    }
    
    if (!messageContent.trim()) {
      Alert.alert('Error', 'Please enter message content');
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔄 Sending notification...');
      
      const payload = {
        title: messageTitle.trim(),
        message: messageContent.trim(),
        type: notificationType,
      };

      console.log('📦 Payload:', payload);

      const response = await api.post('/notifications/send', payload);

      console.log('✅ Response:', response.data);

      if (response.data && response.data.success) {
        Alert.alert(
          'Success',
          `Notification sent successfully to ${response.data.data?.notifications_sent || 'all'} applicants!`,
          [
            {
              text: 'OK',
              onPress: () => {
                setMessageTitle('');
                setMessageContent('');
                setTargetAudience('All Applicants');
                setNotificationType('info');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('❌ Error sending notification:', error);
      
      let errorMessage = 'Failed to send notification. Please try again.';
      
      if (error.response) {
        console.error('Server Error:', error.response.data);
        
        if (error.response.status === 403) {
          errorMessage = 'Unauthorized. Only admin and manager can send notifications.';
        } else if (error.response.status === 422) {
          errorMessage = 'Validation error: ' + (error.response.data.message || 'Invalid data');
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
        
      } else if (error.request) {
        console.error('Network Error:', error.request);
        errorMessage = 'Cannot connect to server. Please check your connection.';
      } else {
        console.error('Error:', error.message);
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (value: string) => {
    const type = NOTIFICATION_TYPES.find(t => t.value === value);
    return type ? type.label : 'Info';
  };

  const handleTargetAudiencePress = () => {
    console.log('📍 Target Audience pressed');
    setOpenDropdown('targetAudience');
    setShowTargetAudienceModal(true);
  };

  const handleTypePress = () => {
    console.log('📍 Type pressed');
    setOpenDropdown('notificationType');
    setShowTypeModal(true);
  };

  const handleCloseTargetAudienceModal = () => {
    console.log('❌ Closing Target Audience Modal');
    setShowTargetAudienceModal(false);
    setOpenDropdown(null);
  };

  const handleCloseTypeModal = () => {
    console.log('❌ Closing Type Modal');
    setShowTypeModal(false);
    setOpenDropdown(null);
  };

  return (
    <SafeAreaView style={AdminStyles.container} edges={['top', 'bottom']}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={localStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={AdminStyles.headerContainer}>
          <ImageBackground
            source={require('../../assets/images/App Bar - Bottom.png')}
            style={AdminStyles.waveBackground}
            resizeMode="cover"
          >
            <View style={AdminStyles.headerContent}>
              <TouchableOpacity
                style={ManagerStyles.headerIconContainerLeft}
                onPress={() => navigation.goBack()}
              >
                <Image
                  source={require('../../assets/icons/material-symbols_arrow-back-rounded.png')}
                  style={ManagerStyles.headerIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={AdminStyles.headerTitle}>Manage Notifications</Text>
            </View>
          </ImageBackground>
        </View>

        {/* Content Section */}
        <View style={localStyles.contentContainer}>
          {/* Broadcast Notifications Label */}
          <View style={localStyles.broadcastHeader}>
            <Text style={localStyles.broadcastText}>Broadcast Notifications</Text>
          </View>

          {/* Target Audience */}
          <View style={localStyles.formGroup}>
            <Text style={localStyles.label}>Target Audience</Text>
            <TouchableOpacity 
              style={localStyles.pickerContainer}
              onPress={handleTargetAudiencePress}
              activeOpacity={0.7}
            >
              <View style={localStyles.pickerInput}>
                <Text style={localStyles.pickerText}>
                  {targetAudience}
                </Text>
              </View>
              <Image
                source={
                  openDropdown === 'targetAudience'
                    ? require('../../assets/icons/Polygon 5.png')
                    : require('../../assets/icons/Polygon 4.png')
                }
                style={localStyles.dropdownIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Notification Type */}
          <View style={localStyles.formGroup}>
            <Text style={localStyles.label}>Notification Type</Text>
            <TouchableOpacity 
              style={localStyles.pickerContainer}
              onPress={handleTypePress}
              activeOpacity={0.7}
            >
              <View style={localStyles.pickerInput}>
                <Text style={localStyles.pickerText}>
                  {getTypeLabel(notificationType)}
                </Text>
              </View>
              <Image
                source={
                  openDropdown === 'notificationType'
                    ? require('../../assets/icons/Polygon 5.png')
                    : require('../../assets/icons/Polygon 4.png')
                }
                style={localStyles.dropdownIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Message Title */}
          <View style={localStyles.formGroup}>
            <Text style={localStyles.label}>Message Title</Text>
            <TextInput
              style={localStyles.input}
              placeholder="Important Registration Update"
              placeholderTextColor="#999"
              value={messageTitle}
              onChangeText={setMessageTitle}
              maxLength={255}
            />
          </View>

          {/* Message Content */}
          <View style={localStyles.formGroup}>
            <Text style={localStyles.label}>Message Content</Text>
            <TextInput
              style={localStyles.textArea}
              placeholder="Dear applicants, please note that..."
              placeholderTextColor="#999"
              value={messageContent}
              onChangeText={setMessageContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          {/* Send Notifications Button */}
          <TouchableOpacity 
            onPress={handleSendNotification}
            disabled={isLoading}
            activeOpacity={0.8}
            style={[
              localStyles.sendButtonWrapper,
              isLoading && localStyles.sendButtonDisabled
            ]}
          >
            <LinearGradient
              colors={['#DABC4E', '#EFE3B0']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 1 }}
              style={localStyles.sendButton}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={localStyles.sendButtonText}>
                  Send Notifications
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Background Logo */}
      <Image
        source={require('../../assets/images/logo-ugn.png')}
        style={AdminStyles.backgroundLogo}
        resizeMode="contain"
      />

      {/* Target Audience Dropdown Modal */}
      <DropdownModal
        visible={showTargetAudienceModal}
        onClose={handleCloseTargetAudienceModal}
        options={TARGET_AUDIENCE_OPTIONS}
        onSelect={(value) => {
          console.log('Target audience selected:', value);
          setTargetAudience(value);
        }}
        selectedValue={targetAudience}
      />

      {/* Notification Type Modal */}
      <DropdownModal
        visible={showTypeModal}
        onClose={handleCloseTypeModal}
        options={NOTIFICATION_TYPES.map(type => type.label)}
        onSelect={(label) => {
          console.log('Type label selected:', label);
          const type = NOTIFICATION_TYPES.find(t => t.label === label);
          if (type) {
            console.log('Type value:', type.value);
            setNotificationType(type.value);
          }
        }}
        selectedValue={getTypeLabel(notificationType)}
      />
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  broadcastHeader: {
    alignSelf: 'flex-start',
    backgroundColor: '#DABC4E',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#000000ff',
    opacity: 0.75,
  },
  broadcastText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerInput: {
    flex: 1,
  },
  pickerText: {
    fontSize: 14,
    color: '#000',
  },
  dropdownIcon: {
    width: 12,
    height: 8,
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    backgroundColor: '#F5ECD7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: '#000',
    borderWidth: 2,
    borderColor: '#DABC4E',
    borderStyle: 'dashed',
    minHeight: 150,
  },
  sendButtonWrapper: {
    marginTop: 20,
    width: '100%',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButton: {
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    padding: 8,
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalOptionSelected: {
    backgroundColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#000',
  },
  modalOptionTextSelected: {
    fontWeight: 'bold',
    color: '#015023',
  },
});

export default ManageNotification;