import React, { useState, useEffect, useRef } from "react";
// import "../styles/AddReport.css";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import differenceInHours from 'date-fns/differenceInHours';
import Select from 'react-select'


const AddReportModal = (props) => {
    const [selectedAudios, setSelectedAudios] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [airDate, setAirDate] = useState(new Date());
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
    const [uploadSuccess, setUploadSuccess] = useState(false); // Track if upload is successful
    const [remarks, setRemarks] = useState(""); // Add state for remarks
    const titleRef = useRef(null); // Reference for the Headline text field

    const config = {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
    };

    // Fetch available tags from backend
    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await axios.get("https://api.radiopilipinas.online/nims/tags/view", config);
                setTags(response.data.tagsList || []);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        };

        fetchTags();
    }, []);

    const handleTagChange = (event) => {
        const options = event;
        const selected = [];
        console.log(selected)
        for (let i = 0; i < options.length; i++) {
                selected.push(options[i].label);

        }


        setSelectedTag(selected);
    };

    // Handle selected files and categorize them into audio, image, and video
    const fileSelectedHandler = (event) => {
        const files = Array.from(event.target.files);
        const audios = [];
        const images = [];
        const videos = [];

        files.forEach((file) => {
            if (file.type.startsWith("audio/")) {
                audios.push(file);
            } else if (file.type.startsWith("image/")) {
                images.push(file);
            } else if (file.type.startsWith("video/")) {
                videos.push(file);
            }
        });

        setSelectedAudios(audios);
        setSelectedImages(images);
        setSelectedVideos(videos);
    };

    // Upload the report and files to the backend
    const fileUploadHandler = (event) => {
        event.preventDefault();

        const title = event.target.title.value;
        const selectedTags = selectedTag.join(", ");
        const lead = event.target.lead.value;
        const body = event.target.body.value;
        const currentDate = new Date();
        const hoursDifference = differenceInHours(airDate, currentDate);

        // Check for past air date
        if (hoursDifference < 0) {
            alert("The selected air date is in the past. Please choose a future date.");
            return;
        }

        const fd = new FormData();
        fd.append("title", title);
        fd.append("tags", selectedTags);
        console.log(selectedTags)
        fd.append("lead", lead);
        fd.append("body", body);

        const userId = JSON.parse(localStorage.getItem("user")).id;
        fd.append("userId", userId);

        const formattedDate = airDate.toISOString().split("T")[0];
        fd.append("forDate", formattedDate);
        fd.append("remarks", remarks); // Append remarks to the form data

        selectedAudios.forEach((file) => fd.append("media", file, file.name));
        selectedImages.forEach((file) => fd.append("media", file, file.name));
        selectedVideos.forEach((file) => fd.append("media", file, file.name));

        axios
            .post("https://api.radiopilipinas.online/nims/add", fd, {
                headers: config.headers,
                onUploadProgress: (progressEvent) => {
                    setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
                },
            })
            .then((res) => {
                console.log('2')
                setUploadSuccess(true); // Trigger success message
                props.updateReports(res.data); // Call the updateReports function from parent
                setTimeout(() => {
                    setUploadSuccess(false); // Hide success message after 2 seconds
                    window.location.reload(); // Close the modal
                },);
            })
            .catch((err) => {
                console.log('3')
                console.error(err);
            });
    };

    useEffect(() => {
        document.body.style.overflow = props.isOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [props.isOpen]);

        // Focus on the first text field when the modal opens
        useEffect(() => {
            if (props.isOpen && titleRef.current) {
                titleRef.current.focus();
            }
            document.body.style.overflow = props.isOpen ? 'hidden' : 'unset';
            return () => {
                document.body.style.overflow = 'unset';
            };
        }, [props.isOpen]);


    return (
        <div className={`popup-box ${props.isOpen ? 'open' : ''}`}>
            <div className="backdrop" onClick={props.handleClose}></div>
            <div className="box">
                <span className="close-icon" onClick={props.handleClose}>
                    <i className="fa fa-close"></i>
                </span>
                <form onSubmit={fileUploadHandler}>
                    <div className="table-responsive">
                        <div>
                            <h3>Report Details</h3>
                            <h6>Headline</h6>
                            <textarea
                             ref={titleRef} // Attach the ref to the headline field
                            className="w-100"
                                id="title"
                                name="title"
                                placeholder="Headline.."
                                required

                            />
                            <h6>Tags</h6>

<Select
    isMulti
    name="tags"
    className="selectedTags"
    classNamePrefix="select"
    placeholder="Search.."
    options={tags.length > 0 ? (
                                    tags.map((tag) => (
                                        {value: tag.name, label: tag.name}
                                    ))
                                ): {}}
                                onChange={handleTagChange}
  />

                            <h6>Air Date</h6>
                            <DatePicker
                                id="forDate"
                                name="forDate"
                                selected={airDate}
                                onChange={(date) => setAirDate(date)}
                                dateFormat="MM-dd-yyyy"
                                placeholderText="Select a date"
                                required
                            />

                            <h6>Lead</h6>
                            <textarea
                                className="w-100"
                                id="lead"
                                name="lead"
                                placeholder="Lead.."
                                rows="4"
                                cols="91"
                                required

                            />
                            <h6>Story</h6>
                            <textarea
                            className="w-100"
                                id="body"
                                name="body"
                                placeholder="Story.."
                                rows="7"
                                cols="91"
                                required
                            />

                            <h6>Remarks</h6> {/* Add remarks field */}
                            <textarea
                            className="w-100"
                                id="remarks"
                                name="remarks"
                                placeholder="Add any remarks.."
                                rows="2"
                                cols="91"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                            />

                            <h6>Media Files</h6>
                            <input
                                type="file"
                                multiple
                                accept="audio/*,image/*,video/*"
                                className="choosefile"
                                onChange={fileSelectedHandler}
                                id="media"
                            />

                            <div>
                                <span className="spa">
                                    <button className="btn2 btn-dark btn-lg w-100">Upload</button>
                                </span>
                                {uploadProgress > 0 && (
                                    <p>Upload Progress: {uploadProgress}%</p>
                                )}
                                {uploadSuccess && (
                                    <p style={{ color: "green" }}>Report successfully uploaded!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReportModal;
