import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, Firestore, orderBy, query } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBth5BPdFF7zR7utwzEU5aqyNKusBDjTSs",
  authDomain: "cheesytracker.firebaseapp.com",
  projectId: "cheesytracker",
  storageBucket: "cheesytracker.appspot.com",
  messagingSenderId: "413164372288",
  appId: "1:413164372288:web:55f70c80c74944d2e03aa5",
  measurementId: "G-5G4TY0PPZW"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage for persistence
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore query SKELETON
// TO-DO add Snapshot for realtime listener (query) and make asynchronous
export function searchDB( {driverID} ){
  const driverCol = collection(firestore, 'DRIVERS')
  const driverQuery = query(driverCol)
}

export default app;
