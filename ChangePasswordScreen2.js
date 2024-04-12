import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, Text} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getAuth, updatePassword, signOut } from '@firebase/auth';
import { PropTypes } from 'prop-types';

const ChangePasswordScreen2 = ({ navigation }) => {
  const [newPassword, setNewPassword] = useState('');                     // User's desired new password
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');       // Used to confirm the new password
  const [showPassword, setShowPassword] = useState(false);                // For hiding/showing entered new passwords on screen 

  const auth = getAuth();         // Set observer on Auth object,
  const user = auth.currentUser;  // Get the current user's profile

  const handleSubmit = () => {
    if (newPassword != newPasswordConfirm) {
      Alert.alert('Password do not match')
    } else {
      updatePassword(user, newPassword).then(() => {   // From Firebase Doc, Manage Users, Change the user's password
        Alert.alert('Password Changed Successfully. You will now be signed out');  
        console.log('SUCCESS: PASSWORD CHANGED');
        handleSignOut();
      }).catch(() => {
        Alert.alert('Error Changing Password');
        console.log('ERROR: PASSWORD NOT CHANGED');
      })

      handleSignOut();
    }
  };

  // After user changes password, log them out and take to sign in screen
  const handleSignOut = () => {
    setTimeout(() => {
      signOut(auth)
          .then(() => {
            navigation.navigate('SignIn');
            Alert.alert('You have been signed out. You may sign in with your new password.')
          })
          .catch((error) => {
            console.error('Sign out error:', error);
          });
    }, 2000);  // 2 second delay
  };

  return (
    <View style={styles.container}> 
      <View style={styles.passwordContainer} marginTop={32}>
        <TextInput
          style={styles.passwordInput}
          placeholder="New Password"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword}
          onChangeText={setNewPassword}
          value={newPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#333333" />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Re-enter New Password"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword}
          onChangeText={setNewPasswordConfirm}
          value={newPasswordConfirm}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#333333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  )
}

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
    // marginTop: 32,
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
ChangePasswordScreen2.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default ChangePasswordScreen2;