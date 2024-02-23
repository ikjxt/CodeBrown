import React , { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Card from './Card';
import { getAuth } from 'firebase/auth';
import { PropTypes } from 'prop-types';
import { doc, getDoc } from '@firebase/firestore';
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
    navigation.navigate('EditProfileScreen')
  }

  return (
    <View>
       <Card
        title="Profile"
        description={<Text>{user.photoURL}
                           First Name: {fName} {"\n"}
                           Last Name: {lName} {"\n"}
                           Email: {email} {"\n"} 
                           Phone: {phone} {"\n"}
                    </Text>}
      /> 
      <TouchableOpacity style={styles.button} onPress={editProfile}>
        <Text>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
UserProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default UserProfileScreen;