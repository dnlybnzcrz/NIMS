import React, { useState, useContext } from "react";
import "../styles/Login.css";
import profile from "../logo/user2.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { AuthContext } from "../context/AuthContext";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    const data = JSON.stringify({ username, password });

    try {
      const response = await axios.post(
        `https://api.radiopilipinas.online/login`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      if (rememberMe) {
        localStorage.setItem("user", JSON.stringify(response.data));
      } else {
        sessionStorage.setItem("user", JSON.stringify(response.data));
      }

      const userDetailsResponse = await axios.get(
        `https://api.radiopilipinas.online/login/getDetails`,
        {
          headers: {
            Authorization: `Bearer ${response.data.token}`,
          },
        }
      );

      localStorage.setItem(
        "userDetails",
        JSON.stringify(userDetailsResponse.data.userData)
      );

      setUser(userDetailsResponse.data.userData);

      navigate("/homepage");
    } catch (err) {
      setErrorMessage("Incorrect username or password!");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="main">
      <div className="sub-main" role="main">
        {/* Header Section with background image */}
        <div className="header"></div>
        <div className="container-img">
          <img src={profile} alt="profile" className="profile" />
        </div>
        <h1 tabIndex="0">LOGIN</h1>
        <form name="login" onSubmit={handleLogin} aria-describedby="error-message">
          <div className="form-group-wrapper">
            <label htmlFor="username" className="sr-only">Username</label>
            <i className="fas fa-user icon-left" aria-hidden="true" />
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              required
              aria-required="true"
              aria-invalid={errorMessage ? "true" : "false"}
            />
          </div>
          <div className="form-group-wrapper">
            <label htmlFor="password" className="sr-only">Password</label>
            <i className="fas fa-lock icon-left" aria-hidden="true" />
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              className="form-control"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
              aria-required="true"
              aria-invalid={errorMessage ? "true" : "false"}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setPasswordVisible(!passwordVisible)}
              aria-label={passwordVisible ? "Hide password" : "Show password"}
            >
              <i className={`fa ${passwordVisible ? "fa-eye-slash" : "fa-eye"}`} aria-hidden="true" />
            </button>
          </div>

          {/* Inline error message */}
          {errorMessage && (
            <div id="error-message" className="error-message" role="alert" tabIndex="0">
              {errorMessage}
            </div>
          )}

          {/* Remember me checkbox */}
          <div className="remember-me">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              aria-checked={rememberMe}
            />
            <label htmlFor="rememberMe">Remember me</label>
          </div>

          <div className="form-group">
            <button
              type="submit"
              className="login-btn"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="spinner" aria-label="Loading"></span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default LoginForm;
