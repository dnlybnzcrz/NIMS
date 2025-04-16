import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import moment from "moment";
import { Button } from "react-bootstrap";
import StoryModal from "./StoryModal"; // Import StoryModal component
import ReactPaginate from "react-paginate"; // Import React Paginate
import MediaModal from "./MediaModal"; // Import MediaModal component
import pbsheader from "../logo/pbsheader.png";
import "../styles/Pagination.css";
import "../styles/Homepage.css";

const Homepage = () => {
  const [approvedReports, setApprovedReports] = useState([]);
  const [showModal, setShowModal] = useState(false); // StoryModal visibility state
  const [selectedReport, setSelectedReport] = useState(null); // Store selected report
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [currentPage, setCurrentPage] = useState(0); // Current page (0-based index)
  const [showMediaModal, setShowMediaModal] = useState(false); // MediaModal visibility state
  const [mediaUrls, setMediaUrls] = useState([]); // Array of media URLs to preview
  const [mediaType, setMediaType] = useState(null); // Type of media: image, audio, video
  const [mediaInitialIndex, setMediaInitialIndex] = useState(0); // Initial index for media modal
  const [expandedReports, setExpandedReports] = useState({}); // Track expanded state of reports by id
  const rowsPerPage = 20; // Number of rows per page

  // Check if the user is logged in and get the token
  const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
  const token = user ? user.token : null;

  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "", // Ensure token exists before appending
    },
  };

  useEffect(() => {
    if (token) {
      fetchApprovedReports();
    } else {
      console.error("No token found, user is not authenticated");
      // Optionally, redirect to login or show a message
    }
  }, [token]); // Fetch reports when token is available

  const fetchApprovedReports = () => {
    axios
      .get("https://api.radiopilipinas.online/nims/view", config)
      .then((res) => {
        const filteredApprovedReports = res.data.newsDataList.filter(report => report.approved === true);
        setApprovedReports(filteredApprovedReports);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Show StoryModal
  const handleShowModal = (report) => {
    setSelectedReport(report); // Set the selected report
    setShowModal(true); // Show the modal
  };

  // Close StoryModal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Show MediaModal
  const handleShowMediaModal = (mediaItems, type, initialIndex = 0) => {
    setMediaUrls(mediaItems);
    setMediaType(type);
    setMediaInitialIndex(initialIndex);
    setShowMediaModal(true);
  };

  // Close MediaModal
  const handleCloseMediaModal = () => {
    setShowMediaModal(false);
    setMediaUrls([]);
    setMediaType(null);
    setMediaInitialIndex(0);
  };

  // Filter reports based on search query
  const filterReports = () => {
    return approvedReports.filter((report) => {
      const { author, lead, tags, dateCreated } = report;
      const formattedDate = moment(dateCreated).format("MM/DD/YYYY, h:mm:ss a");
      const tagsToSearch = Array.isArray(tags) ? tags.join(', ') : ''; // Join tags into a string if it's an array

      return (
        (author.station && author.station.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (author.name.first && author.name.first.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (author.name.middle && author.name.middle.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (author.name.last && author.name.last.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (lead && lead.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tagsToSearch.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (formattedDate && formattedDate.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  };

  // Calculate paginated reports for current page
  const paginatedReports = filterReports().slice(
    currentPage * rowsPerPage,
    (currentPage + 1) * rowsPerPage
  );

  // Handle page change
  const handlePageClick = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  // Delete report function
  const handleDeleteReport = (reportId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this report?");
    if (confirmDelete) {
      axios
        .delete(`https://api.radiopilipinas.online/nims/delete/${reportId}`, config)
        .then(() => {
          // Filter out the deleted report from state
          setApprovedReports(approvedReports.filter(report => report._id !== reportId));
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <div>
      <div style={{ backgroundColor: "white", padding: "10px 0", textAlign: "center" }}>
        <img src={pbsheader} alt="PBS Header" style={{ maxWidth: "100%", height: "auto" }} />
      </div>
      <Navbar />
      <br />
      <div className="container my-2">
        <div className="social-feed">
          <h3 className="text-center mb-4">Approved Reports Feed</h3>

          {/* Search input */}
          <input
            type="text"
            className="form-control mb-4"
            placeholder="Search by source, headline, lead, tags, or date/time"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {paginatedReports.length ? (
            <div className="feed">
              {paginatedReports.map((report) => (
                <div key={report._id} className="post card mb-4 shadow-sm">
                  <div className="post-header d-flex align-items-center mb-3">
                    <div>
                      <strong style={{ fontSize: "1.1rem" }}>{report.author.name.first} {report.author.name.last}</strong>
                      <div style={{ fontSize: "0.85rem", color: "#555" }}>{report.author.station}</div>
                      <div style={{ fontSize: "0.75rem", color: "#888" }}>{moment(report.dateCreated).fromNow()}</div>
                    </div>
                  </div>
                  <div className="post-content mb-3">
                    <h5 style={{ fontWeight: "600" }}>{report.title}</h5>
                    <p>
                      {expandedReports[report._id]
                        ? report.lead || ""
                        : (typeof report.lead === "string" ? report.lead.split(" ").slice(0, 30).join(" ") : "") + ((typeof report.lead === "string" && report.lead.split(" ").length > 30) ? "..." : "")}
                      {(typeof report.lead === "string" && report.lead.split(" ").length > 30) && (
                        <span
                          onClick={() => {
                            setExpandedReports((prev) => ({
                              ...prev,
                              [report._id]: !prev[report._id],
                            }));
                          }}
                          style={{ color: "blue", cursor: "pointer", marginLeft: "5px" }}
                        >
                          {expandedReports[report._id] ? " see less" : " see more"}
                        </span>
                      )}
                    </p>
                    <p style={{ textAlign: "justify" }}>
                      <strong>Story: </strong>
                      {expandedReports[report._id + "_body"]
                        ? report.body || ""
                        : (typeof report.body === "string" ? report.body.split(" ").slice(0, 50).join(" ") : "") + ((typeof report.body === "string" && report.body.split(" ").length > 50) ? "..." : "")}
                      {(typeof report.body === "string" && report.body.split(" ").length > 50) && (
                        <span
                          onClick={() => {
                            setExpandedReports((prev) => ({
                              ...prev,
                              [report._id + "_body"]: !prev[report._id + "_body"],
                            }));
                          }}
                          style={{ color: "blue", cursor: "pointer", marginLeft: "5px" }}
                        >
                          {expandedReports[report._id + "_body"] ? " see less" : " see more"}
                        </span>
                      )}
                    </p>
                    <p><strong>Tags: </strong>{report.tags.join(', ')}</p>
                    <p><strong>Remarks: </strong>{report.remarks}</p>
                  </div>

                  {/* Media Section */}
                  {/* Combined Media Section */}
                  {(() => {
                    const combinedMedia = [];

                    // Add main image if exists
                    if (report.image || report.imageUrl) {
                      combinedMedia.push({
                        type: "image",
                        url: report.image || report.imageUrl,
                      });
                    }

                    // Add images
                    if (report.files && report.files.images && report.files.images.length > 0) {
                      report.files.images.forEach((img) => {
                        combinedMedia.push({
                          type: "image",
                          url: `https://pbs-nims.s3.ap-southeast-1.amazonaws.com${img}`,
                        });
                      });
                    }

                    // Add videos
                    if (report.files && report.files.videos && report.files.videos.length > 0) {
                      report.files.videos.forEach((video) => {
                        combinedMedia.push({
                          type: "video",
                          url: `https://pbs-nims.s3.ap-southeast-1.amazonaws.com${video}`,
                        });
                      });
                    }

                    if (combinedMedia.length === 0) return null;

                    return (
                      <div className="media-section mb-3" style={{ display: "flex", gap: "15px", overflowX: "auto", flexWrap: "wrap", justifyContent: "center" }}>
                        {combinedMedia.map((media, idx) => {
                          if (media.type === "image") {
                            return (
                              <img
                                key={idx}
                                src={media.url}
                                alt={`media-${idx}`}
                                style={{ height: "300px", borderRadius: "10px", cursor: "pointer", flexShrink: 0, objectFit: "cover" }}
                                draggable="true"
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('DownloadURL', `image/jpeg:${media.url}`);
                                }}
                                onClick={() => handleShowMediaModal(combinedMedia, null, idx)}
                              />
                            );
                          } else if (media.type === "video") {
                            return (
                              <video
                                key={idx}
                                controls
                              style={{
                                height: "300px",
                                maxWidth: "400px",
                                objectFit: "cover",
                                borderRadius: "10px",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                                draggable="true"
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('DownloadURL', `video/mp4:${media.url}`);
                                }}
                                onClick={() => handleShowMediaModal(combinedMedia, null, idx)}
                              >
                                <source src={media.url} type="video/mp4" />
                                Your browser does not support the video element.
                              </video>
                            );
                          } else {
                            return null;
                          }
                        })}
                      </div>
                    );
                  })()}
+
                  {/* Separate Audio Section */}
                  {report.files && report.files.audios && report.files.audios.length > 0 && (
                    <div className="media-section mb-3">
                      <h6 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Audio:</h6>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {report.files.audios.map((audio, index) => {
                          const audioUrl = `https://pbs-nims.s3.ap-southeast-1.amazonaws.com${audio}`;
                          return (
                            <audio
                              key={index}
                              controls
                              style={{
                                width: "100%",
                                maxWidth: "400px",
                                borderRadius: "8px",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                cursor: "pointer",
                              }}
                              draggable="true"
                              onDragStart={(e) => {
                                e.dataTransfer.setData('DownloadURL', `audio/mpeg:${audioUrl}`);
                              }}
                              onClick={() => handleShowMediaModal(report.files.audios.map(a => ({ type: "audio", url: `https://pbs-nims.s3.ap-southeast-1.amazonaws.com${a}` })), "audio", index)}
                            >
                              <source src={audioUrl} type="audio/mpeg" />
                              Your browser does not support the audio tag.
                            </audio>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="post-actions d-flex justify-content-between mt-3">
                    <Button variant="outline-primary" size="sm" onClick={() => handleShowModal(report)}>
                      Read Full Story
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteReport(report._id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center my-4">No approved reports found!</div>
          )}

          <ReactPaginate
            previousLabel={<span>&laquo; Previous</span>}
            nextLabel={<span>Next &raquo;</span>}
            pageCount={Math.ceil(filterReports().length / rowsPerPage)}
            onPageChange={handlePageClick}
            containerClassName={"pagination"}
            pageClassName={"page-item"}
            pageLinkClassName={"page-link"}
            previousClassName={"page-item"}
            nextClassName={"page-item"}
            previousLinkClassName={"page-link"}
            nextLinkClassName={"page-link"}
            activeClassName={"active"}
            disabledClassName={"disabled"}
          />
        </div>
      </div>

      {/* Story Modal */}
      {showModal && selectedReport && (
        <StoryModal
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          selectedNewsItem={selectedReport}
        />
      )}

      {/* Media Modal */}
      {showMediaModal && mediaUrls.length > 0 && (
        <MediaModal
          show={showMediaModal}
          handleClose={handleCloseMediaModal}
          mediaItems={mediaUrls}
          initialIndex={mediaInitialIndex}
        />
      )}
    </div>
  );
};

export default Homepage;
