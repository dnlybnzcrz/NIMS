import React, { useState, useEffect } from "react";
import "../styles/AddReport.css";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";
import CompareModal from "./CompareModal";

const EditStory = (props) => {
  if (!props.content) return null;

  const offset = new Date().getTimezoneOffset() * 60000;
  const localISOTime = new Date(Date.now() - offset);

  // State variables
  const [airDate, setAirDate] = useState(localISOTime);
  const [inputData, setInputData] = useState({
    title: props.content.title,
    tags: props.content.tags,
    lead: props.content.lead,
    body: props.content.body,
    remarks: props.content.remarks || "",
  });
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(inputData.tags);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    // Fetch tags once on component mount
    const fetchTags = async () => {
      const config = {
        headers: {
          Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
      };
      try {
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
  }, []); // Empty array as dependency, so it runs only once when component mounts

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Handle multi-select tag changes
  const handleTagChange = (selectedOptions) => {
    const selected = selectedOptions.map((option) => option.label);
    setSelectedTags(selected);
  };

  // Handle form submission
  const formSubmitHandler = async (event) => {
    event.preventDefault();

    const config = {
      headers: {
        Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        "Content-Type": "multipart/form-data",
      },
    };

    const fd = new FormData();
    fd.append("title", inputData.title);
    fd.append("lead", inputData.lead);
    fd.append("body", inputData.body);
    fd.append("remarks", inputData.remarks);
    fd.append("forDate", airDate.toISOString().split("T")[0]);
    selectedTags.forEach((tag) => fd.append("tags", tag));

    try {
      const res = await axios.post(
        `https://api.radiopilipinas.online/nims/${props.content._id}/edit`,
        fd,
        config
      );
      alert("Story updated successfully!");
      props.handleStoryUpdate(res.data.updatedStory);
      props.handleClose();
      window.location.reload();
    } catch (err) {
      console.error("Error updating story:", err);
      alert("Error updating story.");
    }
  };

  // Compare button handler
  const handleCompare = () => setShowCompareModal(true);

  // Close compare modal
  const closeCompareModal = () => setShowCompareModal(false);

 // Get last edited by information
 const lastEditedBy =
 props.content.updateHistory &&
 props.content.updateHistory.length > 0 &&
 props.content.updateHistory[0].username
   ? props.content.updateHistory[0].username
   : "No Edits Made";




  return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={props.handleClose}>
          <i className="fa fa-close"></i>
        </span>
        <form onSubmit={formSubmitHandler}>
          <div className="table-responsive">
            <h3>Edit Story</h3>
            <h6>Last Edited By</h6>
            <p>{lastEditedBy}</p>

            <h6>Headline</h6>
            <textarea
              className="w-100"
              id="title"
              name="title"
              value={inputData.title}
              onChange={handleInputChange}
              required
            />

            <h6>Tags</h6>
            <Select
              isMulti
              name="tags"
              className="selectedTags"
              classNamePrefix="select"
              options={tags.map((tag) => ({
                value: tag.name,
                label: tag.name,
              }))}
              value={tags.filter((tag) => selectedTags.includes(tag.name)).map((tag) => ({
                value: tag.name,
                label: tag.name,
              }))}
              onChange={handleTagChange}
            />

            <h6>Air Date</h6>
            <DatePicker
              id="forDate"
              name="forDate"
              selected={airDate}
              onChange={(date) => setAirDate(date)}
            />

            <h6>Lead</h6>
            <textarea
              className="w-100"
              id="lead"
              name="lead"
              value={inputData.lead}
              onChange={handleInputChange}
              rows="4"
              cols="91"
              required
            />

            <h6>Story</h6>
            <textarea
              className="w-100"
              id="body"
              name="body"
              value={inputData.body}
              onChange={handleInputChange}
              rows="7"
              cols="91"
              required
            />

            <h6>Remarks</h6>
            <textarea
              className="w-100"
              id="remarks"
              name="remarks"
              value={inputData.remarks}
              onChange={handleInputChange}
              rows="2"
              cols="91"
              placeholder="Add remarks"
            />

            <div>
              <button type="submit" className="btn2 btn-dark btn-lg">
                Update
              </button>
              <button
                type="button"
                className="btn2 btn-secondary btn-lg"
                onClick={handleCompare}
              >
                Compare Changes
              </button>
            </div>
          </div>
        </form>

        {showCompareModal && (
          <CompareModal
            original={props.content.body} // Original text
            latest={inputData.body} // Latest edited text
            onClose={closeCompareModal}
          />
        )}
      </div>
    </div>
  );
};

export default EditStory;
