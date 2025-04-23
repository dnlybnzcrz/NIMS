import React from "react";
import { Modal, View, Text, Image, ScrollView, Button, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const MediaModal = ({ show, handleClose, mediaItems, initialIndex }) => {
  if (!mediaItems || mediaItems.length === 0) return null;

  // For simplicity, show the first media item (initialIndex)
  const media = mediaItems[initialIndex];

  return (
    <Modal visible={show} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} horizontal pagingEnabled>
          {mediaItems.map((item, index) => (
            <View key={index} style={styles.mediaWrapper}>
              {/* Assuming media is image URL; for audio/video, additional handling needed */}
              <Image source={{ uri: item }} style={styles.media} resizeMode="contain" />
            </View>
          ))}
        </ScrollView>
        <Button title="Close" onPress={handleClose} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  mediaWrapper: {
    width: width,
    height: height * 0.75,
    justifyContent: "center",
    alignItems: "center",
  },
  media: {
    width: "100%",
    height: "100%",
  },
});

export default MediaModal;
