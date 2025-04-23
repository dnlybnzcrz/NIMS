import React, { useState } from "react";
import "../styles/AddReport.css";


const AddTagsModal = ({ handleClose, onSubmit }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  const handleSubmit = () => {
    // Create the new tag object
    const newTag = {
      name,
      description,
      status,
    };

    // Pass it to the parent component through props
    onSubmit(newTag);

    // Clear the form and close the modal
    setName("");
    setDescription("");
    setStatus("Active");
    handleClose();
  };

  return (

    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={handleClose}>
          <i className="fa fa-close"></i>
        </span>
        <div className="table-responsive">
          <div>
            <p>Name</p>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p>Description</p>
            <textarea
              id="description"
              name="description"
              placeholder="Description"
              rows="4"
              cols="90"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <p>Status</p>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <span className="spa">
              <button
                className="btn2 btn-dark btn-lg"
                onClick={handleSubmit}
              >
                Upload
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>

  );
};

export default AddTagsModal;
