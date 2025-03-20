import {globalColors} from '../theme/global.styles';
import Icon from 'react-native-vector-icons/Ionicons'

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
  // @ts-ignore
  return <Icon name={name} size={size} color={color} />;
};
