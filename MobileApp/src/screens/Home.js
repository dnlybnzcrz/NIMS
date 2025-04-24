import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');

      if (!storedUser) {
        setError('No user data found in storage.');
        console.error('No user data in AsyncStorage.');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const token = parsedUser?.token;

      if (!token) {
        setError('Token not found.');
        console.error('Token missing in parsed user data.');
        return;
      }

      console.log('Using token:', token);

      const response = await axios.get('https://api.radiopilipinas.online/reports', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Fetched reports:', response.data);
      setReports(response.data);
    } catch (err) {
      setError('Failed to fetch reports.');
      console.error('API fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      {error ? (
        <Text style={{ color: 'red' }}>{error}</Text>
      ) : (
        reports.map((report, index) => (
          <View key={index} style={{ marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold' }}>{report.title}</Text>
            <Text>{report.lead}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default Home;
