import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getAuth, signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc, query, where, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PropTypes } from 'prop-types';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { custNumberRef } from './TakeOrderScreen';
import { getDistance } from 'geolib';
import debounce from 'lodash/debounce';

const Dashboard = ({ navigation }) => {
  // State variables
  const [role, setRole] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const mapViewRef = useRef(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedOrderLocation, setSelectedOrderLocation] = useState(null);
  const [polylineCoordinates, setPolylineCoordinates] = useState([]);
  const [eta, setEta] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isSettingsDropdownVisible, setIsSettingsDropdownVisible] = useState(false);
  const [userLocations, setUserLocations] = useState([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastViewed, setLastViewed] = useState(null);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [distanceFromDelivery, setDistanceFromDelivery] = useState(null);

  // Firebase and Google Maps API setup
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const user = auth.currentUser;
  const googleMapsApiKey = 'AIzaSyBqdK2r3h7vi8WZ1ldQRHiayg0Mj5JbeUw';

  // Function to set marker location
  const setMarkerLocation = (location) => {
    setMarkers((currentMarkers) => [
      ...currentMarkers,
      {
        id: new Date().toISOString(),
        latitude: location.latitude,
        longitude: location.longitude,
      },
    ]);
  };

  // Memoize the geocodeAddress function to avoid unnecessary re-calculations
  const memoizedGeocodeAddress = useMemo(() => geocodeAddress, []);

  // Fetch and set the destination location when the delivery address changes
  useEffect(() => {
    const fetchAndSetDestinationLocation = async () => {
      if (deliveryAddress) {
        try {
          const destinationLocation = await memoizedGeocodeAddress(deliveryAddress);
          setSelectedOrderLocation(destinationLocation);
        } catch (error) {
          console.error('Failed to fetch or set destination location:', error);
          // Display user-friendly error message
        }
      }
    };

    fetchAndSetDestinationLocation();
  }, [deliveryAddress, memoizedGeocodeAddress]);

  // Calculate the distance between the user's location and the delivery address
  useEffect(() => {
    const calculateDistance = () => {
      if (userLocation && deliveryAddress) {
        const deliveryCoords = { latitude: 38.5816, longitude: -121.4944 };
        const distance = getDistance(userLocation, deliveryCoords, 1); // Returns distance in meters
        setDistanceFromDelivery(distance / 1000); // Convert to kilometers
      }
    };

    calculateDistance();
  }, [userLocation, deliveryAddress]);

  // Fetch user locations from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'locations'), where('isActive', '==', true)),
      (snapshot) => {
        const newLocations = [];
        const now = new Date().getTime();

        snapshot.forEach((doc) => {
          const data = doc.data();
          const lastUpdate = data.timestamp.toDate().getTime();
          let status = 'online';

          if (now - lastUpdate > 20000 && now - lastUpdate <= 40000) {
            status = 'recentlyOffline';
          } else if (now - lastUpdate > 40000) {
            status = 'offline';
          }

          if (status !== 'offline') {
            newLocations.push({ userId: doc.id, ...data, status, lastUpdate });
          }
        });

        setUserLocations(newLocations.filter((location) => location.status !== 'offline'));
      },
      (error) => {
        console.error('Error fetching user locations:', error);
        // Display user-friendly error message
      }
    );

    return () => unsubscribe();
  }, []);

  // Use debounce to limit the frequency of location updates
  const updateLocation = useCallback(
    debounce(async () => {
      const location = await Location.getCurrentPositionAsync({});
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(),
        isActive: true,
      };

      await setDoc(doc(db, 'locations', userId), locationData);
    }, 5000),
    []
  );

  // Update the user's location every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateLocation();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      updateLocation.cancel();
    };
  }, [updateLocation]);

  // Function to get directions from Google Maps API
  const getDirections = async (startLoc, destinationLoc) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc.latitude},${startLoc.longitude}&destination=${destinationLoc.latitude},${destinationLoc.longitude}&key=${googleMapsApiKey}`
      );
      const json = await response.json();

      if (json.status !== 'OK' || !json.routes[0]) {
        throw new Error('Error fetching directions');
      }

      const points = json.routes[0].overview_polyline.points;
      const steps = decodePolyline(points);
      const eta = json.routes[0].legs[0].duration.text;

      return { steps, eta };
    } catch (error) {
      console.error('Error fetching directions:', error);
      return { steps: [], eta: '' };
    }
  };

  // Function to clear the route
  const clearRoute = () => {
    setPolylineCoordinates([]);
    setEta('');
    setDeliveryLocation(null);
    setMarkers([]);
  };

  // Log the delivery address when it changes
  useEffect(() => {
    console.log('Delivery address updated:', deliveryAddress);
  }, [deliveryAddress]);

  // Function to decode the polyline from Google Maps API
  const decodePolyline = (encoded) => {
    if (!encoded) {
      return [];
    }
    const poly = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;
    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) ? ~(result >> 1) : result >> 1;
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) ? ~(result >> 1) : result >> 1;
      lng += dlng;
      poly.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return poly;
  };

  // Function to handle order selection
  const onSelectOrder = async (orderId) => {
    console.log('Attempting to fetch order with ID:', orderId);
    try {
      clearRoute();

      const orderDocSnap = await getDoc(doc(db, 'ORDERS', orderId));
      if (!orderDocSnap.exists()) {
        console.error(`Order with ID ${orderId} not found`);
        return;
      }
      const orderData = orderDocSnap.data();
      const deliveryAddress = orderData.deliveryAddress;
      const startLocation = userLocation;
      setDeliveryLocation(null);
      const destinationLocation = await memoizedGeocodeAddress(deliveryAddress);
      setDeliveryLocation(destinationLocation);
      const { steps, eta } = await getDirections(startLocation, destinationLocation);
      setPolylineCoordinates(steps);
      setEta(eta);

      setMarkerLocation(destinationLocation);

      mapViewRef.current.fitToCoordinates([startLocation, destinationLocation], {
        edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
        animated: true,
      });

      setIsDropdownVisible(false);
    } catch (error) {
      console.error('Error fetching order details:', error);
      // Display user-friendly error message
    }
  };

  // Function to geocode an address using Google Maps API
  async function geocodeAddress(address) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${googleMapsApiKey}`
      );
      const json = await response.json();
      if (json.results && json.results.length > 0) {
        const location = json.results[0].geometry.location;
        return { latitude: location.lat, longitude: location.lng };
      } else {
        throw new Error('No results found');
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      return { latitude: 0, longitude: 0 };
    }
  }

  // Function to make a phone call
  const makePhoneCall = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('tel: ' + custNumberRef);
    }
    if (Platform.OS == 'ios') {
      Linking.openURL('tel:// ' + custNumberRef);
    } else {
      Linking.openURL('telprompt: ' + custNumberRef);
    }
  };

  // Function to get the user's location
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
      // Display user-friendly error message
    }
  };

  // Function to center the map on the user's location
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

  // Function to handle user sign out
  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'No',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          const userLocationRef = doc(db, 'locations', userId);
          await setDoc(userLocationRef, { isActive: false }, { merge: true });

          signOut(auth)
            .then(() => {
              navigation.navigate('SignIn');
            })
            .catch((error) => {
              console.error('Sign out error:', error);
              // Display user-friendly error message
            });
        },
      },
    ]);
  };

  // Function to toggle the dropdown
  const toggleDropdown = () => {
    if (role !== 'manager') {
      Alert.alert('Access Denied', 'You do not have permission to access this feature.');
      return;
    }

    setIsDropdownVisible(!isDropdownVisible);
    if (!isDropdownVisible) {
      setLastViewed(new Date());
      setNewOrdersCount(0);
      AsyncStorage.setItem('lastViewed', new Date().toString());
      AsyncStorage.setItem('newOrdersCount', '0');
    }
  };

  // Get the user's location when the component mounts
  useEffect(() => {
    getUserLocation();

    return () => {
      // Clean up any necessary subscriptions or intervals
    };
  }, []);

  // Fetch the user's role from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'USERS', user.email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Display user-friendly error message
      }
    };

    fetchUserData();
  }, [user.email]);

  // Fetch pending orders from Firestore
  useEffect(() => {
    const pendingOrdersQuery = query(collection(db, 'ORDERS'), where('status', '==', 'pending'));

    const unsubscribe = onSnapshot(
      pendingOrdersQuery,
      (querySnapshot) => {
        let orders = [];

        querySnapshot.forEach((doc) => {
          const order = { id: doc.id, ...doc.data() };
          orders.push(order);
        });

        orders.sort((a, b) => {
          const aCreatedAt = a.createdAt ? a.createdAt.toDate() : 0;
          const bCreatedAt = b.createdAt ? b.createdAt.toDate() : 0;
          return aCreatedAt - bCreatedAt;
        });

        setCurrentOrders(orders);
      },
      (error) => {
        console.error('Error fetching pending orders:', error);
        // Display user-friendly error message
      }
    );

    return () => unsubscribe();
  }, [db]);
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
        onPress={() => setIsDropdownVisible(false)}
        compassButton={false}
      >
        {role === 'manager' &&
          userLocations.map((location, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={`User: ${location.userId}`}
              pinColor={location.status === 'online' ? 'blue' : 'yellow'}
            />
          ))}

        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title="Delivery Location"
            pinColor="#39FF14"
          />
        ))}

        {deliveryLocation && deliveryAddress && (
          <Marker
            key={deliveryAddress}
            coordinate={deliveryLocation}
            title="Delivery Location"
            description={deliveryAddress}
          />
        )}

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

        <Polyline coordinates={polylineCoordinates} strokeWidth={6} strokeColor="#007bff" />
      </MapView>

      {eta && (
        <View style={styles.etaContainer}>
          <Text style={styles.etaText}>Estimated Time Arrival: {eta}</Text>
        </View>
      )}

      {eta && (
        <>
          <View style={styles.etaContainer}>
            <Text style={styles.etaText}>Estimated Time Arrival: {eta}</Text>
          </View>
          <TouchableOpacity onPress={clearRoute} style={styles.clearRouteButton}>
            <Text style={styles.clearRouteButtonText}>Clear Route</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}>
        <MaterialIcons name="list" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.callButton} onPress={makePhoneCall}>
        <MaterialIcons name="call" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.callButton} onPress={makePhoneCall}>
        <MaterialIcons name="call" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}>
        <MaterialIcons name="menu" size={24} color="black" />
      </TouchableOpacity>

      <Image
        source={require('./assets/Logo.png')}
        style={styles.logo}
        resizeMode="contain"
        pointerEvents="none"
      />

      <TouchableOpacity style={styles.locationButton} onPress={centerOnUserLocation}>
        <MaterialIcons name="my-location" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.exitButton]} onPress={handleSignOut}>
        <MaterialIcons name="exit-to-app" size={24} color="black" />
      </TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}>
            {currentOrders.length > 0 ? 'Current Orders' : 'No Current Orders'}
          </Text>
          <View style={styles.titleUnderline}></View>
          <ScrollView style={styles.scrollView}>
            {currentOrders.map((order) => (
              <View key={order.id}>
                <TouchableOpacity onPress={() => onSelectOrder(order.id)} style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>
                    Order <Text style={styles.orderNumber}>#{order.orderNumber}</Text> by{' '}
                    {order.userFirstName} {order.userLastName} -{' '}
                    {order.deliveryAddress.split(',').slice(0, 2).join(',')}
                  </Text>
                </TouchableOpacity>
                <View style={styles.dropdownDivider}></View>
              </View>
            ))} 
          </ScrollView>
        </View>
      )}
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
  menuButton: {
    position: 'absolute',
    top: '5%',
    left: '5%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    zIndex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: 80,
    left: 0,
    backgroundColor: '#fff',
    padding: 3,
    borderRadius: 5,
    zIndex: 10,
    minWidth: 400,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownItemText: {
    fontSize: 16,
    marginVertical: 5,
    paddingHorizontal: 0,
  },
  dropdownDivider: {
    height: 0,
    backgroundColor: '#e0e0e0',
    marginVertical: 0,
  },
  locationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logo: {
    position: 'absolute',
    top: '-5%',
    alignSelf: 'center',
    width: 175,
    height: 175,
    resizeMode: 'contain',
    zIndex: 1,
  },
  callButton: {
    position: 'absolute',
    top: '17%',
    left: '5%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    zIndex: 1,
  },
  scrollView: {
    maxHeight: 500,
  },
  orderNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  etaContainer: {
    position: 'absolute',
    bottom: 70,
    left: '5%',
    right: '5%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaText: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  clearRouteButton: {
    position: 'absolute',
    bottom: 17,
    alignSelf: 'center',
    backgroundColor: '#e74c3c',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  clearRouteButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  exitButton: {
    position: 'absolute',
    top: '29%',
    left: '5%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    zIndex: 1,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    color: '#000',
    textAlign: 'center',
  },
  titleUnderline: {
    height: 2,
    backgroundColor: 'lightgrey',
    borderRadius: 10,
    marginVertical: 1,
    width: '100%',
  },
});

Dashboard.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default Dashboard;