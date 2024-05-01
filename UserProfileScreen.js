import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import Card from './Card';
import { getAuth } from 'firebase/auth';
import { PropTypes } from 'prop-types';
import { doc, onSnapshot } from '@firebase/firestore';
import { db } from "./firebaseConfig";

const UserProfileScreen = ({ navigation }) => {
  // State variables
  const [fName, setFName] = useState('');
  const [lName, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'USERS', user.email), (docSnap) => {
      if (docSnap.exists()) {
        setFName(docSnap.data().firstName);
        setLName(docSnap.data().lastName);
        setEmail(docSnap.data().email);
        setPhone(docSnap.data().phoneNumber);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [user.email]);

  const editProfile = () => {
    navigation.navigate('EditProfileScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image source={require("./assets/Logo.png")} style={styles.logo} resizeMode="contain" />
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <Card
            title="Profile"
            description={
              <Text style={styles.descriptionText}>
                <Text style={styles.label}>First Name: </Text>{fName} {"\n"}
                <Text style={styles.label}>Last Name: </Text>{lName} {"\n"}
                <Text style={styles.label}>Email: </Text>{email} {"\n"}
                <Text style={styles.label}>Phone: </Text>{phone} {"\n"}
              </Text>
            }
          />
        )}
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
    marginLeft: 30,
  },
  editButton: {
    backgroundColor: "#e74c3c",
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
});

UserProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default UserProfileScreen;