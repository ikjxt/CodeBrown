import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Dashboard from './Dashboard';
import LocationHistoryScreen from './LocationHistoryScreen'; // Import the new screen

const Stack = createStackNavigator();

function AppNavigator({ isAuthenticated }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignUp">
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="LocationHistoryScreen" component={LocationHistoryScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="SignIn" component={SignIn} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
