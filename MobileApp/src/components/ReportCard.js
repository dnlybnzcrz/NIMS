import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, AccessibilityInfo } from "react-native";
import moment from "moment";

const ReportCard = ({ report, handleShowModal, handleDeleteReport, handleShowMediaModal, searchQuery, userRole }) => {
  const { author, lead, tags, dateCreated, _id, files, remarks, headline, status } = report;

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

  const S3_BASE_URL = "https://pbs-nims.s3.ap-southeast-1.amazonaws.com";


  return (
    <TouchableOpacity
      onPress={() => handleShowModal(report)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Report card. Headline: ${headline || "No headline"}. By ${author?.name?.first || "N/A"} ${author?.name?.middle ? author.name.middle + " " : ""}${author?.name?.last || "N/A"}.`}
    >
      <View style={styles.card}>
        {files?.images && files.images.length > 0 ? (
          <Image
            source={{ uri: S3_BASE_URL + files.images[0] }}
            style={styles.thumbnail}
            resizeMode="cover"
            accessibilityLabel="Report image thumbnail"
          />
        ) : null}
        <Text
          style={[styles.headline, styles.headlineBackground]}
          numberOfLines={files?.images && files.images.length > 0 ? 2 : undefined}
          ellipsizeMode={files?.images && files.images.length > 0 ? "tail" : undefined}
        >
          {highlightText(
            lead
              ? (files?.images && files.images.length > 0 && lead.split(" ").length > 20)
                ? lead.split(" ").slice(0, 15).join(" ") + "..."
                : lead
              : "No Headline"
          )}
        </Text>
        {status && (
          <View style={status === "approved" ? styles.approvedLabel : styles.pendingLabel}>
            <Text style={status === "approved" ? styles.approvedLabelText : styles.pendingLabelText}>
              {status === "approved" ? "Approved" : "Pending"}
            </Text>
          </View>
        )}
        <View style={styles.infoContainer}>
          <Text style={styles.author} numberOfLines={1} ellipsizeMode="tail">
            By {author?.name?.first || "N/A"} {author?.name?.middle ? author.name.middle + " " : ""}{author?.name?.last || "N/A"} - {author?.station || "N/A"}
          </Text>
          <Text style={styles.tags} numberOfLines={1} ellipsizeMode="tail">
            {tags && Array.isArray(tags) && tags.length > 0 ? tags.join(", ") : "No tags selected"}
          </Text>
          <Text style={styles.date}>
            {report.forDate
              ? moment(report.forDate).isValid()
                ? moment(report.forDate).format("MM/DD/YYYY, h:mm:ss a")
                : // Try parsing as ISO string or timestamp
                  moment(new Date(report.forDate)).isValid()
                ? moment(new Date(report.forDate)).format("MM/DD/YYYY, h:mm:ss a")
                : "N/A"
              : "N/A"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    marginVertical: 8,
    marginHorizontal: 12,
  },
  thumbnail: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
  },
  noMediaPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  noMediaText: {
    fontSize: 14,
    color: "#888",
    fontStyle: "italic",
  },
  infoContainer: {
    paddingHorizontal: 4,
  },
  headline: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 6,
    lineHeight: 26,
  },
  headlineBackground: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  author: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginBottom: 6,
  },
  tags: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 6,
  },
  highlight: {
    backgroundColor: "yellow",
  },
  approvedLabel: {
    backgroundColor: '#d4edda',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  approvedLabelText: {
    color: '#155724',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  pendingLabel: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  pendingLabelText: {
    color: '#856404',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});


export default ReportCard;