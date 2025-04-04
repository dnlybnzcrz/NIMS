import React, { useState } from "react";
import "../styles/Login.css";
import profile from "../logo/user2.png";
import user from "../logo/user.png";
import passwordImg from "../logo/pss.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = JSON.stringify({ username, password });

    try {
      const response = await axios.post(
        `https://api.radiopilipinas.online/login`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("user", JSON.stringify(response.data));

      const userDetailsResponse = await axios.get(
        `https://api.radiopilipinas.online/login/getDetails`,
        {
          headers: {
            Authorization: `Bearer ${response.data.token}`,
          },
        }
      );

      localStorage.setItem("userDetails", JSON.stringify(userDetailsResponse.data.userData));
      navigate("/homepage");
    } catch (err) {
      alert("Incorrect username or password!");
      console.log(err);
    }
  };

  return (
    <section className="main">
      <div className="sub-main">
        <div className="container-img">
          <img src={profile} alt="profile" className="profile" />
        </div>
        <h1>LOGIN</h1>
        <form name="login" onSubmit={handleLogin}>
          <div className="form-group position-relative">
            <img src={user} alt="user" className="user" />
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              required
            />
          </div>
          <div className="form-group position-relative">
            <img src={passwordImg} alt="password" className="user" />
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
          <div className="form-group">
            <button type="submit" className="login-btn">Login</button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default LoginForm;
