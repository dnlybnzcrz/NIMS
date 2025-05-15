import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import moment from 'moment';
import ScreenWrapper from '../components/ScreenWrapper';
import { AuthContext } from '../../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Helper function to decode JWT token payload
const decodeBase64 = (str) => {
  try {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (e) {
    return null;
  }
};

const decodeJWT = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeBase64(base64);
    return jsonPayload ? JSON.parse(jsonPayload) : null;
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
};

// Polyfill for atob in React Native
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function atob(input = '') {
  let str = input.replace(/=+$/, '');
  let output = '';

  if (str.length % 4 === 1) {
    throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

import { useFocusEffect } from '@react-navigation/native';
import eventEmitter from '../utils/EventEmitter';

const News = () => {
  const navigation = useNavigation();
  const { userToken } = useContext(AuthContext);
  const [newsList, setNewsList] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Load cached news on mount
  useEffect(() => {
    const loadCachedNews = async () => {
      try {
        const cachedNews = await AsyncStorage.getItem('cachedNews');
        if (cachedNews) {
          const parsedNews = JSON.parse(cachedNews);
          setNewsList(parsedNews);
          setFilteredNews(parsedNews);
        }
      } catch (error) {
        console.error('Failed to load cached news:', error);
      }
    };
    loadCachedNews();
  }, []);

  // Refresh news when tab is reselected via event emitter
  useEffect(() => {
    const refreshListener = () => {
      setPage(1);
      // Delay fetchNews call to ensure page state is updated
      setTimeout(() => {
        fetchNews(1);
      }, 0);
    };
    eventEmitter.on('scrollToTopAndRefresh', refreshListener);
    return () => {
      eventEmitter.off('scrollToTopAndRefresh', refreshListener);
    };
  }, [currentUserId]);

  // Decode user info from token
  const userInfo = decodeJWT(userToken);
  // Prefer username if available, else fallback to _id or id
  const userIdFromToken = userInfo ? userInfo.username || userInfo._id || userInfo.id || userInfo.userId : null;

  const config = {
    headers: {
      Authorization: 'Bearer ' + (userToken ? userToken : ''),
    },
  };

  useEffect(() => {
    // Set currentUserId directly from decoded token userIdFromToken
    if (userIdFromToken) {
      setCurrentUserId(userIdFromToken);
    }
  }, [userIdFromToken]);

  useEffect(() => {
    if (currentUserId) {
      fetchNews(page);
    }
  }, [page, currentUserId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // debounce delay 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    filterNews(debouncedSearchQuery);
  }, [newsList, debouncedSearchQuery]);

  const fetchNews = async (pageToFetch = 1) => {
    if (!currentUserId) {
      // Wait until currentUserId is loaded
      return;
    }
    setLoading(true);
    try {
      let res;
      if (userToken) {
        res = await axios.get(`https://api.radiopilipinas.online/nims/view?page=${pageToFetch}&limit=${itemsPerPage}`, {
          headers: { Authorization: 'Bearer ' + userToken }
        });
      } else {
        res = await axios.get(`https://api.radiopilipinas.online/nims/view?page=${pageToFetch}&limit=${itemsPerPage}`);
      }
      let newsData = res.data.newsDataList;

      // Filter news to include approved or pending posts authored by current user
      newsData = newsData.filter(news => {
        if (!news.author) return false;
        const authorUsername = news.author.username || '';
        const authorId = news.author._id || news.author.id || '';
        const currentUserIdStr = String(currentUserId).toLowerCase();
        const authorUsernameStr = String(authorUsername).toLowerCase();
        const authorIdStr = String(authorId).toLowerCase();
        // Match if currentUserId matches either username or id exactly or partially
        if (authorUsernameStr === currentUserIdStr || authorIdStr === currentUserIdStr) {
          return true;
        }
        if (authorUsernameStr.includes(currentUserIdStr) || currentUserIdStr.includes(authorUsernameStr)) {
          return true;
        }
        if (authorIdStr.includes(currentUserIdStr) || currentUserIdStr.includes(authorIdStr)) {
          return true;
        }
        return false;
      });

      if (newsData.length === 0) {
        // Remove fallback to all approved news, show empty list if no user posts
        newsData = [];
      }

      if (pageToFetch === 1) {
        setNewsList(newsData);
        // Cache first 10 news items
        try {
          const newsToCache = newsData.slice(0, 10);
          AsyncStorage.setItem('cachedNews', JSON.stringify(newsToCache));
        } catch (error) {
          console.error('Failed to cache news:', error);
        }
      } else {
        setNewsList(prev => [...prev, ...newsData]);
      }
      if (res.data.totalCount !== undefined) {
        setTotalCount(res.data.totalCount);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        Alert.alert('Authentication Error', 'You must be logged in to view news.');
      } else {
        Alert.alert('Error', 'Failed to fetch news.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterNews = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = newsList.filter(news => {
      const authorFirstName = news.author && news.author.name ? news.author.name.first : '';
      const authorMiddleName = news.author && news.author.name ? news.author.name.middle : '';
      const authorLastName = news.author && news.author.name ? news.author.name.last : '';
      const authorFullName = `${authorFirstName} ${authorMiddleName} ${authorLastName}`.toLowerCase();

      return (
        (news.author && news.author.station && news.author.station.toLowerCase().includes(lowerCaseQuery)) ||
        authorFullName.includes(lowerCaseQuery) ||
        (news.lead && news.lead.toLowerCase().includes(lowerCaseQuery)) ||
        (news.body && news.body.toLowerCase().includes(lowerCaseQuery)) ||
        (news.tags && Array.isArray(news.tags) && news.tags.some(tag => tag && tag.toLowerCase().includes(lowerCaseQuery))) ||
        (news.dateCreated && moment(news.dateCreated).format('MM/DD/YYYY, h:mm:ss a').includes(lowerCaseQuery))
      );
    });
    setFilteredNews(filtered);
  };

 const handleEdit = (newsItem) => {
  navigation.navigate('Home', {
    screen: 'EditReport',
    params: { post: newsItem },
  });
}

  const handleDelete = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this news item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`https://api.radiopilipinas.online/nims/delete/${id}`, config);
              setNewsList(prev => prev.filter(news => news._id !== id));
              // Refresh the filtered news list after deletion
              setFilteredNews(prev => prev.filter(news => news._id !== id));
            } catch (error) {
              console.log(error);
              Alert.alert('Error', 'Failed to delete news item.');
            }
          },
        },
      ]
    );
  };

  const openMediaModal = (files) => {
    setSelectedMedia(files);
    setIsMediaModalVisible(true);
  };

  const closeMediaModal = () => {
    setIsMediaModalVisible(false);
    setSelectedMedia(null);
  };

  const loadMore = () => {
    if (!loading && newsList.length >= itemsPerPage * page) {
      setPage(prev => prev + 1);
    }
  };

  // Removed duplicate fetchNews function to fix redeclaration error

  const onRefresh = () => {
    setPage(1);
    fetchNews(1);
  };

  const renderItem = ({ item }) => {
    const authorName = item.author && item.author.name
      ? `${item.author.name.first || 'N/A'} ${item.author.name.last || 'N/A'}`
      : 'N/A';
    const station = item.author && item.author.station ? item.author.station : 'N/A';
    const tags = item.tags && Array.isArray(item.tags) && item.tags.length > 0
      ? item.tags.join(', ')
      : 'No tags selected';

    const hasMedia = item.files &&
      ((item.files.audios && item.files.audios.length > 0) ||
      (item.files.images && item.files.images.length > 0) ||
      (item.files.videos && item.files.videos.length > 0));

    // Determine if current user is the author of this news item
    const currentUserIdStr = currentUserId ? String(currentUserId).toLowerCase() : '';
    const authorUsernameStr = item.author && item.author.username ? String(item.author.username).toLowerCase() : '';
    const authorIdStr = item.author && (item.author._id || item.author.id) ? String(item.author._id || item.author.id).toLowerCase() : '';
    const isAuthor = currentUserIdStr && (authorUsernameStr === currentUserIdStr || authorIdStr === currentUserIdStr);

    return (
      <View style={styles.newsItem}>
        <Text style={styles.source}>{authorName} - {station}</Text>
        <Text style={styles.lead}>{item.lead}</Text>
        <Text style={styles.tags}>{tags}</Text>
        <Text style={styles.date}>{moment(item.dateCreated).format('MM/DD/YYYY')}</Text>
        <Text style={styles.time}>{moment(item.dateCreated).format('h:mm:ss a')}</Text>
        {hasMedia ? (
          <TouchableOpacity style={styles.mediaButton} onPress={() => openMediaModal(item.files)}>
            <Text style={styles.mediaButtonText}>View Media</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noMedia}>No Media</Text>
        )}
        <Text style={styles.remarks}>{item.remarks}</Text>
        <View style={styles.actions}>
          {isAuthor && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item._id)}>
                <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>NEWS</Text>
        {/* Removed Add Report button and modal as per user request */}
        <TextInput
          style={styles.searchInput}
          placeholder="Search by source, lead, body, tags, or date/time"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {(loading && page === 1) || refreshing ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={filteredNews}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListEmptyComponent={<Text style={styles.emptyText}>Loading..... 😢</Text>}
          />
        )}
        {/* Removed StoryScreen modal as editing is now done in AddReport screen */}
        {isMediaModalVisible && selectedMedia && (
          <MediaModal
            visible={isMediaModalVisible}
            onClose={closeMediaModal}
            media={selectedMedia}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#222',
  },
  searchInput: {
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newsItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  source: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  lead: {
    fontSize: 15,
    marginBottom: 8,
    color: '#444',
  },
  tags: {
    fontStyle: 'italic',
    marginBottom: 8,
    color: '#666',
  },
  date: {
    color: '#888',
    fontSize: 13,
  },
  time: {
    color: '#888',
    fontSize: 13,
    marginBottom: 8,
  },
  mediaButton: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  mediaButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  noMedia: {
    color: '#bbb',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  remarks: {
    marginBottom: 10,
    color: '#555',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    marginLeft: 15,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
  },
  actionText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    color: '#aaa',
    fontSize: 16,
  },
});

export default News;
