import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Modal, Button } from "react-native";
import axios from "axios";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Navbar from "../components/Navbar";
import StoryModal from "../components/StoryModal";
import MediaModal from "../components/MediaModal";
import ReportCard from "../components/ReportCard";
import pbsheader from "../components/pbsheader.png";

const rowsPerPage = 20;

const Homepage = () => {
  const [approvedReports, setApprovedReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [mediaType, setMediaType] = useState(null);
  const [mediaInitialIndex, setMediaInitialIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getUserToken = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          if (user && user.token) {
            setToken(user.token);
          } else {
            setToken(null);
            console.error("Token not found in user object");
          }
        } else {
          setToken(null);
          console.error("No user found in AsyncStorage");
        }
      } catch (error) {
        setToken(null);
        console.error("Error reading user token from AsyncStorage", error);
      }
    };
    getUserToken();
  }, []);

  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };

  useEffect(() => {
    if (token) {
      fetchApprovedReports();
    } else {
      console.error("No token found, user is not authenticated");
    }
  }, [token]);

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTokenText}>You are not logged in. Please login to view reports.</Text>
      </View>
    );
  }

  const fetchApprovedReports = () => {
    setLoading(true);
    axios
      .get("https://api.radiopilipinas.online/nims/view", config)
      .then((res) => {
        console.log("API response first report:", res.data.newsDataList[0]);
        const filteredApprovedReports = res.data.newsDataList.filter(
          (report) => report.approved === true
        );
        setApprovedReports(filteredApprovedReports);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const handleShowModal = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleShowMediaModal = (mediaItems, type, initialIndex = 0) => {
    setMediaUrls(mediaItems);
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

  const filterReports = () => {
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
  };

  const paginatedReports = filterReports().slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  const handlePageChange = (direction) => {
    const totalPages = Math.ceil(filterReports().length / rowsPerPage);
    if (direction === "next" && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDeleteReport = (reportId) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this report?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            axios
              .delete(`https://api.radiopilipinas.online/nims/delete/${reportId}`, config)
              .then(() => {
                setApprovedReports(
                  approvedReports.filter((report) => report._id !== reportId)
                );
              })
              .catch((err) => {
                console.error(err);
              });
          },
        },
      ]
    );
  };

  const renderReport = ({ item, index }) => (
    <View key={item._id} style={index !== paginatedReports.length - 1 ? styles.reportContainer : null}>
      <ReportCard
        report={item}
        handleShowModal={handleShowModal}
        handleDeleteReport={handleDeleteReport}
        handleShowMediaModal={handleShowMediaModal}
        searchQuery={searchQuery}
      />
      {index !== paginatedReports.length - 1 && <View style={styles.separator} />}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={pbsheader} style={styles.headerImage} resizeMode="contain" />
      </View>
      <Navbar />
      <TextInput
        style={styles.searchInput}
        placeholder="Search by source, headline, lead, tags, or date/time"
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityLabel="Search reports"
        accessibilityRole="search"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
      ) : paginatedReports.length ? (
        <FlatList
          data={paginatedReports}
          renderItem={renderReport}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.feed}
        />
      ) : (
        <Text style={styles.noReportsText}>No approved reports found!</Text>
      )}
      <View style={styles.paginationContainer}>
        <Button
          title="Previous"
          onPress={() => handlePageChange("prev")}
          disabled={currentPage === 0}
        />
        <Text style={styles.pageNumber}>
          Page {currentPage + 1} of {Math.ceil(filterReports().length / rowsPerPage)}
        </Text>
        <Button
          title="Next"
          onPress={() => handlePageChange("next")}
          disabled={currentPage >= Math.ceil(filterReports().length / rowsPerPage) - 1}
        />
      </View>

      {/* Story Modal */}
      <Modal visible={showModal} animationType="slide" onRequestClose={handleCloseModal}>
        {selectedReport && (
          <StoryModal
            showModal={showModal}
            handleCloseModal={handleCloseModal}
            selectedNewsItem={selectedReport}
          />
        )}
      </Modal>

      {/* Media Modal */}
      <Modal visible={showMediaModal} animationType="slide" onRequestClose={handleCloseMediaModal}>
        {mediaUrls.length > 0 && (
          <MediaModal
            show={showMediaModal}
            handleClose={handleCloseMediaModal}
            mediaItems={mediaUrls}
            initialIndex={mediaInitialIndex}
          />
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingTop: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#007bff",
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  headerImage: {
    width: "90%",
    height: 60,
  },
  searchInput: {
    height: 40,
    marginHorizontal: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderColor: "#007bff",
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  feed: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  reportContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  separator: {
    borderBottomColor: "#e0e0e0",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  noReportsText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 18,
    color: "#666",
  },
  noTokenText: {
    flex: 1,
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    color: "red",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 15,
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  loadingIndicator: {
    marginTop: 20,
  },
});

export default Homepage;
