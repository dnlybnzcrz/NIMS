import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
} from "react-native";
import { Video, Audio } from "expo-av"; // Reverted to expo-av to fix undefined Video component error
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenWrapper from "../components/ScreenWrapper";


// AudioPlayer component for audio files
const AudioPlayer = ({ file, onRemove }) => {
  const [sound, setSound] = React.useState(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const playPauseAudio = async () => {
    if (sound === null) {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: file.uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isPlaying) {
          setIsPlaying(false);
        }
      });
    } else {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  React.useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const fileName = file.name || (file.uri ? file.uri.split("/").pop() : "Unknown");

  return (
    <View key={file.uri || fileName} style={styles.mediaFileContainer}>
      <Text style={styles.mediaFileName} numberOfLines={1}>
        {fileName}
      </Text>
      <TouchableOpacity
        style={styles.removeButtonAudio}
        onPress={() => onRemove(file, "audio")}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={playPauseAudio}
        style={{ marginTop: 8, padding: 10, backgroundColor: '#2563eb', borderRadius: 8 }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isPlaying ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// 1. Split Component Into Smaller Parts - MediaPreview Component
const MediaPreview = ({ media, onRemove, onPlayVideo }) => {
  console.log("MediaPreview media prop:", media);
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.mediaPreviewContainer}
      keyboardDismissMode="on-drag"
      nestedScrollEnabled={true}
      directionalLockEnabled={true}
      scrollEnabled={true}
      contentInsetAdjustmentBehavior="automatic"
      alwaysBounceHorizontal={true}
    >
      {media.map((file, index) => {
        if (file.uri && file.mimeType?.startsWith("image/")) {
          return (
            <View key={file.uri + index} style={[styles.imageWrapper]} pointerEvents="box-none">
              <Image
                source={{ uri: file.uri }}
                style={styles.mediaThumbnail}
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(file, "image")}
                pointerEvents="auto"
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          );
        } else if (file.uri && file.mimeType?.startsWith("video/")) {
          return (
            <View key={file.uri + index} style={[styles.imageWrapper]} pointerEvents="box-none">
              <Video
                source={{ uri: file.uri }}
                style={styles.videoThumbnail}
                resizeMode="cover"
                useNativeControls={false}
                isLooping={false}
                isMuted={true}
                shouldPlay={false}
              />
              <TouchableOpacity
                style={styles.playButton}
                onPress={() => onPlayVideo(file.uri)}
                pointerEvents="auto"
              >
                <Ionicons name="play-circle" size={40} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemove(file, "video")}
                pointerEvents="auto"
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          );
        } else {
          // Audio or other files
          return <AudioPlayer key={file.uri || index} file={file} onRemove={onRemove} />;
        }
      })}
    </ScrollView>
  );
};

// 1. Split Component Into Smaller Parts - TagSelector Component

