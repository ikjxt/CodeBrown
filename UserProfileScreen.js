import React , { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import Card from './Card';
import { getAuth } from 'firebase/auth';
import { PropTypes } from 'prop-types';
import { doc, getDoc, onSnapshot } from '@firebase/firestore';
import { db } from "./firebaseConfig";

const UserProfileScreen = ({ navigation }) => {
  // Need these to work with the useEffect
  const [fName, setFName] = useState(''); 
  const [lName, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const auth = getAuth();         // Set observer on Auth object,
  const user = auth.currentUser;  // Get the current user to display their info
  
  
  // Get data from firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get the doc
        const docRef = doc(db, 'USERS', user.email);  
        const docSnap = await getDoc(docRef);         
        // Get each field
        setFName(docSnap.data().firstName);
        setLName(docSnap.data().lastName);
        setEmail(docSnap.data().email);
        setPhone(docSnap.data().phoneNumber);
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };
    fetchUserData();
  }, []);  // Empty dependency array means this effect runs once after the initial render
    
  const editProfile = () => {
    navigation.navigate('Edit Profile')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content} >
        <Image
          source={require("./assets/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Card
          title="Profile"
          description={<Text style={styles.descriptionText}>
                          <Text style={styles.label}>First Name: </Text>{fName} {"\n"}
                          <Text style={styles.label}>Last Name: </Text>{lName} {"\n"}
                          <Text style={styles.label}>Email: </Text>{email} {"\n"} 
                          <Text style={styles.label}>Phone: </Text>{phone} {"\n"}
                      </Text>}
        /> 
        <TouchableOpacity style={styles.editButton} onPress={editProfile}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: 'center',
  },
  content: {
    width: "100%",
    flex: 1,
    padding: 16,
    alignItems: "center",
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
  }, 
  editButton: {
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
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  descriptionText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },  
  label: {
    fontWeight: "bold",
  },  
  logo: {
    marginTop: -50,
    marginBottom: -16,
    alignSelf: 'center',
    width: 175,
    height: 175,
    resizeMode: 'contain',
    zIndex: 1,
  },
})

// fixed ['navigation.navigate' is missing in props validationeslintreact/prop-types] error
UserProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default UserProfileScreen;