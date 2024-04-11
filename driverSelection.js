import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Assuming you're using Expo
import { collection, query, where, getDocs } from '@firebase/firestore';
import { db } from './firebaseConfig';

const DriverSelectScreen = ({ navigation }) => {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      const q = query(collection(db, "USERS"), where("role", "==", "driver"));
      const querySnapshot = await getDocs(q);
      const fetchedDrivers = [];
      querySnapshot.forEach((doc) => {
        fetchedDrivers.push({ id: doc.id, ...doc.data() });
      });
      setDrivers(fetchedDrivers);
    };
    fetchDrivers();
  }, []);

  const renderDriverItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navigation.navigate('LocationHistoryScreen', { driverId: item.id })}>
      <Text style={styles.title}>{item.firstName} {item.lastName}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#ffffff', '#ffe5e5']} // Gradient from white to light red
      style={styles.container}>
      <FlatList
        data={drivers}
        renderItem={renderDriverItem}
        keyExtractor={item => item.id}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10, // Adjusted padding for overall screen
  },
  item: {
    backgroundColor: '#ffffff', // White for item background
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 5, // Adjusted to fit within the new padding
    borderRadius: 10, // Rounded corners for items
    borderWidth: 1,
    borderColor: '#ff0000', // Red border for items
    shadowColor: '#000', // Shadow for items
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  title: {
    fontSize: 18, // Increased font size
    fontWeight: 'bold', // Bold font weight
    color: '#000', // Black color for text
  },
});

export default DriverSelectScreen;
