import React, {useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  NativeEventEmitter,
  EmitterSubscription,
  NativeModules,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import colors from '../../constants/colors'
import Loader from "../../src/components/Loader";

const Login = ({ navigation }) => {

    const [nickName, setNickName] = useState('')
    const [userId, setUserId] = useState(uuid.v4())
    const [visible, setVisible] = useState(false)

    const loginUser = () => {
        setVisible(true)
        goToNext(nickName, userId).then(() => {})
        setVisible(false)
    }

    const goToNext = async (name, userId) => {
        await AsyncStorage.setItem('NAME', name)
        await AsyncStorage.setItem('USERID', userId)
        navigation.navigate('Main')
    }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={[styles.input, {marginTop: 100}]}
        placeholder="User ID"
        editable={false}
        onChangeText={(text) => setUserId(text)}
        value= {userId}
      />
        <TextInput
            style={[styles.input, {marginTop: 100}]}
            placeholder="Alias"
            autoCapitalize="none"
            onChangeText={(text) => setNickName(text)}
            value={nickName}
        />
        <TouchableOpacity
            style={styles.btn}
            onPress={() => {
                loginUser()
            }}>
            <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>

        <Loader visible={visible}/>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    },
    title: {
        fontSize: 30,
        color: colors.black,
        alignSelf: 'center',
        marginTop: 100,
        fontWeight: '600'
    },
    input: {
        width: '90%',
        height: 50,
        borderWidth: 0.5,
        borderRadius: 10,
        marginTop: 50,
        alignSelf: 'center',
        paddingLeft: 20
    },
    btn: {
        width: '90%',
        height: 50,
        borderRadius: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        backgroundColor: colors.green
    },
    btnText: {
        color: colors.white,
        fontSize: 17
    },
    btnLogin: {
        alignSelf: 'center',
        marginTop: 20,
        textDecorationLine: 'underline',
        fontWeight: '600',
        color: colors.black
    },
})
