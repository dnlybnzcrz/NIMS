import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import pbsheader from "../logo/pbsheader.png";
import Button from "react-bootstrap/Button";

const Tags = () => {
  const [newTag, setNewTag] = useState(""); // State for new tag input
  const [tags, setTags] = useState([]); // State for existing tags
  const [tagDetails, setTagDetails] = useState([]); // State for detailed tag information
  const [message, setMessage] = useState(""); // State for success message
  const [error, setError] = useState(""); // State for error message

  const userData = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  const config = {
    headers: {
      Authorization: "Bearer " + (userData ? userData.token : ""),
    },
  };

  // Fetch existing tags (IDs only) when component loads
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get("https://api.radiopilipinas.online/nims/tags/view", config); // Updated endpoint

        setTags(response.data.tagsList); // Set the tagsList in the state
      } catch (error) {

        setError("Failed to fetch tags. Please check the server or endpoint.");
      }
    };

    fetchTags();
  }, []);

  // Handle input change for new tag
  const handleNewTagChange = (e) => {
    setNewTag(e.target.value);
  };

  // Handle adding a new tag
  const handleAddTag = async () => {
    if (newTag.trim() === "") {
      setError("Tag cannot be empty.");
      setMessage(""); // Clear success message
      return;
    }

    try {
      // Add the new tag
      await axios.post(
        "https://api.radiopilipinas.online/nims/tags/add",
        { name: newTag }, // Send new tag data
        config
      );

      setNewTag(""); // Clear input field
      setError(""); // Clear any previous error
      setMessage("Tag added successfully!"); // Show success message

      // Fetch the updated list of tags
      const response = await axios.get(
        "https://api.radiopilipinas.online/nims/tags/view",
        config
      );

      setTags(response.data.tagsList); // Update the tags state with the new list
    } catch (error) {

      setMessage(""); // Clear success message
      setError("Failed to add tag. " + (error.response ? error.response.data : error.message));
    }
  };



  // Handle deleting a tag
  const handleDeleteTag = async (tagId) => {
    // Show confirmation prompt
    const confirmDelete = window.confirm("Are you sure you want to delete this tag?");
    if (!confirmDelete) {
      return; // Exit if user cancels
    }

    try {
      // Call the API to delete the tag
      await axios.delete(
        `https://api.radiopilipinas.online/nims/tags/delete/${tagId}`, // Adjust endpoint if needed
        config
      );

      // Remove the tag from the state
      setTags((prevTags) => prevTags.filter((tag) => tag._id !== tagId));

      setMessage("Tag deleted successfully!"); // Show success message
      setError(""); // Clear error message
    } catch (error) {

      setMessage(""); // Clear success message
      setError("Failed to delete tag. " + (error.response ? error.response.data : error.message));
    }
  };
  return (
    <div>
      <div style={{ backgroundColor: "#F1EFEC", padding: "10px 0", textAlign: "center" }}>
        <img src={pbsheader} alt="PBS Header" style={{ maxWidth: "100%", height: "auto" }} />
      </div>
      <Navbar />
      <br />
      <div className="container my-2 border card shadow-sm p-4 shadow-lg">
        <h3>TAGS</h3>


        {/* Add Tag section */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Enter new tag"
            value={newTag}
            onChange={handleNewTagChange}
          />
          <Button onClick={handleAddTag}>Add Tag</Button>
        </div>

        {/* Display success or error message */}
        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Display the list of tags in a table */}
        <div className="overflow-x-auto shadow-md rounded-lg">
        {tags.length > 0 ? (
          <table className="table table-striped table-bordered  table-hover align-middle w-full">
            <thead>
              <tr>
                <th>NUMBER</th>
                <th>TAG NAME</th>
                <th>DATE CREATED</th>
                <th>ACTIONS</th> {/* New column for actions */}
              </tr>
            </thead>
            <tbody>
              {tags.map((tag, index) => (
                <tr key={tag._id}>
                  <td>{index + 1}</td>
                  <td>{tag.name}</td>
                  <td>{new Date(tag.dateCreated).toLocaleDateString()}</td>
                  <td  className="px-4 py-2 text-sm">
                  <Button
  variant="danger"
  onClick={() => handleDeleteTag(tag._id)} // Call delete handler
  style={{
    color: "white",
    border: "none",
    width: "auto", // Allow dynamic width
    maxWidth: "100%", // Prevent overflow
    padding: "5px 15px",
    borderRadius: "5px",
    textAlign: "center", // Ensure text stays centered
    whiteSpace: "nowrap", // Prevent text from breaking
  }}
>
  Delete
</Button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No tags available.</p>
        )}
      </div>
      </div>
    </div>
  );
};

export default Tags;
