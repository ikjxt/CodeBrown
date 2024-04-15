import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert, SafeAreaView } from 'react-native';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { PropTypes } from 'prop-types';

// On this screen, user is prompted to enter their current password. If they enter the correct password,
// they will be taken to the next change email screen
const ChangeEmailScreen = ({ navigation }) => {
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
      navigation.navigate('Enter New Email');
    } catch (error) {
      Alert.alert('Incorrect current password.');
    }
  }

  return (
    <SafeAreaView style={styles.container}> 
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

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "#fff",
  },
  input: {
    width: 300,
    height: 40,
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 15,
  },
  submitButton: {
    backgroundColor: "#e74c3c", // Deep orange color
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 210,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginTop: 32,
    marginBottom: 16,
    paddingHorizontal: 16,
    position: 'relative',
    backgroundColor: "#fff",
    
  },
  passwordInput: {
    flex: 1,
    height: 40,
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
ChangeEmailScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default ChangeEmailScreen;