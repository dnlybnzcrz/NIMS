import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";


const Navigation = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("userDetails");
    if (auth) {
      setUser(JSON.parse(auth)); // Set the user state with user data from local storage
    }
  }, []);

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear(); // Clear user data from local storage
      navigate("/"); // Redirect to home page
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand href="#home">PBS NIMS</Navbar.Brand>
        <Navbar.Toggle
  aria-controls="basic-navbar-nav"
  className="custom-toggle"
/>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                {["reporter", "producer", "editor", "super", "programmer"].includes(
                  user.role
                ) && (
                  <>
                    <NavLink to="/homepage" className="nav-link">
                      Home
                    </NavLink>
                    <NavLink to="/news" className="nav-link">
                      News
                    </NavLink>
                    {["producer", "editor", "super", "programmer"].includes(
                      user.role
                    ) && (
                      <>
                        <NavLink to="/approval" className="nav-link">
                          Approval
                        </NavLink>
                        <NavLink to="/tags" className="nav-link">
                          Tags
                        </NavLink>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </Nav>
          <Nav className="ms-auto">
            <NavLink to="/profile" className="nav-link">
              Hello, {user ? user.name.first : "Guest"}
            </NavLink>
            <Nav.Link onClick={logout} className="nav-link">
              Logout
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
