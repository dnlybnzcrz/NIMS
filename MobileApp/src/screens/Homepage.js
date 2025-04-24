import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Image, FlatList, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Modal, Button } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import axios from "axios";
import moment from "moment";
import { useAuth } from "../../contexts/AuthContext"; // Import the custom hook for AuthContext
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

  const { userToken, setUserToken } = useAuth();  // Use the AuthContext to get and set the token

  useEffect(() => {
    if (userToken) {
      fetchApprovedReports();
    } else {
      console.error("No token found, user is not authenticated");
    }
  }, [userToken]);

  const config = {
    headers: {
      Authorization: userToken ? `Bearer ${userToken}` : "",
    },
  };

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

  if (!userToken) {
    return (
      <View style={styles.container}>
        <Text style={styles.noTokenText}>You are not logged in. Please login to view reports.</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.removeItem("user");
            setUserToken(null); // Update the token in AuthContext
          }}
        >
          <Text style={styles.logoutButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#123458', '#D4C9BE', '#123458', '#030303']} locations={[0, 0.33, 0.66, 1]} style={styles.container}>
      <View style={styles.header}>
        <Image source={pbsheader} style={styles.headerImage} resizeMode="contain" />
      </View>
      <Navbar />
      <TextInput
        style={styles.searchInput}
        placeholder="Search by source, headline, lead, tags, or date/time"
        value={searchQuery}
        onChangeText={setSearchQuery}
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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  pageNumber: {
    marginHorizontal: 10,
  },
  reportContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  separator: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  noReportsText: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
  },
  noTokenText: {
    textAlign: "center",
    fontSize: 18,
    color: "#ff0000",
  },
  logoutButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    marginHorizontal: 50,
  },
  logoutButtonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
});

export default Homepage;
