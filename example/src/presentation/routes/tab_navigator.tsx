import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {LogsScreen, ChatScreen} from '../screens';
import {IonIcon} from '../components';
import {globalColors} from '../theme/global.styles';
import {useSdkStore} from '../store';

const Tab = createMaterialTopTabNavigator();

export const TabNavigator = () => {
  const scrollLogList = useSdkStore(state => state.scrollLogList);
  const scrollMessageList = useSdkStore(state => state.scrollMessageList);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: globalColors.primaryColor,
        tabBarInactiveTintColor: globalColors.nofocusColor,
        tabBarIndicatorStyle: {backgroundColor: globalColors.primaryColor},
      }}>
      <Tab.Screen
        name="Logs"
        component={LogsScreen}
        listeners={{
          focus: () => {
            scrollLogList?.current?.forceUpdate();
          },
        }}
        options={{
          tabBarIcon: ({color}) => (
            <IonIcon name="document-text" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        listeners={{
          focus: () => {
            scrollMessageList?.current?.forceUpdate();
          },
        }}
        options={{
          tabBarIcon: ({color}) => <IonIcon name="chatbubbles" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
