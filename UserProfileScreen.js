import React from 'react';
import { View, Text, TouchableOpacity, Button, StyleSheet } from 'react-native';
import Card from './Card';
import { getAuth } from 'firebase/auth';

const UserProfileScreen = ({ navigation }) => {
  const auth = getAuth();         // Set observer on Auth object,
  const user = auth.currentUser;  // Get the current user to display their info

  const editProfile = () => {
    navigation.navigate('EditProfileScreen')
  }

  return (
    <View>
      <Card
        title="Profile"
        description={<Text>Full Name: {user.displayName} {"\n"}
                           Email: {user.email} {"\n"} 
                           Phone: {user.phoneNumber} {"\n"}
                    </Text>}
      /> 
      <TouchableOpacity style={styles.button} onPress={editProfile}>
        <Text>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    width: 150,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:30,
  }
})

export default UserProfileScreen;