import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

const LocationHistory = ({ driverId }) => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = React.createRef();

  // Function to get location name using Google Maps Geocoding API
  const getLocationName = async (latitude, longitude) => {
    const apiKey = "AIzaSyBqdK2r3h7vi8WZ1ldQRHiayg0Mj5JbeUw"; 
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.results.length > 0) {
        return json.results[0].formatted_address;
      }
      return "Unknown location";
    } catch (error) {
      console.error(error);
      return "Unknown location";
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      // Query the USERS collection to find the document with the matching email
      const userRef = query(collection(db, "USERS"), where("email", "==", driverId));
      const userSnapshot = await getDocs(userRef);
  
      if (!userSnapshot.empty) {
        const userUid = userSnapshot.docs[0].data().userId; // 'userId' field stores the Firebase UID
        fetchLocationData(userUid);
      } else {
        console.log("No user found with the given email:", driverId);
        setIsLoading(false);
      }
    };
  
    const fetchLocationData = async (uid) => {
      // Use the obtained UID to fetch locations
      const locRef = query(collection(db, "locations"), where("userId", "==", uid));
      const locSnapshot = await getDocs(locRef);
  
      const locationsDataPromises = locSnapshot.docs.map(async (doc) => {
        const locationName = await getLocationName(doc.data().latitude, doc.data().longitude);
        return {
          ...doc.data(),
          id: doc.id,
          name: locationName,
        };
      });
  
      Promise.all(locationsDataPromises).then((resolvedLocationsData) => {
        setLocations(resolvedLocationsData);
        setIsLoading(false);
      });
    };
  
    if (driverId) {
      fetchUserData();
    }
  }, [driverId]);
  

  const focusOnLocation = (location) => {
    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => focusOnLocation(item)}
    >
      <Text style={styles.icon}>📍</Text>
      <View style={styles.textContainer}>
        <Text style={styles.listItemText}>{item.name}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp.seconds * 1000).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={`Visited on ${new Date(
              loc.timestamp.seconds * 1000
            ).toLocaleString()}`}
          />
        ))}
      </MapView>
      <FlatList
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={(item) => item.id}
      />
      {isLoading && (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
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
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    elevation: 6,
    margin: 8,
    borderRadius: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 14,
    color: "grey",
  },
});

export default LocationHistory;
