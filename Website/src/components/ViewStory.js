import React, { useState, useEffect } from "react";

import "../styles/AddReport.css";
import axios from "axios";



const ViewStory = (props) => {


  const [newsList, setNewsList] = useState([]);



  const config = {
    headers: {
      Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
    },
  };

  useEffect(() => {
    axios
      .get("https://api.radiopilipinas.online/nims/view", config)
      .then((res) => {
        // console.log(res.data.newsDataList);
        setNewsList(res.data.newsDataList);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);


  return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={props.handleClose}>
          <i className="fa fa-close"></i>
        </span>
        <div>
          <p>
            <b>NEWS STORY</b>
          </p>
          <table className="table align-middle">
          <thead>
          <tbody>

{newsList.length ? (
  newsList.map((value, index) => {

    return (
      <tr>
        <td width= "50%" >{value.lead}</td>
        <td width= "100%">{value.body}</td>
        <td width= "50%">
          {value.author.name.first} {value.author.name.middle}{" "}
          {value.author.name.last}{" "}
        </td>
        <td>

        </td>


        <td width= "18%">{value.tags}</td>


<td>
</td>
                      </tr>
                    );
                  })
                ) : (
                  <div>None</div>
                )}
              </tbody>
          </thead>
              <tbody>
                <tr>
                  {/* <td>{props.story.name}</td>
                  <td>{props.story.body}</td> */}
                </tr>
              </tbody>
                </table>


          {/* <p>LEAD: {props.content.lead}</p>
          <p>{props.content.body}</p>
          <p>{props.content.files}</p> */}
        </div>
      </div>
    </div>
  );
};

export default ViewStory;
