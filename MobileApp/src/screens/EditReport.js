import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Button,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";
import { Video } from "expo-av";
import { Ionicons } from '@expo/vector-icons';
import axios from "axios";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenWrapper from "../components/ScreenWrapper";
import styles from "../screens/AddReportStyles";

// TagSelector component
const TagSelector = ({ tags, selectedTags, onChange, visible, toggleVisibility }) => {
  const [searchText, setSearchText] = React.useState("");

  const filteredTags = useMemo(() => {
    return searchText.trim() === ""
      ? tags
      : tags.filter(tag =>
          tag.name.toLowerCase().includes(searchText.toLowerCase())
        );
  }, [searchText, tags]);

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

// DateSelector component
const DateSelector = ({ date, onChange, visible, toggleVisibility }) => {
  const safeDate = date instanceof Date ? date : new Date();

  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
        <View style={[styles.dateInput, { flex: 2, marginRight: 5, justifyContent: "center", alignItems: "flex-start" }]}>
          <Text style={styles.dateText}>{safeDate.toDateString()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.dateInput, { flex: 1, marginLeft: 5, justifyContent: "center", alignItems: "center" }]}
          onPress={() => toggleVisibility(true)}
        >
          <Text style={styles.dateText}>{safeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
      </View>
      {visible && (
        <DateTimePicker
          value={safeDate}
          mode="datetime"
          display="default"
          onChange={(event, selectedDate) => {
            toggleVisibility(false);
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </>
  );
};

const EditReport = (props) => {
  const [formData, setFormData] = useState({
    title: "",
    lead: "",
    body: "",
    remarks: "",
    airDate: new Date(),
    selectedTag: [],
  });

  const [storyInputHeight, setStoryInputHeight] = useState(140);

  const [uiState, setUiState] = useState({
    showTagDropdown: false,
    showDatePicker: false,
    uploadProgress: 0,
    uploadSuccess: false,
    showVideoModal: false,
    videoUri: null,
  });

  const [isLoading, setIsLoading] = useState({
    tags: false,
    upload: false,
  });

  const [tags, setTags] = useState([]);
  const titleRef = useRef(null);

  useEffect(() => {
    const loadPostData = () => {
      if (props.route && props.route.params && props.route.params.post) {
        const post = props.route.params.post;
        setFormData({
          title: post.title || "",
          lead: post.lead || "",
          body: post.body || "",
          remarks: post.remarks || "",
          airDate: post.forDate ? new Date(post.forDate) : new Date(),
          selectedTag: Array.isArray(post.tags) ? post.tags : (typeof post.tags === 'string' ? post.tags.split(',').map(t => t.trim()) : []),
        });
      }
    };

    loadPostData();

    const unsubscribe = props.navigation?.addListener('focus', () => {
      loadPostData();
    });

    return unsubscribe;
  }, [props.route, props.navigation]);

  const updateFormField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleUiState = useCallback((field, value) => {
    setUiState(prev => ({ ...prev, [field]: value !== undefined ? value : !prev[field] }));
  }, []);

  const playVideo = useCallback((uri) => {
    setUiState(prev => ({ ...prev, videoUri: uri, showVideoModal: true }));
  }, []);

  const closeVideoModal = useCallback(() => {
    setUiState(prev => ({ ...prev, showVideoModal: false, videoUri: null }));
  }, []);

  const validateForm = () => {
    const { title, lead, body } = formData;
    const errors = {};
    if (!title.trim()) errors.title = "Headline is required";
    if (!lead.trim()) errors.lead = "Lead is required";
    if (!body.trim()) errors.body = "Story is required";
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  const fileUploadHandler = async () => {
    const { isValid, errors } = validateForm();
    if (!isValid) {
      const errorMessages = Object.values(errors).join('\n');
      Alert.alert("Form Validation Failed", errorMessages);
      return;
    }
    try {
      setIsLoading(prev => ({ ...prev, upload: true }));
      toggleUiState("uploadProgress", 0);
      const user = JSON.parse(await AsyncStorage.getItem("user"));
      if (!user || !user.token) {
        Alert.alert("Authentication Error", "Please log in again.");
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
      const reportId = props.route?.params?.post?._id;
      const url = reportId
        ? `https://api.radiopilipinas.online/nims/${reportId}/edit`
        : "https://api.radiopilipinas.online/nims/add";
      const response = await axios.post(
        url,
        fd,
        config
      );
      if (response.status >= 200 && response.status < 300) {
        toggleUiState("uploadSuccess", true);
      } else {
        Alert.alert("Upload Failed", `Failed to update the report. Status code: ${response.status}`);
      }
    } catch (error) {
      Alert.alert("Upload Error", "An error occurred while uploading the report.");
    } finally {
      setIsLoading(prev => ({ ...prev, upload: false }));
      toggleUiState("uploadProgress", 0);
    }
  };

  // Last Edited By display
  const lastEditedBy = props.route?.params?.post?.updateHistory?.[0]?.username || "No Edits Made";

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.fullScreenContainer}
          >
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
              <Text style={styles.heading}>EDIT REPORT</Text>
            </View>
            <Text style={styles.lastEdited}>Last Edited By: {lastEditedBy}</Text>

            <Text style={styles.label}>Headline</Text>
            <TextInput
              ref={titleRef}
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => updateFormField("title", text)}
              placeholder="Enter headline"
              multiline
              scrollEnabled={false}
            />

            <Text style={styles.label}>Tags</Text>
            <TagSelector
              tags={tags}
              selectedTags={formData.selectedTag}
              onChange={(newTags) => updateFormField("selectedTag", newTags)}
              visible={uiState.showTagDropdown}
              toggleVisibility={() => toggleUiState("showTagDropdown")}
            />

            <Text style={styles.label}>Air Date</Text>
            <DateSelector
              date={formData.airDate}
              onChange={(show) => toggleUiState("showDatePicker", show)}
            />

            <Text style={styles.label}>Lead</Text>
            <TextInput
              style={styles.input}
              value={formData.lead}
              onChangeText={(text) => updateFormField("lead", text)}
              placeholder="Enter lead"
              multiline
              scrollEnabled={false}
            />

            <Text style={styles.label}>Story</Text>
            <TextInput
              style={styles.input}
              value={formData.body}
              onChangeText={(text) => updateFormField("body", text)}
              placeholder="Enter story"
              multiline
              scrollEnabled={false}
            />

            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              value={formData.remarks}
              onChangeText={(text) => updateFormField("remarks", text)}
              placeholder="Add remarks"
              multiline
            />

            {isLoading.upload && (
              <View style={styles.uploadProgressContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text>Uploading... {uiState.uploadProgress}%</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                isLoading.upload && styles.buttonDisabled,
              ]}
              onPress={fileUploadHandler}
              disabled={isLoading.upload}
            >
              <Text style={styles.buttonText}>Update Report</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal
        transparent
        visible={uiState.uploadSuccess}
        animationType="fade"
        onRequestClose={() => toggleUiState("uploadSuccess", false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Report updated successfully.
            </Text>
            <Button title="Close" onPress={() => toggleUiState("uploadSuccess", false)} />
          </View>
        </View>
      </Modal>

      <Modal
        visible={uiState.showVideoModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeVideoModal}
      >
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={closeVideoModal}>
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
          {uiState.videoUri && (
            <Video
              source={{ uri: uiState.videoUri }}
              style={styles.videoPlayer}
              useNativeControls
              resizeMode="contain"
              shouldPlay
            />
          )}
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default EditReport;
