import { StyleSheet } from 'react-native';

const PendaftaranStyles = StyleSheet.create({
  headerTop: {
    paddingTop: 15,
    alignItems: 'center',
  },
  headerTitleContainer: {
    backgroundColor: '#F5E6D3',
    paddingHorizontal: 36,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#000',
    top: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#015023',
  },
  progressContainer: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    alignItems: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  progressStep: {
    width: 50,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressStepActive: {
    backgroundColor: '#DABC4E',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  numberCircle: {
    width: 23,
    height: 23,
    borderRadius: 16,
    backgroundColor: '#F5E6D3',
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:20,
  },
  numberText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5E6D3',
  },
  formGroup: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#F5E6D3',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5E6D3',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: '#DABC4E',
  },
  prodiSection: {
    marginBottom: 30,
  },
  prodiSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5E6D3',
    marginBottom: 15,
    textAlign: 'center',
  },
  prodiCard: {
    backgroundColor: 'rgba(165, 159, 107, 0.6)',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#000',
  },
  prodiFormGroup: {
    gap: 8,
  },
  prodiLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#F5E6D3',
  },
  pickerContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  pickerInput: {
    backgroundColor: '#F5E6D3',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    paddingRight: 45,
    borderWidth: 1,
    borderColor: '#DABC4E',
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 14,
    color: '#000',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownIcon: {
    position: 'absolute',
    right: 15,
    width: 12,
    height: 20,
  },
  nextButton: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 30,
    marginBottom: 20, 
    alignSelf: 'center',
    width: '60%',
    marginLeft: 90,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#F5E6D3',
    borderRadius: 20,
    width: '85%',
    maxHeight: '60%',
    borderWidth: 2,
    borderColor: '#DABC4E',
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D7C5',
  },
  modalOptionSelected: {
    backgroundColor: '#DABC4E',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#000',
  },
  modalOptionTextSelected: {
    fontWeight: 'bold',
    color: '#fff',
  },
  uploadButton: {
  backgroundColor: '#F5E6D3',
  borderRadius: 20,
  borderWidth: 3,
  borderStyle: 'dashed',
  borderColor: '#DABC4E',
  paddingVertical: 20,
  paddingHorizontal: 20,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 8,
},

uploadContent: {
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
},

uploadIconCircle: {
  width: 25,
  height: 25,
  borderRadius: 25,
  backgroundColor: '#000',
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
},

uploadIcon: {
  width: 35,
  height: 35,
},

uploadedFileContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 10,
},

uploadedFileName: {
  fontSize: 14,
  fontWeight: '600',
  color: '#2D5F3F',
  marginBottom: 4,
  maxWidth: '90%',
  textAlign: 'center',
},

uploadedFileSize: {
  fontSize: 12,
  color: '#666',
},
documentActions: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 10,
},
viewButton: {
  flex: 1,
  backgroundColor: '#4A90E2',
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 8,
  alignItems: 'center',
},
viewButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},
deleteButton: {
  flex: 1,
  backgroundColor: '#BE0414',
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 8,
  alignItems: 'center',
},
deleteButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '600',
},
actionIcon: {
  width: 20,
},
dropdown: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#F4EDC9',
  borderWidth: 1,
  borderColor: '#000',
  borderRadius: 25,
  paddingHorizontal: 15,
  paddingVertical: 8,
  marginTop: 6,
},

dropdownText: {
  color: '#000',
  fontSize: 14,
  fontWeight: '500',
},


});

export default PendaftaranStyles;