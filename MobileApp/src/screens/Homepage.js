import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
} from "react-native";
import axios from "axios";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MediaModal from "../components/MediaModal";
import ReportCard from "../components/ReportCard";
import ScreenWrapper from "../components/ScreenWrapper";

const Homepage = () => {
  const navigation = useNavigation();

  const flatListRef = useRef(null);

  const [approvedReports, setApprovedReports] = useState([]);
  // Removed modal state variables as we will navigate to StoryScreen instead
  // const [showModal, setShowModal] = useState(false);
  // const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [mediaType, setMediaType] = useState(null);
  const [mediaInitialIndex, setMediaInitialIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const { userToken, setUserToken } = useAuth();

  const config = {
    headers: {
      Authorization: userToken ? `Bearer ${userToken}` : "",
    },
  };

  useEffect(() => {
    if (userToken) {
      fetchApprovedReports();
    } else {
      console.error("No token found, user is not authenticated");
    }
  }, [userToken]);

  useEffect(() => {
    const eventEmitter = require('../utils/EventEmitter').default;
    const handler = () => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
      fetchApprovedReports();
    };
    eventEmitter.on('scrollToTopAndRefresh', handler);

    return () => {
      eventEmitter.off('scrollToTopAndRefresh', handler);
    };
  }, []);

  const fetchApprovedReports = () => {
    setLoading(true);
    axios
      .get("https://api.radiopilipinas.online/nims/view", config)
      .then((res) => {
        const filtered = res.data.newsDataList.filter((r) => r.approved === true);
        // Map forDate or other date field to dateCreated for consistency
        const mapped = filtered.map((report) => ({
          ...report,
          dateCreated: report.dateCreated || report.forDate || report.createdAt || null,
        }));
        setApprovedReports(mapped);
      })
      .catch((err) => {
        console.error(err);
        Alert.alert("Error", "Failed to fetch approved reports.");
      })
      .finally(() => setLoading(false));
  };

  const handleShowModal = (report) => {
    // Navigate to StoryScreen with report and searchQuery as params
    navigation.navigate('StoryScreen', { newsItem: report, searchQuery });
  };

  // Removed handleCloseModal as modal is removed
  // const handleCloseModal = () => {
  //   setShowModal(false);
  //   setSelectedReport(null);
  // };

  const S3_BASE_URL = "https://pbs-nims.s3.ap-southeast-1.amazonaws.com";

  const handleShowMediaModal = (mediaItems, type, initialIndex = 0) => {
    if (!mediaItems) return;

    // Prefix media URLs with S3 base URL
    const prefixedMediaItems = {
      audios: mediaItems.audios ? mediaItems.audios.map((item) => S3_BASE_URL + item) : [],
      images: mediaItems.images ? mediaItems.images.map((item) => S3_BASE_URL + item) : [],
      videos: mediaItems.videos ? mediaItems.videos.map((item) => S3_BASE_URL + item) : [],
    };

    setMediaUrls(prefixedMediaItems);
    setMediaType(type);
    setMediaInitialIndex(initialIndex);
    setShowMediaModal(true);
  };

  const handleCloseMediaModal = () => {
    setShowMediaModal(false);
    setMediaUrls([]);
    setMediaType(null);
    setMediaInitialIndex(0);
  };

  const [postsToRender, setPostsToRender] = useState(10);

  const allFilteredReports = useMemo(() => {
    return approvedReports.filter((report) => {
      const { author, lead, tags, dateCreated } = report;
      const formattedDate = moment(dateCreated).format("MM/DD/YYYY, h:mm:ss a");
      const tagsToSearch = Array.isArray(tags) ? tags.join(", ") : "";

      return (
        (author.station &&
          author.station.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (author.name.first &&
          author.name.first.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (author.name.middle &&
          author.name.middle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (author.name.last &&
          author.name.last.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead && lead.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tagsToSearch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (formattedDate && formattedDate.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [approvedReports, searchQuery]);

  const filteredReports = useMemo(() => {
    return allFilteredReports.slice(0, postsToRender);
  }, [allFilteredReports, postsToRender]);

  const handleDeleteReport = (reportId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this report?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          axios
            .delete(`https://api.radiopilipinas.online/nims/delete/${reportId}`, config)
            .then(() => {
              setApprovedReports((prev) => prev.filter((r) => r._id !== reportId));
            })
            .catch((err) => {
              console.error(err);
              Alert.alert("Error", "Failed to delete report.");
            });
        },
      },
    ]);
  };

  const renderReport = ({ item }) => (
    <View key={item._id} style={{ marginBottom: 12 }}>
      <ReportCard
        report={item}
        handleShowModal={handleShowModal}
        handleDeleteReport={handleDeleteReport}
        handleShowMediaModal={handleShowMediaModal}
        searchQuery={searchQuery}
      />
    </View>
  );


  return (
    <ScreenWrapper>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6b6b6b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#6b6b6b"
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#123458" />
        </View>
      ) : filteredReports.length ? (
      <FlatList
          ref={flatListRef}
          data={filteredReports}
          renderItem={renderReport}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchApprovedReports}
          style={styles.flatList}
          onEndReached={() => {
            if (postsToRender < allFilteredReports.length) {
              setPostsToRender((prev) => prev + 10);
            }
          }}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={21}
        />
      ) : (
        <Text style={styles.noReportsText}>No approved reports found!</Text>
      )}

      {/* Removed modal and StoryModal usage */}
      {/* <Modal visible={!!selectedReport} animationType="slide" onRequestClose={handleCloseModal}>
        <StoryModal
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          selectedNewsItem={selectedReport}
        />
      </Modal> */}

      <Modal visible={showMediaModal} animationType="slide" onRequestClose={handleCloseMediaModal}>
        <MediaModal
          show={showMediaModal}
          handleClose={handleCloseMediaModal}
          mediaItems={mediaUrls}
          initialIndex={mediaInitialIndex}
      />
      </Modal>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          navigation.navigate('AddReport');
        }}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
};



const styles = StyleSheet.create({
  searchContainer: {
    position: "absolute",
    top: 5,
    left: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: "#ffffff",
    borderRadius: 30,
    borderColor: "#123458",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#123458",
  },
  searchIcon: {
    marginLeft: 10,
  },
  feed: {
    paddingHorizontal: 15,
    paddingTop: 65, // to avoid overlap with floating search bar
  },
  flatList: {
    marginTop: 10,
  },
  noReportsText: {
    textAlign: "center",
    fontSize: 18,
    color: "#999999",
    marginTop: 50,
  },
  noTokenText: {
    textAlign: "center",
    fontSize: 18,
    color: "#ff4d4d",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 30,
    backgroundColor: "#123458",
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 30,
    color: "white",
  },
});

export default Homepage;

