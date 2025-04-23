import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

const MediaModal = ({ show, handleClose, mediaItems, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, show]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!show) return;

      if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, show]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mediaItems.length) % mediaItems.length);
  };

  const renderMedia = () => {
    if (!mediaItems || mediaItems.length === 0) return null;

    const currentMedia = mediaItems[currentIndex];

    if (!currentMedia || !currentMedia.type || !currentMedia.url) {
      return <p>Unsupported media item</p>;
    }

    if (currentMedia.type === "image") {
      return (
        <div style={{ position: "relative", textAlign: "center" }}>
          <img
            src={currentMedia.url}
            alt={`Media ${currentIndex + 1}`}
            style={{ width: "100%", maxHeight: "70vh", objectFit: "contain" }}
          />
          {mediaItems.length > 1 && (
            <>
              <Button
                variant="light"
                onClick={goToPrevious}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "10px",
                  transform: "translateY(-50%)",
                  opacity: 0.7,
                  zIndex: 10,
                }}
              >
                &#8592;
              </Button>
              <Button
                variant="light"
                onClick={goToNext}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  opacity: 0.7,
                  zIndex: 10,
                }}
              >
                &#8594;
              </Button>
            </>
          )}
          <div style={{ marginTop: "8px" }}>
            {currentIndex + 1} / {mediaItems.length}
          </div>
        </div>
      );
    } else if (currentMedia.type === "audio") {
      return (
        <audio controls style={{ width: "100%" }}>
          <source src={currentMedia.url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      );
    } else if (currentMedia.type === "video") {
      return (
        <video controls style={{ width: "100%" }}>
          <source src={currentMedia.url} type="video/mp4" />
          Your browser does not support the video element.
        </video>
      );
    } else {
      return <p>Unsupported media type</p>;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Media Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>{renderMedia()}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MediaModal;
