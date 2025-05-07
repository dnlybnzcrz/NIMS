import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const ChangePass = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }
    setLoading(true);
    try {
      // Replace with your API endpoint for changing password
      const token = JSON.parse(localStorage.getItem('user')).token;
      const config = {
        headers: { Authorization: 'Bearer ' + token },
      };
      await axios.post(
        'https://api.radiopilipinas.online/login/changePassword',
        { currentPassword, newPassword },
        config
      );
      Alert.alert('Success', 'Password changed successfully.');
      onClose();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={currentPassword}
        onChangeText={setCurrentPassword}
      />
      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title={loading ? 'Changing...' : 'Change Password'} onPress={handleChangePassword} disabled={loading} />
      <Button title="Cancel" onPress={onClose} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginTop: 5,
  },
});

export default ChangePass;
