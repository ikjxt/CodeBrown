

import React, { useState } from "react";
import {SafeAreaView, StyleSheet, TextInput, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard, View, Alert} from "react-native";
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import {app, db} from './firebaseConfig';
import { getAuth, } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';


const TakeOrderScreen = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const auth = getAuth(app);


  //When Start order is pressed
  const handleStartOrderPress = async () => {
    // Ensure there's a logged-in user and both order number and delivery address are provided
    if (auth.currentUser && orderNumber && deliveryAddress) {
      const orderData = {
        userId: auth.currentUser.uid,       // User Id
        orderNumber: orderNumber,           // Order number
        deliveryAddress: deliveryAddress,   // Delivery Address
        createdAt: serverTimestamp(),       // Firebase server timestamp
      };
  
      try {
        // Save the order in the "ORDERS" collection with a doc ID based on the user's UID and order number
        await setDoc(doc(db, "ORDERS", `${auth.currentUser.uid}_${orderNumber}`), orderData);
        Alert.alert("Success", "Order has been started successfully!");
      } catch (error) {
        console.error("Error saving order: ", error);
        Alert.alert("Error", "There was a problem starting the order.");
      }
    } else {
      // Handle cases where there's no user logged in, or the order details are incomplete
      Alert.alert("Error", "Please make sure all order details are provided.");
    }
  };
  

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>

        {/*Header text for Order*/}
        <Text style={styles.headertext}>ORDER NUMBER:</Text>
        <TextInput 
          style={styles.inputOrder} 
          onChangeText={(text) => setOrderNumber(text.toUpperCase())} 
          value={orderNumber}
          onSubmitEditing={Keyboard.dismiss}
          placeholder="Enter Order Number"
          returnKeyType="done"
        />

        {/*Header text for Delivery*/}
        <Text style={styles.headertext}>DELIVERY ADDRESS:</Text>
        <GooglePlacesAutocomplete
          placeholder='Enter Delivery Address'
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            console.log(data, details);
            setDeliveryAddress(details?.formatted_address);
          }}
          query={{
            key: 'AIzaSyBqdK2r3h7vi8WZ1ldQRHiayg0Mj5JbeUw', // Google API key
            language: 'en',
          }}
          styles={{
            textInput: styles.inputDelivery,
            container: {
              zIndex: 9999,
            }
          }}
          fetchDetails={true}
          onFail={error => console.error(error)}
        />
      
        {/*Start order button*/}
        <TouchableOpacity style={styles.takeOrder} onPress={handleStartOrderPress}>
          <Text style={styles.text}>Start Order</Text>
        </TouchableOpacity>

        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    flex: 1,
    margin: 8,
    justifyContent: 'top',
  },
  //Input text for Order
  inputOrder: {
    height: 40,
    margin: 8,
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  //Input text for Delivery
  inputDelivery: {
    height: 40,
    margin: 8,
    borderWidth: 1,
    padding: 10,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  // Header text "Order/Delivery"
  headertext: {
    position: "relative",
    color: "#eb4c34",
    fontSize: 20,
    padding: 8,
    marginTop: 8,
  },
  // Start Order button 
  takeOrder: {
    backgroundColor: "#e74c3c",
    padding: 8,
    borderRadius: 4,
    position: "absolute",
    top: 250,
    right: 135,
  },
  // Start Order text
  text: {
    color: "white",
    fontSize: 16,
  },
});

export default TakeOrderScreen;
