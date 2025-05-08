import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import moment from 'moment';
import AddReport from './AddReport';
import StoryScreen from './StoryScreen';
import MediaModal from '../components/MediaModal';

const News = () => {
  const { userToken } = useContext(AuthContext);
  const [newsList, setNewsList] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  // Removed add report state as per user request
  // const [isAddReportVisible, setIsAddReportVisible] = useState(false);
  const [isEditStoryVisible, setIsEditStoryVisible] = useState(false);
  const [selectedNewsItem, setSelectedNewsItem] = useState(null);
  const [isMediaModalVisible, setIsMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const config = {
    headers: {
      Authorization: 'Bearer ' + (userToken ? userToken : ''),
    },
  };

  useEffect(() => {
    console.log('User token in News screen:', userToken);
  }, [userToken]);

  useEffect(() => {
    fetchNews();
  }, [page]);

  useEffect(() => {
    filterNews(searchQuery);
  }, [newsList, searchQuery]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      let res;
      if (userToken) {
        res = await axios.get(`https://api.radiopilipinas.online/nims/view?page=${page}&limit=${itemsPerPage}`, {
          headers: { Authorization: 'Bearer ' + userToken }
        });
      } else {
        res = await axios.get(`https://api.radiopilipinas.online/nims/view?page=${page}&limit=${itemsPerPage}`);
      }
      if (page === 1) {
        setNewsList(res.data.newsDataList);
      } else {
        setNewsList(prev => [...prev, ...res.data.newsDataList]);
      }
      if (res.data.totalCount !== undefined) {
        setTotalCount(res.data.totalCount);
      }
    } catch (error) {
      console.log(error);
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
    console.log('Filtering news with query:', query);
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
    console.log('Filtered news count:', filtered.length);
    setFilteredNews(filtered);
  };

  // Removed handleAddReport function as per user request
  // const handleAddReport = (newReport) => {
  //   setNewsList(prev => [newReport, ...prev]);
  //   setIsAddReportVisible(false);
  // };

  const handleEdit = (newsItem) => {
    setSelectedNewsItem(newsItem);
    setIsEditStoryVisible(true);
  };

  const handleUpdateNews = (updatedNews) => {
    setNewsList(prev =>
      prev.map(news => (news._id === updatedNews._id ? updatedNews : news))
    );
    setIsEditStoryVisible(false);
    setSelectedNewsItem(null);
  };

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

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
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
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item._id)}>
            <Text style={[styles.actionText, { color: 'red' }]}>Delete</Text>
          </TouchableOpacity>
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
        {loading && page === 1 ? (
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
            ListEmptyComponent={<Text style={styles.emptyText}>No news found 😢</Text>}
          />
        )}
        {isEditStoryVisible && selectedNewsItem && (
          <StoryScreen
            visible={isEditStoryVisible}
            onClose={() => setIsEditStoryVisible(false)}
            content={selectedNewsItem}
            onStoryUpdated={handleUpdateNews}
          />
        )}
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
