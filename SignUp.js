import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import app from "./firebaseConfig";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "./firebaseConfig";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("driver");
  const [showPassword, setShowPassword] = useState(false);
  const [managerAuthCode, setManagerAuthCode] = useState("");
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password should be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match!");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Invalid Input", "Please enter your first and last name.");
      return;
    }

    if (role === "manager") {
      if (!managerAuthCode.trim()) {
        Alert.alert("Authorization Required", "Please enter the manager authorization code.");
        return;
      }
      // Retrieve the manager authorization code from Firebase
      const authCodeDoc = await getDoc(doc(db, "managerAuthCodes", "authCode"));
      if (authCodeDoc.exists()) {
        const validManagerAuthCode = authCodeDoc.data().code;
        if (managerAuthCode !== validManagerAuthCode) {
          Alert.alert("Invalid Authorization", "The entered manager authorization code is incorrect.");
          return;
        }
      } else {
        Alert.alert("Error", "Manager authorization code not found. Please contact support.");
        return;
      }
    }


    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        sendVerificationEmail(userCredential.user);
        const userId = auth.currentUser ? auth.currentUser.uid : null;
        const userRef = doc(db, "USERS", email);
        return setDoc(userRef, {
          firstName: firstName,
          userId: userId,
          lastName: lastName,
          email: email,
          role: role,
        });
      })
      .then(() => {
        return signOut(auth); // Sign out the user after sending the verification email
      })
      .then(() => {
        Alert.alert(
          "Account Created",
          "Your account has been created successfully. Please verify your email before signing in."
        );
        navigation.navigate("SignIn"); // Navigate to Sign In screen after signing out
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.logoText}>Round Table Pizza</Text>
        <Text style={styles.title}>Sign Up</Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#666"
          onChangeText={setFirstName}
          value={firstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#666"
          onChangeText={setLastName}
          value={lastName}
        />

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
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
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
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#333333"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.roleSelection}>
          <TouchableOpacity
            onPress={() => setRole("driver")}
            style={[
              styles.roleButton,
              role === "driver" ? styles.roleButtonSelected : {},
            ]}
          >
            <Text
              style={[
                styles.roleButtonText,
                { color: role === "driver" ? "#fff" : "#333333" },
              ]}
            >
              Driver
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setRole("manager");
              setManagerAuthCode("");
            }}
            style={[
              styles.roleButton,
              role === "manager" ? styles.roleButtonSelected : {},
            ]}
          >
            <Text
              style={[
                styles.roleButtonText,
                { color: role === "manager" ? "#fff" : "#333333" },
              ]}
            >
              Manager
            </Text>
          </TouchableOpacity>
        </View>
        {role === "manager" && (
          <TextInput
            style={styles.input}
            placeholder="Manager Authorization Code"
            placeholderTextColor="#666"
            onChangeText={setManagerAuthCode}
            value={managerAuthCode}
          />
        )}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
  },

  logoText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#e74c3c",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#333333",
  },
  input: {
    width: 300,
    height: 50,
    borderColor: "#333333",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 15,
    color: "#333333",
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 300,
    height: 50,
    borderColor: "#333333",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 15,
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    height: 50,
    color: "#333333",
    fontSize: 14,
  },
  showPasswordButton: {
    position: "absolute",
    right: 10,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 5,
    color: "#333333",
  },
  roleSelection: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  roleButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  roleButtonSelected: {
    backgroundColor: "#e74c3c",
  },
  roleButtonText: {
    color: "#333333",
  },
  button: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 5,
    width: 300,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  switchText: {
    color: "#e74c3c",
    marginTop: 20,
    fontSize: 14,
  },
});

export default SignUp;
