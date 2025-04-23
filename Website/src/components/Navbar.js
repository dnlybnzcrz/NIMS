import React, { useContext, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Navbar.css";
import { AuthContext } from "../context/AuthContext";
import LogoutModal from "./LogoutModal";
import userIcon from "../logo/user2.png";

const Navigation = () => {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutModal(false);
    navigate("/");
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const hasRole = (roles) => {
    return user && roles.includes(user.role);
  };

  if (loading) {
    return (
      <Navbar expand="lg" className="navbar-custom" aria-busy="true">
        <Container>
          <Navbar.Brand as={NavLink} to="/homepage">PBS NIMS</Navbar.Brand>
          <div>Loading...</div>
        </Container>
      </Navbar>
    );
  }

  return (
    <>
      <Navbar expand="lg" className="navbar-custom">
        <Container>
          <Navbar.Brand as={NavLink} to="/homepage">PBS NIMS</Navbar.Brand>
          <div className="toggle-and-usericon-wrapper d-lg-none" style={{ display: 'flex', alignItems: 'center' }}>
            <NavLink to="/profile" className="user-icon-mobile" aria-label="User Profile" style={{ marginRight: '10px' }}>
              <img src={userIcon} alt="User Icon" className="user-icon-image" />
            </NavLink>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              aria-label="Toggle navigation"
              className="custom-toggle"
            />
          </div>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {hasRole(["reporter", "producer", "editor", "super", "programmer"]) && (
                <>
                  <NavLink to="/homepage" className="nav-link" aria-current="page">
                    Home
                  </NavLink>
                  <NavLink to="/news" className="nav-link">
                    News
                  </NavLink>
                  {hasRole(["producer", "editor", "super", "programmer"]) && (
                    <>
                      <NavLink to="/approval" className="nav-link">
                        Approval
                      </NavLink>
                      <NavLink to="/tags" className="nav-link">
                        Tags
                      </NavLink>
                      <NavLink to="/approvedreports" className="nav-link">
                        Approved Reports
                      </NavLink>
                    </>
                  )}
                </>
              )}
            </Nav>
            <Nav className="ms-auto">
              <NavLink to="/profile" className="nav-link user-greeting d-none d-lg-block">
                Hello, {user ? user.name.first : "Guest"}
              </NavLink>
              <Nav.Link onClick={handleLogoutClick} className="nav-link" role="button" tabIndex={0}>
                Logout
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <LogoutModal
        show={showLogoutModal}
        handleClose={handleLogoutCancel}
        handleConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Navigation;
