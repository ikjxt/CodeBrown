import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <FlatList
        data={drivers}
        renderItem={renderDriverItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
  },
});

export default DriverSelectScreen;
