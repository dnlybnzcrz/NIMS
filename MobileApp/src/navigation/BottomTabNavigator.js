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
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            const iconSize = 24;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'News') {
              iconName = focused ? 'newspaper' : 'newspaper-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'AddReport') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            }

            return <Ionicons name={iconName} size={iconSize} color={color} />;
          },
          tabBarActiveTintColor: '#123458',
          tabBarInactiveTintColor: 'gray',
          tabBarLabelStyle: {
            fontSize: 12,
          },
          tabBarStyle: {
            paddingBottom: 0,
            height: 70,
            marginBottom: 0,
            // Increased height and added marginBottom to move tab bar upwards
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
            tabBarStyle: routeName === 'StoryScreen' ? { display: 'none', height: 0, paddingBottom: 0 } : { height: 80, marginBottom: 0 },
          };
        }}
      />
      <Tab.Screen
        name="News"
        component={News}
        listeners={({ navigation, route }) => {
          const eventEmitter = require('../utils/EventEmitter').default;
          return {
            tabPress: e => {
              e.preventDefault();
              if (!navigation.isFocused()) {
                navigation.navigate('News');
              }
              eventEmitter.emit('scrollToTopAndRefresh');
            },
          };
        }}
        options={{ tabBarStyle: { height: 80, paddingBottom: 5, marginBottom: 0 } }}
      />
      <Tab.Screen name="Profile" component={Profile} options={{ tabBarStyle: { height: 80, paddingBottom: 5, marginBottom: 0 } }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;


