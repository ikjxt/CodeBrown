import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { getAuth, signOut } from 'firebase/auth';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc, query, where, onSnapshot, forEach } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { PropTypes } from 'prop-types';
import { Platform, Linking } from "react-native"



const Dashboard = ({ navigation }) => {
  const [role, setRole] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const mapViewRef = useRef(null);
  const locationUpdateInterval = useRef(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Added state for dropdown visibility
  const [custNum, setCustNum] = useState('');

  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const user = auth.currentUser;  // ask about this***^


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

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out", // Title of the alert
      "Are you sure you want to sign out?", // Message of the alert
      [
        {
          text: "No",
          onPress: () => console.log("Cancel Pressed"),
          style: "No"
        },
        { text: "Yes", onPress: () => 
          signOut(auth).then(() => {
            navigation.navigate('SignIn');
          }).catch((error) => {
            console.error('Sign out error:', error);
          }) 
        }
      ]
    );
  };

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
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
        // Get the doc
        const docRef = doc(db, 'USERS', user.email);  
        const docSnap = await getDoc(docRef);         
        // Get each field
        setRole(docSnap.data().role);
      } catch (error) {
        console.error('Error fetching document:', error);
        console.log(role);
      }
    };
    fetchUserData();
  }, []);  // Empty dependency array means this effect runs once after the initial render

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
          {userLocation && (<Marker coordinate={{latitude: userLocation.latitude,longitude: userLocation.longitude,}}
          title="Your Location"
          description="You are here"
        />
        )}
      </MapView>

      <TouchableOpacity style={styles.menuButton} onPress={toggleDropdown}>
        <MaterialIcons name="menu" size={24} color="black" />
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

      {isDropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('ContactsScreen')}>
            <Text style={styles.dropdownItemText}>Contacts</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('UserProfileScreen')}>
            <Text style={styles.dropdownItemText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('TakeOrderScreen')}>
            <Text style={styles.dropdownItemText}>TakeOrder</Text>
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
    top: '-5%', // Adjust based on layout
    alignSelf: 'center',
    width: 175, // You might want to adjust this
    height: 175, // Or adjust this based on the image's aspect ratio
    resizeMode: 'contain', // This line won't directly affect the Image style; use resizeMode on the Image component itself
    zIndex: 1,
  },
  callButton: {
    position: 'absolute',
    top: '25%',
    left: '5%',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    zIndex: 1,
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
