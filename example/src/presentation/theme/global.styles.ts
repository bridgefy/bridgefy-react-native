import { Platform, StyleSheet } from "react-native";

export const globalColors = {
  primaryColor: '#FF4040',
  secondaryColor: '#760000',
  inactiveColor: 'grey',
  nofocusColor: '#F6ADA3',
}

export const globalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: Platform.OS==='ios' ? 30 : 20,
  },
  log: {
    marginVertical: 3,
  },
  logSuccess: {
    color: 'green',
    fontWeight: 'normal',
  },
  logFinish: {
    color: globalColors.primaryColor,
  },
  logNormal: {
    color: 'black',
    fontWeight: 'normal',
  },
  logError: {
    color: 'crimson',
    fontWeight: 'bold',
  },
  flatlist: {
    borderColor: globalColors.primaryColor,
    borderWidth: 0.2,
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 10,
    color: 'black',
  },
  messageBuble: {
    borderRadius: 15,
    backgroundColor: globalColors.primaryColor,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    maxWidth: '80%',
  },
});