import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getFirestore, collection, Firestore, onSnapshot, orderBy, query, where, snapshot, getDocs, addDoc, serverTimestamp, get
} from '@firebase/firestore';

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

// Initialize firestore service
const db = getFirestore(app);

// Create ref for Driver collection
const driverRef = collection(db, 'DRIVERS')

const orderRef = collection(db, 'ORDERS')

// queries shows all orders belonging to specific name 
// TO DO: get user input to use for query
const q = query(orderRef, where("DRIVER:", "==", "Larry"));

// Initialize Firebase Auth with AsyncStorage for persistence
// initializeAuth(app, {
//   persistence: getReactNativePersistence(AsyncStorage)
// });


// PRESS SEARCH BUTTON TO CONSOLE LOG DRIVERS
// Display all drivers
export function searchDB(){
  try{
    onSnapshot(driverRef, (snapshot) => {
      let drivers = []
      snapshot.docs.forEach((doc) => {
      drivers.push({ ...doc.data() })
      })
      console.log(drivers);
    })
  }
  catch(err){
    console.error(err);
  }
} 

// Get all orders
export function showOrders(){
  try{
    onSnapshot(orderRef, (snapshot) => {
      let drivers = []
      snapshot.docs.forEach((doc) => {
      drivers.push({ ...doc.data() })
      })
      console.log(drivers);
    })
  }
  catch(err){
    console.error(err);
  }
} 

// Search by name (all orders) Returns an array of data (in progress)
export function nameSearch({ name }){
  try{
    let orders = []
    snapshot.docs.forEach((doc) => {
      orders.push({...doc.data() })
    })
    return orders;
  }
  catch(err){
    console.error(err)
  }
}
// Search by date (all orders)

// 



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
