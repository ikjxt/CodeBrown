import React, { useState, useEffect } from 'react';
import app from './firebaseConfig'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import AppNavigator from './AppNavigator'; 

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth(app); 
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe(); 
  }, []);

  return <AppNavigator isAuthenticated={isAuthenticated} />;
};

export default App;
