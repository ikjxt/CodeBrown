import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground, PropTypes, SafeAreaView, Image } from 'react-native';
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
      onPress={() => navigation.navigate('Location History', { driverId: item.id })}>
      <Text style={styles.title}>{item.firstName} {item.lastName}</Text>
    </TouchableOpacity>
  );

  return (
    // <LinearGradient
    //   colors={['#ffffff', '#ffe5e5']} // Gradient from white to light red
    //   style={styles.container}>
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require("./assets/Logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <FlatList
          marginTop={0}
          data={drivers}
          renderItem={renderDriverItem}
          keyExtractor={item => item.id}
        />
      </View>
    </SafeAreaView>  
    // </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16, // Adjusted padding for overall screen
    backgroundColor: "#fff",
  },
  item: {  // The "Box" that a name is in
    backgroundColor: '#ffffff', // White for item background
    paddingHorizontal: 8, // Space from inside edge of box to left side of name
    marginBottom: 16,
    marginHorizontal: 5, // Adjusted to fit within the new padding
    borderRadius: 4, // Rounded corners for items
    borderWidth: 1,
    borderColor: '#ccc', // Red border for items
    shadowColor: '#000', // Shadow for items
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 14, // Increased font size
    fontWeight: 'bold', // Bold font weight
    color: '#000', // Black color for text
  },
  logo: {
    marginTop: -34,
    marginBottom: -16,
    alignSelf: 'center',
    width: 175,
    height: 175,
    resizeMode: 'contain',
    zIndex: 1,
  },
});



export default DriverSelectScreen;
