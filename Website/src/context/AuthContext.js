import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let auth = localStorage.getItem("userDetails");
    if (!auth) {
      auth = sessionStorage.getItem("userDetails");
    }
    if (auth) {
      setUser(JSON.parse(auth));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    // Clear all relevant authentication data
    localStorage.removeItem("userDetails");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
