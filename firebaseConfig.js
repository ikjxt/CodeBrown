import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, Firestore, onSnapshot, orderBy, query, snapshot, getDocs } from '@firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBth5BPdFF7zR7utwzEU5aqyNKusBDjTSs",
  authDomain: "cheesytracker.firebaseapp.com",
  projectId: "cheesytracker",
  storageBucket: "cheesytracker.appspot.com",
  messagingSenderId: "413164372288",
  appId: "1:413164372288:web:55f70c80c74944d2e03aa5",
  measurementId: "G-5G4TY0PPZW"
};

// Initialize firebase app
const app = initializeApp(firebaseConfig);

// Initialize firestore service
const db = getFirestore();

// Create ref for Driver collection
const colRef = collection(db, 'DRIVERS')


// Initialize Firebase Auth with AsyncStorage for persistence
// initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage)
// });


// DISPLAY ALL DRIVERS FROM DB
// PRESS SEARCH BUTTON TO CONSOLE LOG DRIVERS
// TO DO: TAKE IN PERAMETERS FOR SPECIFIC SEARCHES
export function searchDB(){
  try{
    getDocs(colRef)
    .then((snapshot) => {
      let drivers = []
      snapshot.docs.forEach((doc) => {
        drivers.push({ ...doc.data() })
      })
      console.log(drivers)
    })
  }
  catch(err){
    console.error(err)
  }
}

export default app;
