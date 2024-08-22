import {Button} from 'react-native-paper';
import {globalColors} from '../theme/global.styles';

interface Props {
  label: string;
  icon: string;
  disabled?: boolean;
  onPress: () => void;
}

export const CommonButton = ({
  label,
  icon,
  disabled = false,
  onPress,
}: Props) => {
  return (
    <Button
      icon={icon}
      mode="elevated"
      disabled={disabled}
      textColor={globalColors.primaryColor}
      buttonColor="white"
      onPress={() => onPress()}>
      {label}
    </Button>
  );
};
