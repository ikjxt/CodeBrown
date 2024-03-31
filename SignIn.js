import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, Animated, Switch, ImageBackground} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import app from './firebaseConfig';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // State to manage checkbox status
  const navigation = useNavigation();
  const formOpacity = useRef(new Animated.Value(0)).current;


  // const fetchUserRoleAndNavigate = async (userId) => {
  //   const driverDocRef = doc(db, "DRIVERS", userId);
  //   const managerDocRef = doc(db, "MANAGERS", userId);

  //   const driverDocSnap = await getDoc(driverDocRef);
  //   if (driverDocSnap.exists()) {
  //     navigation.navigate('Dashboard', { role: 'driver' });
  //     return;
  //   }

  //   const managerDocSnap = await getDoc(managerDocRef);
  //   if (managerDocSnap.exists()) {
  //     navigation.navigate('Dashboard', { role: 'manager' });
  //     return;
  //   }

  //   Alert.alert("Error", "User's role could not be determined.");
  // };

  // Remove the header
  // useLayoutEffect(() => {
  //  navigation.setOptions({
  //    headerShown: false,
  //  });
  //}, [navigation]); 

  useEffect(() => {
    const loadCredentials = async () => {
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      setRememberMe(savedRememberMe === 'true');
      if (savedRememberMe === 'true') {
        const savedEmail = await AsyncStorage.getItem('userEmail');
        // Load and set the email if Remember Me was true, ignoring the password
        if (savedEmail) {
          setEmail(savedEmail);
          // Do not automatically fill in the password
        }
      } else {
        // Clear the email field if Remember Me is not true
        setEmail('');
      }
    };
  
    loadCredentials();
  }, []);
  
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSignIn = async () => {
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        if (userCredential.user.emailVerified) {
          // Email is verified, proceed with signing in
          
          if (rememberMe) {
            await AsyncStorage.setItem('userEmail', email);
            await AsyncStorage.setItem('rememberMe', 'true');
          } else {
            await AsyncStorage.removeItem('userEmail');
            await AsyncStorage.setItem('rememberMe', 'false');
          }
          navigation.navigate('Dashboard');
        } else {
          // Email is not verified, alert the user
          Alert.alert("Email Verification Required", "Please verify your email before signing in.");
          // Optional: Sign out the user to reinforce the verification process
          auth.signOut();
        }
      })
      .catch((error) => {
        Alert.alert('Sign In Failed', error.message);
      });
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>

        <Text style={styles.logoText}>Round Table Pizza</Text>
        <Text style={styles.title}>DELIVERY APP</Text>

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
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            value={password}
          />
          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#333333" />
          </TouchableOpacity>
          </View>
          <View style={styles.credentialsContainer}>
          <View style={styles.leftSideContainer}>
             <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
            />
          <Text style={styles.rememberMeText}>Remember Me</Text>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('forgotpassword')} style={styles.rightSideContainer}>
            <Text style={styles.switchTextfg}>Forgot Password?</Text>
          </TouchableOpacity>
          </View>


        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.switchText1}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.switchText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
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
  
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  overlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)', // Ensures text readability over the video
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  rememberMeText: {
    marginLeft: 8,
    color: '#333333',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'thin',
    color: '#e74c3c',
    marginBottom: 20,
  },
  input: {
    width: 300,
    height: 50,
    borderColor: '#333333',
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
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
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
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  switchText: {
    color: 'blue', //"Sign up" link text
    marginTop: 10,
    
  },
  switchText1: {
    marginTop: 10, // "Don't have an account" text
    color: '#333333',
    
  },
  switchTextfg: {
    color: 'blue',
  },
  leftSideContainer: {
    flexDirection: 'row',
    alignItems: 'center', // This ensures vertical alignment in the row
    marginTop: 2,
    marginBottom: 5.5,
    // Other styling as needed
  },
  
  rightSideContainer: {
    // Apply the same vertical alignment strategy as leftSideContainer
    justifyContent: 'center', // If needed, based on your layout
    // Other styling as needed
    marginTop: 2,
    marginBottom: 5.5,
  },
  
  credentialsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // This should align children vertically in the center
    width: '100%', // Ensure the container spans the entire width
    paddingHorizontal: 50, // Adjust as needed to match your layout
  },
  

});

export default SignIn;
