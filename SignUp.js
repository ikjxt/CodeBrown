import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import app from './firebaseConfig'; 
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Added showPassword state for both fields
  const navigation = useNavigation();

  const handleSignUp = () => {
    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters.');
      return;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match!');
      return;
    }

    // Firebase sign-up function
    const auth = getAuth(app);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('SignIn');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
      <Text style={styles.logoText}>Round Table Pizza</Text>
      <Text style={styles.title}>Sign Up</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword
          onChangeText={setPassword}
          value={password}
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)} // Toggle showPassword for password field
        >
          <Text>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm Password"
          placeholderTextColor="#666"
          secureTextEntry={!showPassword} // Toggle secureTextEntry based on showPassword
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={() => setShowPassword(!showPassword)} // Toggle showPassword for confirm password field
        >
          <Text>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.switchText}>Already have an account? Sign In</Text>
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
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 15,
  },
  passwordInput: {
    flex: 1,
    height: 50,
  },
  showPasswordButton: {
    padding: 10,
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
  switchText: {
    color: 'blue',
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});

export default SignUp;
