import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
// Removed import of Homepage since it is now inside HomeStackNavigator
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
// Removed import of AddReport since it is now part of HomeStackNavigator
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={BottomTabNavigator} />
          {/* Removed AddReport stack screen */}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
