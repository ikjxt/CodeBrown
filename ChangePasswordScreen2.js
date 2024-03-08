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
      <View style={styles.passwordContainer}>
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

      <TouchableOpacity style={styles.button1} onPress={handleSubmit}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  )
}

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
ChangePasswordScreen2.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default ChangePasswordScreen2;