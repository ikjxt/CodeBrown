import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { PropTypes } from 'prop-types';

// On this screen, user is prompted to enter their current password. If they enter the correct password,
// they will be taken to the next change password screen.
const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');             // User input for current password, used for reauthentication
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);  // For hiding/showing entered current password on screen 
  
  const auth = getAuth();         // Set observer on Auth object,
  const user = auth.currentUser;  // Get the current user's profile
  
  // Called when button is pressed
  const handleSubmit = () => {
    reauthenticate();  // Changing a password is a security-sensitive action, so Firebase requires reauthentication
  }

  // Called before updatePassword(). Need to reauthenticate user login before changing password
  const reauthenticate = async () => {
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);  // Use the entered current password to reauthenticate login
      await reauthenticateWithCredential(user, credential);
      console.log('REAUTHENTICATION SUCCESSFUL');
      navigation.navigate('Enter New Password');
    } catch (error) {
      Alert.alert('Incorrect current password.');
    }
  }

  return (
    <View style={styles.container}> 
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Current Password"
          placeholderTextColor="#666"
          secureTextEntry={!showCurrentPassword}
          onChangeText={setCurrentPassword}
          value={currentPassword}
        />
        <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} style={styles.showPasswordButton}>
          <Ionicons name={showCurrentPassword ? 'eye' : 'eye-off'} size={20} color="#333333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button1} onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize:30,
    fontWeight: 'bold',
    textAlign:'center',  // Center the title 
    lineHeight: 60
  },
  input: {
    width: 300,
    height: 50,
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 15,
  },
  button1: {
    height: 50,
    width: 150,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  button2: {
    height: 50,
    width: 300,
    backgroundColor: '#eeeded',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:30,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 50,
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 15,
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    color: '#333333', // Adjusted for visibility on the overlay
    fontSize: 14,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 10,
    height: '100%', // Match the height of passwordContainer
    justifyContent: 'center', // Center the icon vertically
    paddingHorizontal: 5, // Padding inside the button for touch area
    color: '#333333',
    
  },
})

// fixed ['navigation.navigate' is missing in props validationeslintreact/prop-types] error
ChangePasswordScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default ChangePasswordScreen;