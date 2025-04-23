import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  Button,
  Image,
} from "react-native";
import axios from "axios";

const HomeScreen = () => {
  const [approvedReports, setApprovedReports] = useState([]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [mediaType, setMediaType] = useState(null);
  const [mediaInitialIndex, setMediaInitialIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const rowsPerPage = 20;

  // For simplicity, token is hardcoded or fetched from some secure storage
  // Replace this with your actual token retrieval logic
  // Temporarily setting token to empty string to avoid unauthenticated error
  const token = ""; // TODO: Replace with AsyncStorage or context token retrieval

  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };

  useEffect(() => {
    if (token) {
      fetchApprovedReports();
    } else {
      // Temporarily allow fetch without token for testing
      fetchApprovedReports();
      // console.error("No token found, user is not authenticated");
      // Optionally, handle unauthenticated state here
    }
  }, [token]);

  const fetchApprovedReports = () => {
    setLoading(true);
    axios
      .get("https://api.radiopilipinas.online/nims/view", config)
      .then((res) => {
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

  const handleShowStoryModal = (report) => {
    setSelectedReport(report);
    setShowStoryModal(true);
  };

  const handleCloseStoryModal = () => {
    setShowStoryModal(false);
    setSelectedReport(null);
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
      const formattedDate = new Date(dateCreated).toLocaleString();
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

  const totalPages = Math.ceil(filterReports().length / rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDeleteReport = (reportId) => {
    // Confirm deletion - React Native does not have window.confirm, use Alert
    // For simplicity, skipping confirmation here
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
  };

  // Render ReportCard equivalent
  const renderReportCard = ({ item }) => {
    return (
      <View style={styles.reportCard}>
        <TouchableOpacity onPress={() => handleShowStoryModal(item)}>
          <Text style={styles.reportTitle}>{item.lead || "No Title"}</Text>
        </TouchableOpacity>
        <Text style={styles.reportAuthor}>
          {item.author?.name?.first} {item.author?.name?.last} -{" "}
          {item.author?.station}
        </Text>
        <Text style={styles.reportDate}>
          {new Date(item.dateCreated).toLocaleString()}
        </Text>
        <View style={styles.reportActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteReport(item._id)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
          {item.media && item.media.length > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                handleShowMediaModal(
                  item.media.map((m) => m.url),
                  item.media[0].type
                )
              }
            >
              <Text style={styles.actionButtonText}>View Media</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // StoryModal component
  const StoryModal = () => {
    if (!selectedReport) return null;
    return (
      <Modal
        visible={showStoryModal}
        animationType="slide"
        onRequestClose={handleCloseStoryModal}
      >
        <ScrollView style={styles.modalContent}>
          <Text style={styles.modalTitle}>{selectedReport.lead}</Text>
          <Text style={styles.modalAuthor}>
            {selectedReport.author?.name?.first}{" "}
            {selectedReport.author?.name?.last} -{" "}
            {selectedReport.author?.station}
          </Text>
          <Text style={styles.modalDate}>
            {new Date(selectedReport.dateCreated).toLocaleString()}
          </Text>
          <Text style={styles.modalBody}>{selectedReport.story}</Text>
          <Button title="Close" onPress={handleCloseStoryModal} />
        </ScrollView>
      </Modal>
    );
  };

  // MediaModal component
  const MediaModal = () => {
    if (!mediaUrls || mediaUrls.length === 0) return null;
    return (
      <Modal
        visible={showMediaModal}
        animationType="slide"
        onRequestClose={handleCloseMediaModal}
      >
        <ScrollView style={styles.modalContent}>
          {mediaUrls.map((url, index) => (
            <Image
              key={index}
              source={{ uri: url }}
              style={styles.mediaImage}
              resizeMode="contain"
            />
          ))}
          <Button title="Close" onPress={handleCloseMediaModal} />
        </ScrollView>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Approved Reports Feed</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by source, headline, lead, tags, or date/time"
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityLabel="Search reports"
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : paginatedReports.length > 0 ? (
        <FlatList
          data={paginatedReports}
          keyExtractor={(item) => item._id}
          renderItem={renderReportCard}
          ItemSeparatorComponent={() => (
            <View style={styles.separator} />
          )}
        />
      ) : (
        <Text style={styles.noReportsText}>No approved reports found!</Text>
      )}

      {/* Pagination Controls */}
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage === 0 && styles.disabledButton,
          ]}
          onPress={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 0}
        >
          <Text style={styles.pageButtonText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageInfo}>
          Page {currentPage + 1} of {totalPages}
        </Text>
        <TouchableOpacity
          style={[
            styles.pageButton,
            currentPage + 1 === totalPages && styles.disabledButton,
          ]}
          onPress={() => handlePageChange(currentPage + 1)}
          disabled={currentPage + 1 === totalPages}
        >
          <Text style={styles.pageButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <StoryModal />
      <MediaModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: 40,
    backgroundColor: "#F1EFEC",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  reportCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  reportAuthor: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  reportDate: {
    fontSize: 12,
    color: "#777",
    marginBottom: 10,
  },
  reportActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  actionButton: {
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  separator: {
    height: 3,
    backgroundColor: "#555",
    marginVertical: 10,
  },
  noReportsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  pageButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  pageButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pageInfo: {
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalAuthor: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalDate: {
    fontSize: 14,
    color: "#777",
    marginBottom: 15,
  },
  modalBody: {
    fontSize: 16,
    lineHeight: 22,
  },
  mediaImage: {
    width: "100%",
    height: 300,
    marginBottom: 15,
  },
});

export default HomeScreen;
