import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Card from './Card';
import { getAuth } from 'firebase/auth';
import { PropTypes } from 'prop-types';

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
        description={<Text>{user.photoURL}
                           First Name: {user.displayName} {"\n"}
                           Last Name: {"\n"}
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

// fixed ['navigation.navigate' is missing in props validationeslintreact/prop-types] error
UserProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default UserProfileScreen;