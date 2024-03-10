import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Alert,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { app, db } from "./firebaseConfig";
import { getAuth } from "firebase/auth";
import { doc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { getDistance, getCompletion } from "./utils";

const TakeOrderScreen = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [distance, setDistance] = useState("");
  const auth = getAuth(app);

  useEffect(() => {
    const estimateTimeAndDistance = async () => {
      if (deliveryAddress) {
        try {
          const locationsRef = collection(db, "locations");
          const querySnapshot = await getDocs(query(locationsRef, where("userId", "==", auth.currentUser.uid), limit(1), orderBy("timestamp", "desc")));

          if (!querySnapshot.empty) {
            const locationData = querySnapshot.docs[0].data();
            const { latitude: userLat, longitude: userLng } = locationData;
            const { lat: destLat, lng: destLng } = await getCompletion(deliveryAddress);

            const distanceInKm = await getDistance(userLat, userLng, destLat, destLng);
            const distanceInMiles = distanceInKm * 0.621371; // Convert km to miles
            const estimatedTimeInHours = distanceInMiles / 50; // Assuming an average speed of 50 miles/h
            const estimatedTimeInMinutes = estimatedTimeInHours * 60;
            const roundedEstimatedTime = Math.round(estimatedTimeInMinutes);

            setDistance(distanceInMiles.toFixed(2)); // Now in miles
            setEstimatedTime(roundedEstimatedTime > 0 ? roundedEstimatedTime : 1); // Ensuring a minimum of 1 minute
          } else {
            console.error("User location data not found");
          }
        } catch (error) {
          console.error("Error estimating time and distance: ", error);
        }
      }
    };

    estimateTimeAndDistance();
  }, [deliveryAddress]);

  const handleStartOrderPress = async () => {
    if (auth.currentUser && orderNumber && deliveryAddress) {
      try {
        const locationsRef = collection(db, "locations");
        const querySnapshot = await getDocs(query(locationsRef, where("userId", "==", auth.currentUser.uid), limit(1), orderBy("timestamp", "desc")));

        if (!querySnapshot.empty) {
          const locationData = querySnapshot.docs[0].data();
          const { latitude: startLat, longitude: startLng } = locationData;

          const orderData = {
            userId: auth.currentUser.uid,
            orderNumber: orderNumber,
            deliveryAddress: deliveryAddress,
            estimatedTime: estimatedTime,
            distance: distance, // Now reflects miles
            startLocation: { latitude: startLat, longitude: startLng },
            createdAt: serverTimestamp(),
            status: "pending",
          };

          await setDoc(doc(db, "ORDERS", `${auth.currentUser.uid}_${orderNumber}`), orderData);
          Alert.alert("Success", "Order has been started successfully!");
          setOrderNumber("");
          setDeliveryAddress("");
          setEstimatedTime("");
          setDistance("");
        } else {
          console.error("User location data not found");
          Alert.alert("Error", "User location data not found.");
        }
      } catch (error) {
        console.error("Error saving order: ", error);
        Alert.alert("Error", "There was a problem starting the order.");
      }
    } else {
      Alert.alert("Error", "Please make sure all order details are provided.");
    }
  };

  const handleCompleteOrderPress = async () => {
    if (auth.currentUser && orderNumber) {
      try {
        const locationsRef = collection(db, "locations");
        const querySnapshot = await getDocs(query(locationsRef, where("userId", "==", auth.currentUser.uid), limit(1), orderBy("timestamp", "desc")));

        if (!querySnapshot.empty) {
          const locationData = querySnapshot.docs[0].data();
          const { latitude: endLat, longitude: endLng } = locationData;

          const orderRef = doc(db, "ORDERS", `${auth.currentUser.uid}_${orderNumber}`);
          await updateDoc(orderRef, {
            completedAt: serverTimestamp(),
            status: "completed",
            endLocation: { latitude: endLat, longitude: endLng },
          });
          Alert.alert("Success", "Order has been completed!");
          setOrderNumber("");
        } else {
          console.error("User location data not found");
          Alert.alert("Error", "User location data not found.");
        }
      } catch (error) {
        console.error("Error completing order: ", error);
        Alert.alert("Error", "There was a problem completing the order.");
      }
    } else {
      Alert.alert("Error", "Please make sure the order number is provided.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.content}>
          <Text style={styles.headerText}>Order Details</Text>
          <TextInput
            style={styles.input}
            onChangeText={(text) => setOrderNumber(text.toUpperCase())}
            value={orderNumber}
            onSubmitEditing={Keyboard.dismiss}
            placeholder="Enter Order Number"
            returnKeyType="done"
          />

          <Text style={styles.headerText}>Delivery Address</Text>
          <GooglePlacesAutocomplete
            placeholder="Enter Delivery Address"
            onPress={(data, details = null) => {
              setDeliveryAddress(details?.formatted_address);
            }}
            query={{
              key: "AIzaSyBD14niYPy6mOu_234-bMZgK-3m6gzOZRg",
              language: "en",
            }}
            styles={{
              textInput: styles.input,
              container: {
                zIndex: 9999,
              },
            }}
            fetchDetails={true}
            onFail={(error) => console.error(error)}
          />

          <Text style={styles.headerText}>Route Information</Text>
          <View style={styles.routeContainer}>
            <Text style={styles.routeText}>Estimated Time: {estimatedTime} minutes</Text>
            <Text style={styles.routeText}>Distance: {distance} miles</Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartOrderPress}>
            <Text style={styles.startButtonText}>Start Order</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.completeButton} onPress={handleCompleteOrderPress}>
            <Text style={styles.completeButtonText}>Complete Order</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: "#f9f9f9",
  },
  routeContainer: {
    marginBottom: 16,
  },
  routeText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  startButton: {
    backgroundColor: "#e74c3c",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  completeButton: {
    backgroundColor: "#2ecc71",
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TakeOrderScreen;
