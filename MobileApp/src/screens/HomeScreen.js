import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';

const HomeScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posts, setPosts] = useState([]); 

  const handlePost = () => {
    if (!title || !description) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const newPost = { id: Date.now().toString(), title, description };
    setPosts([newPost, ...posts]); 
    setTitle('');
    setDescription('');
    Alert.alert('Success', 'Your news has been posted!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Post a News Report</Text>

      
      <TextInput
        style={styles.input}
        placeholder="Enter news title"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />

      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the event..."
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      
      <TouchableOpacity style={styles.button} onPress={handlePost}>
        <Text style={styles.buttonText}>Post News</Text>
      </TouchableOpacity>

      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.post}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <Text style={styles.postDescription}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 100,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  post: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
});

export default HomeScreen;
