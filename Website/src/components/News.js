import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import pbsheader from "../logo/pbsheader.png";
import axios from "axios";
import AddReportModal from "./AddReportModal";
import EditStory from "./EditStory"; // Import your EditStory component
import moment from "moment";
import "../styles/News.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown"; // Import Dropdown from react-bootstrap
import ReactPaginate from "react-paginate"; // Import react-paginate

const News = () => {
    const [newsList, setNewsList] = useState([]);
    const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
    const [isViewMediaModalOpen, setIsViewMediaModalOpen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedNewsItem, setSelectedNewsItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 20; // Set items per page

    const userData = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
    const config = {
        headers: {
            Authorization: "Bearer " + (userData ? userData.token : ""),
        },
    };

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await axios.get("https://api.radiopilipinas.online/nims/view", config);
            setNewsList(res.data.newsDataList);
        } catch (err) {
            console.log(err);
        }
    };

    const toggleAddReportModal = () => {
        setIsAddReportModalOpen(!isAddReportModalOpen);
    };

    const handleViewMedia = (files) => {
        setSelectedMedia(files);
        setIsViewMediaModalOpen(true);
    };

    const closeViewMediaModal = () => {
        setIsViewMediaModalOpen(false);
        setSelectedMedia(null);
        document.body.style.overflow = "unset"; // Re-enable body scroll
    };

    const handleReportAdded = (newReport) => {
        setNewsList((prevNewsList) => [newReport, ...prevNewsList]);
    };

    const handleEdit = (newsItem) => {
        setSelectedNewsItem(newsItem);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedNewsItem(null);
    };

    const updateNewsList = (updatedNews) => {
        setNewsList((prevNewsList) =>
            prevNewsList.map((news) =>
                news._id === updatedNews._id ? updatedNews : news
            )
        );
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this news item?");
        if (confirmDelete) {
            try {
                await axios.delete(`https://api.radiopilipinas.online/nims/delete/${id}`, config);
                setNewsList((prevNewsList) => prevNewsList.filter((news) => news._id !== id));
            } catch (err) {
                console.log(err);
            }
        }
    };

    const filteredNewsList = newsList.filter((news) => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const authorFirstName = news.author && news.author.name ? news.author.name.first : '';
        const authorMiddleName = news.author && news.author.name ? news.author.name.middle : '';
        const authorLastName = news.author && news.author.name ? news.author.name.last : '';
        const authorFullName = `${authorFirstName} ${authorMiddleName} ${authorLastName}`.toLowerCase();

        return (
            (news.author.station && news.author.station.toLowerCase().includes(searchQuery.toLowerCase())) ||
            authorFullName.includes(lowerCaseQuery) ||
            (news.lead && news.lead.toLowerCase().includes(lowerCaseQuery)) ||
            (news.body && news.body.toLowerCase().includes(lowerCaseQuery)) ||
            (news.tags && Array.isArray(news.tags) && news.tags.some(tag => tag && tag.toLowerCase().includes(lowerCaseQuery))) ||
            (news.dateCreated && moment(news.dateCreated).format("MM/DD/YYYY, h:mm:ss a").includes(lowerCaseQuery))
        );
    });

    const pageCount = Math.ceil(filteredNewsList.length / itemsPerPage);
    const displayedNews = filteredNewsList.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    const handlePageClick = (event) => {
        setCurrentPage(event.selected);
    };

    return (
        <div>
        <div style={{ backgroundColor: "#F1EFEC", padding: "10px 0", textAlign: "center" }}>
          <img src={pbsheader} alt="PBS Header" style={{ maxWidth: "100%", height: "auto" }} />
        </div>
        <Navbar />
        <br />
        <div className="container my-2 border p-4 rounded-lg shadow-lg">
            <div className="card-body  ">
                <h3 className="text-xl font-semibold text-gray-700">NEWS</h3>

                {/* Add Report Button */}
                <div className="flex justify-between mb-4">
                    <button
                        type="button"
                        className="btn btn-primary btn-sm shadow-md transition-transform transform hover:scale-105"
                        onClick={toggleAddReportModal}
                    >
                        Add Report
                    </button>
                    {isAddReportModalOpen && (
                        <AddReportModal
    handleClose={toggleAddReportModal}
    updateReports={handleReportAdded}
    fullscreen="sm-down" /* Makes the modal fullscreen on small screens */
    show={isAddReportModalOpen}
/>
                    )}
                </div>

                {/* Search Input */}
                <div className="mt-4 mb-4">
                    <input
                        type="text"
                        className="form-control shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by source, lead, body, tags, or date/time"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <hr />

                {/* Responsive Table */}
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="table table-bordered  table-hover align-middle w-full">
                        <thead className="bg-primary text-white text-sm uppercase tracking-wide table-light">
                            <tr>
                                <th className="px-4 py-2 text-left w-1/5">SOURCE</th>
                                <th className="px-4 py-2 text-left w-1/4">LEAD</th>
                                <th className="px-4 py-2 text-left w-1/6">TAGS</th>
                                <th className="px-4 py-2 text-left w-1/6">DATE/TIME</th>
                                <th className="px-4 py-2 text-left w-1/6">MEDIA</th>
                                <th className="px-4 py-2 text-left w-1/6">REMARKS</th>
                                <th className="px-4 py-2 text-left w-1/6">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedNews.length ? (
                                displayedNews.map((value, index) => (
                                    <tr key={index} className="hover:bg-gray-100">
                                        <td className="px-4 py-2 text-sm truncate">
                                            {value.author && value.author.name
                                                ? `${value.author.name.first || 'N/A'} ${value.author.name.last || 'N/A'} - ${value.author.station}`
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 py-2 text-sm truncate">{value.lead}</td>
                                        <td className="px-4 py-2 text-sm truncate">
                                            {value.tags && Array.isArray(value.tags) && value.tags.length > 0
                                                ? value.tags.join(", ")
                                                : 'No tags selected'}
                                        </td>
                                        <td className="px-4 py-2 text-sm truncate">
                                            {moment(value.dateCreated).format("MM/DD/YYYY")}
                                            <br />
                                            {moment(value.dateCreated).format("h:mm:ss a")}
                                        </td>
                                        <td className="px-4 py-2 text-sm truncate">
                                            {value.files &&
                                            (value.files.audios.length > 0 || value.files.images.length > 0 || value.files.videos.length > 0) ? (
                                                <button
                                                    className="btn btn-secondary btn-sm shadow-sm hover:bg-gray-300"
                                                    onClick={() => handleViewMedia(value.files)}

                                                    style={{whiteSpace: "nowrap"}}
                                                >
                                                    View Media ({(value.files.audios.length || 0) +
                                                    (value.files.images.length || 0) +
                                                    (value.files.videos.length || 0)})

                                                </button>
                                            ) : (
                                                <p className="text-sm text-gray-500">N/A</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 text-sm truncate">{value.remarks}</td>
                                        <td className="px-4 py-2 text-sm">
                                            <Dropdown>
                                                <Dropdown.Toggle variant="success" id="dropdown-basic" className="shadow-sm">
                                                    Actions
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => handleEdit(value)}>Edit</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => handleDelete(value._id)}>Delete</Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center text-gray-500">
                                        No news found 😢
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <ReactPaginate
                    previousLabel={"Previous"}
                    nextLabel={"Next"}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={5}
                    onPageChange={handlePageClick}
                    containerClassName={"pagination flex justify-center mt-4"}
                    activeClassName={"active"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousClassName={"page-item"}
                    nextClassName={"page-item"}
                    previousLinkClassName={"page-link"}
                    nextLinkClassName={"page-link"}
                    breakClassName={"page-item"}
                    breakLinkClassName={"page-link"}
                />
            </div>
        </div>

            {/* Modal for displaying media files */}
            <Modal show={isViewMediaModalOpen} onHide={closeViewMediaModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Media Files</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMedia && (
                        <div>
                            {selectedMedia.audios && selectedMedia.audios.length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-lg">Audio Files</h5>
                                    {selectedMedia.audios.map((audio, index) => (
                                        <audio key={index} controls className="w-full mb-2">
                                            <source
                                                src={`https://pbs-nims.s3.ap-southeast-1.amazonaws.com${audio}`}
                                                type="audio/mpeg"
                                            />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ))}
                                </div>
                            )}
                            {selectedMedia.images && selectedMedia.images.length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-lg">Images</h5>
                                    {selectedMedia.images.map((image, index) => (
                                        <img
                                            key={index}
                                            src={`https://pbs-nims.s3.ap-southeast-1.amazonaws.com${image}`}
                                            alt={`news-image-${index}`}
                                            className="w-1/4 m-2 shadow-sm rounded-lg"
                                            style={{ width: "200px", margin: "5px" }}
                                        />
                                    ))}
                                </div>
                            )}
                            {selectedMedia.videos && selectedMedia.videos.length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-lg">Videos</h5>
                                    {selectedMedia.videos.map((video, index) => (
                                        <video key={index} controls className="w-full mb-2"  style={{ width: "100%" }}>
                                            <source
                                                src={`https://pbs-nims.s3.ap-southeast-1.amazonaws.com${video}`}
                                                type="video/mp4"
                                            />
                                            Your browser does not support the video tag.
                                        </video>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeViewMediaModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit Story Modal */}
            {showEditModal && selectedNewsItem && (
                <EditStory
                    showModal={showEditModal}
                    handleClose={handleCloseEditModal}
                    content={selectedNewsItem}
                    handleStoryUpdate={updateNewsList}
                />
            )}
        </div>
    );

};

export default News;
