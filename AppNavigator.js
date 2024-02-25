import React from 'react';
import PropTypes from 'prop-types';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import FirstPage from './FirstPage';
import SignIn from './SignIn';
import SignUp from './SignUp';
import forgotpassword from './forgotpassword';
import Dashboard from './Dashboard';
import ContactsScreen from './ContactsScreen';
import ChatScreen from './ChatScreen';
import LocationHistoryScreen from './LocationHistoryScreen';
import TakeOrderScreen from './TakeOrderScreen';
import UserProfileScreen from './UserProfileScreen';  
import EditProfileScreen from './EditProfileScreen';

const Stack = createStackNavigator();

function AppNavigator({ isAuthenticated }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="FirstPage">
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="ContactsScreen" component={ContactsScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="LocationHistoryScreen" component={LocationHistoryScreen} />
            <Stack.Screen name="TakeOrderScreen" component={TakeOrderScreen} />
            <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} />
            <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          </>
        ) : (
          <>
            {/* Apply gestureEnabled: false to these screens */}
            <Stack.Screen 
              name="FirstPage" 
              component={FirstPage} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUp} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="SignIn" 
              component={SignIn} 
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen 
              name="forgotpassword" 
              component={forgotpassword} 
              options={{ gestureEnabled: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

AppNavigator.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
};

export default AppNavigator;


