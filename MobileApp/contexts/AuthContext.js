import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the AuthContext
export const AuthContext = createContext();

// AuthProvider component will wrap around the app's components
export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);  // Store token
  const [isLoading, setIsLoading] = useState(true);   // To handle loading state

  useEffect(() => {
    // Retrieve stored token on app load (if any)
    const loadUserToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('userToken');
        if (storedToken) {
          setUserToken(storedToken);  // Set the token if found
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      } finally {
        setIsLoading(false);  // Once loading is finished, set the loading state to false
      }
    };
    loadUserToken();
  }, []);

  // AuthContext value to provide to children components
  const authContextValue = {
    userToken,
    setUserToken, // Function to update the token
    isLoading,     // Loading state for first-time app load
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
