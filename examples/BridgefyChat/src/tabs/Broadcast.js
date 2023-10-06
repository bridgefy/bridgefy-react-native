import React from "react";
import { useRoute } from "@react-navigation/native";
import { useState, useCallback, useEffect } from "react";
import {View, Text, NativeEventEmitter, NativeModules} from "react-native";
import { GiftedChat } from 'react-native-gifted-chat'
import {BridgefyEvents, BridgefyPropagationProfile, BridgefyTransmissionModeType} from "bridgefy-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {BridgefyTransmissionMode} from "bridgefy-react-native/src";
import uuid from "react-native-uuid";

const Broadcast = ({ route }) => {
    const { bridgefy } = route.params;
    let messageBroadcast = [];
    const [messageList, setMessageList] = useState([])
    const subscriptions = [];
    const eventEmitter = new NativeEventEmitter();
    let id = ''
    let name = ''

    useEffect(() => {
      AsyncStorage.getItem('USERID').then((value) =>{ id = value })
      AsyncStorage.getItem("NAME").then((value) => { name = value })

      subscriptions.push(eventEmitter.addListener(BridgefyEvents.bridgefyDidReceiveData, (event) => {
        const messageId = event.messageId
        const data = JSON.parse(event.data)
        const transmissionMode = event.transmissionMode
        console.log("bridgefyDidReceiveData: type: " + transmissionMode.mode)
        console.log("bridgefyDidReceiveData: id: " + messageId)
        console.log("bridgefyDidReceiveData: sender: " + transmissionMode.uuid)
        console.log("bridgefyDidReceiveData: data: " + JSON.stringify(data))
        switch (transmissionMode.mode) {
          case BridgefyTransmissionModeType.mesh:
          case BridgefyTransmissionModeType.p2p:
                const senderId = transmissionMode.uuid
                AsyncStorage.getItem("P2P: " + senderId).then((chat)=> {
                  const p2pMessages = chat ? JSON.parse(chat) : []
                  p2pMessages.push(data)
                  AsyncStorage.setItem("P2P:" + senderId, JSON.stringify(p2pMessages)).then()
                })
          break;
          case BridgefyTransmissionModeType.broadcast:
            data.sendTo = id
            data.sendBy = transmissionMode.uuid
            data.createdAt = Date.parse(data.createdAt)
            messageBroadcast.push(data)
            // messageBroadcast = messageBroadcast.map(item => item._id !== messageId)
            setMessageList(messageBroadcast)
          break;
        }
      }))

      subscriptions.push(eventEmitter.addListener(BridgefyEvents.bridgefyDidFailSendingMessage, (event) => {
        console.log("bridgefyDidFailSendingMessage: " + JSON.stringify(event))
      }))

      subscriptions.push(eventEmitter.addListener(BridgefyEvents.bridgefyDidSendMessage, (event) => {
        console.log("bridgefyDidSendMessage: " + JSON.stringify(event))
      }))

      return () => {
        eventEmitter.removeAllListeners(BridgefyEvents.bridgefyDidFailSendingMessage)
        eventEmitter.removeAllListeners(BridgefyEvents.bridgefyDidReceiveData)
        eventEmitter.removeAllListeners(BridgefyEvents.bridgefyDidSendMessage)
        for (const sub of subscriptions) {
          sub.remove();
        }
      };

    }, [])

  const onSend = useCallback((messages = []) => {
    const msg = messages[0]
    const myMsg = {
        ...msg,
        user:{
          _id: id,
          name: name,
        },
        sendBy: id,
        createdAt: Date.parse(msg.createdAt)
    }

    bridgefy.send(
      JSON.stringify(myMsg),
      {
        type: BridgefyTransmissionModeType.broadcast,
        uuid: id,
      },
    ).then((messageId) => {
      myMsg._id = messageId
      setMessageList(previousMessages =>
        GiftedChat.append(previousMessages, myMsg))
    })
  }, [])
    return (
        <View style={{ flex: 1 }}>
            <GiftedChat
                messages={ messageList }
                onSend= { messages => onSend(messages) }
                user={{
                    _id: id,
                    name: name
                }}
            />
        </View>
    );
};

export default Broadcast;
