import React from "react";
import { Modal, View, Text, ScrollView, Button, StyleSheet } from "react-native";

const StoryModal = ({ showModal, handleCloseModal, selectedNewsItem }) => {
  if (!selectedNewsItem) return null;

  return (
    <Modal visible={showModal} animationType="slide" onRequestClose={handleCloseModal}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{selectedNewsItem.headline || "No Headline"}</Text>
          <Text style={styles.author}>
            By {selectedNewsItem.author?.name?.first || ""} {selectedNewsItem.author?.name?.last || ""}
          </Text>
          <Text style={styles.date}>
            {selectedNewsItem.dateCreated ? new Date(selectedNewsItem.dateCreated).toLocaleString() : ""}
          </Text>
          <Text style={styles.lead}>{selectedNewsItem.lead || "No content available."}</Text>
        </ScrollView>
        <Button title="Close" onPress={handleCloseModal} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  content: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  author: {
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  lead: {
    fontSize: 16,
  },
});

export default StoryModal;
