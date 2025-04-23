import React from "react";
import { diffLines } from "diff"; // Use diff library for line-by-line comparison
import "../styles/CompareModal.css";

const CompareModal = ({ original, latest, onClose }) => {
  const normalizeContent = (content) =>
    content ? content.replace(/\r\n|\r|\n/g, "\n").trim() : "";

  // Combine relevant fields into a single string for comparison
  const formatReport = (report) =>
    report
      ? `Title: ${report.title || ""}\nLead: ${report.lead || ""}\nBody: ${
          report.body || ""
        }\nRemarks: ${report.remarks || ""}`
      : "";

  const originalContent = normalizeContent(formatReport(original));
  const latestContent = normalizeContent(formatReport(latest));

  // Debug: Log the data
  console.log("Original Content:", originalContent);
  console.log("Latest Content:", latestContent);

  if (!originalContent || !latestContent) {
    return (
      <div className="popup-box">
        <div className="box">
          <span className="close-icon" onClick={onClose}>
            <i className="fa fa-close"></i>
          </span>
          <h3>Compare Changes</h3>
          <p>No content available for comparison.</p>
        </div>
      </div>
    );
  }

  const differences = diffLines(originalContent, latestContent);

  return (
    <div className="popup-box">
      <div className="box">
        <span className="close-icon" onClick={onClose}>
          <i className="fa fa-close"></i>
        </span>
        <h3>Compare Changes</h3>
        <div className="diff-container">
          {differences.map((part, index) => {
            const { value, added, removed } = part;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: added
                    ? "#c8e6c9" // Green for added lines
                    : removed
                    ? "#ffcccb" // Red for removed lines
                    : "",
                  textDecoration: removed ? "line-through" : "none",
                }}
              >
                {value}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
