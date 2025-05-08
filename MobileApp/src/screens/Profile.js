import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Modal, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import ScreenWrapper from '../components/ScreenWrapper';
import ChangePass from '../components/ChangePass';
import { useNavigation, CommonActions } from '@react-navigation/native';

const Profile = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChangePass, setShowChangePass] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('user');
        const parsedToken = token ? JSON.parse(token).token : null;
        if (!parsedToken) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }
        const config = {
          headers: {
            Authorization: 'Bearer ' + parsedToken,
          },
        };
        const response = await axios.get('https://api.radiopilipinas.online/login/getDetails', config);
        setUserData(response.data.userData);
      } catch (error) {
        setError(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleClose = () => setShowChangePass(false);
  const handleShow = () => setShowChangePass(true);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      Alert.alert('Logged out', 'You have been logged out successfully.');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!userData) {
    return (
      <ScreenWrapper>
        <View style={styles.centered}>
          <Text>No user data found.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Extract initials for user icon
  const getInitials = () => {
    if (!userData || !userData.name) return '';
    const first = userData.name.first ? userData.name.first.charAt(0) : '';
    const last = userData.name.last ? userData.name.last.charAt(0) : '';
    return (first + last).toUpperCase();
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>{getInitials()}</Text>
          </View>
          <Text style={styles.title}>User Profile</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>{userData.username}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>First Name:</Text>
            <Text style={styles.value}>{userData.name.first}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Middle Name:</Text>
            <Text style={styles.value}>{userData.name.middle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Last Name:</Text>
            <Text style={styles.value}>{userData.name.last}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value}>{userData.department}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Station:</Text>
            <Text style={styles.value}>{userData.station}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{userData.role}</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleShow}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showChangePass} animationType="slide" transparent={true} onRequestClose={handleClose}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <ChangePass onClose={handleClose} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#123458',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  iconText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
    maxWidth: 400,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 60,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 120,
    textAlign: 'left',
    marginRight: 10,
  },
  value: {
    fontSize: 18,
    flex: 1,
    textAlign: 'left',
  },
  errorText: {
    color: 'red',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
  },
  button: {
    backgroundColor: "#123458",
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    alignSelf: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonLogout: {
    backgroundColor: "#123458",
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    alignSelf: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  contentContainer: {
    backgroundColor: '#F1EFEC',
    padding: 20,
    borderRadius: 10,
    width: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default Profile;