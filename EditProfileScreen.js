import { React, useState } from "react";
import { View, TextInput, StyleSheet, Text, Alert, TouchableWithoutFeedback, Keyboard } from "react-native";
import { getAuth } from "firebase/auth";
import { TouchableOpacity } from "react-native-gesture-handler";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { PropTypes } from 'prop-types';

const EditProfileScreen = ({ navigation }) => {
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');

  const auth = getAuth();
  const user = auth.currentUser;
  const documentID = user.email;

  const updateFirstName = async () => {
    try {
      const userDocRef = doc(db, "USERS", documentID);
      await updateDoc(userDocRef, {
        firstName: newFirstName
      });
    } catch (error) {
      console.error('Error updating first name', error);
    }
  };

  const updateLastName = async () => {
    try {
      const userDocRef = doc(db, "USERS", documentID);
      await updateDoc(userDocRef, {
        lastName: newLastName
      });
    } catch (error) {
      console.error('Error updating last name', error);
    }
  };

  const updatePhoneNumber = async () => {
    try {
      const userDocRef = doc(db, "USERS", documentID);
      await updateDoc(userDocRef, {
        phoneNumber: newPhoneNumber
      });
    } catch (error) {
      console.error('Error updating phone number', error);
    }
  };

  const handleSubmitChanges = () => {
    if (newFirstName || newLastName || newPhoneNumber) {
      Alert.alert("Changes Saved");
    }
    if (newFirstName) {
      updateFirstName();
      setNewFirstName('');
    }
    if (newLastName) {
      updateLastName();
      setNewLastName('');
    }
    if (newPhoneNumber) {
      updatePhoneNumber();
      setNewPhoneNumber('');
    }
  };

  const handleChangeEmail = () => {
    navigation.navigate('Enter Current Password');
  };

  const handleChangePassword = () => {
    navigation.navigate('Enter Current Password');
  };

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
          onChangeText={(text) => setNewPhoneNumber(text.replace(/[^0-9]/g, '').slice(0, 10))}
          value={newPhoneNumber}
          keyboardType="numeric"
          maxLength={10}
        />

        <TouchableOpacity style={styles.button2} onPress={handleChangeEmail}>
          <Text>Email</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button2} onPress={handleChangePassword}>
          <Text>Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button1} onPress={handleSubmitChanges}>
          <Text>Submit Changes</Text>
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
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
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
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'left',
    marginTop: 15,
    marginBottom: 15,
    paddingLeft: 15,
  }
})

EditProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default EditProfileScreen;