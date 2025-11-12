/**
 * P2PChatScreen.tsx
 *
 * P2P chat screen for direct peer-to-peer messaging
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
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Bridgefy from 'bridgefy-react-native';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  isMine: boolean;
  status: 'sending' | 'sent' | 'failed';
}

interface P2PChatScreenProps {
  route: {
    params: {
      peerId: string;
      peerName: string;
    };
  };
  navigation: any;
}

export default function P2PChatScreen({ route, navigation }: P2PChatScreenProps) {
  const { peerId, peerName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [peerConnected, setPeerConnected] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setupBridgefy();
    setupP2PListeners();

    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerRight}>
          <View
            style={[
              styles.connectionStatus,
              peerConnected ? styles.statusConnected : styles.statusDisconnected,
            ]}
          />
          <Text style={styles.headerStatus}>
            {peerConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
      ),
    });

    return () => {
      Bridgefy.removeAllListeners();
    };
  }, []);

  const setupBridgefy = async () => {
    try {
      const userId = await Bridgefy.currentUserId();
      setCurrentUserId(userId);
    } catch (error) {
      console.log('Not initialized yet', error);
    }
  };

  const setupP2PListeners = () => {
    Bridgefy.onReceiveData((event) => {
      console.log(JSON.stringify(event));
      // Only add messages from this specific peer
      if (event.transmissionMode.uuid === peerId) {
        const newMessage: Message = {
          id: event.messageId,
          text: event.data,
          senderId: event.transmissionMode.uuid,
          timestamp: Date.now(),
          isMine: false,
          status: 'sent',
        };
        setMessages((prev) => [newMessage, ...prev]);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }
    });

    Bridgefy.onDisconnect((event) => {
      if (event.userId === peerId) {
        setPeerConnected(false);
        Alert.alert('Connection Lost', `Peer ${formatPeerId(peerId)} disconnected`);
      }
    });

    Bridgefy.onConnect((event) => {
      if (event.userId === peerId) {
        setPeerConnected(true);
      }
    });

    Bridgefy.onFailSendingMessage((error) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.status === 'sending' ? { ...msg, status: 'failed' } : msg
        )
      );
      Alert.alert('Error', `Failed to send message: ${error.message}`);
    });
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    // Add message to UI immediately with sending status
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      text,
      senderId: currentUserId,
      timestamp: Date.now(),
      isMine: true,
      status: 'sending',
    };

    setMessages((prev) => [tempMessage, ...prev]);

    try {
      setSending(true);
      const messageId = await Bridgefy.sendP2P(text, peerId);

      // Update message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? { ...msg, id: messageId, status: 'sent' }
            : msg
        )
      );
    } catch (error: any) {
      console.error('Failed to send message:', error);
      // Keep message but mark as failed
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, status: 'failed' } : msg
        )
      );
      Alert.alert('Error', `Failed to send message: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatPeerId = (userId: string) => {
    return userId.substring(0, 12) + '...';
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
          {item.isMine && (
            <Icon
              name={
                item.status === 'sending'
                  ? 'clock-outline'
                  : item.status === 'sent'
                    ? 'check'
                    : 'close'
              }
              size={14}
              color={
                item.status === 'sending'
                  ? 'rgba(255, 255, 255, 0.7)'
                  : item.status === 'sent'
                    ? 'rgba(255, 255, 255, 0.7)'
                    : '#FF5252'
              }
              style={styles.statusIcon}
            />
          )}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="message-text-outline" size={64} color="#BDBDBD" />
      <Text style={styles.emptyText}>Start a Conversation</Text>
      <Text style={styles.emptySubtext}>
        Send a message to {formatPeerId(peerId)}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted={messages.length !== 0}
        contentContainerStyle={[
          styles.messagesList,
          messages.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0 })}
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
          editable={!sending && peerConnected}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || sending || !peerConnected) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || sending || !peerConnected}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Icon
              name="send"
              size={24}
              color={inputText.trim() && peerConnected ? '#fff' : '#BDBDBD'}
            />
          )}
        </TouchableOpacity>
      </View>

      {!peerConnected && (
        <View style={styles.disconnectedBanner}>
          <Icon name="alert" size={18} color="#F44336" />
          <Text style={styles.disconnectedText}>
            Peer disconnected - messages may not be delivered
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 6,
  },
  connectionStatus: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusDisconnected: {
    backgroundColor: '#F44336',
  },
  headerStatus: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
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
    maxWidth: '85%',
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
    justifyContent: 'flex-end',
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
  statusIcon: {
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
  disconnectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFCDD2',
  },
  disconnectedText: {
    flex: 1,
    fontSize: 13,
    color: '#F44336',
    fontWeight: '500',
  },
});
