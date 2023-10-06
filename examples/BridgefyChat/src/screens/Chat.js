import React, { useState, useCallback, useEffect } from 'react';
import { View, NativeEventEmitter } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import {
  BridgefyEvents,
  BridgefyTransmissionModeType,
} from 'bridgefy-react-native/src';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Chat = ({ route }) => {
  const { bridgefy, nodeId, id, name } = route.params;
  const [messageList, setMessageList] = useState([]);
  const subscriptions = [];
  const eventEmitter = new NativeEventEmitter();

  useEffect(() => {
    getMessages().then();

    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidReceiveData,
        (event) => {
          const messageId = event.messageId;
          const data = JSON.parse(event.data);
          const transmissionMode = event.transmissionMode;
          console.log('bridgefyDidReceiveData: type: ' + transmissionMode.mode);
          console.log('bridgefyDidReceiveData: id: ' + messageId);
          console.log(
            'bridgefyDidReceiveData: sender: ' + transmissionMode.uuid
          );
          switch (transmissionMode.mode) {
            case BridgefyTransmissionModeType.mesh:
            case BridgefyTransmissionModeType.p2p:
              const senderId = transmissionMode.uuid;
              AsyncStorage.getItem(`P2P:${senderId}`).then((chat) => {
                const messages = chat ? JSON.parse(chat) : [];
                messages.push(data);
                AsyncStorage.setItem(
                  `P2P:${senderId}`,
                  JSON.stringify(messages)
                ).then();
              });
              if (senderId === nodeId) {
                setMessageList((previousMessages) =>
                  GiftedChat.append(previousMessages, data)
                );
              }
              break;
            case BridgefyTransmissionModeType.broadcast:
              AsyncStorage.getItem('BROADCAST').then((chat) => {
                const messages = chat ? JSON.parse(chat) : [];
                data.createdAt = Date.parse(data.createdAt);
                messages.push(data);
                AsyncStorage.setItem(
                  'BROADCAST',
                  JSON.stringify(messages)
                ).then();
              });
              break;
          }
        }
      )
    );

    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidFailSendingMessage,
        (event) => {
          console.log(
            'bridgefyDidFailSendingMessage: ' + JSON.stringify(event)
          );
        }
      )
    );

    subscriptions.push(
      eventEmitter.addListener(
        BridgefyEvents.bridgefyDidSendMessage,
        (event) => {
          console.log('bridgefyDidSendMessage: ' + JSON.stringify(event));
        }
      )
    );

    return () => {
      AsyncStorage.removeItem('P2P:' + nodeId);
      eventEmitter.removeAllListeners(
        BridgefyEvents.bridgefyDidFailSendingMessage
      );
      eventEmitter.removeAllListeners(BridgefyEvents.bridgefyDidReceiveData);
      eventEmitter.removeAllListeners(BridgefyEvents.bridgefyDidSendMessage);
      for (const sub of subscriptions) {
        sub.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMessages = async () => {
    AsyncStorage.getItem(`P2P:${nodeId}`).then((chat) => {
      const messages = chat ? JSON.parse(chat) : [];
      setMessageList(messages);
    });
  };

  const onSend = useCallback((messages = []) => {
    const msg = messages[0];
    const myMsg = {
      ...msg,
      sendBy: id,
      sendTo: nodeId,
      createdAt: Date.parse(msg.createdAt),
    };

    bridgefy
      .send(JSON.stringify(myMsg), {
        type: BridgefyTransmissionModeType.p2p,
        uuid: nodeId,
      })
      .then((messageId) => {
        myMsg._id = messageId;
        AsyncStorage.getItem(`P2P:${nodeId}`).then((chat) => {
          const messages = chat ? JSON.parse(chat) : [];
          messages.push(myMsg);
          AsyncStorage.setItem(
            `P2P:${nodeId}`,
            JSON.stringify(messages)
          ).then();
        });
        setMessageList((previousMessages) =>
          GiftedChat.append(previousMessages, myMsg)
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messageList}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: id,
          name: name,
        }}
      />
    </View>
  );
};

export default Chat;
