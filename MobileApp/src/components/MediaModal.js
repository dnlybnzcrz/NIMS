import React, { useState, useRef, useEffect } from "react";
import { Modal, View, Text, Image, Button, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { Audio, Video } from "expo-av";

const { width, height } = Dimensions.get("window");

const S3_BASE_URL = "https://pbs-nims.s3.ap-southeast-1.amazonaws.com";

const MediaModal = ({ show, handleClose, mediaItems, initialIndex = 0 }) => {
  if (
    !mediaItems ||
    (!mediaItems.images?.length && !mediaItems.audios?.length && !mediaItems.videos?.length)
  )
    return null;

  // Combine all media into a single array with type info
  const combinedMedia = [];

  if (mediaItems.images?.length) {
    mediaItems.images.forEach((img) => combinedMedia.push({ type: "image", uri: S3_BASE_URL + img }));
  }
  if (mediaItems.audios?.length) {
    mediaItems.audios.forEach((audio) => combinedMedia.push({ type: "audio", uri: S3_BASE_URL + audio }));
  }
  if (mediaItems.videos?.length) {
    mediaItems.videos.forEach((video) => combinedMedia.push({ type: "video", uri: S3_BASE_URL + video }));
  }

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const playbackInstance = useRef(null);
  const videoRef = useRef(null);
  const currentAudioUri = useRef(null);

  const currentMedia = combinedMedia[currentIndex];

  useEffect(() => {
    async function managePlayback() {
      if (currentMedia.type === "audio") {
        if (videoRef.current) {
          await videoRef.current.pauseAsync?.();
        }

        if (playbackInstance.current) {
          if (currentAudioUri.current !== currentMedia.uri) {
            await playbackInstance.current.unloadAsync();
            playbackInstance.current = null;
            currentAudioUri.current = null;
            setIsPlaying(false);
          } else {
            return; // same audio, do not reload
          }
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: currentMedia.uri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        playbackInstance.current = sound;
        currentAudioUri.current = currentMedia.uri;
        setIsPlaying(true);
      } else {
        if (playbackInstance.current) {
          await playbackInstance.current.unloadAsync();
          playbackInstance.current = null;
          currentAudioUri.current = null;
          setIsPlaying(false);
        }

        if (videoRef.current && currentMedia.type !== "video") {
          await videoRef.current.pauseAsync?.();
        }
      }
    }

    if (show) {
      managePlayback();
    }

    return () => {
      if (playbackInstance.current) {
        playbackInstance.current.unloadAsync();
        playbackInstance.current = null;
        currentAudioUri.current = null;
        setIsPlaying(false);
      }

      if (videoRef.current) {
        videoRef.current.stopAsync?.();
      }
    };
  }, [currentIndex, show]);

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) {
      setIsPlaying(false);
    } else {
      setIsPlaying(status.isPlaying);
    }
  };

  const handlePlayPause = async () => {
    if (playbackInstance.current) {
      if (isPlaying) {
        await playbackInstance.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await playbackInstance.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % combinedMedia.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + combinedMedia.length) % combinedMedia.length);
  };

  return (
    <Modal visible={show} animationType="fade" onRequestClose={handleClose} transparent={false} key={show ? "modal-visible" : "modal-hidden"}>
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>
          {currentMedia.type.charAt(0).toUpperCase() + currentMedia.type.slice(1)} {currentIndex + 1} / {combinedMedia.length}
        </Text>
        <View style={styles.mediaContainer}>
          {loading && (
            <ActivityIndicator size="large" color="#ffffff" style={styles.loadingIndicator} />
          )}
          {currentMedia.type === "image" && (
            <Image
              source={{ uri: currentMedia.uri }}
              style={styles.image}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          )}
          {currentMedia.type === "audio" && (
            <View style={styles.audioContainer}>
              <TouchableOpacity onPress={handlePlayPause} style={styles.audioButton}>
                <Text style={styles.audioButtonText}>{isPlaying ? "Pause" : "Play"}</Text>
              </TouchableOpacity>
              <Text style={styles.audioText}>{currentMedia.uri.split('/').pop()}</Text>
            </View>
          )}
          {currentMedia.type === "video" && (
            <Video
              ref={videoRef}
              source={{ uri: currentMedia.uri }}
              useNativeControls
              resizeMode="contain"
              style={styles.mediaPlayer}
              shouldPlay={true}
              isLooping={false}
              onLoadStart={() => setLoading(true)}
              onLoad={() => setLoading(false)}
            />
          )}
        </View>
        {combinedMedia.length > 1 && (
          <View style={styles.navigation}>
            <TouchableOpacity onPress={goPrev} style={styles.navButton}>
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goNext} style={styles.navButton}>
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  mediaContainer: {
    width: width * 0.9,
    height: height * 0.6,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingIndicator: {
    position: "absolute",
    zIndex: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  mediaPlayer: {
    width: "100%",
    height: "100%",
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.6,
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: "#0056b3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  navButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  audioContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  audioButton: {
    backgroundColor: "#0056b3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  audioButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  audioText: {
    color: "#fff",
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    marginBottom: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    textAlign: "center",
  },
});

export default MediaModal;
