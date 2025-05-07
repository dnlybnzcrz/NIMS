import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Platform } from 'react-native';
import HomeStackNavigator from './HomeStackNavigator';
import News from '../screens/News';
import Profile from '../screens/Profile';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();


const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'News') {
            iconName = focused ? 'newspaper' : 'newspaper-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'AddReport') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#123458',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: Platform.OS === 'android' ? 10 : 0,
          height: Platform.OS === 'android' ? 60 : undefined,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        listeners={({ navigation, route }) => {
          const eventEmitter = require('../utils/EventEmitter').default;
          return {
            tabPress: e => {
              e.preventDefault();
              if (!navigation.isFocused()) {
                navigation.navigate('Home');
              }
              eventEmitter.emit('scrollToTopAndRefresh');
            },
          };
        }}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';

          return {
            tabBarStyle: routeName === 'StoryScreen' ? { display: 'none' } : {},
          };
        }}
      />
      <Tab.Screen name="News" component={News} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;


