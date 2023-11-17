import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SignUp from './SignUp'; 
import SignIn from './SignIn'; 
import Dashboard from './Dashboard'; 

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
