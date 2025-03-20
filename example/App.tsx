// import 'react-native-gesture-handler';
import {PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {HomeScreen} from './src/presentation/screens';
import {IonIcon} from './src/presentation/components/IonIcon';

const IconComponent = (props: any) => <IonIcon {...props} />;

export const App = () => {
  return (
    <PaperProvider
      settings={{
        icon: IconComponent,
      }}>
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    </PaperProvider>
  );
};
