import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

const LocationHistory = ({ userId }) => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = React.createRef();

  useEffect(() => {
    const fetchLocationHistory = async () => {
      const q = query(collection(db, "locations"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const locationData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setLocations(locationData);
    };

    fetchLocationHistory();
  }, [userId]);

  const focusOnLocation = (location) => {
    setSelectedLocation(location);
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
      <Text style={styles.listItemText}>
        {`Time: ${new Date(item.timestamp.seconds * 1000).toLocaleString()}`}
      </Text>
      <Text style={styles.listItemText}>
        {`Lat: ${item.latitude.toFixed(4)}, Lon: ${item.longitude.toFixed(4)}`}
      </Text>
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
            pinColor={loc === selectedLocation ? 'blue' : 'red'}
          />
        ))}
      </MapView>
      <View style={styles.listContainer}>
        <FlatList
          data={locations}
          renderItem={renderLocationItem}
          keyExtractor={item => item.id}
        />
      </View>
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
  listContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listItemText: {
    fontSize: 16,
  },
});

export default LocationHistory;
