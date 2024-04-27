import React, { useEffect, useRef, useState } from "react";
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
  Platform,
  Linking,
  FlatList,
  Image,
  Button,
} from "react-native";
import { app, db } from "./firebaseConfig";
import { getAuth } from "firebase/auth";

import { doc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, orderBy, limit, getDoc } from "firebase/firestore";
import { getDistance, getCompletion } from "./utils";
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from "react-native-gesture-handler";


const GOOGLE_PLACES_API_KEY = "AIzaSyBD14niYPy6mOu_234-bMZgK-3m6gzOZRg";

const TakeOrderScreen = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [distance, setDistance] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [custNumber, setCustNumber] = useState("");
  const auth = getAuth(app);

  const fetchSuggestions = async (input) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data.predictions);
    } catch (error) {
      console.error("Error fetching suggestions: ", error);
    }
  };

  const handleAddressChange = (text) => {
    setDeliveryAddress(text);
    if (text.length > 0) {
      fetchSuggestions(text);
    } else {
      setSuggestions([]);
    }
  };

  const handleCustNumberChange = (text) => {
    setCustNumber(text);
  }

  const custNumberRef = useRef(null);

  useEffect(() => {
    customerContact = custNumber;
    console.log(customerContact)
  },[custNumber])

  const handleSuggestionPress = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      const selectedAddress = data.result.formatted_address;
      setDeliveryAddress(selectedAddress);
      setSuggestions([]);

      const locationsRef = collection(db, "locations");
      const querySnapshot = await getDocs(query(locationsRef, where("userId", "==", auth.currentUser.uid), limit(1), orderBy("timestamp", "desc")));

      if (!querySnapshot.empty) {
        const locationData = querySnapshot.docs[0].data();
        const { latitude: userLat, longitude: userLng } = locationData;
        const { lat: destLat, lng: destLng } = await getCompletion(selectedAddress);

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
      console.error("Error fetching place details: ", error);
    }
  };

  const handleStartOrderPress = async () => {
    if (auth.currentUser && orderNumber && deliveryAddress) {
      try {
        const userEmail = auth.currentUser.email; // Get the current user's email
        if (!userEmail) {
          console.error("User email not found");
          Alert.alert("Error", "User email not found.");
          return;
        }

        // Reference the user's document by their email
        const userDocRef = doc(db, "USERS", userEmail);
        // Fetch the document
        const userDocSnap = await getDoc(userDocRef);

        let userFirstName, userLastName;
        // Check if the document exists and has the data
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          userFirstName = userData.firstName || "No First Name Found"; // Adjust these keys if your document structure uses different names
          userLastName = userData.lastName || "No Last Name Found";
        } else {
          console.log("Document does not exist for the user's email:", userEmail);
          userFirstName = "Unknown"; // Fallback value
          userLastName = "User";    // Fallback value
        }

        const locationsRef = collection(db, "locations");
        const querySnapshot = await getDocs(query(locationsRef, where("userId", "==", auth.currentUser.uid), limit(1), orderBy("timestamp", "desc")));

        if (!querySnapshot.empty) {
          const locationData = querySnapshot.docs[0].data();
          const { latitude: startLat, longitude: startLng } = locationData;

          const orderData = {
            userId: auth.currentUser.uid,
            userEmail: userEmail, // Saving user's email
            userFirstName,
            userLastName,
            orderNumber: orderNumber,
            deliveryAddress: deliveryAddress,
            estimatedTime: estimatedTime,
            distance: distance, // Now reflects miles
            custNumber: custNumber, 
            startLocation: { latitude: startLat, longitude: startLng },
            createdAt: serverTimestamp(),
            status: "pending",
          };
          await setDoc(doc(db, "ORDERS", `${auth.currentUser.uid}_${orderNumber}`), orderData);
          Alert.alert("Success", "Order has been started successfully!");
          setOrderNumber("");
          setDeliveryAddress("");
          setEstimatedTime("");
          setDistance("")
          setCustNumber("");
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

  const handleNavigatePress = () => {
    if (deliveryAddress) {
      const url = Platform.select({
        ios: `http://maps.apple.com/?daddr=${encodeURIComponent(deliveryAddress)}`,
        android: `http://maps.google.com/?daddr=${encodeURIComponent(deliveryAddress)}`,
      });

      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Please enter a delivery address.");
    }
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestion}
      onPress={() => handleSuggestionPress(item.place_id)}
    >
      <Text>{item.description}</Text>
      
    </TouchableOpacity>
  );

  // const renderOrderDetails = () => ( COMMENTED OUT FOR TESTING
  //     <View style={styles.content}>  
  //       <Image
  //         source={require("./assets/Logo.png")}
  //         style={styles.logo}
  //         resizeMode="contain"
  //       />
  //       <Text style={styles.headerText}>Order Details</Text>
  //       <TextInput
  //         style={styles.input}
  //         onChangeText={(text) => setOrderNumber(text.toUpperCase())}
  //         value={orderNumber}
  //         onSubmitEditing={Keyboard.dismiss}
  //         placeholder="Enter Order Number"
  //         placeholderTextColor="#888"
  //         returnKeyType="done"
  //       />
  //       <Text style={styles.headerText}>Delivery Address</Text>
  //       <TextInput
  //         style={styles.input}
  //         value={deliveryAddress}
  //         onChangeText={handleAddressChange}
  //         placeholder="Enter Delivery Address"
  //         placeholderTextColor="#888"
  //       />
  //       {suggestions.length > 0 && (
  //         <FlatList
  //           data={suggestions}
  //           renderItem={renderSuggestion}
  //           keyExtractor={(item) => item.place_id}
  //           style={styles.suggestionsList}
  //           keyboardShouldPersistTaps="always"
  //         />
  //       )}

  //       <Text style={styles.headerText}>Customer Phone Number</Text>
  //       <TextInput
  //         ref ={custNumberRef}
  //         style={styles.input}
  //         value={custNumber}
  //         onChangeText={handleCustNumberChange}
  //         placeholder="Enter Customer Phone Number"
  //         placeholderTextColor="#888"
  //         returnKeyType="done"
  //       />

  //       <Text style={styles.headerText}>Route Information</Text>
  //       <View style={styles.routeContainer}>
  //         <Text style={styles.routeText}>
  //           <Text style={styles.routeLabel}>Estimated Time:</Text> {estimatedTime} minutes
  //         </Text>
  //         <Text style={styles.routeText}>
  //           <Text style={styles.routeLabel}>Distance:</Text> {distance} miles
  //         </Text>
  //       </View>

  //       <TouchableOpacity style={styles.buttonBig} onPress={handleStartOrderPress}>
  //         <Text style={styles.buttonText}>Start Order</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.buttonBig} onPress={handleCompleteOrderPress}>
  //         <Text style={styles.buttonText}>Complete Order</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.buttonBig} onPress={handleNavigatePress}>
  //         <Text style={styles.buttonText}>Navigate</Text>
  //       </TouchableOpacity>
  //     </View>
      
  // );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            {/* <FlatList
              data={[{ key: "orderDetails" }]}
              renderItem={renderOrderDetails}
              contentContainerStyle={styles.contentContainer}
              keyboardShouldPersistTaps="always"
            /> */}
          <View style={styles.content}>  
            <Image
              source={require("./assets/Logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerText}>Order Details</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setOrderNumber(text.toUpperCase())}
              value={orderNumber}
              onSubmitEditing={Keyboard.dismiss}
              placeholder="Enter Order Number"
              placeholderTextColor="#888"
              returnKeyType="done"
            />
            <Text style={styles.headerText}>Delivery Address</Text>
            <TextInput
              style={styles.input}
              value={deliveryAddress}
              onChangeText={handleAddressChange}
              placeholder="Enter Delivery Address"
              placeholderTextColor="#888"
            />
            {deliveryAddress !== "" && (
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.place_id}
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="always"
                nestedScrollEnabled={true}
              />
            )}

            <Text style={styles.headerText}>Customer Phone Number</Text>
            <TextInput
              ref ={custNumberRef}
              style={styles.input}
              value={custNumber}
              onChangeText={handleCustNumberChange}
              placeholder="Enter Customer Phone Number"
              placeholderTextColor="#888"
              returnKeyType="done"
            />

            <Text style={styles.headerText}>Route Information</Text>
            <View style={styles.routeContainer}>
              <Text style={styles.routeText}>
                <Text style={styles.routeLabel}>Estimated Time:</Text> {estimatedTime} minutes
              </Text>
              <Text style={styles.routeText}>
                <Text style={styles.routeLabel}>Distance:</Text> {distance} miles
              </Text>
            </View>

            <TouchableOpacity style={styles.buttonBig} onPress={handleStartOrderPress}>
              <Text style={styles.buttonText}>Start Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonBig} onPress={handleCompleteOrderPress}>
              <Text style={styles.buttonText}>Complete Order</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonBig} onPress={handleNavigatePress}>
              <Text style={styles.buttonText}>Navigate</Text>
            </TouchableOpacity>
            
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },  
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#fff",
  },
  background: {
    flex: 1,
    width: '100%', // Ensure it covers the whole screen
    height: '100%', // Depending on your layout you might need to adjust this
  },
  contentContainer: {
    width: "100%",
    flex: 1,
    //backgroundColor: 'rgba(255, 255, 255, 0.9)', 
  },
  content: {
    width: "100%",
    flex: 1,
    padding: 16,
    alignItems: "center",
  },
  logo: {
    marginTop: -50,
    marginBottom: -16,
    alignSelf: 'center',
    width: 175,
    height: 175,
    resizeMode: 'contain',
    zIndex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  routeContainer: {
    width: "100%",
    marginBottom: 24,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  routeLabel: {
    fontWeight: "bold",
  },
  buttonBig: {
    backgroundColor: "#e74c3c", // Deep orange color
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  suggestionsList: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 4,
    marginTop: -8,
    marginBottom: 16,
    elevation: 2,

  },
  suggestion: {
    flex: 1,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default TakeOrderScreen;