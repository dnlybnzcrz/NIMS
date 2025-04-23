import React, { useState } from "react";
import axios from "axios";

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const config = {
        headers: {
            Authorization: "Bearer " + JSON.parse(localStorage.getItem("user")).token,
        },
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            return;
        }

        try {
            const response = await axios.post(
                "https://api.radiopilipinas.online/login/changePassword",
                {
                    oldPassword, // using the "oldPassword" field
                    newPassword, // using the "newPassword" field
                },
                config
            );

            setMessage(response.data.message || "Password changed successfully.");
            setError("");
        } catch (err) {
            setError(err.response ? err.response.data.error : "An error occurred.");
            setMessage("");
        }
    };

    return (
        <div className="container mt-5">
            <h3>Change Password</h3>
            <form onSubmit={handlePasswordChange}>
                <div className="form-group">
                    <label>Current Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                {message && <div className="alert alert-success mt-3">{message}</div>}
                {error && <div className="alert alert-danger mt-3">{error}</div>}
                <button type="submit" className="btn btn-primary mt-3">
                    Change Password
                </button>
            </form>
        </div>
    );
};

export default ChangePassword;
