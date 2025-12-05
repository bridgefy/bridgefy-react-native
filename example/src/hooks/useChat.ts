import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { Message } from '../entities';
import { type ChatEventHandlers, ChatRepository } from '../repositories';
import { ChatService } from '../services';
import { GetCurrentUserIdUseCase, SendMessageUseCase } from '../usecases';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const repositoryRef = useRef(new ChatRepository());
  const chatServiceRef = useRef(new ChatService());
  const repository = repositoryRef.current;
  const chatService = chatServiceRef.current;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getCurrentUserIdUseCase = new GetCurrentUserIdUseCase(repository);
  const sendMessageUseCase = new SendMessageUseCase(repository);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener el ID de usuario actual
        const userId = await getCurrentUserIdUseCase.execute();
        setCurrentUserId(userId);

        // Suscribirse a eventos de mensajes
        const eventHandlers: ChatEventHandlers = {
          onMessageReceived: (message) => {
            console.log('Message received:', message.text);
            chatService.addMessage(message);
            setMessages(chatService.getMessagesSorted());
          },
          // eslint-disable-next-line @typescript-eslint/no-shadow
          onUserIdChanged: (userId) => {
            console.log('User ID changed:', userId);
            setCurrentUserId(userId);
          },
          onError: (err) => {
            console.error('Chat error:', err);
            setError(err);
          },
        };

        repository.subscribeToMessages(eventHandlers);
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const error =
          err instanceof Error ? err : new Error('Failed to initialize chat');
        setError(error);
        console.error('Hook initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();

    return () => {
      repository.unsubscribeFromMessages();
      chatService.clearMessages();
    };
  }, [chatService, getCurrentUserIdUseCase, repository]);

  const sendMessage = async (text: string): Promise<void> => {
    try {
      if (!text.trim()) {
        throw new Error('Message cannot be empty');
      }

      const messageId = await sendMessageUseCase.execute(text);

      const newMessage: Message = {
        id: messageId,
        text: text.trim(),
        senderId: currentUserId,
        timestamp: Date.now(),
        isMine: true,
        transmissionMode: 'broadcast',
      };

      chatService.addMessage(newMessage);
      setMessages(chatService.getMessagesSorted());
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const error =
        err instanceof Error ? err : new Error('Failed to send message');
      setError(error);
      Alert.alert('Error', error.message);
      console.error('Send message error:', error);
    }
  };

  const clearMessages = (): void => {
    chatService.clearMessages();
    setMessages([]);
  };

  const getMessageCount = (): number => {
    return chatService.getMessageCount();
  };

  return {
    messages,
    currentUserId,
    loading,
    error,
    sendMessage,
    clearMessages,
    getMessageCount,
  };
};
