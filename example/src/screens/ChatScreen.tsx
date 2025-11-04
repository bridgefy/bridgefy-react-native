/**
 * ChatScreen.tsx
 *
 * Chat interface for sending and receiving messages
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Bridgefy from 'bridgefy-react-native';
import setSystemTime = jest.setSystemTime;

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  isMine: boolean;
  transmissionMode: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setupBridgefy();
    return () => {
      Bridgefy.removeAllListeners();
    };
  }, []);

  const setupBridgefy = async () => {
    try {
      const userId = await Bridgefy.currentUserId();
      setCurrentUserId(userId);
    } catch (error) {
      console.log('Not initialized yet');
    }

    Bridgefy.onReceiveData((event) => {
      const newMessage: Message = {
        id: event.messageId,
        text: event.data,
        senderId: event.transmissionMode.uuid || 'unknow',
        timestamp: Date.now(),
        isMine: false,
        transmissionMode: event.transmissionMode.type || 'broadcast',
      };
      setMessages((prev) => [newMessage, ...prev]);
    });

    Bridgefy.onStart((event) => {
      setCurrentUserId(event.userId);
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    try {
      const messageId = await Bridgefy.sendBroadcast(inputText.trim());

      const newMessage: Message = {
        id: messageId,
        text: inputText.trim(),
        senderId: currentUserId,
        timestamp: Date.now(),
        isMine: true,
        transmissionMode: 'broadcast',
      };

      setMessages((prev) => [newMessage, ...prev]);
      setInputText('');
    } catch (error: any) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatUserId = (userId: string) => {
    return userId.substring(0, 8);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isMine ? styles.myMessage : styles.theirMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.isMine ? styles.myBubble : styles.theirBubble,
        ]}
      >
        {!item.isMine && (
          <Text style={styles.senderName}>{formatUserId(item.senderId)}</Text>
        )}
        <Text
          style={[
            styles.messageText,
            item.isMine ? styles.myMessageText : styles.theirMessageText,
          ]}
        >
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              item.isMine ? styles.myMessageTime : styles.theirMessageTime,
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
          <Icon
            name={
              item.transmissionMode === 'broadcast'
                ? 'broadcast'
                : item.transmissionMode === 'p2p'
                  ? 'account'
                  : 'wifi'
            }
            size={12}
            color={item.isMine ? '#fff' : '#757575'}
            style={styles.modeIcon}
          />
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="message-text-outline" size={64} color="#BDBDBD" />
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>
        Start a conversation by sending a message
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 160 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        inverted={messages.length !== 0}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          placeholderTextColor="#9E9E9E"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Icon
            name="send"
            size={24}
            color={inputText.trim() ? '#fff' : '#BDBDBD'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesList: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  theirMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myBubble: {
    backgroundColor: '#2196F3',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#212121',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTime: {
    fontSize: 11,
    marginRight: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirMessageTime: {
    color: '#9E9E9E',
  },
  modeIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    color: '#212121',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
});
