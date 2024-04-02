// LocationHistory.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig"; 
import DateTimePicker from "@react-native-community/datetimepicker";

const { width, height } = Dimensions.get("window");


const GOOGLE_MAPS_API_KEY = "AIzaSyBqdK2r3h7vi8WZ1ldQRHiayg0Mj5JbeUw";

const LocationHistory = ({ driverId }) => {
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRouteVisible, setRouteVisible] = useState(false);
  const mapRef = useRef(null);

  const getLocationName = async (latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.results.length > 0) {
        return json.results[0].formatted_address;
      }
      return "Unknown location";
    } catch (error) {
      console.error("Failed to fetch location name:", error);
      return "Unknown location";
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const userRef = query(collection(db, "USERS"), where("email", "==", driverId));
        const userSnapshot = await getDocs(userRef);
        if (!userSnapshot.empty) {
          const userUid = userSnapshot.docs[0].data().userId;
          fetchLocationData(userUid);
        } else {
          console.log("No user found with the given email:", driverId);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setIsLoading(false);
      }
    };

    const fetchLocationData = async (uid) => {
      try {
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
        const resolvedLocationsData = await Promise.all(locationsDataPromises);
        setLocations(resolvedLocationsData);
        filterLocationsByDate(resolvedLocationsData, new Date());
      } catch (error) {
        console.error("Failed to fetch location data:", error);
        setIsLoading(false);
      }
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

  const filterLocationsByDate = (locationsData, date) => {
    const filtered = locationsData.filter((location) => {
      const locationDate = new Date(location.timestamp.seconds * 1000);
      return (
        locationDate.getDate() === date.getDate() &&
        locationDate.getMonth() === date.getMonth() &&
        locationDate.getFullYear() === date.getFullYear()
      );
    });
    setFilteredLocations(filtered);
    setIsLoading(false);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setSelectedDate(currentDate);
    filterLocationsByDate(locations, currentDate);
    setShowDatePicker(false);
  };

  const toggleRouteVisibility = () => {
    setRouteVisible(!isRouteVisible);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: filteredLocations.length > 0 ? filteredLocations[0].latitude : 37.7749,
          longitude: filteredLocations.length > 0 ? filteredLocations[0].longitude : -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {filteredLocations.map((loc, index) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={`Visited on ${new Date(
              loc.timestamp.seconds * 1000
            ).toLocaleString()}`}
            pinColor={index === 0 ? "green" : index === filteredLocations.length - 1 ? "red" : "blue"}
          />
        ))}
        {isRouteVisible && (
          <Polyline
            coordinates={filteredLocations.map((loc) => ({
              latitude: loc.latitude,
              longitude: loc.longitude,
            }))}
            strokeColor="rgba(0, 0, 255, 0.7)"
            strokeWidth={4}
            lineDashPattern={[1]}
          />
        )}
      </MapView>
      <TouchableOpacity style={styles.toggleButton} onPress={toggleRouteVisibility}>
        <Text style={styles.toggleButtonText}>
          {isRouteVisible ? "Hide Route" : "Show Route"}
        </Text>
      </TouchableOpacity>
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.datePickerButtonText}>
            {selectedDate.toDateString()}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {filteredLocations.length === 0 ? (
          <Text style={styles.noDataText}>No locations found for the selected date.</Text>
        ) : (
          <FlatList
            data={filteredLocations}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listItem} onPress={() => focusOnLocation(item)}>
                <Text style={styles.icon}>📍</Text>
                <View style={styles.textContainer}>
                  <Text style={styles.listItemText}>{item.name}</Text>
                  <Text style={styles.timestamp}>
                    {new Date(item.timestamp.seconds * 1000).toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id.toString()}
            style={styles.list}
          />
        )}
      </View>
      {isLoading && (
        <View style={styles.loadingContainer}>
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
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
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
  loadingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  datePickerButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  datePickerButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  toggleButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});

export default LocationHistory;
