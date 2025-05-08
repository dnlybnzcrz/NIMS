import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, Switch, StyleSheet } from 'react-native';  // Add StyleSheet here
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../../contexts/AuthContext';

const LoginScreen = ({ navigation }) => {
  const { setUserToken } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErrorMessage('');
    setLoading(true);
    const data = { username, password };

    try {
      const response = await axios.post(
        'https://api.radiopilipinas.online/login',
        data,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const userData = response.data;
      const token = userData.token;

      // Get additional user details
      const userDetailsResponse = await axios.get(
        'https://api.radiopilipinas.online/login/getDetails',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userDetails = userDetailsResponse.data.userData;

      // Always store token and user ID together under 'user' key
      await AsyncStorage.setItem('user', JSON.stringify({
        token,
        id: userDetails.id,
      }));

      // Store full details only if rememberMe is true
      if (rememberMe) {
        await AsyncStorage.setItem('userDetails', JSON.stringify(userDetails));
      } else {
        await AsyncStorage.removeItem('userDetails');
      }

      setUserToken(token); // Set token in context
      navigation.replace('Home'); // Navigate to Home screen after successful login
    } catch (error) {
      setErrorMessage('Incorrect username or password!');
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/Logo.png')} style={styles.logo} />

      <View style={styles.inputContainer}>
        <Icon name="user" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#666" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.rememberMeContainer}>
        <Switch
          value={rememberMe}
          onValueChange={setRememberMe}
          thumbColor={rememberMe ? '#333' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
        <Text style={styles.rememberMeText}>Remember me</Text>
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  backgroundLogo: {
    position: 'absolute',
    bottom: 20,
    width: 250,
    height: 250,
    opacity: 1,
    resizeMode: 'contain',
  },
  logo: {
    width: 330,
    height: 145,
    marginBottom: 30,
    resizeMode: 'contain',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    width: '90%',
    height: 50,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 15,
  },
  rememberMeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    width: '90%',
    height: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
