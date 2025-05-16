import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar'; // Adjust the import based on your file structure
import { Container, Row, Col, Table, Button, Modal } from 'react-bootstrap'; // Importing Bootstrap components
import ChangePass from './ChangePass'; // Import the ChangePass component

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChangePass, setShowChangePass] = useState(false); // State for showing change password modal

  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"));
  const config = {
    headers: {
      Authorization: "Bearer " + (user ? user.token : ""),
    },
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('https://api.radiopilipinas.online/login/getDetails', config);
        setUserData(response.data.userData); // Access userData from the response
      } catch (error) {
        console.error('Error fetching user data:', error.response ? error.response.data : error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userData) {
    return <div>No user data found.</div>;
  }

  const handleClose = () => setShowChangePass(false);
  const handleShow = () => setShowChangePass(true);

  return (
    <div>
      <Navbar />
      <Container className="my-4" style={{ maxWidth: '900px' }}> {/* Increase max width */}
        <Row className="d-flex justify-content-center">
          <Col md={8} className="text-center">
            <h2 className="mb-4" style={{ fontSize: '2.5rem' }}>User Profile</h2>
            <hr />
            <Table striped bordered hover className="text-left">
              <tbody>
                <tr>
                  <td><strong>Username:</strong></td>
                  <td style={{ fontSize: '1.2rem' }}>{userData.username}</td>
                </tr>
                <tr>
                  <td><strong>First Name:</strong></td>
                  <td style={{ fontSize: '1.2rem' }}>{userData.name.first}</td>
                </tr>
                <tr>
                  <td><strong>Middle Name:</strong></td>
                  <td style={{ fontSize: '1.2rem' }}>{userData.name.middle}</td>
                </tr>
                <tr>
                  <td><strong>Last Name:</strong></td>
                  <td style={{ fontSize: '1.2rem' }}>{userData.name.last}</td>
                </tr>
                <tr>
                  <td><strong>Department:</strong></td>
                  <td style={{ fontSize: '1.2rem' }}>{userData.department}</td>
                </tr>
                <tr>
                  <td><strong>Station:</strong></td>
                  <td style={{ fontSize: '1.2rem' }}>{userData.station}</td>
                </tr>
                <tr>
                  <td><strong>Role:</strong></td>
                  <td style={{ fontSize: '1.2rem' }}>{userData.role}</td>
                </tr>
              </tbody>
            </Table>
            <Button variant="primary" className="mt-3" onClick={handleShow}>Change Password</Button>
          </Col>
        </Row>
      </Container>

      {/* Modal for Change Password */}
      <Modal show={showChangePass} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ChangePass /> {/* Render the ChangePass component inside the modal */}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Profile;
