import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, Animated } from 'react-native';
import app from './firebaseConfig';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { db } from './firebaseConfig';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('driver');
  const [showPassword, setShowPassword] = useState(false);
  const formOpacity = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 2750);
    return () => clearTimeout(timer);
  }, [formOpacity]);

  const sendVerificationEmail = (user) => {
    sendEmailVerification(user)
      .then(() => {
        Alert.alert('Verify Your Email', 'A verification email has been sent to your email address. Please verify your email to continue.');
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to send verification email.');
      });
  };

  const handleSignUp = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password should be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match!');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Invalid Input', 'Please enter your first and last name.');
      return;
    }

    createUserWithEmailAndPassword(getAuth(app), email, password)
      .then((userCredential) => {
        sendVerificationEmail(userCredential.user);
        const userRef = doc(db, role === 'driver' ? 'DRIVERS' : 'MANAGERS', userCredential.user.uid);
        return setDoc(userRef, {
          firstName: firstName,
          lastName: lastName,
          email: email,
          role: role,
        });
      })
      .then(() => {
        Alert.alert('Account Created', 'Your account has been created successfully. Please verify your email before signing in.');
        navigation.navigate('SignIn');
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Video
          source={require('./assets/Intro.mp4')}
          rate={1.0}
          volume={1.0}
          isMuted={true}
          resizeMode="cover"
          shouldPlay
          isLooping={false}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.overlay, { opacity: formOpacity }]}>
          <Text style={styles.logoText}>Round Table Pizza</Text>
          <Text style={styles.title}>Sign Up</Text>

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#ddd"
            onChangeText={setFirstName}
            value={firstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#ddd"
            onChangeText={setLastName}
            value={lastName}
          />

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#ddd"
            onChangeText={setEmail}
            value={email}
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#ddd"
              secureTextEntry={!showPassword}
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#ddd" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password"
              placeholderTextColor="#ddd"
              secureTextEntry={!showPassword}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#ddd" />
            </TouchableOpacity>
          </View>

          <View style={styles.roleSelection}>
            <TouchableOpacity onPress={() => setRole('driver')} style={[styles.roleButton, role === 'driver' ? styles.roleButtonSelected : {}]}>
              <Text style={styles.roleButtonText}>Driver</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRole('manager')} style={[styles.roleButton, role === 'manager' ? styles.roleButtonSelected : {}]}>
              <Text style={styles.roleButtonText}>Manager</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.switchText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </Animated.View>
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
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Ensures text readability over the video
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
    color: '#ddd', // Adjusted for visibility on the overlay
  },
  input: {
    width: 300,
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 15,
    color: '#ddd', // Adjusted for visibility on the overlay
    fontSize: 14,
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
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
    height: 50,
    color: '#ddd', // Adjusted for visibility on the overlay
    fontSize: 14,
  },
  showPasswordButton: {
    position: 'absolute',
    right: 10,
    height: '100%', // Match the height of passwordContainer
    justifyContent: 'center', // Center the icon vertically
    paddingHorizontal: 5, // Padding inside the button for touch area
  },
  roleSelection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  roleButtonSelected: {
    backgroundColor: '#e74c3c',
  },
  roleButtonText: {
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    width: 300,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  switchText: {
    color: 'blue',
    marginTop: 20,
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

export default SignUp;
