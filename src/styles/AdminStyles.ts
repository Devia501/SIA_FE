// src/styles/AdminStyles.ts (Bagian yang diperbarui)

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const BOTTOM_NAV_HEIGHT = 50; 
const BOTTOM_NAV_SPACING = 20;

export const AdminStyles = StyleSheet.create({
  // --- Background & Container ---
  container: {
    flex: 1,
    backgroundColor: '#015023', // Warna hijau gelap utama
  },
  backgroundLogo: {
    position: 'absolute',
    bottom: -350,
    alignSelf: 'center',
    width: 950,
    height: 950,
    opacity: 0.15,
    zIndex: -1,
  },
  
  // --- HEADER UMUM (Baru ditambahkan/dipindahkan dari DashboardAdmin.tsx) ---
  headerContainer: {
    height: 62,
    // CATATAN: waveBackground akan memberikan visual melengkung
  },
  waveBackground: {
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 15,
    paddingHorizontal: 20, 
    position: 'relative', 
  },
  headerTitle: {
    marginLeft: 18,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000ff',
  },
  // --- AKHIR HEADER UMUM ---

  // ... (Gaya lainnya tetap sama) ...

  contentPadding: {
    paddingHorizontal: 20,
    marginTop: 20,
  },

  cardBase: {
    backgroundColor: '#F5E6D3',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#DABC4E',
  },

  primaryButton: {
    backgroundColor: '#DABC4E',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2d193ff',
    width: '85%',
    alignSelf: 'center',
    marginTop: 20, 
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },

  primaryButtonText1: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  
  bottomNav: {
    position: 'absolute',
    bottom: 55,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 4,
    borderColor: '#DABC4E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5E6D3',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#000',
    gap: 4,
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  navSpacer: {
    height: 100,
  }
});