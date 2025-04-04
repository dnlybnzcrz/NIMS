import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import moment from "moment";
import axios from "axios";


const StoryModal = ({ showModal, handleCloseModal, selectedNewsItem, updateNewsList }) => {
  const [editedNewsItem, setEditedNewsItem] = useState(selectedNewsItem);
  const [isEditing, setIsEditing] = useState(false);



  // Function to handle saving changes
  const handleSaveChanges = () => {
    axios
      .put(
        `https://api.radiopilipinas.online/nims/${editedNewsItem._id}/edit`,
        editedNewsItem,
        {
          headers: {
            Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
          },
        }
      )
      .then((res) => {
        console.log('Save response:', res.data);
        updateNewsList(editedNewsItem);
        setIsEditing(false);
        handleCloseModal();
      })
      .catch((err) => {
        console.error('Error saving changes:', err.response ? err.response.data : err.message);
      });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    // Write the HTML content for the print window
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Story</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              padding: 0;
              color: #333;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
              border-bottom: 2px solid #333;
              padding-bottom: 5px;
            }
            h5 {
              font-size: 18px;
              margin: 10px 0;
            }
            p {
              font-size: 16px;
              line-height: 1.5;
              margin: 5px 0;
              text-align: justify; /* Justify text */
            }
            img {
              max-width: 100%;
              height: auto;
              margin: 10px 0;
              border: 1px solid #ccc;
              padding: 5px;
            }
            .container {
              max-width: 800px;
              margin: auto;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 5px;
            }
            .footer {
              margin-top: 20px;
              font-size: 14px;
              text-align: center;
            }
            .signature {
              margin-top: 30px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${editedNewsItem.lead}</h1>
            <p><strong>Date:</strong> ${moment(editedNewsItem.dateCreated).format("MM/DD/YYYY, h:mm:ss a")}</p>
            <p><strong>Tags:</strong> ${editedNewsItem.tags}</p>
            <p><strong>Title:</strong> ${editedNewsItem.title}</p>
            <p><strong>Story:</strong> ${editedNewsItem.body}</p>

            <p><strong>Approved By:</strong> ${selectedNewsItem.approvedBy ? selectedNewsItem.approvedBy.name.first : ""} ${selectedNewsItem.approvedBy ? selectedNewsItem.approvedBy.name.last : ""}</p>
            <p><strong>Prepared By:</strong> ${editedNewsItem.author.name.first} ${editedNewsItem.author.name.last}</p>

            <div class="footer">Printed on ${moment().format("MM/DD/YYYY, h:mm:ss a")}</div>
          </div>
        </body>
      </html>
    `);

    // Close the document and trigger the print dialog
    printWindow.document.close();
    printWindow.print();
    window.location.reload(); // Close the modal
  };

  const handleStoryUpdate = (updatedStory) => {
    updateNewsList(updatedStory); // Update the story in the parent component
    setIsEditing(false); // Exit editing mode
  };

  return (
    <Modal
      show={showModal}
      onHide={handleCloseModal}
      size="lg" // Change the size to large
      centered // Optional: Center the modal
    >
      <Modal.Header closeButton>
        <Modal.Title>Story Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedNewsItem && (
          <div>
            <h5>{selectedNewsItem.lead}</h5>
            <p><strong>Date:</strong> {moment(selectedNewsItem.dateCreated).format("MM/DD/YYYY, h:mm:ss a")}</p>
            <p><strong>Title:</strong> {selectedNewsItem.title}</p>
            <p style={{ textAlign: "justify" }}><strong>Story:</strong> {selectedNewsItem.body}</p>
            <p><strong>Tags:</strong> {selectedNewsItem.tags}</p>

            {/* Display prepared by and approved by */}
            <p><strong>Approved By:</strong> {selectedNewsItem.approvedBy ? selectedNewsItem.approvedBy.name.first : null} {selectedNewsItem.approvedBy ? selectedNewsItem.approvedBy.name.last : null}</p>
            <p><strong>Prepared By:</strong> {selectedNewsItem.author.name.first} {selectedNewsItem.author.name.last}</p>


            {/* Display images */}
{selectedNewsItem.files && selectedNewsItem.files.images && selectedNewsItem.files.images.length > 0 && (
  <div>
    <h5>Images:</h5>
    {selectedNewsItem.files.images.map((image, index) => (
      <img
        key={index}
        src={`https://pbs-nims.s3.ap-southeast-1.amazonaws.com${image}`}
        alt={`news-image-${index}`}
        style={{ width: "200px", height: "auto", margin: "5px" }}
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('DownloadURL', `image/jpeg:https://pbs-nims.s3.ap-southeast-1.amazonaws.com${image}`);
        }}
      />
    ))}
  </div>
)}

{/* Display audio */}
{selectedNewsItem.files && selectedNewsItem.files.audios && selectedNewsItem.files.audios.length > 0 && (
  <div>
    <h5>Audio:</h5>
    {selectedNewsItem.files.audios.map((audio, index) => (
      <audio
        key={index}
        controls
        style={{ margin: "5px" }}
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('DownloadURL', `audio/mpeg:https://pbs-nims.s3.ap-southeast-1.amazonaws.com${audio}`);
        }}
      >
        <source
          src={`https://pbs-nims.s3.ap-southeast-1.amazonaws.com${audio}`}
          type="audio/mpeg"
        />
        Your browser does not support the audio tag.
      </audio>
    ))}
  </div>
)}

{/* Display videos */}
{selectedNewsItem.files && selectedNewsItem.files.videos && selectedNewsItem.files.videos.length > 0 && (
  <div>
    <h5>Videos:</h5>
    {selectedNewsItem.files.videos.map((video, vidIndex) => (
      <video
        key={vidIndex}
        controls
        style={{ width: "100%", margin: "5px 0" }}
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('DownloadURL', `video/mp4:https://pbs-nims.s3.ap-southeast-1.amazonaws.com${video}`);
        }}
      >
        <source
          src={`https://pbs-nims.s3.ap-southeast-1.amazonaws.com${video}`}
          type="video/mp4" // Adjust the type as necessary
        />
        Your browser does not support the video element.
      </video>
                  ))}
                </div>
              )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handlePrint}>
          Print
        </Button>

      </Modal.Footer>
    </Modal>
  );
};

export default StoryModal;
