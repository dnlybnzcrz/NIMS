import React, { useState, useEffect, useRef } from "react";
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
} from "react-native";
import { Video } from "expo-av";
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenWrapper from "../components/ScreenWrapper";

const AddReport = (props) => {
  const [selectedAudios, setSelectedAudios] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [airDate, setAirDate] = useState(new Date());
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [title, setTitle] = useState("");
  const [lead, setLead] = useState("");
  const [body, setBody] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const titleRef = useRef(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = JSON.parse(await AsyncStorage.getItem("user")).token;
        const config = {
          headers: { Authorization: "Bearer " + token },
        };
        const response = await axios.get(
          "https://api.radiopilipinas.online/nims/tags/view",
          config
        );
        setTags(response.data.tagsList || []);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };
    fetchTags();
  }, []);

  const differenceInHours = (date1, date2) =>
    (date1.getTime() - date2.getTime()) / (1000 * 60 * 60);

  const fileSelectedHandler = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Permission to access media library is required!");
        return;
      }

      // Launch image library to pick media
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (result.canceled) return;

      const selectedFiles = result.assets || [];

      const isDuplicate = (list, uri) => list.some((f) => f.uri === uri);

      selectedFiles.forEach((file) => {
        if (file.type === "audio" && !isDuplicate(selectedAudios, file.uri)) {
          setSelectedAudios((prev) => [...prev, file]);
        } else if (file.type === "image" && !isDuplicate(selectedImages, file.uri)) {
          setSelectedImages((prev) => [...prev, file]);
        } else if (file.type === "video" && !isDuplicate(selectedVideos, file.uri)) {
          setSelectedVideos((prev) => [...prev, file]);
        }
      });
    } catch (err) {
      console.error("File selection error:", err);
    }
  };

