import { FlatList } from 'react-native';
import type { P2PMessage } from '../entities';
import { P2PMessageBubble } from './P2PMessageBubble';
import { p2pChatStyles } from '../styles';
import { P2PEmptyChat } from './P2PEmptyChat';

interface P2PMessagesListProps {
  messages: P2PMessage[];
  peerId: string;
  listRef?: React.RefObject<FlatList<any> | null>;
  onRetryMessage?: (messageId: string) => void;
}

export const P2PMessagesList: React.FC<P2PMessagesListProps> = ({
  messages,
  peerId,
  listRef,
  onRetryMessage,
}) => {
  const renderMessage = ({ item }: { item: P2PMessage }) => (
    <P2PMessageBubble message={item} onRetry={onRetryMessage} />
  );

  return (
    <FlatList
      ref={listRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        p2pChatStyles.messagesList,
        messages.length === 0 && p2pChatStyles.emptyList,
      ]}
      ListEmptyComponent={<P2PEmptyChat peerId={peerId} />}
      inverted={messages.length > 0}
      scrollEnabled
      showsVerticalScrollIndicator={true}
      onContentSizeChange={() =>
        listRef?.current?.scrollToOffset({ offset: 0 })
      }
    />
  );
};
