import React from 'react';
import { View, StyleSheet } from 'react-native';
import LocationHistory from './LocationHistory'; // Adjust the import path as needed

const LocationHistoryScreen = ({ route }) => {
  const { userId } = route.params;

  return (
    <View style={styles.container}>
      <LocationHistory userId={userId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LocationHistoryScreen;
