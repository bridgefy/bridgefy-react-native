/**
 * App-with-EventStore.tsx
 *
 * Updated App component with global event store initialization
 * Collects all SDK events regardless of which screen is active
 */

import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import PermissionsScreen from './screens/PermissionsScreen';
import StatusScreen from './screens/StatusScreen';
import ChatScreen from './screens/ChatScreen';
import LogsScreen from './screens/LogsScreen';
import NearbyScreen from './screens/NearbyScreen';
import P2PChatScreen from './screens/P2PChatScreen';

import Bridgefy from 'bridgefy-react-native';
import { setupBridgefyEventListeners } from './BridgefyEventStore';

const Tab = createBottomTabNavigator();
const NearbyStack = createNativeStackNavigator();

function NearbyStackNavigator() {
  return (
    <NearbyStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <NearbyStack.Screen
        name="NearbyList"
        component={NearbyScreen}
        options={{
          title: 'Nearby Peers',
        }}
      />
      <NearbyStack.Screen
        name="P2PChat"
        // @ts-ignore
        component={P2PChatScreen}
        options={({ route }: any) => ({
          title: `Chat with ${route.params.peerName.substring(0, 12)}...`,
        })}
      />
    </NearbyStack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize global event listeners on app start
    setupBridgefyEventListeners(Bridgefy);
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Permissions"
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: '#757575',
          tabBarStyle: {
            height: 100,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#2196F3',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Tab.Screen
          name="Permissions"
          component={PermissionsScreen}
          options={{
            title: 'Permissions',
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({ color, size }) => (
              <Icon name="shield-check" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Status"
          component={StatusScreen}
          options={{
            title: 'SDK Status',
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({ color, size }) => (
              <Icon name="chart-donut" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Nearby"
          component={NearbyStackNavigator}
          options={{
            title: 'Nearby',
            headerShown: false,
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({ color, size }) => (
              <Icon name="bluetooth-connect" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: 'Broadcast',
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({ color, size }) => (
              <Icon name="message-text" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Logs"
          component={LogsScreen}
          options={{
            title: 'Events',
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({ color, size }) => (
              <Icon name="text-box-multiple" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
