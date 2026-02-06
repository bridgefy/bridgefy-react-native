import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { statusStyles } from '../styles';

interface ControlButtonProps {
  title: string;
  icon: string;
  onPress: () => void;
  loading?: boolean;
  variant:
    | 'init'
    | 'start'
    | 'stop'
    | 'destroy'
    | 'refresh'
    | 'background'
    | 'foreground';
  disabled?: boolean;
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  title,
  icon,
  onPress,
  loading = false,
  variant,
  disabled = false,
}) => {
  const buttonStyle: ViewStyle = {
    ...statusStyles.button,
    ...(variant === 'init' && statusStyles.initButton),
    ...(variant === 'start' && statusStyles.startButton),
    ...(variant === 'stop' && statusStyles.stopButton),
    ...(variant === 'destroy' && statusStyles.destroyButton),
    ...(variant === 'refresh' && statusStyles.refreshButton),
    ...(variant === 'background' && statusStyles.backGroundButton),
    ...(variant === 'foreground' && statusStyles.foreGroundButton),
    opacity: disabled ? 0.5 : 1,
  };

  const textStyle =
    variant === 'refresh'
      ? statusStyles.refreshButtonText
      : statusStyles.buttonText;

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'refresh' ? '#2196F3' : '#fff'} />
      ) : (
        <Icon
          name={icon}
          size={20}
          color={variant === 'refresh' ? '#2196F3' : '#fff'}
        />
      )}
      <Text style={textStyle}>{loading ? 'Loading...' : title}</Text>
    </TouchableOpacity>
  );
};
