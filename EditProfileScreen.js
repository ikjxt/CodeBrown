import { React, useState } from "react";
import { View, TextInput, StyleSheet, Text, Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import { getAuth, updateEmail, signOut, verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { TouchableOpacity } from "react-native-gesture-handler";
import { doc, updateDoc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { PropTypes } from 'prop-types';
//import Reauthenticate from "./Reauthenticate";

// 02/20/2024
// On this screen, the user is able to edit their profile information. We are currently NOT using the UserProfile
// class from Firebase.Auth to hold the user's data. We have collections "DRIVERS" and "MANAGERS" that hold the user's
// data in our Cloud Firestore. The Document ID of each user is the same as the email of the user **SUBJECT TO CHANGE**

const EditProfileScreen = ({ navigation }) => {
  const [newFirstName, setNewFirstName] = useState('');      // For new name from user input
  const [newLastName, setNewLastName] = useState('');        // For new name from user input
  const [newEmail, setNewEmail] = useState('');              // For new email form user input
  const [newPhoneNumber, setNewPhoneNumber] = useState('');  // For new phone number from user input
  const [isChangingEmail, setIsChangingEmail] = useState(false);      // For conditional render
  const [isReauthenticated, setIsReauthenticated] = useState(false);  // For the reauthentication
  const [password, setPassword] = useState('');

  const auth = getAuth();         // Set observer on Auth object,
  const user = auth.currentUser;  // Get the current user's profile,
  const documentID = user.email;  // Get the user's email, which is the ID of the document on our Firestore
  var oldDocumentID = '';         // Needed when creating a new Document 

  // When user changes their email: must change the 'email' field of the document, 
  // must change the Document ID (which should always be the same email), and must change the email used to sign in
  const updateAllEmail = async () => {
    try {
      oldDocumentID = documentID;  // Save the old ID

      // Change email field of document
      const userDocRef = doc(db, "DRIVERS", documentID)  // Get the document, this is currently just for "driver"s
      await updateDoc(userDocRef, {               
        email: newEmail                                 
      });

      // Update the Document ID, because it should be the new email
      changeDocumentID(oldDocumentID, newEmail)  

      // Update email that is used to Sign In
      changeSignInEmail(newEmail);    

    } catch (error) {
      console.error('Error updating email', error);
      console.log(documentID);
    }
  };
  // Change the email used to sign in
  const changeSignInEmail = async (newEmail) => {
    try {
      await verifyBeforeUpdateEmail(user, newEmail);  // Send an email verification to the new email

      await updateEmail(user, newEmail);
      console.log('success email for sign in CHANGE');
    } catch (error) {
      console.error('Error updating sign in email', error);
    }
  }
  // When an email is changed, must change the Document ID to match
  const changeDocumentID = async (currentID, newID) => {
    try {
      // Retrieve the data from the existing document
      const currentDocRef = doc(db, 'DRIVERS', currentID);
      const currentDocSnapshot = await getDoc(currentDocRef);
      const currentDocData = currentDocSnapshot.data();

      // Create a new document with the new email as the Document ID
      const newDocRef = doc(db, 'DRIVERS', newID);
      await setDoc(newDocRef, currentDocData);

      // Delete the existing document, which is now outdated 
      await deleteDoc(currentDocRef);

      console.log('Document ID changed successfully!');
    } catch (error) {
      console.error('Error changing document ID:', error);
    }
  }
 
  // User has entered a new first name
  const updateFirstName = async () => {
    try {
      const userDocRef = doc(db, "DRIVERS", documentID)  // Get the document, this is currently just for "driver"s
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
      const userDocRef = doc(db, "DRIVERS", documentID)  // Get the document, this is currently just for "driver"s
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
      const userDocRef = doc(db, "DRIVERS", documentID)  // Get the document, this is currently just for "driver"s
      await updateDoc(userDocRef, {
        phoneNumber: newPhoneNumber
      });
    } catch (error) {
      console.error('Error updating phone number', error);
    }
  };

  // When change email, sign out
  const handleSignOut = () => {
    setTimeout(() => {
      signOut(auth)
          .then(() => {
            navigation.navigate('SignIn');
            Alert.alert('You have been signed out. Please verify your new email.')
          })
          .catch((error) => {
            console.error('Sign out error:', error);
          });
    }, 4000);  // 4 second delay
        
  };

  // Called when user presses the "Submit Changes" button
  // Changes are only made if user inputs text into text box before pressing button
  const handleSubmitChanges = () => {
    if (newFirstName != '') {  // If a new first name is entered
      updateFirstName();       // Call function (line )
    }
    if (newLastName != '') {  // If a new last name is entered
      updateLastName();       // Call function (line )
    }
    if (newPhoneNumber != '') {  // If a new phone number is entered
      updatePhoneNumber();       // Call function (line )
    }
    if (newEmail != '') {  // If a new email is entered
      setIsChangingEmail(true);  // So the app knows to change the text on the Submit Button
      
      // The first time this function is called, user will be prompted to enter their password
      if (!isReauthenticated && (password == '')) {  
        Alert.alert("Confirm password to change email.");
      }
      // The second time this function is called, user will have already entered a password
      if (!isReauthenticated && (password != '')) {
        reauthenticate();
        
      }
      // The third time this function is called, if reauthentication was success
      if (isReauthenticated) {
        updateAllEmail();    // Call function (line )
        setIsChangingEmail(false);
        setIsReauthenticated(false);
        handleSignOut();     // Email was changed, so must sign out and email verification must be completed
      }
    }
  };

  // Reauthenticate user before changing email
  const reauthenticate = async () => {
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      Alert.alert("Authentication Successful, Press Button to Change Email");
      setIsReauthenticated(true);
    } catch (error) {
      console.error('Error reauthenticating:', error);
      // Handle reauthentication error (e.g., show an error message to the user)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}> 
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#666"
        onChangeText={setNewFirstName}
        value={newFirstName}
        autoCapitalize="none"
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
        onChangeText={setNewPhoneNumber}
        value={newPhoneNumber}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        onChangeText={setNewEmail}
        value={newEmail}
        autoCapitalize="none"
      />

      {isChangingEmail && (!isReauthenticated) && (
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#666"
          onChangeText={setPassword}
          value={password}
          autoCapitalize="none"
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmitChanges}>
        <Text>{(isChangingEmail && (!isReauthenticated)) ? "Confirm Password" : "Submit Changes" } </Text>
      </TouchableOpacity>

      
    </View>
    </TouchableWithoutFeedback>
  );
};

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
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 15,
  },
  button: {
    height: 50,
    width: 150,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft:30,
  }
})

// fixed ['navigation.navigate' is missing in props validationeslintreact/prop-types] error
EditProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditProfileScreen;