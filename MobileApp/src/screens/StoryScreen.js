import React, { useState, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, StatusBar, SafeAreaView, Platform, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import { Video } from "expo-av";
import pbsheader from "../components/pbsheader.png";

const StoryScreen = ({ route = {}, navigation }) => {
  // Extract params from navigation
  const { newsItem, searchQuery } = route.params || {};
  
  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  // New state for media modal
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [mediaUri, setMediaUri] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'video' or 'audio'

  if (!newsItem) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>News item not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { author, lead, tags, dateCreated, files, headline, body } = newsItem;

  // Highlight search query matches
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

  const S3_BASE_URL = "https://pbs-nims.s3.ap-southeast-1.amazonaws.com";

  const openFullImage = (uri) => {
    setSelectedImageUri(uri);
    setFullImageModalVisible(true);
  };

  const closeFullImage = () => {
    setSelectedImageUri(null);
    setFullImageModalVisible(false);
  };

  const openMediaModal = (uri, type) => {
    setMediaUri(uri);
    setMediaType(type);
    setMediaModalVisible(true);
  };

  const closeMediaModal = () => {
    setMediaUri(null);
    setMediaType(null);
    setMediaModalVisible(false);
  };

  const renderImages = () => {
    if (!files?.images || files.images.length === 0) {
      return null;
    }
    return files.images.map((imageUrl, index) => (
      <TouchableOpacity key={index} onPress={() => openFullImage(S3_BASE_URL + imageUrl)}>
        <Image
          source={{ uri: S3_BASE_URL + imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      </TouchableOpacity>
    ));
  };

  const renderVideos = () => {
    if (!files?.videos || files.videos.length === 0) {
      return null;
    }
    return files.videos.map((videoUrl, index) => (
      <TouchableOpacity key={index} onPress={() => openMediaModal(S3_BASE_URL + videoUrl, 'video')} style={styles.mediaThumbnail}>
        <View style={styles.mediaThumbnailContent}>
          <Text style={styles.mediaThumbnailText}>▶ Video</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const renderAudios = () => {
    if (!files?.audios || files.audios.length === 0) {
      return null;
    }
    return files.audios.map((audioUrl, index) => (
      <TouchableOpacity key={index} onPress={() => openMediaModal(S3_BASE_URL + audioUrl, 'audio')} style={styles.mediaThumbnail}>
        <View style={styles.mediaThumbnailContent}>
          <Text style={styles.mediaThumbnailText}>▶ Audio</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F1EFEC" />
      
      {/* Header */} 
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={pbsheader} style={styles.headerImage} resizeMode="contain" />
        </View>
      </SafeAreaView>
      
      {/* Main Content */}
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.contentWrapper}>
          <ScrollView contentContainerStyle={styles.content}>
            <TouchableOpacity 
              style={styles.backButtonContainer} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.headline, styles.headlineBackground]}>
              {highlightText(lead || headline || "No Headline")}
            </Text>
            
            <View style={styles.infoContainer}>
              <Text style={styles.author} numberOfLines={1} ellipsizeMode="tail">
                By {author?.name?.first || "N/A"} {author?.name?.middle ? author.name.middle + " " : ""}{author?.name?.last || "N/A"} - {author?.station || "N/A"}
              </Text>
              <Text style={styles.tags} numberOfLines={1} ellipsizeMode="tail">
                Tags: {tags && Array.isArray(tags) && tags.length > 0 ? tags.join(", ") : "No tags selected"}
              </Text>
              <Text style={styles.date}>{dateCreated ? moment(dateCreated).format("MMMM Do, YYYY [at] h:mm A") : "N/A"}</Text>
              
              {files?.images && files.images.length > 0 && (
                <TouchableOpacity onPress={() => openFullImage(S3_BASE_URL + files.images[0])}>
                  <Image
                    source={{ uri: S3_BASE_URL + files.images[0] }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                    accessibilityLabel="Report image thumbnail"
                  />
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.body}>
              {body || lead || "No content available."}
            </Text>
            
            {renderImages()}
            {renderVideos()}
            {renderAudios()}
          </ScrollView>
        </View>
      </View>

      {/* Full Image Modal */}
      {fullImageModalVisible && (
        <View style={styles.fullImageModalBackground}>
          <TouchableOpacity style={styles.fullImageModalCloseArea} onPress={closeFullImage} />
          <Image source={{ uri: selectedImageUri }} style={styles.fullImage} resizeMode="contain" />
          <TouchableOpacity style={styles.fullImageModalCloseButton} onPress={closeFullImage}>
            <Text style={styles.fullImageModalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Media Modal */}
      <Modal
        visible={mediaModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMediaModal}
      >
        <View style={styles.mediaModalBackground}>
          <TouchableOpacity style={styles.mediaModalCloseArea} onPress={closeMediaModal} />
          <Video
            source={{ uri: mediaUri }}
            style={styles.mediaPlayer}
            useNativeControls
            resizeMode="contain"
            isLooping={false}
            shouldPlay
            isMuted={false}
            isAudioOnly={mediaType === 'audio'}
          />
          <TouchableOpacity style={styles.mediaModalCloseButton} onPress={closeMediaModal}>
            <Text style={styles.mediaModalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFEC',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F1EFEC',
  },
  errorText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  header: {
    backgroundColor: "#F1EFEC",
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 0 : 30,
    paddingBottom: 10,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#123458',
    fontSize: 16,
    fontWeight: '600',
    
  },
  headerImage: {
    width: '100%',
    height: 60,
  },
  gradientBackground: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 10,
    
    overflow: 'hidden',
  },
  content: {
    padding: 15,
    paddingTop: 40,
  },
  headline: {
    fontSize: 24,
    fontWeight: "800",
    color: "#222",
    marginBottom: 6,
    lineHeight: 32,
    textTransform: "uppercase",
  },
  headlineBackground: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  infoContainer: {
    marginBottom: 15,
  },
  author: {
    fontSize: 16,
    color: "#444",
    marginBottom: 4,
    fontWeight: "600",
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontStyle: "italic",
  },
  tags: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 8,
  },
  highlight: {
    backgroundColor: "#fffb91",
  },
  body: {
    fontSize: 18,
    lineHeight: 28,
    color: "#333",
    marginBottom: 20,
  },
  thumbnail: {
    width: "100%",
    height: 240,
    backgroundColor: "#ddd",
  },
  image: {
    width: "100%",
    height: 220,
    marginBottom: 20,
    borderRadius: 14,
  },
  video: {
    width: "100%",
    height: 220,
    marginBottom: 20,
    borderRadius: 14,
  },
  audio: {
    width: "100%",
    height: 50,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: "#123458",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  fullImageModalBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  fullImageModalCloseArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  fullImage: {
    width: '90%',
    height: '80%',
    borderRadius: 10,
  },
  fullImageModalCloseButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#123458',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  fullImageModalCloseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  mediaContainer: {
    position: 'relative',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '40%',
    left: '45%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    padding: 10,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  mediaModalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  mediaModalCloseArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  mediaPlayer: {
    width: '90%',
    height: '60%',
    borderRadius: 10,
  },
  mediaModalCloseButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#123458',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  mediaModalCloseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  mediaThumbnail: {
    marginBottom: 15,
    backgroundColor: '#ddd',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  mediaThumbnailContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mediaThumbnailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#123458',
  },
});

export default StoryScreen;
