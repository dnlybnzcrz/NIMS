import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import moment from "moment";
import StoryModal from "./StoryModal"; // Import StoryModal component
import ReactPaginate from "react-paginate"; // Import React Paginate
import MediaModal from "./MediaModal"; // Import MediaModal component
import pbsheader from "../logo/pbsheader.png";
import "../styles/Pagination.css";
import "../styles/Homepage.css";
import ReportCard from "./ReportCard"; // Import ReportCard component
import { Button } from "react-bootstrap";

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
  const [loading, setLoading] = useState(false); // Loading state for data fetch
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
    setLoading(true);
    axios
      .get("https://api.radiopilipinas.online/nims/view", config)
      .then((res) => {
        const filteredApprovedReports = res.data.newsDataList.filter(report => report.approved === true);
        setApprovedReports(filteredApprovedReports);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
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
      <div style={{ backgroundColor: "#F1EFEC", padding: "10px 0", textAlign: "center" }}>
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
            aria-label="Search reports"
            role="search"
          />

          {loading ? (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : paginatedReports.length ? (
            <div className="feed">
              {paginatedReports.map((report, index) => (
                <React.Fragment key={report._id}>
                  <ReportCard
                    report={report}
                    handleShowModal={handleShowModal}
                    handleDeleteReport={handleDeleteReport}
                    handleShowMediaModal={handleShowMediaModal}
                    searchQuery={searchQuery}
                  />
                  {index !== paginatedReports.length - 1 && (
                    <hr style={{ borderTop: "3px solid #555", margin: "20px 0" }} />
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center my-4">No approved reports found!</div>
          )}

          <ReactPaginate
            previousLabel={<span aria-label="Previous page">&laquo; Previous</span>}
            nextLabel={<span aria-label="Next page">Next &raquo;</span>}
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
            ariaLabelBuilder={(page) => `Go to page ${page}`}
            role="navigation"
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