const TagSelector = ({ tags, selectedTags, onChange, visible, toggleVisibility }) => {
  const [searchText, setSearchText] = React.useState("");

  // Filter tags based on search text
  const filteredTags = searchText.trim() === ""
    ? tags
    : tags.filter(tag =>
        tag.name.toLowerCase().includes(searchText.toLowerCase())
      );

  // Remove tag handler
  const removeTag = (tagName) => {
    onChange(selectedTags.filter(t => t !== tagName));
  };

  return (
    <>
      <TouchableOpacity
        onPress={toggleVisibility}
        style={styles.dropdown}
      >
        {selectedTags.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center" }}
            style={{ maxHeight: 50 }}
          >
            {selectedTags.map((tagName) => (
              <View key={tagName} style={styles.selectedTag}>
                <Text style={styles.selectedTagText}>{tagName}</Text>
                <TouchableOpacity
                  onPress={() => {
                    onChange(selectedTags.filter(t => t !== tagName));
                  }}
                  style={styles.removeTagButton}
                >
                  <Text style={styles.removeTagButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.dropdownText}>Select tags (optional)</Text>
        )}
      </TouchableOpacity>

      {visible && (
        <View style={styles.dropdownList}>
          {/* Search input with close button */}
          <View style={styles.searchInputContainer}>
            <TextInput
              style={styles.searchInputWithClose}
              placeholder="Search tags..."
              placeholderTextColor="#6b7280"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity
              onPress={() => {
                setSearchText("");
                toggleVisibility(false);
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {filteredTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              return (
                <TouchableOpacity
                  key={tag.name}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onChange(
                      isSelected
                        ? selectedTags.filter((t) => t !== tag.name)
                        : [...selectedTags, tag.name]
                    );
                  }}
                >
                  <Text style={[styles.tagText, isSelected && styles.tagSelected]}>
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </>
  );
};

// 1. Split Component Into Smaller Parts - DateSelector Component
const DateSelector = ({ date }) => {
  // Defensive: ensure date is a valid Date object
  const safeDate = date instanceof Date ? date : new Date();

  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <View style={[styles.dateInput, { flex: 2, marginRight: 5, justifyContent: "center", alignItems: "flex-start" }]}>
          <Text style={styles.dateText}>{safeDate.toDateString()}</Text>
        </View>
        <View style={[styles.dateInput, { flex: 1, marginLeft: 5, justifyContent: "center", alignItems: "center" }]}>
          <Text style={styles.dateText}>{safeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
    </>
  );
};

// Main Component
const AddReport = (props) => {
  // 1. Optimize State Management - Combine related state into a form object
  const [formData, setFormData] = useState({
    title: "",
    lead: "",
    body: "",
    remarks: "",
    airDate: new Date(),
    selectedTag: [],
  });
  
  const [media, setMedia] = useState({
    audio: [],
    images: [],
    videos: []
  });
  
  // UI state
  const [uiState, setUiState] = useState({
    showTagDropdown: false,
    showDatePicker: false,
    uploadProgress: 0,
    uploadSuccess: false,
    showVideoModal: false,
    videoUri: null,
  });
  
  // 3. Add Loading States
  const [isLoading, setIsLoading] = useState({
    tags: false,
    upload: false,
    mediaSelection: false
  });

  const [tags, setTags] = useState([]);
  const titleRef = useRef(null);

  // Handler to update form fields
  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  }, []);
  
  // Toggle UI states
  const toggleUiState = useCallback((field, value) => {
    setUiState(prev => ({...prev, [field]: value !== undefined ? value : !prev[field]}));
  }, []);

  // Play video handler
  const playVideo = useCallback((uri) => {
    setUiState(prev => ({...prev, videoUri: uri, showVideoModal: true}));
  }, []);

  // Close video modal handler
  const closeVideoModal = useCallback(() => {
    setUiState(prev => ({...prev, showVideoModal: false, videoUri: null}));
  }, []);

  // 2. Memoize Expensive Calculations - Combine all media for display
  const allMedia = useMemo(() => {
    return [...media.images, ...media.videos, ...media.audio];
  }, [media]);

  // Handle media removal
  const handleMediaRemove = useCallback((file, type) => {
    setMedia(prev => ({
      ...prev,
      [type === "image" ? "images" : type === "video" ? "videos" : "audio"]: 
        prev[type === "image" ? "images" : type === "video" ? "videos" : "audio"].filter(
          item => item.uri !== file.uri
        )
    }));
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      // 3. Add Loading States
      setIsLoading(prev => ({...prev, tags: true}));
      
      try {
        const user = JSON.parse(await AsyncStorage.getItem("user"));
        if (!user || !user.token) {
          Alert.alert("Authentication Error", "Please log in again.");
          // Redirect to login
          return;
        }
        
        const config = {
          headers: { Authorization: "Bearer " + user.token },
        };
        const response = await axios.get(
          "https://api.radiopilipinas.online/nims/tags/view",
          config
        );
        setTags(response.data.tagsList || []);
      } catch (error) {
        // 1. Improve Error Handling
        if (error.response && error.response.status === 401) {
          Alert.alert("Session Expired", "Please log in again to continue.");
          AsyncStorage.removeItem("user");
          // Redirect to login
        } else {
          Alert.alert(
            "Error Loading Tags", 
            "Unable to load tags. Please check your connection and try again."
          );
        }
        console.error("Error fetching tags:", error);
      } finally {
        setIsLoading(prev => ({...prev, tags: false}));
      }
    };
    
    fetchTags();
    
    // 3. Form Saving - Load draft on component mount
    loadDraft();
  }, []);
  
  // 3. Form Saving - Load draft implementation
  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem('draft-report');
      if (draft) {
        const parsedDraft = JSON.parse(draft);

        // Normalize media URIs and ensure name and mimeType for upload after restoring draft
        if (parsedDraft.media) {
          const normalizedMedia = { audio: [], images: [], videos: [] };
          const prefix = Platform.OS !== "web" ? "file://" : "";
          ["audio", "images", "videos"].forEach((type) => {
            if (Array.isArray(parsedDraft.media[type])) {
              normalizedMedia[type] = parsedDraft.media[type].map((file) => {
                let newFile = { ...file };
                if (newFile.uri && !newFile.uri.startsWith("file://") && prefix) {
                  newFile.uri = prefix + newFile.uri;
                }
                // Ensure name property
                if (!newFile.name && newFile.uri) {
                  const uriParts = newFile.uri.split("/");
                  newFile.name = uriParts[uriParts.length - 1] || `file_${type}`;
                }
                // Ensure mimeType property
                if (!newFile.mimeType && newFile.uri) {
                  const lowerUri = newFile.uri.toLowerCase();
                  if (lowerUri.match(/\.(jpg|jpeg|png|gif|webp|heic)$/)) {
                    newFile.mimeType = "image/jpeg";
                  } else if (lowerUri.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/)) {
                    newFile.mimeType = lowerUri.endsWith(".mov") ? "video/quicktime" : "video/mp4";
                  } else if (lowerUri.match(/\.(mp3|wav|ogg|m4a|aac)$/)) {
                    newFile.mimeType = "audio/mpeg";
                  } else {
                    newFile.mimeType = "*/*";
                  }
                }
                return newFile;
              });
            }
          });
          parsedDraft.media = normalizedMedia;
        }

        Alert.alert(
          "Restore Draft",
          "Would you like to restore your previous draft?",
          [
            { text: "No", style: "cancel", onPress: () => AsyncStorage.removeItem('draft-report') },
            { text: "Yes", onPress: () => {
              setFormData(parsedDraft.formData || formData);
              setMedia(parsedDraft.media || media);
            }}
          ]
        );
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  };
  
  // 3. Form Saving - Save draft periodically
  useEffect(() => {
    // Only save if there's actual content
    if (formData.title || formData.lead || formData.body || allMedia.length > 0) {
      const saveData = async () => {
        try {
          await AsyncStorage.setItem('draft-report', JSON.stringify({
            formData,
            media
          }));
        } catch (error) {
          console.error("Error saving draft:", error);
        }
      };
      saveData();
    }
    
    // Set up auto-save interval
    const autoSaveInterval = setInterval(() => {
      if (formData.title || formData.lead || formData.body || allMedia.length > 0) {
        AsyncStorage.setItem('draft-report', JSON.stringify({
          formData,
          media
        }));
      }
    }, 60000); // Save every minute
    
    return () => clearInterval(autoSaveInterval);
  }, [formData, media, allMedia]);

  const differenceInHours = (date1, date2) =>
    (date1.getTime() - date2.getTime()) / (1000 * 60 * 60);

  const fileSelectedHandler = async () => {
    try {
      setIsLoading(prev => ({...prev, mediaSelection: true}));
      
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Permission to access media library is required!");
        return;
      }

      // Launch image library to pick media
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // FIXED: Use enum instead of string array
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled) {
        setIsLoading(prev => ({...prev, mediaSelection: false}));
        return;
      }

      const selectedFiles = result.assets || [];
      // Prepare new media arrays
      let newAudio = [];
      let newImages = [];
      let newVideos = [];

      const isDuplicate = (list, uri) => list.some((f) => f.uri === uri);

      // Process selected files by type
      selectedFiles.forEach((file) => {
        // Determine file type from mime type or uri extension
        let fileType = "audio"; // Default
        
        if (file.type) {
          // If file.type is already set, use it
          fileType = file.type;
        } else {
          // Determine type from uri or mime type
          const uri = file.uri.toLowerCase();
          const mimeType = file.mimeType?.toLowerCase() || "";
          
          if (mimeType.startsWith("image/") || uri.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)) {
            fileType = "image";
          } else if (mimeType.startsWith("video/") || uri.match(/\.(mp4|mov|avi|wmv|flv|mkv)$/i)) {
            fileType = "video";
          } else if (mimeType.startsWith("audio/") || uri.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
            fileType = "audio";
          }
        }
        
        // Set mime type if it's not already set
        if (!file.mimeType) {
          if (fileType === "video") {
            file.mimeType = file.uri.toLowerCase().endsWith("mov") ? "video/quicktime" : "video/mp4";
          } else if (fileType === "image") {
            file.mimeType = "image/jpeg"; // Default image type
          } else {
            file.mimeType = "audio/mpeg"; // Default audio type
          }
        }
        
        if (fileType === "audio" && !isDuplicate(media.audio, file.uri)) {
          newAudio.push(file);
        } else if (fileType === "image" && !isDuplicate(media.images, file.uri)) {
          newImages.push(file);
        } else if (fileType === "video" && !isDuplicate(media.videos, file.uri)) {
          newVideos.push(file);
        }
      });

      // Batch update media state
      setMedia(prev => ({
        audio: [...prev.audio, ...newAudio],
        images: [...prev.images, ...newImages],
        videos: [...prev.videos, ...newVideos],
      }));

      console.log("Selected media:", {
        audio: [...media.audio, ...newAudio],
        images: [...media.images, ...newImages],
        videos: [...media.videos, ...newVideos],
      });
    } catch (err) {
      // 1. Improve Error Handling
      Alert.alert(
        "Media Selection Failed", 
        "There was a problem selecting media files. Please try again."
      );
      console.error("File selection error:", err);
    } finally {
      setIsLoading(prev => ({...prev, mediaSelection: false}));
    }
  };

  const audioFileSelectedHandler = async () => {
    try {
      setIsLoading(prev => ({...prev, mediaSelection: true}));

      // Use DocumentPicker to open file system picker for audio files
      // Updated to explicitly allow .m4a files on iOS by specifying mime types
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === "ios" ? ["audio/m4a", "audio/mp4", "audio/x-m4a", "audio/*"] : "audio/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      console.log("DocumentPicker result:", result);

      if (result.type === "cancel") {
        setIsLoading(prev => ({...prev, mediaSelection: false}));
        return;
      }

      // Handle result.assets array if present (like ImagePicker)
      const selectedFiles = result.assets ? result.assets : [result];
      let newAudio = [];

      const isDuplicate = (list, uri) => list.some((f) => f.uri === uri);

      selectedFiles.forEach((file) => {
        // Defensive: ensure file.uri and file.name exist
        if (!file.uri) return;
        // Copy file object as is, similar to website approach
        if (!isDuplicate(media.audio, file.uri)) {
          newAudio.push(file);
        }
      });

      setMedia(prev => ({
        ...prev,
        audio: [...prev.audio, ...newAudio],
      }));

      console.log("Selected audio files:", [...media.audio, ...newAudio]);
    } catch (err) {
      Alert.alert(
        "Audio Selection Failed",
        "There was a problem selecting audio files. Please try again."
      );
      console.error("Audio file selection error:", err);
    } finally {
      setIsLoading(prev => ({...prev, mediaSelection: false}));
    }
  };

  const validateForm = () => {
    const { title, lead, body, airDate } = formData;
    const errors = {};
    
    if (!title.trim()) errors.title = "Headline is required";
    if (!lead.trim()) errors.lead = "Lead is required";
    if (!body.trim()) errors.body = "Story is required";
    
    // Date validation
    const now = new Date();
    const isSameDay =
      airDate.getFullYear() === now.getFullYear() &&
      airDate.getMonth() === now.getMonth() &&
      airDate.getDate() === now.getDate();
    
    if (!isSameDay && differenceInHours(airDate, now) < 0) {
      errors.date = "Air date must be today or in the future";
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const fileUploadHandler = async () => {
    // Validate form
    const { isValid, errors } = validateForm();
    if (!isValid) {
      const errorMessages = Object.values(errors).join('\n');
      Alert.alert("Form Validation Failed", errorMessages);
      return;
    }

    // Start upload process
    try {
      setIsLoading(prev => ({...prev, upload: true}));
      toggleUiState("uploadProgress", 0);
      
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      if (!user || !user.token) {
        Alert.alert("Authentication Error", "Please log in again.");
        // Redirect to login
        return;
      }
      
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + user.token,
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          toggleUiState("uploadProgress", progress);
        },
      };

      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("tags", formData.selectedTag.join(", "));
      fd.append("lead", formData.lead.trim());
      fd.append("body", formData.body.trim());
      fd.append("userId", user.id);
      fd.append("forDate", formData.airDate.toISOString());
      fd.append("remarks", formData.remarks.trim());

      // Add all media files
      allMedia.forEach((file, index) => {
        // Append file object directly if it has name and uri, similar to website
        if (file.name && file.uri) {
          // Ensure uri has file:// prefix for local files (especially audio)
          let fileUri = file.uri;
          if (Platform.OS !== "web" && !fileUri.startsWith("file://")) {
            fileUri = "file://" + fileUri;
          }
          // Fix mime type for .m4a files on iOS
          let mimeType = file.mimeType || "application/octet-stream";
          if (fileUri.toLowerCase().endsWith(".m4a")) {
            mimeType = "audio/mp4"; // or "audio/x-m4a"
          }
          fd.append("media", {
            uri: fileUri,
            type: mimeType,
            name: file.name,
          });
        } else {
          // Fallback to previous logic
          let mimeType = file.mimeType;
          let fileName = file.name;
          if (!mimeType) {
            if (file.uri.endsWith(".mp4")) mimeType = "video/mp4";
            else if (file.uri.endsWith(".mov")) mimeType = "video/quicktime";
            else if (file.uri.endsWith(".mp3") || file.uri.endsWith(".wav") || file.uri.endsWith(".ogg") || file.uri.endsWith(".m4a") || file.uri.endsWith(".aac")) mimeType = "audio/mpeg";
            else mimeType = "*/*";
          }
          if (!fileName) {
            const uriParts = file.uri.split("/");
            fileName = uriParts[uriParts.length - 1] || `file${index}`;
          }
          // Ensure uri has file:// prefix for local files (especially videos and audio)
          let fileUri = file.uri;
          if (Platform.OS !== "web" && !fileUri.startsWith("file://")) {
            fileUri = "file://" + fileUri;
          }
          fd.append("media", {
            uri: fileUri,
            type: mimeType,
            name: fileName,
          });
        }
      });

      const res = await axios.post(
        "https://api.radiopilipinas.online/nims/add",
        fd,
        config
      );
      
      toggleUiState("uploadProgress", 100);
      // Wait a short time to show 100% progress before success modal
      setTimeout(() => {
        toggleUiState("uploadSuccess", true);
        toggleUiState("uploadProgress", 0);
      }, 500);
      props.updateReports?.(res.data);
      
      // Clear draft after successful upload
      AsyncStorage.removeItem('draft-report');
    } catch (err) {
      // 1. Improve Error Handling
      if (err.response) {
        // Server responded with an error status code
        const errorMessage = err.response.data?.message || "Server returned an error.";
        Alert.alert("Upload Failed", `Error: ${errorMessage}`);
        
        // Handle token expiration
        if (err.response.status === 401) {
          Alert.alert("Session Expired", "Please log in again.");
          AsyncStorage.removeItem("user");
          // Redirect to login
        }
      } else if (err.request) {
        // Request was made but no response received
        Alert.alert("Network Error", "Cannot connect to server. Check your internet connection.");
      } else {
        // Error in request setup
        Alert.alert("Upload Failed", "An unexpected error occurred.");
      }
      console.error("Upload error:", err);
    } finally {
      setIsLoading(prev => ({...prev, upload: false}));
    }
  };

  useEffect(() => {
    if (uiState.uploadSuccess) {
      // Reset form after successful upload
      setFormData({
        title: "",
        lead: "",
        body: "",
        remarks: "",
        airDate: new Date(),
        selectedTag: [],
      });
      setMedia({
        audio: [],
        images: [],
        videos: []
      });
    }
  }, [uiState.uploadSuccess]);

  // ADDED: Video Modal component
  const VideoPlayerModal = useCallback(() => {
    if (!uiState.videoUri) return null;
    
    return (
      <Modal
        transparent
        visible={uiState.showVideoModal}
        animationType="fade"
        onRequestClose={closeVideoModal}
      >
        <View style={styles.videoModalOverlay}>
          <View style={styles.videoModalContent}>
              <Video
                source={{ uri: uiState.videoUri }}
                style={styles.videoPlayer}
                resizeMode="contain"
                useNativeControls={true}
                isLooping={false}
                shouldPlay={true}
              />
            <TouchableOpacity 
              style={styles.closeVideoButton}
              onPress={closeVideoModal}
            >
              <Text style={styles.closeVideoButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }, [uiState.videoUri, uiState.showVideoModal, closeVideoModal]);

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView style={styles.fullScreenContainer} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <View style={styles.headerContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                  if (props.navigation?.isFocused && props.navigation.isFocused()) {
                    props.navigation.navigate("Homepage", { animation: 'slide_to_right' });
                  } else {
                    props.navigation?.navigate("Homepage", { animation: 'slide_to_right' });
                  }
                }}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.heading}>NEW REPORT</Text>
            </View>
            <TextInput
              ref={titleRef}
              placeholder="Headline"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => updateFormField("title", text)}
              multiline={true}
            />
            {/* 1. Split Component Into Smaller Parts - Using TagSelector */}
            <TagSelector 
              tags={tags}
              selectedTags={formData.selectedTag}
              onChange={(newTags) => updateFormField("selectedTag", newTags)}
              visible={uiState.showTagDropdown}
              toggleVisibility={() => toggleUiState("showTagDropdown")}
            />
            {/* 1. Split Component Into Smaller Parts - Using DateSelector */}
            <DateSelector 
              date={formData.airDate}
              onChange={(newDate) => updateFormField("airDate", newDate)}
              visible={uiState.showDatePicker}
              toggleVisibility={(value) => toggleUiState("showDatePicker", value)}
            />
            <TextInput
              placeholder="Lead"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={formData.lead}
              onChangeText={(text) => updateFormField("lead", text)}
              multiline
            />
            <TextInput
              placeholder="Story"
              placeholderTextColor="#6b7280"
              style={[styles.input, { height: 150 }]}
              value={formData.body}
              onChangeText={(text) => updateFormField("body", text)}
              multiline
            />
            <TextInput
              placeholder="Remarks (optional)"
              placeholderTextColor="#6b7280"
              style={styles.input}
              value={formData.remarks}
              onChangeText={(text) => updateFormField("remarks", text)}
            />
            {/* 1. Split Component Into Smaller Parts - Using MediaPreview */}
            <MediaPreview 
              media={allMedia} 
              onRemove={handleMediaRemove} 
              onPlayVideo={playVideo} // FIXED: Added missing playVideo prop
            />
            <TouchableOpacity 
              style={styles.button} 
              onPress={fileSelectedHandler}
              disabled={isLoading.mediaSelection}
            >
              <Text style={styles.buttonText}>
                {isLoading.mediaSelection ? "Uploading..." : "Choose Media Files"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonClose]} 
              onPress={audioFileSelectedHandler}
              disabled={isLoading.mediaSelection}
            >
              <Text style={styles.buttonText}>
                {isLoading.mediaSelection ? "Uploading..." : "Choose Audio Files"}
              </Text>
            </TouchableOpacity>
            {/* Removed uploading progress text to show only modal */}
            <Modal
              transparent
              visible={uiState.uploadProgress > 0 && uiState.uploadProgress < 100}
              animationType="fade"
              onRequestClose={() => {}}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <ActivityIndicator size="large" color="#2563eb" style={{ marginBottom: 20 }} />
                  <Text style={styles.modalText}>Uploading media... {uiState.uploadProgress}%</Text>
                </View>
              </View>
            </Modal>
            <TouchableOpacity 
              style={[
                styles.button, 
                isLoading.upload && styles.buttonDisabled
              ]} 
              onPress={fileUploadHandler}
              disabled={isLoading.upload}
            >
              <Text style={styles.buttonText}>
                {isLoading.upload ? "Uploading..." : "Upload Report"}
              </Text>
            </TouchableOpacity>
            {/* Draft saved indicator */}
            {(formData.title || formData.lead || formData.body) && (
              <Text style={styles.draftSavedText}>Draft saved automatically</Text>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        transparent
        visible={uiState.uploadSuccess}
        animationType="fade"
        onRequestClose={() => toggleUiState("uploadSuccess", false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              News uploaded successfully. Waiting for approval.
            </Text>
            <Button title="Close" onPress={() => toggleUiState("uploadSuccess", false)} />
          </View>
        </View>
      </Modal>

      {/* ADDED: Video Player Modal */}
      <VideoPlayerModal />
    </ScreenWrapper>
  );
};


const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 140,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    marginBottom: 20,
    letterSpacing: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
    position: "relative",
  },
  input: {
    backgroundColor: "#f3f4f6",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    marginBottom: 18,
    color: "#1e293b",
    fontWeight: "500",
  },
  dateInput: {
    backgroundColor: "#f3f4f6",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  dateText: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  dropdown: {
    backgroundColor: "#f3f4f6",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 18,
  },
  dropdownText: {
    fontSize: 16,
    color: "#475569",
  },
  dropdownList: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderColor: "#cbd5e1",
    borderWidth: 1,
    maxHeight: 300,
    marginBottom: 18,
    paddingVertical: 6,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  tagText: {
    fontSize: 16,
    color: "#334155",
  },
  tagSelected: {
    fontWeight: "700",
    color: "#2563eb",
  },
  selectedTagsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  selectedTag: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    alignItems: "center",
  },
  selectedTagText: {
    color: "white",
    fontWeight: "600",
    marginRight: 6,
  },
  removeTagButton: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeTagButtonText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#f3f4f6",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 8,
    color: "#1e293b",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderColor: "#cbd5e1",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchInputWithClose: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  closeButton: {
    marginLeft: 8,
    backgroundColor: "#ef4444",
    borderRadius: 12,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "bold",
  },
  mediaPreviewContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  mediaThumbnail: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginRight: 12,
  },
  mediaFileContainer: {
    width: 140,
    height: 140,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    paddingHorizontal: 8,
    position: "relative",
  },
  mediaFileName: {
    fontSize: 14,
    color: "#475569",
    maxWidth: "80%",
    textAlign: "center",
  },
  imageWrapper: {
    position: "relative",
    marginRight: 12,
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ef4444",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  removeButtonAudio: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ef4444",
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "bold",
  },
  videoThumbnail: {
    width: 140,
    height: 140,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#000",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 5,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 16,
    marginTop: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonClose: {
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  progressText: {
    textAlign: "center",
    marginTop: 10,
    color: "#64748b",
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 28,
    borderRadius: 16,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  modalText: {
    fontSize: 18,
    color: "#334155",
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  draftSavedText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 16,
    fontStyle: "italic",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    position: "absolute",
    left: 0,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
});

export default AddReport;
