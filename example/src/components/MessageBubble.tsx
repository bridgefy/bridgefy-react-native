import { Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MessageFormatter } from '../utils';
import { chatStyles } from '../styles';
import type { Message } from '../entities';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  let transmissionModeIcon = MessageFormatter.getTransmissionModeIcon(
    message.transmissionMode
  );

  return (
    <View
      style={[
        chatStyles.messageContainer,
        message.isMine ? chatStyles.myMessage : chatStyles.theirMessage,
      ]}
    >
      <View
        style={[
          chatStyles.messageBubble,
          message.isMine ? chatStyles.myBubble : chatStyles.theirBubble,
        ]}
      >
        {!message.isMine && (
          <Text style={chatStyles.senderName}>
            {MessageFormatter.formatUserId(message.senderId)}
          </Text>
        )}
        <Text
          style={[
            chatStyles.messageText,
            message.isMine
              ? chatStyles.myMessageText
              : chatStyles.theirMessageText,
          ]}
        >
          {message.text}
        </Text>

        <View style={chatStyles.messageFooter}>
          <Text
            style={[
              chatStyles.messageTime,
              message.isMine
                ? chatStyles.myMessageTime
                : chatStyles.theirMessageTime,
            ]}
          >
            {MessageFormatter.formatTime(message.timestamp)}
          </Text>
          <Icon
            name={transmissionModeIcon}
            size={12}
            color={message.isMine ? 'rgba(255, 255, 255, 0.7)' : '#9E9E9E'}
            style={chatStyles.modeIcon}
          />
        </View>
      </View>
    </View>
  );
};
