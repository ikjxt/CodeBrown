import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import app from './firebaseConfig';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { db } from './firebaseConfig';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('driver');
  const [showPassword, setShowPassword] = useState(false);
  const [managerAuthCode, setManagerAuthCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isValidCredentials, setIsValidCredentials] = useState(false);
  const navigation = useNavigation();


  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidCode = role === 'manager' ? managerAuthCode.trim().length >= 4 : true;

    setIsValidCredentials(
      emailRegex.test(email) &&
      password.length >= 6 &&
      password === confirmPassword &&
      firstName.trim() !== '' &&
      lastName.trim() !== '' &&
      phoneNumber.trim() !== '' &&
      isValidCode
    );
  }, [email, password, confirmPassword, firstName, lastName, phoneNumber, role, managerAuthCode]);

  const sendVerificationEmail = (user) => {
    sendEmailVerification(user)
      .then(() => {
        Alert.alert(
          "Verify Your Email",
          "A verification email has been sent to your email address. Please verify your email to continue."
        );
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to send verification email.");
      });
  };

  const handleSignUp = async () => {
    const auth = getAuth(app);
  
    if (role === 'manager') {
      if (!managerAuthCode.trim()) {
        setError('Please enter the manager authorization code.');
        return;
      }
      
      const authCodeDoc = await getDoc(doc(db, 'managerAuthCodes', 'authCode'));
      if (authCodeDoc.exists()) {
        const validManagerAuthCode = authCodeDoc.data().code;
        if (managerAuthCode !== validManagerAuthCode) {
          setError('The entered manager authorization code is incorrect.');
          return;
        }
      } else {
        setError('Manager authorization code not found. Please contact support.');
        return;
      }
    }
  
    setIsLoading(true);
    setError(null);
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendVerificationEmail(userCredential.user);
        const userId = auth.currentUser ? auth.currentUser.uid : null;
        const userRef = doc(db, 'USERS', email);
        return setDoc(userRef, {
          firstName: firstName,
          userId: userId,
          lastName: lastName,
          email: email,
          phoneNumber: phoneNumber,
          role: role,
        });
      })
      .then(() => {
        return signOut(auth);
      })
      .then(() => {
        Alert.alert(
          "Account Created",
          "Your account has been created successfully. Please verify your email before signing in."
        );
        navigation.navigate('SignIn');
      })
      .catch((error) => {
        if (error.code === 'auth/email-already-in-use') {
          setError('The email address is already in use. Please choose a different email.');
        } else if (error.code === 'auth/invalid-email') {
          setError('The provided email address is not valid.');
        } else if (error.code === 'auth/weak-password') {
          setError('The password is too weak. Please choose a stronger password.');
        } else if (error.code === 'auth/operation-not-allowed') {
          setError('Email/password sign-up is not enabled. Please contact support.');
        } else {
          setError('An error occurred. Please try again later.');
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.logoText}>Cheesy Tracker</Text>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#666"
          onChangeText={setFirstName}
          value={firstName}
          accessibilityLabel="First Name input"
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#666"
          onChangeText={setLastName}
          value={lastName}
          accessibilityLabel="Last Name input"
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          accessibilityLabel="Email input"
        />
         <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#666"
          onChangeText={setPhoneNumber}
          value={phoneNumber}
          keyboardType="phone-pad"
          accessibilityLabel="Phone Number input"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            value={password}
            accessibilityLabel="Password input"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
            accessibilityLabel="Toggle password visibility"
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#333333"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            accessibilityLabel="Confirm Password input"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
            accessibilityLabel="Toggle password visibility"
          >
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color="#333333"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.roleSelection}>
          <TouchableOpacity
            onPress={() => setRole('driver')}
            style={[
              styles.roleButton,
              role === 'driver' ? styles.roleButtonSelected : {},
            ]}
            accessibilityLabel="Select Driver role"
          >
            <Text
              style={[
                styles.roleButtonText,
                { color: role === 'driver' ? '#fff' : '#333333' },
              ]}
            >
              Driver
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setRole('manager');
              setManagerAuthCode('');
            }}
            style={[
              styles.roleButton,
              role === 'manager' ? styles.roleButtonSelected : {},
            ]}
            accessibilityLabel="Select Manager role"
          >
            <Text
              style={[
                styles.roleButtonText,
                { color: role === 'manager' ? '#fff' : '#333333' },
              ]}
            >
              Manager
            </Text>
          </TouchableOpacity>
        </View>

        {role === 'manager' && (
          <TextInput
            style={styles.input}
            placeholder="Manager Authorization Code"
            placeholderTextColor="#666"
            onChangeText={setManagerAuthCode}
            value={managerAuthCode}
            accessibilityLabel="Manager Authorization Code input"
          />
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, !isValidCredentials && styles.disabledButton]}
          onPress={handleSignUp}
          disabled={!isValidCredentials || isLoading}
          accessibilityLabel="Sign up button"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignIn')} accessibilityLabel="Navigate to Sign In">
          <Text style={styles.switchText}>
            Already have an account? Sign In
          </Text>
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
    fontWeight: 'bold',
    marginBottom: 16,
    color: "#333",
},
  input: {
    width: 300,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 300,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginTop: 0,
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
    color: '#333333',
  },
  button: {
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
    width: 256,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  switchText: {
    color: '#e74c3c',
    marginTop: 20,
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  disabledButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.5)',
  },
});

export default SignUp;