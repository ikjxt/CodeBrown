import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getAuth, signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

const Dashboard = ({ navigation, route }) => {
  const role = route.params?.role || 'defaultRole';
  const [userLocation, setUserLocation] = useState(null);
  const mapViewRef = useRef(null);
  const locationUpdateInterval = useRef(null);

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

      <TouchableOpacity style={styles.centerLocationButton} onPress={centerOnUserLocation}>
        <MaterialIcons name="my-location" size={24} color="black" />
      </TouchableOpacity>

      {role === 'manager' && (
        <TouchableOpacity style={[styles.button, styles.logButton]} onPress={() => navigation.navigate('LocationHistoryScreen', { userId })}>
          <Text style={styles.buttonText}>Log</Text>
        </TouchableOpacity>
      )}

      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ContactsScreen')}>
          <Text style={styles.buttonText}>Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UserProfileScreen')}>
          <Text style={styles.buttonText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

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
    top: '1%',
    right: '1%',
    elevation: 5,
  },
  button: {
    height: 50,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
  },
  logButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
});

export default Dashboard;
