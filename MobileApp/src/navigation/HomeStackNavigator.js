import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Homepage from '../screens/Homepage';
import AddReport from '../screens/AddReport';
import StoryScreen from '../screens/StoryScreen';

const Stack = createStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Homepage" component={Homepage} />
      <Stack.Screen name="AddReport" component={AddReport} />
      <Stack.Screen 
        name="StoryScreen" 
        component={StoryScreen} 
        options={{ tabBarStyle: { display: 'none' } }} 
      />
    </Stack.Navigator>
  );
};

export default HomeStackNavigator;
