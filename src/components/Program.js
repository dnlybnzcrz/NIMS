import React, { useState } from "react";
import AddTagsModal from "./AddTagsModal";

import Navbar from "./Navbar";

const Program = () => {
  const [tags, setTags] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleAddTag = (newTag) => {
    setTags((prevTags) => [...prevTags, newTag]);
  };

  return (
    <div>
    <Navbar/>
    <div className="container">
      <h2>Program List</h2>

      <button className="btn btn-primary" onClick={() => setShowModal(true)}>
        Add Program
      </button>

      {/* Display the tags */}
      <div className="mt-4">
        {tags.length > 0 ? (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag, index) => (
                <tr key={index}>
                  <td>{tag.name}</td>
                  <td>{tag.description}</td>
                  <td>{tag.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No programs added yet.</p>
        )}
      </div>

      {/* AddTagsModal */}
      {showModal && (
        <AddTagsModal
          handleClose={() => setShowModal(false)}
          onSubmit={handleAddTag}
        />
      )}
    </div>
    </div>
  );
};

export default Program;
