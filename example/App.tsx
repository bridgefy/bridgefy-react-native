// import 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {HomeScreen} from './src/presentation/screens';
import { IonIcon } from './src/presentation/components/IonIcon';

export const App = () => {
  return (
    <PaperProvider
      settings={{
        icon: props => <IonIcon {...props} />,
      }}>
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    </PaperProvider>
  );
};
