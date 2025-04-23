import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import pbsheader from "../logo/pbsheader.png";
import axios from "axios";
import moment from "moment";
import { Button } from "react-bootstrap";
import StoryModal from "./StoryModal"; // Import StoryModal component
import ReactPaginate from "react-paginate"; // Import React Paginate
import "../styles/Pagination.css";

const Homepage = () => {
  const [approvedReports, setApprovedReports] = useState([]);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedReport, setSelectedReport] = useState(null); // Store selected report
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [currentPage, setCurrentPage] = useState(0); // Current page (0-based index)
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
      <div className="container my-2 border p-4 rounded-lg shadow-lg">
        <div className="card shadow-sm p-4">
          <h3 className="text-xl text-center mb-4">APPROVED REPORTS</h3>
          <hr />

          {/* Search input */}
          <input
            type="text"
            className="form-control mb-4"
            placeholder="Search by source, headline, lead, tags, or date/time"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>SOURCE</th>
                  <th>HEADLINE</th>
                  <th>TAGS</th>
                  <th>DATE/TIME</th>
                  <th>STORY</th>
                  <th>REMARKS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.length ? (
                  paginatedReports.map((report) => (
                    <tr key={report._id}>
                      <td width="20%">{report.author.name.first} {report.author.name.last} - {report.author.station}</td>
                      <td>{report.title}</td>
                      <td>{report.tags.join(', ')}</td>
                      <td width="10%">
                        {moment(report.dateCreated).format("MM/DD/YYYY")}
                        <br />
                        {moment(report.dateCreated).format("h:mm:ss a")}
                      </td>
                      <td>
                        <Button style={{ whiteSpace: "nowrap" }} onClick={() => handleShowModal(report)}>
                          Click to see full story
                        </Button>
                      </td>
                      <td>{report.remarks}</td>
                      <td>
                        <Button variant="danger" onClick={() => handleDeleteReport(report._id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">No approved reports found!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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
    </div>
  );
};

export default Homepage;
