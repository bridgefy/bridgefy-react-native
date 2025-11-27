import React, { useRef, useLayoutEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  FlatList,
  View,
} from 'react-native';
import { useP2PChat } from '../hooks';
import { MessageInput } from '../components/MessageInput';
import { P2PConnectionBanner } from '../components/P2PConnectionBanner';
import { P2PHeaderRight } from '../components/P2PHeaderRight';
import { P2PMessagesList } from '../components/P2PMessagesList';
import { p2pChatStyles } from '../styles';

interface P2PChatScreenProps {
  route: {
    params: {
      peerId: string;
      peerName: string;
    };
  };
  navigation: any;
}

export default function P2PChatScreen({ route, navigation }: Readonly<P2PChatScreenProps>) {
  const { peerId, peerName } = route.params;

  const {
    messages,
    peerConnected,
    sending,
    sendMessage,
    retryMessage,
  } = useP2PChat({ peerId, peerName });

  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = React.useState('');

  // Configurar header con estado de conexión
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <P2PHeaderRight peerConnected={peerConnected} />,
    });
  }, [navigation, peerConnected]);

  const handleSendMessage = async () => {
    const messageText = inputText.trim();
    if (!messageText) return;

    setInputText('');

    try {
      await sendMessage(messageText);

      // Scroll al último mensaje
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    try {
      await retryMessage(messageId);
    } catch (err) {
      console.error('Error retrying message:', err);
    }
  };

  return (
    <View style={p2pChatStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={p2pChatStyles.container}
      >
        <P2PMessagesList
          messages={messages}
          peerId={peerId}
          listRef={flatListRef}
          onRetryMessage={handleRetryMessage}
        />

        <P2PConnectionBanner peerConnected={peerConnected} />

        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          loading={sending}
          disabled={!peerConnected}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
