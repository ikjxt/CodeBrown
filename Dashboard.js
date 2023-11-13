import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { FontAwesome5 } from '@expo/vector-icons';

const Dashboard = ({ navigation }) => {
  // Dummy data for the list of drivers and their routes
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      name: 'Driver 1',
      latitude: 38.5816,
      longitude: -121.4944,
      route: [
        { latitude: 38.5816, longitude: -121.4944 },
        { latitude: 38.5790, longitude: -121.4913 },
      ],
      onDelivery: true,
    },
    // Add more drivers as needed
  ]);

  // State to hold the selected driver
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Effect to simulate selecting a driver and updating their location
  useEffect(() => {
    // This would be replaced with real-time updates from a backend service
    const interval = setInterval(() => {
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) =>
          driver.id === selectedDriver?.id
            ? {
                ...driver,
                latitude: driver.latitude + 0.0001,
                longitude: driver.longitude + 0.0001,
              }
            : driver
        )
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedDriver]);

  const renderDriverItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.driverItem,
        selectedDriver?.id === item.id && styles.selectedDriver,
      ]}
      onPress={() => setSelectedDriver(item)}
    >
      <FontAwesome5 name="pizza-slice" size={24} color={selectedDriver?.id === item.id ? '#FFF' : '#e74c3c'} />
      <Text style={styles.driverName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 38.5816,
          longitude: -121.4944,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {drivers.map((driver) => (
          <React.Fragment key={driver.id}>
            <Marker
              coordinate={{
                latitude: driver.latitude,
                longitude: driver.longitude,
              }}
              title={`${driver.name} ${driver.onDelivery ? '(Delivering)' : ''}`}
            />
            <Polyline
              coordinates={driver.route}
              strokeColor="#e74c3c" // red
              strokeWidth={3}
            />
          </React.Fragment>
        ))}
      </MapView>

      <FlatList
        data={drivers}
        renderItem={renderDriverItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        style={styles.driverList}
        contentContainerStyle={styles.driverListContainer}
        showsHorizontalScrollIndicator={false}
      />

      <View style={styles.dashboardContent}>
        <Text style={styles.title}>Delivery Dashboard</Text>
        {selectedDriver && (
          <View style={styles.driverDetails}>
            <Text style={styles.driverDetailText}>
              {selectedDriver.name} - {selectedDriver.onDelivery ? 'On Delivery' : 'Available'}
            </Text>
            {/* Add more details as needed */}
          </View>
        )}
      </View>
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
  dashboardContent: {
    position: 'absolute',
    top: 0,
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  driverList: {
    position: 'absolute',
    bottom: 10,
  },
  driverListContainer: {
    paddingHorizontal: 10,
  },
  driverItem: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedDriver: {
    backgroundColor: '#4CAF50',
  },
  driverName: {
    color: '#333',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  driverDetails: {
    alignItems: 'center',
    marginTop: 10,
  },
  driverDetailText: {
    fontSize: 16,
    color: '#333',
  },
});

export default Dashboard;
