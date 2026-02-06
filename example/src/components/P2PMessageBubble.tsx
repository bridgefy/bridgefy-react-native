import { Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { P2PFormatter } from '../utils';
import type { P2PMessage } from '../entities';
import { p2pChatStyles } from '../styles';

interface P2PMessageBubbleProps {
  message: P2PMessage;
  onRetry?: (messageId: string) => void;
}

export const P2PMessageBubble: React.FC<P2PMessageBubbleProps> = ({
  message,
  onRetry,
}) => {
  const statusIcon = P2PFormatter.getMessageStatusIcon(message.status);
  const statusColor = P2PFormatter.getMessageStatusColor(message.status);
  const canRetry = message.status === 'failed' && message.isMine;

  return (
    <TouchableOpacity
      style={[
        p2pChatStyles.messageContainer,
        message.isMine ? p2pChatStyles.myMessage : p2pChatStyles.theirMessage,
      ]}
      onPress={canRetry ? () => onRetry?.(message.id) : undefined}
      disabled={!canRetry}
      activeOpacity={canRetry ? 0.7 : 1}
    >
      <View
        style={[
          p2pChatStyles.messageBubble,
          message.isMine ? p2pChatStyles.myBubble : p2pChatStyles.theirBubble,
        ]}
      >
        <Text
          style={[
            p2pChatStyles.messageText,
            message.isMine
              ? p2pChatStyles.myMessageText
              : p2pChatStyles.theirMessageText,
          ]}
        >
          {message.text}
        </Text>

        <View style={p2pChatStyles.messageFooter}>
          <Text
            style={[
              p2pChatStyles.messageTime,
              message.isMine
                ? p2pChatStyles.myMessageTime
                : p2pChatStyles.theirMessageTime,
            ]}
          >
            {P2PFormatter.formatTime(message.timestamp)}
          </Text>

          {message.isMine && (
            <Icon
              name={statusIcon}
              size={14}
              color={statusColor}
              style={p2pChatStyles.statusIcon}
            />
          )}
        </View>
      </View>

      {canRetry && <Text style={p2pChatStyles.retryHint}>Tap to retry</Text>}
    </TouchableOpacity>
  );
};
