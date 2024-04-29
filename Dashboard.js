// Import necessary modules from React and React Native libraries.
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image,Platform, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getAuth, signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc, query, where, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PropTypes } from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { custNumberRef } from './TakeOrderScreen'; 
import { getDistance } from 'geolib';
import debounce from 'lodash/debounce'; 
import { styles } from './DashboardStyles';

const Dashboard = ({ navigation }) => {
  // Initialize state variables for managing various functionalities and data.
  const [role, setRole] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const mapViewRef = useRef(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedOrderLocation, setSelectedOrderLocation] = useState(null);
  const [polylineCoordinates, setPolylineCoordinates] = useState([]);
  const [eta, setEta] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [userLocations, setUserLocations] = useState([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastViewed, setLastViewed] = useState(null);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [distanceFromDelivery, setDistanceFromDelivery] = useState(null);
  const [orderCreatorLocation, setOrderCreatorLocation] = useState(null);
  const [userFullNames, setUserFullNames] = useState({});

  // Setup for Firebase authentication and user session.
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const user = auth.currentUser;

  // Google Maps API key for utilizing Maps functionalities.
  const googleMapsApiKey = 'AIzaSyBqdK2r3h7vi8WZ1ldQRHiayg0Mj5JbeUw';

  // Function to initiate a phone call to a customer using the native phone app.
  const makePhoneCall = () => {
    if (Platform.OS === 'android') {
      Linking.openURL('tel: ' + 9169269050);
    }
    if (Platform.OS == 'ios') {
      Linking.openURL('tel:// ' + 9169269050);
    } else {
      Linking.openURL('telprompt: ' + 9169269050);
    }
  };

  // Hook to monitor and update the activity status of the order creator in real-time.
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (orderCreatorLocation?.userId) {
        const docRef = doc(db, 'locations', orderCreatorLocation.userId);
        getDoc(docRef)
        .then((doc) => {
          if (doc.exists()) {
            const data = doc.data();
            const lastUpdate = data.timestamp.toDate();
            const timeDifference = new Date() - lastUpdate;
            const isActive = timeDifference < 6500; // Checks if the user is active within the last 6.5 seconds.
            
            // Update the active status of the order creator.
            setOrderCreatorLocation(prevState => ({ ...prevState, isActive, }));
          } else {
            console.error('Location data not found for user ID:', orderCreatorLocation.userId);
          }
        })
        .catch((error) => {console.error('Error fetching location data:', error); });
      }
    }, 1000); // Check every second.

    // Cleanup function to clear interval on component unmount.
    return () => clearInterval(intervalId);
  }, [orderCreatorLocation?.userId]); // Re-run effect when userId changes
  
  // Function to set marker location
  const setMarkerLocation = (location) => {
    setMarkers((currentMarkers) => [ ...currentMarkers, { id: new Date().toISOString(), latitude: location.latitude, longitude: location.longitude, }, ]);
  };

  // Memoize the geocodeAddress function to avoid unnecessary re-calculations
  const memoizedGeocodeAddress = useMemo(() => geocodeAddress, []);

  const fetchUserFullName = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'USERS', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const firstName = userData.firstName || '';
        const lastName = userData.lastName || '';
        return `${firstName} ${lastName}`.trim() || 'Unknown User';
      } else {
        console.error('User document not found for user ID:', userId);
        return 'Unknown User';
      }
    } catch (error) {
      console.error('Error fetching user full name:', error);
      return 'Unknown User';
    }
  };

  // Fetch and set the destination location when the delivery address changes
  useEffect(() => {
    const fetchAndSetDestinationLocation = async () => {
      if (deliveryAddress) {
        try {
          const destinationLocation = await memoizedGeocodeAddress(deliveryAddress);
          setSelectedOrderLocation(destinationLocation);
        } catch (error) { console.error('Failed to fetch or set destination location:', error);}
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
      async (snapshot) => {
        const newLocations = [];
        const newUserFullNames = {};
        const now = new Date().getTime();
  
        for (const doc of snapshot.docs) {
          const data = doc.data();
          const lastUpdate = data.timestamp.toDate().getTime();
          let status = 'online';
  
          if (now - lastUpdate > 6000 && now - lastUpdate <= 6000) {
            status = 'recentlyOffline';
          } else if (now - lastUpdate > 6000) {
            status = 'offline';
          }
          if (status !== 'offline') {
            newLocations.push({ userId: doc.id, ...data, status, lastUpdate });
  
            // Fetch the user's full name using their email from the location document
            if (data.email) {
              const userFullName = await fetchUserFullName(data.email);
              newUserFullNames[doc.id] = userFullName;
            } else {
              console.log('Email not found for user ID', doc.id);
              newUserFullNames[doc.id] = 'Unknown User';
            }
          }
        }
  
        setUserLocations(newLocations.filter((location) => location.status !== 'offline'));
        setUserFullNames(newUserFullNames);
      },
      (error) => { console.error('Error fetching user locations:', error); }
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
        email: user.email, // Add the user's email to the location data
      };
      await setDoc(doc(db, 'locations', userId), locationData);
    }, 1000),
    [user.email] // Add user.email as a dependency
  );



  // Update the user's location every 5 seconds
  useEffect(() => { 
    const intervalId = setInterval(() => { updateLocation(); }, 1000);
    return () => { clearInterval(intervalId); updateLocation.cancel(); };
  }, [updateLocation]);

  // Function to calculate and set the route for delivery using Google Maps API.
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
    } catch (error) { console.error('Error fetching directions:', error);
      return { steps: [], eta: '' };
    }
  };

  // Function to clear the route
  const clearRoute = () => { setMarkers([]); setPolylineCoordinates([]); setEta(''); setDeliveryLocation(null); setOrderCreatorLocation(null); };

  // Log the delivery address when it changes
  useEffect(() => { console.log('Delivery address updated:', deliveryAddress); }, [deliveryAddress]);

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
  // Function to handle order selection
