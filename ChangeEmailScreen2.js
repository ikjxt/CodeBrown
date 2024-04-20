import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { getAuth, signOut, verifyBeforeUpdateEmail, updateEmail } from '@firebase/auth';
import { doc, updateDoc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { PropTypes } from 'prop-types';

const ChangeEmailScreen2 = ({ navigation }) => {
  const [newEmail, setNewEmail] = useState('');

  const auth = getAuth();         // Set observer on Auth object,
  const user = auth.currentUser;  // Get the current user's profile
  const documentID = user.email;  // Get the user's email, which is the ID of the document on our Firestore
  var oldDocumentID = '';         // Needed when recreating a Document with a new ID

  const handleSubmit = () => {
    updateAllEmail();
    handleSignOut();
  }

  // When user changes their email: must change the 'email' field of the document, 
  // must change the Document ID (which should always be the same email), and must change the email used to sign in
  const updateAllEmail = async () => {
    try {
      oldDocumentID = documentID;  // Save the old ID

      // Change email field of document
      const userDocRef = doc(db, "USERS", documentID)  // Get the document, this is currently just for "driver"s
      await updateDoc(userDocRef, {               
        email: newEmail                                 
      });

      // Update the Document ID, because it should be the new emailr
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
      const currentDocRef = doc(db, 'USERS', currentID);
      const currentDocSnapshot = await getDoc(currentDocRef);
      const currentDocData = currentDocSnapshot.data();

      // Create a new document with the new email as the Document ID
      const newDocRef = doc(db, 'USERS', newID);
      await setDoc(newDocRef, currentDocData);

      // Delete the existing document, which is now outdated 
      await deleteDoc(currentDocRef);

      console.log('Document ID changed successfully!');
    } catch (error) {
      console.error('Error changing document ID:', error);
    }
  }

  // When change email, sign out
  const handleSignOut = () => {
    setNewEmail('');  // Clear Text Box
    Alert.alert("Changes Saved");
    setTimeout(() => {
      signOut(auth)
          .then(() => {
            navigation.navigate('SignIn');
            Alert.alert('You have been signed out. Please check your email for verification.')
          })
          .catch((error) => {
            console.error('Sign out error:', error);
          });
    }, 4000);  // 4 second delay
  };

  return (
    <View style={styles.container}> 
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        onChangeText={setNewEmail}
        value={newEmail}
        autoCapitalize="none"
      />
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
ChangeEmailScreen2.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default ChangeEmailScreen2;