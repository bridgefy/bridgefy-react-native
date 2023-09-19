import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
  NativeEventEmitter,
  NativeModules
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import colors from "../../constants/colors";
import User from '../../assets/user.png'
import { BridgefyEvents } from "bridgefy-react-native";
import {useNavigation, useRoute} from "@react-navigation/native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import Pulse from "react-native-pulse";

let id = ''
let name = ''

const Users = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { bridgefy } = route.params

  let connectedUsers = []
  const [users, setUsers] = useState([])
  const getCurrentUserId = async () => {
    AsyncStorage.getItem('USERID').then((value) =>{ id = value })
    AsyncStorage.getItem("NAME").then((value) => { name = value })
  }

  const getConnectedUsers = async () => {
      bridgefy.connectedPeers().then((nodes)=> {
        if (nodes) {
          console.log("connected peers " + JSON.stringify(nodes))
          connectedUsers = nodes.map(nodeId => { ({ _id: nodeId, name: nodeId.substring(0, 8), connected: true }) })
          setUsers(connectedUsers)
        }
      })
  }

  // Subscribe to Bridgefy real-time events so we can act on them as required.
  useEffect(() => {
    getCurrentUserId().then()
    getConnectedUsers().then()
    const subscriptions = [];
    const eventEmitter = new NativeEventEmitter();

    subscriptions.push(eventEmitter.addListener(BridgefyEvents.bridgefyDidConnect, (event)=> {
      const peer = { _id: event.userId, name: event.userId.substring(0, 8), connected: true }
      const contains = connectedUsers.some((elm) => { return elm._id === peer._id })
      if (!contains) {
        connectedUsers.push(peer)
      } else {
        connectedUsers.forEach((item, index, list)=>{
            if (item._id === peer._id) {
              item.connected = true
            }
        })
      }
        setUsers(connectedUsers)
    }))

    subscriptions.push(eventEmitter.addListener(BridgefyEvents.bridgefyDidDisconnect, (event) => {
      const peer = {_id: event.userId, name: event.userId.substring(0, 8), connected: false}
      connectedUsers.forEach( (item, index, a) => {
        if (item._id === peer._id) {
          item.connected = false
        }
      })
      setUsers(connectedUsers)
    }))

    return () => {
      for (const sub of subscriptions) {
        sub.remove();
      }
    };
  }, [])

  return (
      <View style={styles.container}>
          <FlatList
              data={ users }
              keyExtractor={item => item._id}
              renderItem={({ item }) => {
                  return (
                      <TouchableOpacity
                          style={styles.userItem}
                          onPress={() => {
                              navigation.navigate('Chat', { nodeId: item._id, id: id, name: name })
                          }}>
                        <MaterialCommunityIcons name="antenna" color={colors.red} size={30} />
                          <Text style={ item.connected ? styles.nameOnline : styles.nameOffline }>{ item.name }</Text>
                      </TouchableOpacity>
                  )
              }}/>

      </View>
  );
};

export default Users;

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        flex: 1
    },
    header: {
        width: '100%',
        height: 60,
        backgroundColor: colors.white,
        elevation: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        color: colors.red,
        fontSize: 18,
        fontWeight: '200'
    },
    userItem: {
        width: Dimensions.get('window').width - 20,
        alignSelf: 'center',
        marginTop: 10,
        flexDirection: 'row',
        height: 60,
        borderWidth: 0.5,
        borderRadius: 6,
        paddingLeft: 10,
        alignItems: 'center'
    },
    userIcon: {
        width: 40,
        height: 40
    },
    nameOnline: {
        color: colors.black,
        marginLeft: 20,
        fontSize: 20
    },
    nameOffline: {
      color: colors.red,
      marginLeft: 20,
      fontSize: 20
    }
})
