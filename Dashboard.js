
import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import MapView, { Marker, Polyline} from 'react-native-maps';
import { getAuth, signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc, query, where, onSnapshot, forEach, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PropTypes } from 'prop-types';
import { Platform, Linking } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, doc, getDoc, query, where, onSnapshot, forEach } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PropTypes } from 'prop-types';
import { Platform, Linking } from "react-native"

const Dashboard = ({ navigation }) => {
  const [role, setRole] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const mapViewRef = useRef(null);
  const locationUpdateInterval = useRef(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); 
  const [custNum, setCustNum] = useState('');
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
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Added state for dropdown visibility
  const [custNum, setCustNum] = useState('');

  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const user = auth.currentUser;  
  const googleMapsApiKey = "AIzaSyBqdK2r3h7vi8WZ1ldQRHiayg0Mj5JbeUw";  

  const setMarkerLocation = (location) => {
    setMarkers(currentMarkers => [
      ...currentMarkers,
      {
        id: new Date().toISOString(), 
        latitude: location.latitude,
        longitude: location.longitude,
      }
    ]);
  };

  useEffect(() => {
    const fetchAndSetDestinationLocation = async () => {
      if (deliveryAddress) {
        try {
          const destinationLocation = await geocodeAddress(deliveryAddress);
          setSelectedOrderLocation(destinationLocation);
        } catch (error) {
          console.error('Failed to fetch or set destination location:', error);
        }
      }
    };
  
    fetchAndSetDestinationLocation();
  }, [deliveryAddress]); 
  
  
  useEffect(() => {
    const calculateDistance = (startCoords, endCoords) => {
        const earthRadius = 6371; 
        const lat1 = startCoords.latitude;
        const lon1 = startCoords.longitude;
        const lat2 = endCoords.latitude;
        const lon2 = endCoords.longitude;

        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;

        return distance;
    };

    // Calculate the distance between the user's location and the delivery address
    if (userLocation && deliveryAddress) {
        const deliveryCoords = 
            { latitude: 38.5816, longitude: -121.4944 }; 
        const distance = calculateDistance(userLocation, deliveryCoords);
        setDistanceFromDelivery(distance);
    }
}, [userLocation, deliveryAddress]);


useEffect(() => {
  const unsubscribe = onSnapshot(query(collection(db, 'locations'), where('isActive', '==', true)), (snapshot) => {
    const newLocations = [];
    const now = new Date().getTime();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const lastUpdate = data.timestamp.toDate().getTime();
      let status = 'online';

      if (now - lastUpdate > 20000 && now - lastUpdate <= 40000) { // 20 seconds to just under 40 seconds
        status = 'recentlyOffline';
      } else if (now - lastUpdate > 40000) { // Over 40 seconds
        status = 'offline';
      }

      if (status !== 'offline') {
        newLocations.push({ userId: doc.id, ...data, status, lastUpdate });
      }
    });

    setUserLocations(newLocations.filter(location => location.status !== 'offline'));
  });

  return () => unsubscribe();
}, []);


  const updateLocation = async () => {
    const location = await Location.getCurrentPositionAsync({});
    const locationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date(),
      isActive: true,
    };
  
    await setDoc(doc(db, 'locations', userId), locationData);
  };
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      updateLocation();
    }, 5000); 
  
    return () => clearInterval(intervalId);
  }, []);
  
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

  const clearRoute = () => {
    setPolylineCoordinates([]);
    setEta('');
    setDeliveryLocation(null);
    setMarkers([]);
  };
  
  useEffect(() => {
    console.log("Delivery address updated:", deliveryAddress);
  }, [deliveryAddress]);
  
const decodePolyline = (encoded) => {
  if (!encoded) {
    return [];
  }
  const poly = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charAt(index++).charCodeAt(0) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    poly.push({latitude: (lat / 1E5), longitude: (lng / 1E5)});
  }
  return poly;
};

