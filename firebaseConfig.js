import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

<<<<<<< HEAD
=======
// Initialize firestore service
const db = getFirestore();

// Create ref for Driver collection
const colRef = collection(db, 'DRIVERS')


>>>>>>> parent of 6aef7f3 (fixing firestore connection dupe)
// Initialize Firebase Auth with AsyncStorage for persistence
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

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
