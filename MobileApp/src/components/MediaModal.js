import React from "react";
import { Modal, View, Text, Image, ScrollView, Button, StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const S3_BASE_URL = "https://pbs-nims.s3.ap-southeast-1.amazonaws.com";

const MediaModal = ({ show, handleClose, mediaItems, initialIndex }) => {
  if (
    !mediaItems ||
    (!mediaItems.images?.length && !mediaItems.audios?.length && !mediaItems.videos?.length)
  )
    return null;

  return (
    <Modal visible={show} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Render audio files */}
          {mediaItems.audios && mediaItems.audios.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Audio Files</Text>
              {mediaItems.audios.map((audio, index) => (
                <Text key={index} style={styles.mediaText}>
                  Audio: {S3_BASE_URL + audio}
                </Text>
              ))}
            </View>
          )}

          {/* Render image files */}
          {mediaItems.images && mediaItems.images.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mediaItems.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: S3_BASE_URL + image }}
                    style={styles.image}
                    resizeMode="contain"
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Render video files */}
          {mediaItems.videos && mediaItems.videos.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.sectionTitle}>Videos</Text>
              {mediaItems.videos.map((video, index) => (
                <Text key={index} style={styles.mediaText}>
                  Video: {S3_BASE_URL + video}
                </Text>
              ))}
            </View>
          )}
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
    padding: 10,
  },
  content: {
    alignItems: "center",
  },
  mediaSection: {
    marginBottom: 20,
    width: width * 0.9,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mediaText: {
    color: "#fff",
    marginBottom: 5,
  },
  image: {
    width: 200,
    height: 200,
    marginRight: 10,
    borderRadius: 10,
  },
});

export default MediaModal;
