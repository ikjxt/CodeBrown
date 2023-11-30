import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SignIn from './SignIn';
import SignUp from './SignUp';
import forgotpassword from './forgotpassword';
import Dashboard from './Dashboard';
import ContactsScreen from './ContactsScreen';
import ChatScreen from './ChatScreen';
import LocationHistoryScreen from './LocationHistoryScreen'; // Import the new screen
import TakeOrderScreen from './TakeOrderScreen';

const Stack = createStackNavigator();

function AppNavigator({ isAuthenticated }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignUp">
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="ContactsScreen" component={ContactsScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="LocationHistoryScreen" component={LocationHistoryScreen} />
            <Stack.Screen name="TakeOrderScreen" component={TakeOrderScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="forgotpassword" component={forgotpassword} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
