import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SignUp from './SignUp'; // Adjust the path as necessary
import SignIn from './SignIn'; // Adjust the path as necessary
import Dashboard from './Dashboard'; // Adjust the path as necessary

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignUp">
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        {/* Add other screens here as needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
