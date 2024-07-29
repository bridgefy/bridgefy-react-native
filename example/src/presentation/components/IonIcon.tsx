import Icon from 'react-native-vector-icons/Ionicons';
import {globalColors} from '../theme/global.styles';

interface Props {
  name: string;
  color?: string;
  size?: number;
}
export const IonIcon = ({
  name,
  color = globalColors.primaryColor,
  size = 25,
}: Props) => {
  return <Icon name={name} size={size} color={color} />;
};
