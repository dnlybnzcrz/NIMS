import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ReportCard = ({ report, handleShowModal, handleDeleteReport, handleShowMediaModal, searchQuery }) => {
  const { author, lead, tags, dateCreated, _id, media } = report;

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

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => handleShowModal(report)}>
        <Text style={styles.headline}>{highlightText(report.headline || "No Headline")}</Text>
      </TouchableOpacity>
      <Text style={styles.author}>
        By {author?.name?.first || ""} {author?.name?.last || ""} - {author?.station || ""}
      </Text>
      <Text style={styles.date}>{dateCreated ? new Date(dateCreated).toLocaleString() : ""}</Text>
      <Text style={styles.lead}>{highlightText(lead || "No content available.")}</Text>

      {media && media.length > 0 && (
        <TouchableOpacity onPress={() => handleShowMediaModal(media, "image", 0)}>
          <Text style={styles.mediaLink}>View Media ({media.length})</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteReport(_id)}
      >
        <Text style={styles.deleteButtonText}>Delete Report</Text>
      </TouchableOpacity>
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
  mediaLink: {
    color: "#007bff",
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
