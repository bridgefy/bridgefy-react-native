import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { chatStyles } from '../styles';

interface MessageInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChangeText,
  onSend,
  loading = false,
  disabled = false,
}) => {
  const canSend = value.trim().length > 0 && !loading && !disabled;

  return (
    <View style={chatStyles.inputContainer}>
      <TextInput
        style={chatStyles.input}
        placeholder="Type a message..."
        placeholderTextColor="#9E9E9E"
        value={value}
        onChangeText={onChangeText}
        editable={!disabled && !loading}
        multiline
        maxLength={500}
      />

      <TouchableOpacity
        style={[
          chatStyles.sendButton,
          !canSend && chatStyles.sendButtonDisabled,
        ]}
        onPress={onSend}
        disabled={!canSend}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon
            name="send"
            size={24}
            color={canSend ? '#fff' : '#9E9E9E'}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};
