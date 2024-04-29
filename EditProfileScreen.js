import { React, useState } from "react";
import { View, TextInput, StyleSheet, Text, Alert, TouchableWithoutFeedback, Keyboard, SafeAreaView, Dimensions } from "react-native";
import { getAuth } from "firebase/auth";
import { TouchableOpacity } from "react-native-gesture-handler";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { PropTypes } from 'prop-types';

const EditProfileScreen = ({ navigation }) => {
  const [newFirstName, setNewFirstName] = useState('');      // For new name from user input
  const [newLastName, setNewLastName] = useState('');        // For new name from user input
  const [newPhoneNumber, setNewPhoneNumber] = useState('');  // For new phone number from user input

  const auth = getAuth();         // Set observer on Auth object,
  const user = auth.currentUser;  // Get the current user's profile,
  const documentID = user.email;  // Get the user's email, which is the ID of the document on our Firestore
 
  // User has entered a new first name
  const updateFirstName = async () => {
    try {
      const userDocRef = doc(db, "USERS", documentID)  // Get the document, this is currently just for "driver"s
      await updateDoc(userDocRef, {
        firstName: newFirstName
      });
    } catch (error) {
      console.error('Error updating first name', error);
      console.log(documentID);
    }
  };
  // User has entered a new last name
  const updateLastName = async () => {
    try {
      const userDocRef = doc(db, "USERS", documentID)  // Get the document, this is currently just for "driver"s
      await updateDoc(userDocRef, {
        lastName: newLastName
      });
    } catch (error) {
      console.error('Error updating last name', error);
    }
  };
  // User has entered a new phone number
  const updatePhoneNumber = async () => {
    try {
      const userDocRef = doc(db, "USERS", documentID)  // Get the document, this is currently just for "driver"s
      await updateDoc(userDocRef, {
        phoneNumber: newPhoneNumber
      });
    } catch (error) {
      console.error('Error updating phone number', error);
    }
  };

  // Called when user presses the "Submit Changes" button
  // Changes are only made if user inputs text into text box before pressing button
  const handleSubmitChanges = () => {
    if (newFirstName != '' || newLastName != '' || newPhoneNumber != '') {
      Alert.alert("Changes Saved");
    }
    if (newFirstName != '') {  // If a new first name is entered
      updateFirstName();   
      setNewFirstName('');  // Clear the Text Box    
    }
    if (newLastName != '') {  // If a new last name is entered
      updateLastName();  
      setNewLastName('');  // Clear the Text Box    
    }
    if (newPhoneNumber != '') {  // If a new phone number is entered
      updatePhoneNumber(); 
      setNewPhoneNumber('');  // Clear the Text Box     
    }
    navigation.goBack();
  };

  const handleChangeEmail = () => {
    navigation.navigate('Enter Current Password ');
  }

  const handleChangePassword = () => {
    navigation.navigate('Enter Current Password');
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.content}>
           <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#666"
            onChangeText={setNewFirstName}
            value={newFirstName}
            autoCapitalize="none"
            marginTop={16}
          />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#666"
            onChangeText={setNewLastName}
            value={newLastName}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#666"
            onChangeText={(text) => setNewPhoneNumber(text.replace(/[^0-9]/g, '').slice(0, 10))}
            value={newPhoneNumber}
            keyboardType="numeric"
            maxLength={10}
          />

          <TouchableOpacity style={styles.button2} onPress={handleChangeEmail}>
            <Text style={styles.button2Text}>Email</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button2} onPress={handleChangePassword}>
            <Text style={styles.button2Text}>Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitChanges}>
            <Text style={styles.buttonText}>Submit Changes</Text>
          </TouchableOpacity>

        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 30,
    marginBottom: 5,
  },
  input: {
    width: 300,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  button2: {
    width: 300,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    color: "#666",
    justifyContent: 'center',
  },
  button2Text: {
    color: "#666",
    fontSize: 14,
  },
  routeContainer: {
    width: "100%",
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  routeLabel: {
    fontWeight: "bold",
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
  
});

EditProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditProfileScreen;