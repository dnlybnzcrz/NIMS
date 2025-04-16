import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = localStorage.getItem("userDetails");
    if (auth) {
      setUser(JSON.parse(auth));
    }
    setLoading(false);
  }, []);

  const logout = () => {
    // Clear only relevant authentication data
    localStorage.removeItem("userDetails");
    // You can add other keys to clear if needed
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
