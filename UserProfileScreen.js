import React , { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Keyboard } from 'react-native';
import { getAuth,signOut } from 'firebase/auth';
import { PropTypes } from 'prop-types';
import { doc, getDoc } from '@firebase/firestore';
import { db } from "./firebaseConfig";
import { Alert } from 'react-native';
import { TouchableWithoutFeedback } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';


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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.content}>

          <View style={styles.routeContainer} marginTop={16}> 
            <Text style={styles.routeText}>
              <Text style={styles.routeLabel}>First Name:</Text> {fName} 
            </Text>
            <Text style={styles.routeText}>
              <Text style={styles.routeLabel}>Last Name:</Text> {lName} 
            </Text>
            <Text style={styles.routeText}>
              <Text style={styles.routeLabel}>Email:</Text> {email} 
            </Text>
            <Text style={styles.routeText}>
              <Text style={styles.routeLabel}>Phone:</Text> {phone} 
            </Text>
          </View>  

          <TouchableOpacity style={styles.startButton} onPress={editProfile}>
            <Text style={styles.buttonText}>Edit Profile</Text>
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
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  routeContainer: {
    width: "100%",
    marginBottom: 16,
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
  startButton: {
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
    width: 200,
  },
  completeButton: {
    backgroundColor: "#4caf50", // Green color
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
  },
  navigateButton: {
    backgroundColor: "#2196f3", // Blue color
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  suggestionsList: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
    marginTop: -8,
    marginBottom: 16,
    elevation: 2,
  },
  suggestion: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  
})

// fixed ['navigation.navigate' is missing in props validationeslintreact/prop-types] error
UserProfileScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default UserProfileScreen;