import React from "react";
import { View, Text } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

import Login from "../screens/Login";
import Splash from "../screens/Splash";
import Main from "../screens/Main";
import Chat from "../screens/Chat";
import { Bridgefy } from 'bridgefy-react-native';
import colors from "../../constants/colors";
import Broadcast from "../tabs/Broadcast";

const _bridgefy = new Bridgefy();
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer theme={{
      colors: {
        primary: 'rgb(255, 45, 85)',
        background: 'rgb(242, 242, 242)',
        card: 'rgb(255, 255, 255)',
        text: 'rgb(28, 28, 30)',
        border: 'rgb(199, 199, 204)',
        notification: 'rgb(255, 69, 58)',
      },
      dark: false,
    }}>
        <Stack.Navigator>
            <Stack.Screen
                name={'Splash'}
                component={ Splash }
                options={{ headerShown: false }}
                initialParams={{ bridgefy: _bridgefy }}
            />
            <Stack.Screen
                name={'Login'}
                component={Login}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name={'Main'}
                component={Main}
                options={{ headerShown: false }}
                initialParams={{ bridgefy: _bridgefy }}
            />
            <Stack.Screen
                name={'Chat'}
                component={Chat}
                options={{ headerShown: true }}
                initialParams={{ bridgefy: _bridgefy }}
            />
          <Stack.Screen
            name={'Public'}
            component={ Broadcast }
            options={{ headerShown: true }}
            initialParams={{ bridgefy: _bridgefy }}
          />
        </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
