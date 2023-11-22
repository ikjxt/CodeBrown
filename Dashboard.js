import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import { getAuth, signOut } from 'firebase/auth';

const Dashboard = ({ navigation }) => {
  // Function to handle sign out
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
      navigation.navigate('SignIn'); // Redirect to sign-in page after sign out
    }).catch((error) => {
      // An error happened.
      console.error("Sign out error:", error);
    });
  };

const navigateToContactsScreen = () => {
    navigation.navigate('ContactsScreen');
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 38.5816,
          longitude: -121.4944,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />

      <TouchableOpacity style={styles.button} onPress={navigateToContactsScreen}
        accessibilityLabel="Go to Contacts Screen" >
        <Text style={styles.buttonText}>Contacts</Text>
      </TouchableOpacity>

      {/* Add a Sign-out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    top: 110,
    right: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    top: 50,
    right: 10,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Dashboard;
