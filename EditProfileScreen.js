import { React, useState } from "react";
import { View, TextInput, StyleSheet, Text, Alert } from "react-native";
import { getAuth, updateProfile } from "firebase/auth";
import { TouchableOpacity } from "react-native-gesture-handler";

const EditProfileScreen = () => {
  const [name, setName] = useState('');                // For new name from user input
  const [email, setEmail] = useState('');              // For new email form user input
  const [phoneNumber, setPhoneNumber] = useState('');  // For new phone number from user input

  const handleMakeChanges = () => {
    // Firebase "Update a user's profile"
    // Fount @ Docs > Build > Authentication > Web > Manage Users
    const auth = getAuth();
    if (name != '') {
      updateProfile(auth.currentUser, {
        displayName: name
      }).then(() => {
        Alert.alert('Success');
      }).catch((error) => {
        Alert.alert("Failure", error.message);
      })
    }
    if (email != '') {
      updateProfile(auth.currentUser, {
        email: email
      }).then(() => {
        Alert.alert('Success');
      }).catch((error) => {
        Alert.alert("Failure", error.message);
      })
    }
    if (phoneNumber != '') {
      updateProfile(auth.currentUser, {
        phoneNumber: phoneNumber
      }).then(() => {
        Alert.alert('Success');
      }).catch((error) => {
        Alert.alert("Failure", error.message);
      })
    }

    // updateProfile(auth.currentUser, {
    //   // Use the values from the user input
    //   displayName: {name},
    //   email: {email},
    //   phoneNumber: {phoneNumber}
    // }).then( () => {
         // "Profile Updated"
    // }).catch((error) => { 
         // "An error occured"
    // });
  }

  return (
    <View style={styles.container}> 
      <Text style={styles.title}>Edit Profile</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#666"
        onChangeText={setName}
        value={name}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#666"
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#666"
        onChangeText={setPhoneNumber}
        value={phoneNumber}
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleMakeChanges}>
        <Text>Submit Changes</Text>
      </TouchableOpacity>
    </View>
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

export default EditProfileScreen;