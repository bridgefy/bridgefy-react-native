import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import type { P2PMessage } from '../entities';
import { P2PChatRepository, type P2PEventHandlers } from '../repositories';
import { P2PMessageService } from '../services';
import { GetP2PUserIdUseCase, SendP2PMessageUseCase } from '../usecases';

interface UseP2PChatParams {
  peerId: string;
  peerName: string;
}

export const useP2PChat = ({ peerId, peerName }: UseP2PChatParams) => {
  const [messages, setMessages] = useState<P2PMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [peerConnected, setPeerConnected] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const repositoryRef = useRef(new P2PChatRepository());
  const messageServiceRef = useRef(new P2PMessageService());
  const repository = repositoryRef.current;
  const messageService = messageServiceRef.current;

  const sendP2PMessageUseCase = new SendP2PMessageUseCase(repository);
  const getP2PUserIdUseCase = new GetP2PUserIdUseCase(repository);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Obtener el ID del usuario actual
        const userId = await getP2PUserIdUseCase.execute();
        setCurrentUserId(userId);

        // Suscribirse a eventos P2P
        const eventHandlers: P2PEventHandlers = {
          onMessageReceived: (message) => {
            console.log('P2P message received:', message.text);
            messageService.addMessage(message);
            setMessages(messageService.getMessagesSorted());
          },
          onPeerConnected: (connectedPeerId) => {
            console.log('Peer connected:', connectedPeerId);
            setPeerConnected(true);
          },
          onPeerDisconnected: (disconnectedPeerId) => {
            console.log('Peer disconnected:', disconnectedPeerId);
            setPeerConnected(false);
            Alert.alert(
              'Connection Lost',
              `Peer ${peerName} disconnected. Messages may not be delivered.`
            );
          },
          onMessageFailed: (err) => {
            console.error('Message sending failed:', err);
            messageService.markAllSendingAsFailed();
            setMessages(messageService.getMessagesSorted());
            Alert.alert('Error', `Failed to send message: ${err.message}`);
          },
          onError: (err) => {
            console.error('P2P chat error:', err);
            setError(err);
          },
        };

        repository.subscribeToP2PEvents(peerId, eventHandlers);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize P2P chat');
        setError(error);
        console.error('Hook initialization error:', error);
      }
    };

    initialize();

    return () => {
      repository.unsubscribeFromP2PEvents();
      messageService.clearMessages();
    };
  }, [peerId]);

  const sendMessage = async (text: string): Promise<void> => {
    if (!text.trim()) {
      throw new Error('Message cannot be empty');
    }

    const tempId = `temp-${Date.now()}`;
    const tempMessage: P2PMessage = {
      id: tempId,
      text: text.trim(),
      senderId: currentUserId,
      timestamp: Date.now(),
      isMine: true,
      status: 'sending',
    };

    // Agregar mensaje optimistamente con estado "sending"
    messageService.addMessage(tempMessage);
    setMessages(messageService.getMessagesSorted());

    try {
      setSending(true);
      const messageId = await sendP2PMessageUseCase.execute(text, peerId);

      // Actualizar ID temporal con el ID real y estado "sent"
      messageService.updateMessageId(tempId, messageId, 'sent');
      setMessages(messageService.getMessagesSorted());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to send message');
      setError(error);

      // Marcar mensaje como fallido
      messageService.updateMessageStatus(tempId, 'failed');
      setMessages(messageService.getMessagesSorted());

      Alert.alert('Error', error.message);
      console.error('Send message error:', error);
    } finally {
      setSending(false);
    }
  };

  const retryMessage = async (messageId: string): Promise<void> => {
    const message = messages.find((m) => m.id === messageId);
    if (message?.status !== 'failed') {
      return;
    }

    // Actualizar a estado "sending"
    messageService.updateMessageStatus(messageId, 'sending');
    setMessages(messageService.getMessagesSorted());

    try {
      const newMessageId = await sendP2PMessageUseCase.execute(message.text, peerId);
      messageService.updateMessageId(messageId, newMessageId, 'sent');
      setMessages(messageService.getMessagesSorted());
    } catch (err) {
      messageService.updateMessageStatus(messageId, 'failed');
      setMessages(messageService.getMessagesSorted());
      Alert.alert('Error', `Failed to retry message. Error: ${err}`);
    }
  };

  const clearMessages = (): void => {
    messageService.clearMessages();
    setMessages([]);
  };

  return {
    messages,
    currentUserId,
    peerConnected,
    sending,
    error,
    sendMessage,
    retryMessage,
    clearMessages,
    getPendingCount: () => messageService.getPendingMessagesCount(),
    getFailedCount: () => messageService.getFailedMessagesCount(),
  };
};
