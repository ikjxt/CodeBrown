import React, { useState, useEffect } from 'react';
import { searchDB } from './firebaseConfig';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getAuth, signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

const Dashboard = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);

  // Function to request and get the user's live location
  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
  };

  // Function to query
  const handleSearch = async () => {
    searchDB(DRIVERS);
  }

  // Function to handle centering the map on user's location
  const centerOnUserLocation = () => {
    if (userLocation) {
      mapViewRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02, // Adjust the desired zoom level as needed
        longitudeDelta: 0.02,
      });
    }
  };

  // Function to handle sign out
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigation.navigate('SignIn'); // Redirect to sign-in page after sign out
      })
      .catch((error) => {
        // An error happened.
        console.error('Sign out error:', error);
      });
  };

  useEffect(() => {
    getUserLocation(); // Fetch user's live location when the component mounts
  }, []);

  const mapViewRef = React.createRef();

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        initialRegion={{
          latitude: 38.5816,
          longitude: -121.4944,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        onUserLocationChange={(event) => {
          setUserLocation(event.nativeEvent.coordinate);
        }}
      >
        {/* Display the user's live location as a Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            description="You are here"
          />
        )}
      </MapView>

      {/* Add a button to test Firebase Query*/}
      <TouchableOpacity style={styles.searchButton} onPress = {handleSearch}>
      <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {/* TEST BUTTON*/}
      <TouchableOpacity style={styles.orderButton}>
      <Text style={styles.buttonText}>Current Order</Text>
      </TouchableOpacity>

      {/* Add a button with a pizza slice icon to center the map on the user's location */}
      <TouchableOpacity
        style={styles.centerLocationButton}
        onPress={centerOnUserLocation}
      >
        <MaterialIcons name="local-pizza" size={24} color="#3498db" />
      </TouchableOpacity>

      {/* Add a Sign-out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
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
  centerLocationButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 50,
    position: 'absolute',
    bottom: 20,
    right: 20,
    elevation: 5,
  },
  searchButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    top: 50,
    left: 10,
  },
  orderButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    bottom: 20,
    left: 10,
  },
  signOutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    top: 50,
    right: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Dashboard;
