import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import moment from "moment";

const ReportCard = ({ report, handleShowModal, handleDeleteReport, handleShowMediaModal, searchQuery, userRole }) => {
  const { author, lead, tags, dateCreated, _id, files, remarks, headline } = report;

  // Highlight search query matches (basic implementation)
  const highlightText = (text) => {
    if (!text) return null;
    const textStr = String(text);
    if (!searchQuery) return textStr;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = textStr.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <Text key={index} style={styles.highlight}>
          {part}
        </Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    );
  };

  // Calculate total media count
  const mediaCount =
    (files?.audios?.length || 0) +
    (files?.images?.length || 0) +
    (files?.videos?.length || 0);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => handleShowModal(report)}>
        <Text style={styles.headline}>{highlightText(report.lead || "No Headline")}</Text>
      </TouchableOpacity>
      <Text style={styles.author}>
        By {author?.name?.first || "N/A"} {author?.name?.middle ? author.name.middle + " " : ""}{author?.name?.last || "N/A"} - {author?.station || "N/A"}
      </Text>
      <Text style={styles.date}>{dateCreated ? moment(dateCreated).format("MM/DD/YYYY, h:mm:ss a") : "N/A"}</Text>
      <Text style={styles.lead}>{highlightText(lead || "No content available.")}</Text>
      <Text style={styles.tags}>
        {tags && Array.isArray(tags) && tags.length > 0 ? tags.join(", ") : "No tags selected"}
      </Text>
      {mediaCount > 0 ? (
        <TouchableOpacity onPress={() => handleShowMediaModal(files)}>
          <Text style={styles.mediaLink}>View Media ({mediaCount})</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.noMedia}>No media available</Text>
      )}
      <Text style={styles.remarks}>{remarks || ""}</Text>
      {userRole === "super" && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteReport(_id)}
        >
          <Text style={styles.deleteButtonText}>Delete Report</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headline: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  author: {
    fontSize: 14,
    color: "#555",
    marginBottom: 3,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginBottom: 10,
  },
  lead: {
    fontSize: 16,
    marginBottom: 10,
  },
  tags: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 10,
  },
  mediaLink: {
    color: "#007bff",
    marginBottom: 10,
  },
  noMedia: {
    fontSize: 14,
    color: "#888",
    marginBottom: 10,
  },
  remarks: {
    fontSize: 14,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  highlight: {
    backgroundColor: "yellow",
  },
});

export default ReportCard;