const onSelectOrder = async (orderId) => {
  console.log("Attempting to fetch order with ID:", orderId);
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
    const destinationLocation = await geocodeAddress(deliveryAddress);
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
  }
};

  
async function geocodeAddress(address) {
  try {

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}`
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

  const makePhoneCall = () => {
    if(Platform.OS === "android") {
       Linking.openURL("tel: " + custNum)
    } 
    if(Platform.OS == "ios"){
      Linking.openURL("tel:// " + custNum)
    }
    else{
       Linking.openURL("telprompt: " + custNum)
    }
 }


  // CALL CUSTOMER FUNCTION
  const makePhoneCall = () => {
    if(Platform.OS === "android") {
       Linking.openURL("tel: " + custNum)
    } 
    if(Platform.OS == "ios"){
      Linking.openURL("tel:// " + custNum)
    }
    else{
       Linking.openURL("telprompt: " + custNum)
    }
 }

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

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { 
          text: "Yes", onPress: async () => {
              const userLocationRef = doc(db, 'locations', userId);
              await setDoc(userLocationRef, { isActive: false }, { merge: true });
            
              if (locationUpdateInterval.current) {
                clearInterval(locationUpdateInterval.current);
              }
  
              signOut(auth).then(() => {
                navigation.navigate('SignIn');
              }).catch((error) => {
                console.error('Sign out error:', error);
              });
            } 
        }
      ]
    );
  };

  const toggleDropdown = () => {
    if (role !== 'manager') {
      Alert.alert("Access Denied", "You do not have permission to access this feature.");
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
  
  

  useEffect(() => {
    getUserLocation();
    locationUpdateInterval.current = setInterval(getUserLocation, 1200000);

    return () => {
      if (locationUpdateInterval.current) {
        clearInterval(locationUpdateInterval.current);
      }
    };
  }, []);

  // Get customers number from firestore
  useEffect(() => {
    const fetchCustData = async () => {
      try {
        // Get the doc // todo allow manager to set current order
        const docRef = doc(db, 'ORDERS', '0cMjeyuxHkUN14IvhWTlX3Iit5I2_222');  
        const docSnap = await getDoc(docRef);         
        // Get each field
        setCustNum(docSnap.data().custNum);
      } catch (error) {
        console.error('Error fetching document:', error);
      }
    };
    fetchCustData();
  }, []);  

  // Get user's "role" from firestore

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'USERS', user.email);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);
   
  
  useEffect(() => {
    const q = query(collection(db, 'ORDERS'), where('status', '==', 'pending'));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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
    });
  
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
      >
        {
  role === 'manager' && userLocations.map((location, index) => (
    <Marker
      key={index}
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      title={`User: ${location.userId}`}
      pinColor={location.status === 'online' ? 'blue' : 'yellow'}
    />
  ))
}



{markers.map((marker, index) => (
  <Marker
    key={index}
    coordinate={{
      latitude: marker.latitude,
      longitude: marker.longitude,
    }}
    title="Delivery Location"
    pinColor="#39FF14" 
  >
  </Marker>
))}


        {deliveryLocation && deliveryAddress &&(
          <Marker
          key={deliveryAddress}
          coordinate={deliveryLocation}
          title="Delivery Location"
          description={deliveryAddress}
        />
        )}

          {userLocation && (<Marker coordinate={{latitude: userLocation.latitude,longitude: userLocation.longitude,}}
          title="Your Location"
          description="You are here"
        />
        )}
        <Polyline
  coordinates={polylineCoordinates}
  strokeWidth={6} 
  strokeColor="#007bff" 
/>

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

      <Image source={require('./assets/Logo.png')} style={styles.logo} resizeMode="contain" pointerEvents="none" />

      <TouchableOpacity style={styles.locationButton} onPress={centerOnUserLocation}>
        <MaterialIcons name="my-location" size={24} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.exitButton]} 
        onPress={handleSignOut} 
        >
        <MaterialIcons name="exit-to-app" size={24} color="black" />
      </TouchableOpacity>


      {isDropdownVisible && (
  <View style={styles.dropdown}>
    <Text style={styles.dropdownTitle}>
      {currentOrders.length > 0 ? "Current Orders" : "No Current Orders"}
    </Text>
    <View style={styles.titleUnderline}></View>
    <ScrollView style={styles.scrollView}>
      {currentOrders.map((order) => (
        <View key={order.id}>
          <TouchableOpacity
            onPress={() => onSelectOrder(order.id)}
            style={styles.dropdownItem}
          >
            <Text style={styles.dropdownItemText}>
              Order <Text style={styles.orderNumber}>#{order.orderNumber}</Text> by {order.userFirstName} {order.userLastName} - {order.deliveryAddress.split(',').slice(0, 2).join(',')}
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
    top: '5%',
    right: '5%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    zIndex: 1,
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
    top: '16%',
    top: '25%',
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
    backgroundColor: "#e74c3c",
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
    top: '27%',
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

// fixed ['navigation.navigate' is missing in props validationeslintreact/prop-types] error
Dashboard.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default Dashboard;