const fileUploadHandler = async () => {
    if (!title.trim() || !lead.trim() || !body.trim()) {
      Alert.alert("Missing Fields", "Please fill in Headline, Lead, and Story before uploading.");
      return;
    }

    const now = new Date();
    const isSameDay =
      airDate.getFullYear() === now.getFullYear() &&
      airDate.getMonth() === now.getMonth() &&
      airDate.getDate() === now.getDate();

    if (!isSameDay && differenceInHours(airDate, now) < 0) {
      Alert.alert("Invalid Date", "Air date must be today or in the future.");
      return;
    }

    try {
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + user.token,
        },
        onUploadProgress: (progressEvent) =>
          setUploadProgress(
            Math.round((progressEvent.loaded / progressEvent.total) * 100)
          ),
      };

      const fd = new FormData();
      fd.append("title", title);
      fd.append("tags", selectedTag.join(", "));
      fd.append("lead", lead);
      fd.append("body", body);
      fd.append("userId", user.id);
      fd.append("forDate", airDate.toISOString().split("T")[0]);
      fd.append("remarks", remarks);

      [...selectedAudios, ...selectedImages, ...selectedVideos].forEach(
        (file, index) => {
          let mimeType = file.mimeType;
          let fileName = file.name;
          if (!mimeType) {
            if (file.uri.endsWith(".mp4")) mimeType = "video/mp4";
            else if (file.uri.endsWith(".mov")) mimeType = "video/quicktime";
            else mimeType = "*/*";
          }
          if (!fileName) {
            const uriParts = file.uri.split("/");
            fileName = uriParts[uriParts.length - 1] || `file${index}`;
          }
          fd.append("media", {
            uri: file.uri,
            type: mimeType,
            name: fileName,
          });
        }
      );

      const res = await axios.post(
        "https://api.radiopilipinas.online/nims/add",
        fd,
        config
      );
      setUploadSuccess(true);
      props.updateReports?.(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Upload Failed", "Error uploading the report.");
    }
  };

  useEffect(() => {
    if (uploadSuccess) {
      setTitle("");
      setSelectedTag([]);
      setLead("");
      setBody("");
      setRemarks("");
      setSelectedAudios([]);
      setSelectedImages([]);
      setSelectedVideos([]);
      setAirDate(new Date());
    }
  }, [uploadSuccess]);

  const onChangeDate = (_, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setAirDate(selectedDate);
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backgroundContainer}>
<ScrollView contentContainerStyle={[styles.container, { paddingBottom: 10 }]} style={{ flexGrow: 1 }} keyboardDismissMode="on-drag">
              <Text style={styles.heading}>NEW REPORT</Text>

              <TextInput
                ref={titleRef}
                placeholder="Headline"
                placeholderTextColor="#475569"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                multiline={true}
              />

              <TouchableOpacity
                onPress={() => setShowTagDropdown(!showTagDropdown)}
                style={styles.dropdown}
              >
                <Text style={styles.dropdownText}>
                  {selectedTag.length > 0
                    ? selectedTag.join(", ")
                    : "Select tags (optional)"}
                </Text>
              </TouchableOpacity>

              {showTagDropdown && (
                <View style={styles.dropdownList}>
                  <ScrollView>
                    {tags.map((tag) => {
                      const isSelected = selectedTag.includes(tag.name);
                      return (
                        <TouchableOpacity
                          key={tag.name}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedTag((prev) =>
                              isSelected
                                ? prev.filter((t) => t !== tag.name)
                                : [...prev, tag.name]
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

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
              >
                <Text>{airDate.toDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={airDate}
                  mode="date"
                  display="default"
                  onChange={onChangeDate}
                  minimumDate={new Date()}
                />
              )}

              <TextInput
                placeholder="Lead"
                placeholderTextColor="#475569"
                style={styles.input}
                value={lead}
                onChangeText={setLead}
                multiline
              />
              <TextInput
                placeholder="Story"
                placeholderTextColor="#475569"
                style={[styles.input, { height: 200 }]}
                value={body}
                onChangeText={setBody}
                multiline
              />
              <TextInput
                placeholder="Remarks (optional)"
                placeholderTextColor="#475569"
                style={styles.input}
                value={remarks}
                onChangeText={setRemarks}
              />

              {/* Display selected media */}
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.mediaPreviewContainer}
                keyboardDismissMode="on-drag"
                nestedScrollEnabled={true}
                directionalLockEnabled={true}
                scrollEnabled={true}
                contentInsetAdjustmentBehavior="automatic"
                alwaysBounceHorizontal={true}
              >
                {[...selectedImages, ...selectedVideos, ...selectedAudios].map((file, index) => {
                  if (file.uri && file.mimeType?.startsWith("image/")) {
                    return (
                      <View key={file.uri + index} style={[styles.imageWrapper]} pointerEvents="box-none">
                        <Image
                          source={{ uri: file.uri }}
                          style={styles.mediaThumbnail}
                        />
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => {
                            setSelectedImages((prev) =>
                              prev.filter((img) => img.uri !== file.uri)
                            );
                          }}
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
                          style={styles.removeButton}
                          onPress={() => {
                            setSelectedVideos((prev) =>
                              prev.filter((vid) => vid.uri !== file.uri)
                            );
                          }}
                          pointerEvents="auto"
                        >
                          <Text style={styles.removeButtonText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  } else {
                    return (
                      <View key={file.uri + index} style={styles.mediaFileContainer}>
                        <Text style={styles.mediaFileName} numberOfLines={1}>
                          {file.name || file.uri.split("/").pop()}
                        </Text>
                      </View>
                    );
                  }
                })}
              </ScrollView>

              <TouchableOpacity style={styles.button} onPress={fileSelectedHandler}>
                <Text style={styles.buttonText}>Choose Media Files</Text>
              </TouchableOpacity>

              {uploadProgress > 0 && (
                <Text style={styles.progressText}>Uploading: {uploadProgress}%</Text>
              )}

              <TouchableOpacity style={styles.button} onPress={fileUploadHandler}>
                <Text style={styles.buttonText}>Upload Report</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal
        transparent
        visible={uploadSuccess}
        animationType="fade"
        onRequestClose={() => setUploadSuccess(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              News uploaded successfully. Waiting for approval.
            </Text>
            <Button title="Close" onPress={() => setUploadSuccess(false)} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    backgroundColor: "#f1efec",
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  container: {
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 14,
    color: "#0f172a",
  },
  button: {
    backgroundColor: "#1a3357",
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    color: "#64748b",
    fontSize: 14,
  },
  dropdown: {
    backgroundColor: "#f9fafb",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  dropdownText: {
    fontSize: 15,
    color: "#475569",
  },
  dropdownList: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    borderColor: "#e2e8f0",
    borderWidth: 1,
    maxHeight: 160,
    marginBottom: 14,
    paddingVertical: 4,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tagText: {
    fontSize: 15,
    color: "#334155",
  },
  tagSelected: {
    fontWeight: "600",
    color: "#1d4ed8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    width: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 16,
    textAlign: "center",
  },
  mediaPreviewContainer: {
    flexDirection: "row",
    marginBottom: 10,
    
  },
  mediaThumbnail: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  mediaFileContainer: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingHorizontal: 5,
  },
  mediaFileName: {
    fontSize: 12,
    color: "#475569",
  },
  videoFileName: {
    fontSize: 14,
    color: "#334155",
    backgroundColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 20,
    width: 80,
    textAlign: "center",
    marginRight: 10,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 10,
  },
  removeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#ff0000",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 18,
    fontWeight: "bold",
  },
  videoThumbnail: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#000",
  },
});

export default AddReport;
