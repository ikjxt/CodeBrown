import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getAuth, signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db, nameSearch, searchDB, showOrders } from './firebaseConfig'; // Ensure this is the correct path to your firebaseConfig
import { Modal } from 'react-native';

const Dashboard = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const mapViewRef = useRef(null);
  const locationUpdateInterval = useRef(null);

  // Get user ID from Firebase Authentication
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);
  };

  // Function to handle centering the map on user's location
  const centerOnUserLocation = () => {
    if (userLocation && mapViewRef.current) {
      mapViewRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  const navigateToContactsScreen = () => {
    navigation.navigate('ContactsScreen');
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate('SignIn');
      })
      .catch((error) => {
        console.error('Sign out error:', error);
      });
  };

  // search button 
  // TO DO: GET USER INPUT TO USE AS ARGUMENT
  const handleSearch = () => {
    try{
      showOrders();
    }catch(error){
      console.error(error)
    }
  }
  

  useEffect(() => {
    getUserLocation();
    locationUpdateInterval.current = setInterval(getUserLocation, 10000);

    return () => {
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, []);

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
        onUserLocationChange={(event) => setUserLocation(event.nativeEvent.coordinate)}
      >
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

      <TouchableOpacity
        style={styles.centerLocationButton}
        onPress={centerOnUserLocation}
      >
        <MaterialIcons name="local-pizza" size={24} color="#3498db" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={navigateToContactsScreen}>
        <Text style={styles.buttonText}>Contacts</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => userId && navigation.navigate('LocationHistoryScreen', { userId })}
      >
        <Text style={styles.historyButtonText}>View Location History</Text>
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
  signOutButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  searchButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    position: 'absolute',
    top: 75,
    right: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  historyButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 10,
    left: 10,
  },
  historyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Dashboard;
