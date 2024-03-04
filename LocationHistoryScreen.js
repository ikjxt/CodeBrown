import React from 'react';
import { View } from 'react-native';
import LocationHistory from './LocationHistory';

const LocationHistoryScreen = ({ route }) => {
  const { driverId } = route.params; // Receive driverId passed from navigation

  return (
    <View style={{ flex: 1 }}>
      <LocationHistory driverId={driverId} />
    </View>
  );
};

export default LocationHistoryScreen;
