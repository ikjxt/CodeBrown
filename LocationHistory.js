import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const LocationHistory = ({ userId }) => {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = React.createRef();

  // Function to get location name using Google Maps Geocoding API
  const getLocationName = async (latitude, longitude) => {
    const apiKey = 'AIzaSyBqdK2r3h7vi8WZ1ldQRHiayg0Mj5JbeUw'; // Replace with your actual API key
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const json = await response.json();
      if (json.results.length > 0) {
        return json.results[0].formatted_address;
      }
      return 'Unknown location';
    } catch (error) {
      console.error(error);
      return 'Unknown location';
    }
  };

  useEffect(() => {
    const fetchLocationHistory = async () => {
      setIsLoading(true);
      const q = query(collection(db, "locations"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      const locationDataPromises = querySnapshot.docs.map(doc => {
        return getLocationName(doc.data().latitude, doc.data().longitude).then(name => {
          return {
            ...doc.data(),
            id: doc.id,
            name: name
          };
        });
      });

      Promise.all(locationDataPromises).then(resolvedLocationData => {
        setLocations(resolvedLocationData);
        setIsLoading(false);
      });
    };

    fetchLocationHistory();
  }, [userId]);

  const focusOnLocation = (location) => {
    mapRef.current.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  const renderLocationItem = ({ item }) => (
    <TouchableOpacity style={styles.listItem} onPress={() => focusOnLocation(item)}>
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
        {locations.map(loc => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            title={loc.name}
            description={`Visited on ${new Date(loc.timestamp.seconds * 1000).toLocaleString()}`}
          />
        ))}
      </MapView>
      <FlatList
        data={locations}
        renderItem={renderLocationItem}
        keyExtractor={item => item.id}
      />
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 2,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
    color: 'grey',
  },
});

export default LocationHistory;
