import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, QuerySnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyBth5BPdFF7zR7utwzEU5aqyNKusBDjTSs",
  authDomain: "cheesytracker.firebaseapp.com",
  projectId: "cheesytracker",
  storageBucket: "cheesytracker.appspot.com",
  messagingSenderId: "413164372288",
  appId: "1:413164372288:web:55f70c80c74944d2e03aa5",
  measurementId: "G-5G4TY0PPZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize firestore service
const db = getFirestore(app);

// Create ref for Driver collection
const colRef = collection(db, 'DRIVERS');
// reference to orders collection
const orderRef = collection(db, 'ORDERS');
// realtime get function
// useEffect(() => {
//   const q = query(
//     orderRef,where('deliveryStatus', '==', false)
//   );
//   const unsub = onSnapshot(orderRef, (QuerySnapshot) =>{
//     const items = [];
//     QuerySnapshot.forEach((doc) =>{
//       items.push(doc.data());
//     });
//   });
//   return () => {
//     unsub();
//   }
// }), [];

// Initialize Firebase Auth with AsyncStorage for persistence
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Function to save location data to Firestore
const saveLocationData = async (userId, latitude, longitude) => {
  try {
    await addDoc(collection(db, "locations"), {
      userId,
      latitude,
      longitude,
      timestamp: serverTimestamp()
    });
    console.log("Location saved successfully");
  } catch (error) {
    console.error("Error saving location: ", error);
  }
};



export { db, app, saveLocationData };
