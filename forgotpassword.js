// ForgotPassword.js

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard} from 'react-native';
import app from './firebaseConfig'; 
import { getAuth, sendPasswordResetEmail  } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();
  const auth = getAuth(app);

  const handleResetPassword = () => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return; // Exit the function if the email format is invalid
    }

    sendPasswordResetEmail(auth, email)
    .then(() => {
      Alert.alert('Email Sent', 'A password reset email has been sent to your email address.');
    }) //Sends user an email to reset their password 

    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('Error', 'This email is not registered.');
      } else {
        Alert.alert('Error', error.message);
      }
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Forgot Password</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          onChangeText={(text) => setEmail(text)}
          value={email}
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.switchText}>Back to Sign in</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: 300,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 15,
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    width: 300,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  text: {
    color: '#3498db',
  },
  switchText: {
    color: 'blue',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});

export default ForgotPassword;
