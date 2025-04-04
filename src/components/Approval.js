import React, { useState, useEffect } from "react";
import "../styles/hp.css";
import Navbar from "./Navbar";
import axios from "axios";
import { Dropdown, Button } from "react-bootstrap";
import moment from "moment";
import StoryModal from "./StoryModal";
import EditStory from "./EditStory";

const Approval = () => {
    const [newsList, setNewsList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedNewsItem, setSelectedNewsItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const config = {
        headers: {
            Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
    };

    const fetchNewsList = async () => {
        try {
            const res = await axios.get("https://api.radiopilipinas.online/nims/view", config);
            const filteredNewsList = res.data.newsDataList.filter(item => !item.approved);
            setNewsList(filteredNewsList);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchNewsList();
    }, []);

    const handleDelete = async (event, id) => {
        event.preventDefault();
        if (window.confirm('Are you sure to delete?')) {
            try {
                await axios.delete(`https://api.radiopilipinas.online/nims/delete/${id}`, config);
                setNewsList((prevList) => prevList.filter((item) => item._id !== id));
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleApprove = async (id) => {
        const confirmApprove = window.confirm("Are you sure you want to approve this report?");
        if (confirmApprove) {
            try {
                await axios.post(`https://api.radiopilipinas.online/nims/${id}/approve`, {}, config);
                fetchNewsList(); // Re-fetch the data after approving
            } catch (err) {
                console.error("Error approving report:", err.response ? err.response.data : err.message);
            }
        }
    };

    const updateNewsList = (updatedItem) => {
        if (!updatedItem || !updatedItem._id) return;

        setNewsList((prevList) =>
            prevList.map((item) => (item._id === updatedItem._id ? updatedItem : item))
        );
    };

    const filterNewsList = () => {
        return newsList.filter((news) => {
            const { title, author, lead, body, tags, dateCreated } = news;
            const formattedDate = moment(dateCreated).format("MM/DD/YYYY, h:mm:ss a");
            const tagsString = Array.isArray(tags) ? tags.join(', ') : tags || '';

            return (
                (author.station && author.station.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (author.name.first && author.name.first.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (author.name.middle && author.name.middle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (author.name.last && author.name.last.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (title && title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (lead && lead.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (body && body.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (tagsString && tagsString.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (formattedDate && formattedDate.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        });
    };

    const handleShowStoryModal = (newsItem) => {
        setSelectedNewsItem(newsItem);
        setShowModal(true);
    };

    const handleShowEditModal = (newsItem) => {
        setSelectedNewsItem(newsItem);
        setShowEditModal(true);
    };

    const handleCloseStoryModal = () => {
        setShowModal(false);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
    };

    const paginateNewsList = () => {
        const filteredNews = filterNewsList();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredNews.slice(startIndex, endIndex);
    };

    const totalPages = Math.ceil(filterNewsList().length / itemsPerPage);

    return (
        <div>
            <Navbar />
            <br />
            <div className="container my-2 border p-4 rounded-lg shadow-lg">
    <div className="card-body ">
        <h3 className="text-xl font-semibold text-gray-700">APPROVAL</h3>
        <hr className="my-4" />
        <input
            type="text"
            className="form-control shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by source, headline, lead, tags, or date/time"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
        />
        <br />

        <div className="overflow-x-auto mt-6">
            <table className="table table-bordered table-hover align-middle w-full">
                <thead className=" table-light bg-gray-100 text-gray-600 text-sm uppercase tracking-wide">
                    <tr>
                        <th className="px-4 py-2 text-left w-1/6">SOURCE</th>
                        <th className="px-4 py-2 text-left w-1/6">HEADLINE</th>
                        <th className="px-4 py-2 text-left w-1/4">LEAD</th>
                        <th className="px-4 py-2 text-left w-1/6">TAGS</th>
                        <th className="px-4 py-2 text-left w-1/6">DATE/TIME</th>
                        <th className="px-4 py-2 text-left w-1/6">STORY</th>
                        <th className="px-4 py-2 text-left w-1/6">REMARKS</th>
                        <th className="px-4 py-2 text-left w-1/6">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    {paginateNewsList().length ? (
                        paginateNewsList().map((value) => (
                            <tr key={value._id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-800 truncate">
                                    {value.author.name.first} {value.author.name.last} - {value.author.station}
                                </td>
                                <td className="px-4 py-2 text-gray-800 truncate">{value.title}</td>
                                <td className="px-4 py-2 text-gray-800 truncate">{value.lead}</td>
                                <td className="px-4 py-2 text-gray-800 truncate">{value.tags.join(', ')}</td>
                                <td className="px-4 py-2 text-gray-800">
                                    {moment(value.dateCreated).format("MM/DD/YYYY")}
                                    <br />
                                    {moment(value.dateCreated).format("h:mm:ss a")}
                                </td>
                                <td width="12%"className="px-4 py-2 text-blue-600 hover:text-blue-800 truncate">
                                    <Button
                                        className="text-blue-600 hover:underline"

                                        onClick={() => handleShowStoryModal(value)}
                                        style={{whiteSpace: "nowrap"}}
                                    >
                                        Click to see full story
                                    </Button>
                                </td>
                                <td className="px-4 py-2 text-gray-800 truncate">{value.remarks}</td>
                                <td className="px-4 py-2 text-gray-800">
                                    <Dropdown>
                                        <Dropdown.Toggle variant="success" id="dropdown-basic" className="w-full">
                                            Action
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleApprove(value._id)}>
                                                Approve
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleShowEditModal(value)}>
                                                Edit
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                className="text-red-500"
                                                onClick={(event) => handleDelete(event, value._id)}
                                            >
                                                Delete
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="text-center text-gray-500">No news found! 😢</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <nav className="mt-4">
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>
                            Previous
                        </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, index) => (
                        <li
                            key={index}
                            className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
                        >
                            <button className="page-link" onClick={() => setCurrentPage(index + 1)}>
                                {index + 1}
                            </button>
                        </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        )}
    </div>
</div>

            {/* Story Modal */}
            {showModal && selectedNewsItem && (
                <StoryModal
                    showModal={showModal}
                    handleCloseModal={handleCloseStoryModal}
                    selectedNewsItem={selectedNewsItem}
                    updateNewsList={updateNewsList}
                />
            )}

            {/* Edit Modal */}
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

export default Approval;
