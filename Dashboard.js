import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, /*Dimensions*/ } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getAuth, signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PropTypes } from 'prop-types';

const Dashboard = ({ navigation, route }) => {
  const role = route.params?.role || 'defaultRole';
  const [userLocation, setUserLocation] = useState(null);
  const mapViewRef = useRef(null);
  const locationUpdateInterval = useRef(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Added state for dropdown visibility

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

    const locationData = {
      userId: userId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date(),
    };

    try {
      await addDoc(collection(db, 'locations'), locationData);
      console.log('Location data recorded');
    } catch (error) {
      console.error('Error recording location data: ', error);
    }
  };

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

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigation.navigate('SignIn');
    }).catch((error) => {
      console.error('Sign out error:', error);
    });
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

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

      <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}>
        <MaterialIcons name="menu" size={24} color="black" />
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('ContactsScreen')}>
            <Text style={styles.dropdownItemText}>Contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('UserProfileScreen')}>
            <Text style={styles.dropdownItemText}>Profile</Text>
          </TouchableOpacity>

          {role === 'manager' && (
            <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('LocationHistoryScreen', { userId })}>
              <Text style={styles.dropdownItemText}>Log</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.dropdownItem} onPress={handleSignOut}>
            <Text style={styles.dropdownItemText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

//const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  menuButton: {
    position: 'absolute',
    top: '1%',
    left: '1%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    zIndex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  // Feel free to add or modify styles as needed
});

// fixed ['navigation.navigate' is missing in props validationeslintreact/prop-types] error
Dashboard.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default Dashboard;
