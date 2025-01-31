import {globalColors} from '../theme/global.styles';
const Icon = require('react-native-vector-icons/IonIcons')
  .default as React.ElementType;

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
