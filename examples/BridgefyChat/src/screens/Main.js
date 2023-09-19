import React, {useEffect, useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity, NativeEventEmitter, NativeModules, Alert} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import colors from "../../constants/colors";
import Users from "../tabs/Users";
import Logout from "../tabs/Logout";
import {BridgefyEvents, BridgefyPropagationProfile} from "bridgefy-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Broadcast from "../tabs/Broadcast";
import LoadBroadcast from "../tabs/LoadBroadcast";

const Main = ({ route }) => {
  const { bridgefy } = route.params
  const Tab = createBottomTabNavigator();

  const startNearBy = async ()=>{
    const userId = await AsyncStorage.getItem("USERID")
    bridgefy.start(userId, BridgefyPropagationProfile.standard)
  }

  const log = (event, body, error = false) => {
    if (error) {
      console.error(event, body);
    } else {
      console.log(event, body);
    }
  }

  useEffect(() => {
    startNearBy().then()
    const subscriptions = []
    const nativeEventEmitter = new NativeEventEmitter()
    subscriptions.push(
      nativeEventEmitter.addListener(BridgefyEvents.bridgefyDidStart, (event) => {
        log("bridgefyDidStart", event, false)
      }))

    subscriptions.push(
      nativeEventEmitter.addListener(BridgefyEvents.bridgefyDidFailToStart, (event) => {
        log("bridgefyDidFailToStart",event, true)
      }))

    return () => {
      for (const sub of subscriptions) {
        sub.remove();
      }
    };
  }, [])

  return (
    <Tab.Navigator>
      <Tab.Screen name="NearBy" component={ Users } initialParams={{ bridgefy: bridgefy }} options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="near-me" color={color} size={size} />
        ),
      }}/>
      <Tab.Screen name="Broadcast" component={ LoadBroadcast }
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="broadcast" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Logout"
        component={ Logout }
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="logout" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
    );
};

export default Main;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white
    },
    bottomTab: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 70,
        backgroundColor: colors.green,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    tab: {
        width: '50%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    tabIcon: {
        width: 70,
        height: 40
    }
})
