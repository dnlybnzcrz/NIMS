import React from "react";
import "../styles/AddReport.css";

const DeleteStoryModal = (props) => {
  return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={props.handleClose}>
          <i className="fa fa-close"></i>
        </span>
        <div></div>
      </div>
    </div>
  );
};

export default DeleteStoryModal;