const onSelectOrder = async (orderId) => {
  setOrderCreatorLocation(null);
  console.log('Attempting to fetch order with ID:', orderId);
  try {
    clearRoute();

    const orderDocSnap = await getDoc(doc(db, 'ORDERS', orderId));
    if (!orderDocSnap.exists()) {
      console.error(`Order with ID ${orderId} not found`);
      return;
    }
    const orderData = orderDocSnap.data();
    const userLocationSnap = await getDoc(doc(db, 'locations', orderData.userId));
    if (!userLocationSnap.exists()) {
      console.error(`Location for user ID ${orderData.userId} not found`);
      return;
    }
    const creatorLocationData = userLocationSnap.data();
    const lastLocationUpdate = creatorLocationData.timestamp.toDate();
    const timeDifference = new Date() - lastLocationUpdate;
    const isActive = timeDifference < 3000;
    console.log('isActive:', isActive);

    setOrderCreatorLocation({
      latitude: creatorLocationData.latitude,
      longitude: creatorLocationData.longitude,
      userId: orderData.userId,
      isActive,
      userFirstName: orderData.userFirstName,
      userLastName: orderData.userLastName
    });

    const startLocation = { latitude: creatorLocationData.latitude, longitude: creatorLocationData.longitude };
    const deliveryAddress = orderData.deliveryAddress;
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
    console.error('Error fetching order details or user location:', error);
  } // Ensure this line is properly terminated with a semicolon or correctly formatted
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
    } catch (error) { console.error('Error geocoding address:', error);
      return { latitude: 0, longitude: 0 };
    }
  }

  // Function to get the user's location
  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Location permission denied');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setUserLocation(location.coords);

    const locationData = { userId: userId, latitude: location.coords.latitude, longitude: location.coords.longitude, timestamp: new Date(), };
    try {
      await addDoc(collection(db, 'locations'), locationData);
      console.log('Location data recorded');
    } catch (error) { console.error('Error recording location data: ', error); }
  };

  // Function to center the map on the user's location
  const centerOnUserLocation = () => {
    if (userLocation && mapViewRef.current) {
      mapViewRef.current.animateToRegion({ latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02, });
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
        querySnapshot.forEach((doc) => { const order = { id: doc.id, ...doc.data() }; orders.push(order); });
        orders.sort((a, b) => { const aCreatedAt = a.createdAt ? a.createdAt.toDate() : 0; const bCreatedAt = b.createdAt ? b.createdAt.toDate() : 0; return aCreatedAt - bCreatedAt; });
        setCurrentOrders(orders);
      },
      (error) => { console.error('Error fetching pending orders:', error); }
    );

    return () => unsubscribe();
  }, [db]);


  return (
    // Render the component UI: MapView, markers, buttons, etc.
    <View style={styles.container}>
      <MapView ref={mapViewRef} style={styles.map} initialRegion={{
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
{role === 'manager' && userLocations.filter(location => location.userId !== userId).map((location, index) => (
  <Marker key={index} coordinate={{ latitude: location.latitude, longitude: location.longitude }} title={`User: ${userFullNames[location.userId] || 'Unknown User'}`}>
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <MaterialIcons name={location.isActive ? 'location-on' : 'location-off'} size={28} color={location.isActive ? 'blue' : 'red'} />
    </View>
  </Marker>
))}

{orderCreatorLocation && (
  <Marker
    coordinate={{
      latitude: orderCreatorLocation.latitude,
      longitude: orderCreatorLocation.longitude,
    }}

    title={`User: ${orderCreatorLocation.userFirstName || 'Unknown'} ${orderCreatorLocation.userLastName || 'User'}`} // Display full name
  >
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <MaterialIcons
        name={orderCreatorLocation.isActive ? 'location-on' : 'location-off'}
        size={28}
        color={orderCreatorLocation.isActive ? 'blue' : 'red'}
      />
    </View>
  </Marker>
)}

        {markers.map((marker, index) => ( <Marker key={index} coordinate={{ latitude: marker.latitude, longitude: marker.longitude, }} title="Delivery Location" pinColor="#39FF14" /> ))}

        {deliveryLocation && deliveryAddress && ( <Marker key={deliveryAddress} coordinate={deliveryLocation} title="Delivery Location" description={deliveryAddress} /> )}

        {userLocation && (
  <Marker coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude, }} title={`User: ${userFullNames[userId] || 'Unknown User'}`}>
    <View style={{ alignItems: 'center', justifyContent: 'center' }}><MaterialIcons name="my-location" size={28} color="rgba(30, 144, 255, 0)" /></View>
  </Marker>
)}
        <Polyline coordinates={polylineCoordinates} strokeWidth={6} strokeColor="#007bff" />
        </MapView>

      {eta && (<View style={styles.etaContainer}><Text style={styles.etaText}>Estimated Time Arrival: {eta}</Text></View>)}

      {eta && (<>
        <View style={styles.etaContainer}><Text style={styles.etaText}>Estimated Time Arrival: {eta}</Text></View>
          <TouchableOpacity onPress={clearRoute} style={styles.clearRouteButton}><Text style={styles.clearRouteButtonText}>Clear Route</Text></TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}><MaterialIcons name="list" size={24} color="black" /></TouchableOpacity>
      <TouchableOpacity style={styles.callButton} onPress={makePhoneCall}><MaterialIcons name="call" size={24} color="black" /></TouchableOpacity>
      <TouchableOpacity style={styles.callButton} onPress={makePhoneCall}><MaterialIcons name="call" size={24} color="black" /></TouchableOpacity>
      <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}><MaterialIcons name="menu" size={24} color="black" /></TouchableOpacity>
      <Image source={require('./assets/Logo.png')} style={styles.logo} resizeMode="contain" pointerEvents="none"/>
      <TouchableOpacity style={styles.locationButton} onPress={centerOnUserLocation}><MaterialIcons name="my-location" size={24} color="black" /></TouchableOpacity>
      <TouchableOpacity style={[styles.exitButton]} onPress={handleSignOut}><MaterialIcons name="exit-to-app" size={24} color="black" /></TouchableOpacity>

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <Text style={styles.dropdownTitle}> {currentOrders.length > 0 ? 'Current Orders' : 'No Current Orders'} </Text>
          <View style={styles.titleUnderline}></View>
          <ScrollView style={styles.scrollView}> 
            {currentOrders.map((order) => (
              <View key={order.id}>
                <TouchableOpacity onPress={() => onSelectOrder(order.id)} style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}> Order <Text style={styles.orderNumber}>#{order.orderNumber}
                  </Text> by{' '} {order.userFirstName} {order.userLastName} -{' '} {order.deliveryAddress.split(',').slice(0, 2).join(',')} </Text>
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

// Define propTypes for the component for better type checking and documentation.
Dashboard.propTypes = { navigation: PropTypes.shape({ navigate: PropTypes.func.isRequired, }).isRequired, };

export default Dashboard;
