const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUserProfile = functions.auth.user().onCreate((user) => {
  // Access the user's email and UID
  const {email, uid} = user;

  // Access the Firebase Firestore
  const db = admin.firestore();

  // Create a Firestore document for the user's profile
  return db.collection("UserProfiles").doc(uid).set({
    email: email,
    role: "Driver", // Set the initial role (you can customize this)
  });
});

// Add a newline at the end of the file
