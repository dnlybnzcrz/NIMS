import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Homepage from '../screens/Homepage';
import AddReport from '../screens/AddReport';
import StoryScreen from '../screens/StoryScreen';

const Stack = createStackNavigator();

import { Animated, Easing } from 'react-native';

const forSlideToRight = ({ current, layouts }) => {
  return {
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.width, 0],
          }),
        },
      ],
    },
  };
};

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: forSlideToRight,
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 600,
              easing: Easing.out(Easing.poly(5)),
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 300,
              easing: Easing.out(Easing.poly(5)),
            },
          },
        },
      }}
    >
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
