import React from "react";
import { View, Text, SubmitButton, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../../constants/colors";

const Logout = () => {

  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.btn}
        onPress={() => {
            navigation.navigate('Login')
        }}>
        <Text style={styles.btnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Logout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white
  },
  btn: {
    width: '70%',
    height: 50,
    borderRadius: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 300,
    backgroundColor: colors.red
  },
})
