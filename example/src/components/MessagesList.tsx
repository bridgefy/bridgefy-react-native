import { FlatList } from 'react-native';
import { MessageBubble } from './MessageBubble';
import { EmptyChat } from './EmptyChat';
import { chatStyles } from '../styles';
import type { Message } from '../entities';

interface MessagesListProps {
  messages: Message[];
  listRef?: React.RefObject<FlatList<any> | null>;
}

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  listRef,
}) => {
  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble message={item} />
  );

  return (
    <FlatList
      ref={listRef}
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        chatStyles.messagesList,
        messages.length === 0 && chatStyles.emptyList,
      ]}
      ListEmptyComponent={<EmptyChat />}
      inverted={messages.length > 0}
      scrollEnabled
      showsVerticalScrollIndicator={true}
    />
  );
};
