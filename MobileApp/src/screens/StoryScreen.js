import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, StatusBar, SafeAreaView, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import pbsheader from "../components/pbsheader.png";

const StoryScreen = ({ route = {}, navigation }) => {
  // Extract params from navigation
  const { newsItem, searchQuery } = route.params || {};
  
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

  const [fullImageModalVisible, setFullImageModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);

  const openFullImage = (uri) => {
    setSelectedImageUri(uri);
    setFullImageModalVisible(true);
  };

  const closeFullImage = () => {
    setSelectedImageUri(null);
    setFullImageModalVisible(false);
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
      <LinearGradient
        colors={['#123458', '#D4C9BE', '#123458', '#030303']}
        locations={[0, 0.33, 0.66, 1]}
        style={styles.gradientBackground}
      >
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
          </ScrollView>
        </View>
      </LinearGradient>

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
    shadowColor: "#000",
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
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 10,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 20,
    padding: 20,
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
    backgroundColor: "#fefefe",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
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
    marginBottom: 12,
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
    marginVertical: 16,
    borderRadius: 8,
  },
  image: {
    width: "100%",
    height: 220,
    marginBottom: 20,
    borderRadius: 14,
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
});

export default StoryScreen;
