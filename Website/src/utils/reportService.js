import axios from "axios";

const API_URL = "https://api.radiopilipinas.online/nims/view";

/**
 * Fetch approved reports from the backend API.
 * @param {string} token - Authorization token.
 * @returns {Promise<Array>} - Promise resolving to an array of approved reports.
 */
export async function fetchApprovedReports(token) {
  const config = {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
  try {
    const response = await axios.get(API_URL, config);
    const approvedReports = response.data.newsDataList.filter(
      (report) => report.approved === true
    );
    return approvedReports;
  } catch (error) {
    console.error("Error fetching approved reports:", error);
    throw error;
  }
}

/**
 * Filter reports based on a search query.
 * @param {Array} reports - Array of report objects.
 * @param {string} query - Search query string.
 * @returns {Array} - Filtered array of reports.
 */
export function filterReports(reports, query) {
  if (!query) return reports;

  const lowerQuery = query.toLowerCase();

  return reports.filter((report) => {
    const { author, lead, tags, dateCreated } = report;
    const formattedDate = new Date(dateCreated).toLocaleString();
    const tagsToSearch = Array.isArray(tags) ? tags.join(", ") : "";

    return (
      (author.station && author.station.toLowerCase().includes(lowerQuery)) ||
      (author.name.first && author.name.first.toLowerCase().includes(lowerQuery)) ||
      (author.name.middle && author.name.middle.toLowerCase().includes(lowerQuery)) ||
      (author.name.last && author.name.last.toLowerCase().includes(lowerQuery)) ||
      (lead && lead.toLowerCase().includes(lowerQuery)) ||
      tagsToSearch.toLowerCase().includes(lowerQuery) ||
      (formattedDate && formattedDate.toLowerCase().includes(lowerQuery))
    );
  });
}
