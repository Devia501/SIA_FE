import { StyleSheet } from 'react-native';

const AuthStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#015023', 
  },
  header: {
    backgroundColor: '#DABC4E', 
    height: 80,
    paddingHorizontal: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 8,
    borderBottomColor: '#FFFFFF',
  },
  logo: {
    width: 75,
    height: 75,
    marginBottom: 12,
    
  },
  headerText: {
    color: '#000000ff',
    marginTop: 10,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
    
  },
  formContainer: {
    paddingHorizontal: 40,
    paddingTop: 18,
  },
  title: { 
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 10,
    marginBottom: 10,
    marginLeft: 10,
  },
  input: {
    backgroundColor: '#ffffffff',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 18,
    fontSize: 14,
  },
  buttonSection: {
    paddingHorizontal: 82,
    paddingVertical: 200, 
  },
  primaryButton: {
    backgroundColor: '#DABC4E',
    borderRadius: 25,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: -43,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backgroundLogo: {
    position: 'absolute',
    top: 170,
    alignSelf: 'center',
    width: 500,
    height: 500,
    opacity: 0.20,
    zIndex: -1,
  },
});

export default AuthStyles;