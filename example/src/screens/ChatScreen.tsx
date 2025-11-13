import React, { useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatStyles } from '../styles';
import { useChat } from '../hooks';
import { MessageInput, MessagesList } from '../components';

export default function ChatScreen() {
  const {
    messages,
    currentUserId,
    loading,
    sendMessage,
  } = useChat();

  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setIsSending(true);
    try {
      await sendMessage(inputText);
      setInputText('');

      // Scroll al último mensaje
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={chatStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        style={chatStyles.container}
      >
        <MessagesList messages={messages} listRef={flatListRef} />
        <MessageInput
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSendMessage}
          loading={isSending}
          disabled={loading || !currentUserId}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
