import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';

const Profile = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.text}>Profile Screen - Content coming soon.</Text>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
  },
});

export default Profile;
