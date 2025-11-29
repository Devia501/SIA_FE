import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

/** Warna Utama */
export const Colors = {
  primary: '#015023', // Hijau Tua
  secondary: '#DABC4E', // Kuning Emas
  backgroundLight: '#F5E6D3', // Krem/Kuning Muda
  textDark: '#000000ff', // Hitam
  textLight: '#FFF', // Putih
  statusApproved: '#53A95B', // Hijau Status Lulus/Approved
  statusRejected: '#DC2626', // Merah Status Tidak Lulus/Rejected
  statusPending: '#F5BE40', // Kuning Status Pending
  borderSecondary: '#e6c85fff', // Border kuning untuk tombol
};

/** Style Dasar Layout dan Komponen Bersama */
export const ManagerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  // --- Header ---
  headerContainer: {
    height: 60,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  // Style untuk tombol ikon di header
  headerIconContainer: {
    position: 'absolute',
    right: 20,
    top: 15,
    padding: 5,
  },
  headerIconContainerLeft: {
    position: 'absolute',
    left: 20,
    top: 15,
    padding: 5,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  // --- Bottom Navigation ---
  bottomNav: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.textLight,
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 4,
    borderColor: Colors.secondary,
    shadowColor: Colors.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.textDark,
    gap: 4,
  },
  navIcon: {
    width: 24,
    height: 24,
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  // --- Background Logo ---
  backgroundLogo: {
    position: 'absolute',
    bottom: -350,
    alignSelf: 'center',
    width: 950,
    height: 950,
    opacity: 0.15,
    zIndex: -1
    },
  // --- Common Card Styles ---
  centeredCard: {
    alignSelf: 'center',
    width: width * 0.85,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  // --- Common Button Styles ---
  primaryButton: {
    backgroundColor: Colors.secondary,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.borderSecondary,
    alignSelf: 'center',
    width: width * 0.85,
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 100,
    borderWidth: 2,
    borderColor: Colors.secondary,
    alignSelf: 'center',
    width: width * 0.85,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
});