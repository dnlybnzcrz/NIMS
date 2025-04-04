
import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useLocation } from "react-router-dom";
import moment from "moment"; // Import moment to format date if needed

const Newsbreak = () => {
  const location = useLocation();

  // Replace optional chaining with a null check
  const [stories, setStories] = useState((location.state && location.state.stories) || []);

  // On component mount, load stories from localStorage
  useEffect(() => {
    const storedStories = JSON.parse(localStorage.getItem('newsbreakStories')) || [];
    if (storedStories.length) {
      setStories(storedStories); // Load stories from localStorage if available
    }
  }, []);

  // On every update to the `stories` state, save the stories to localStorage
  useEffect(() => {
    if (stories.length) {
      localStorage.setItem('newsbreakStories', JSON.stringify(stories));
    }
  }, [stories]);

  const handleDelete = (index) => {
    const updatedStories = stories.filter((story, i) => i !== index);
    setStories(updatedStories); // Update state with the remaining stories
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        {stories.length ? (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Story</th>
                <th>Reporter</th>
                <th>Date Created</th>
              </tr>
            </thead>
            <tbody>
              {stories.map((story, index) => (
                <tr key={index}>
                  <td>{story.lead}</td>
                  <td>{story.body}</td>
                  <td>{story.author.name.first} {story.author.name.middle} {story.author.name.last}</td>
                  <td>{moment(story.dateCreated).format("MM/DD/YYYY, h:mm:ss a")}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No story selected</p>
        )}
      </div>
    </div>
  );
};

export default Newsbreak;
