import React, { useState } from "react";
import moment from "moment";
import { Button } from "react-bootstrap";
import { FaBookOpen, FaTrash } from "react-icons/fa";
import "./ReportCard.css";

const ReportCard = ({ report, handleShowModal, handleDeleteReport, handleShowMediaModal, searchQuery }) => {
  const [expandedReports, setExpandedReports] = useState({});

  // Helper function to highlight matching text
  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="highlight">{part}</mark>
      ) : (
        part
      )
    );
  };

  // Toggle expanded state for lead and body
  const toggleExpand = (key) => {
    setExpandedReports((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Combined media for images and videos
  const combinedMedia = [];

  if (report.image || report.imageUrl) {
    combinedMedia.push({
      type: "image",
      url: report.image || report.imageUrl,
    });
  }

  if (report.files && report.files.images && report.files.images.length > 0) {
    report.files.images.forEach((img) => {
      combinedMedia.push({
        type: "image",
        url: `https://pbs-nims.s3.ap-southeast-1.amazonaws.com${img}`,
      });
    });
  }

  if (report.files && report.files.videos && report.files.videos.length > 0) {
    report.files.videos.forEach((video) => {
      combinedMedia.push({
        type: "video",
        url: `https://pbs-nims.s3.ap-southeast-1.amazonaws.com${video}`,
      });
    });
  }

  // Assign media section class based on number of media items for proper sizing
  // Also separate portrait and landscape media for different sizing
  let mediaSectionClass = "media-section";
  let mediaOrientationClass = "";

  // Helper function to determine orientation of media by aspect ratio
  const isPortrait = (url) => {
    // Since we don't have direct access to image/video dimensions here,
    // we can assume portrait if URL contains 'portrait' or similar heuristic,
    // or alternatively, this logic can be enhanced with actual metadata if available.
    // For now, we will just return false (landscape) as default.
    return false;
  };

  if (combinedMedia.length === 1) {
    mediaSectionClass += " single";
    mediaOrientationClass = isPortrait(combinedMedia[0].url) ? " portrait" : " landscape";
  } else if (combinedMedia.length === 2) {
    mediaSectionClass += " double";
    // For simplicity, if both are portrait, add portrait class, else landscape
    const allPortrait = combinedMedia.every((m) => isPortrait(m.url));
    mediaOrientationClass = allPortrait ? " portrait" : " landscape";
  } else if (combinedMedia.length === 3) {
    mediaSectionClass += " triple";
    const allPortrait = combinedMedia.every((m) => isPortrait(m.url));
    mediaOrientationClass = allPortrait ? " portrait" : " landscape";
  } else if (combinedMedia.length >= 4) {
    mediaSectionClass += " grid";
  }

  return (
    <div className="post card mb-4 shadow-sm">
      <div className="post-header d-flex align-items-center mb-3">
        <div>
          <strong className="author-name">
            {highlightText(`${report.author.name.first} ${report.author.name.last}`, searchQuery)}
          </strong>
          <div className="author-station">
            {highlightText(report.author.station, searchQuery)}
          </div>
          <div className="date-created">
            {moment(report.dateCreated).fromNow()}
          </div>
        </div>
      </div>
      <div className="post-content mb-3">
        <h5 className="post-title">{highlightText(report.title, searchQuery)}</h5>
        <p>
          {expandedReports[report._id]
            ? highlightText(report.lead || "", searchQuery)
            : (typeof report.lead === "string"
                ? highlightText(report.lead.split(" ").slice(0, 30).join(" "), searchQuery)
                : "") +
              ((typeof report.lead === "string" && report.lead.split(" ").length > 30) ? "..." : "")}
          {(typeof report.lead === "string" && report.lead.split(" ").length > 30) && (
            <span
              onClick={() => toggleExpand(report._id)}
              className="expand-toggle"
            >
              {expandedReports[report._id] ? " see less" : " see more"}
            </span>
          )}
        </p>
        <p className="post-body">
          <strong>Story: </strong>
          {expandedReports[report._id + "_body"]
            ? highlightText(report.body || "", searchQuery)
            : (typeof report.body === "string"
                ? highlightText(report.body.split(" ").slice(0, 50).join(" "), searchQuery)
                : "") +
              ((typeof report.body === "string" && report.body.split(" ").length > 50) ? "..." : "")}
          {(typeof report.body === "string" && report.body.split(" ").length > 50) && (
            <span
              onClick={() => toggleExpand(report._id + "_body")}
              className="expand-toggle"
            >
              {expandedReports[report._id + "_body"] ? " see less" : " see more"}
            </span>
          )}
        </p>
        <p>
          <strong>Tags: </strong>
          {highlightText(report.tags.join(", "), searchQuery)}
        </p>
        <p>
          <strong>Remarks: </strong>
          {highlightText(report.remarks || "", searchQuery)}
        </p>
      </div>

      {/* Media Section */}
      {combinedMedia.length > 0 && (
        <div className={mediaSectionClass}>
          {combinedMedia.length >= 4
            ? combinedMedia.slice(0, 4).map((media, idx) => {
                if (media.type === "image") {
                  if (idx === 3 && combinedMedia.length > 4) {
                    return (
                      <div
                        key={idx}
                        className="media-image"
                        onClick={() => handleShowMediaModal(combinedMedia, null, idx)}
                      >
                        <img
                          src={media.url}
                          alt={`media-${idx}`}
                          draggable="true"
                          onDragStart={(e) => {
                            e.dataTransfer.setData("DownloadURL", `image/jpeg:${media.url}`);
                          }}
                          style={{ filter: "brightness(70%)" }}
                        />
                        <div className="media-overlay-count">
                          +{combinedMedia.length - 4}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <img
                      key={idx}
                      src={media.url}
                      alt={`media-${idx}`}
                      className="media-image"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData("DownloadURL", `image/jpeg:${media.url}`);
                      }}
                      onClick={() => handleShowMediaModal(combinedMedia, null, idx)}
                    />
                  );
                } else if (media.type === "video") {
                  if (idx === 3 && combinedMedia.length > 4) {
                    return (
                      <div
                        key={idx}
                        className="media-video"
                        onClick={() => handleShowMediaModal(combinedMedia, null, idx)}
                      >
                        <video
                          controls
                          draggable="true"
                          onDragStart={(e) => {
                            e.dataTransfer.setData("DownloadURL", `video/mp4:${media.url}`);
                          }}
                          style={{ filter: "brightness(70%)" }}
                        >
                          <source src={media.url} type="video/mp4" />
                          Your browser does not support the video element.
                        </video>
                        <div className="media-overlay-count">
                          +{combinedMedia.length - 4}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div
                      key={idx}
                      className="media-video"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData("DownloadURL", `video/mp4:${media.url}`);
                      }}
                      onClick={() => handleShowMediaModal(combinedMedia, null, idx)}
                    >
                      <video controls>
                        <source src={media.url} type="video/mp4" />
                        Your browser does not support the video element.
                      </video>
                    </div>
                  );
                } else {
                  return null;
                }
              })
            : combinedMedia.map((media, idx) => {
                if (media.type === "image") {
                  return (
                    <img
                      key={idx}
                      src={media.url}
                      alt={`media-${idx}`}
                      className="media-image"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData("DownloadURL", `image/jpeg:${media.url}`);
                      }}
                      onClick={() => handleShowMediaModal(combinedMedia, null, idx)}
                    />
                  );
                } else if (media.type === "video") {
                  return (
                    <div
                      key={idx}
                      className="media-video"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData("DownloadURL", `video/mp4:${media.url}`);
                      }}
                      onClick={() => handleShowMediaModal(combinedMedia, null, idx)}
                    >
                      <video controls>
                        <source src={media.url} type="video/mp4" />
                        Your browser does not support the video element.
                      </video>
                    </div>
                  );
                } else {
                  return null;
                }
              })}
        </div>
      )}

      {/* Separate Audio Section */}
      {report.files && report.files.audios && report.files.audios.length > 0 && (
        <div className="audio-section">
          <h6>Audio:</h6>
          <div className="audio-list">
{report.files.audios.map((audio, index) => {
  const audioUrl = `https://pbs-nims.s3.ap-southeast-1.amazonaws.com${audio}`;
  // Determine mime type based on file extension
  let mimeType = "audio/mpeg";
  if (audio.toLowerCase().endsWith(".m4a")) {
    mimeType = "audio/mp4";
  }
  return (
    <audio
      key={index}
      controls
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData(`DownloadURL`, `${mimeType}:${audioUrl}`);
      }}
      onClick={() =>
        handleShowMediaModal(
          report.files.audios.map((a) => ({
            type: "audio",
            url: `https://pbs-nims.s3.ap-southeast-1.amazonaws.com${a}`,
          })),
          "audio",
          index
        )
      }
    >
      <source src={audioUrl} type={mimeType} />
      Your browser does not support the audio tag.
    </audio>
  );
})}
          </div>
        </div>
      )}

      <div className="post-actions d-flex justify-content-between mt-3">
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleShowModal(report)}
          aria-label={`Read full story of ${report.title}`}
        >
          <FaBookOpen style={{ marginRight: "6px" }} />
          Read Full Story
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDeleteReport(report._id)}
          aria-label={`Delete report titled ${report.title}`}
        >
          <FaTrash style={{ marginRight: "6px" }} />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default ReportCard;
