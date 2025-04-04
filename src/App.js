import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/Login";
import Homepage from "./components/Homepage";
import News from "./components/News";
import Tags from "./components/Tags";
import Approval from "./components/Approval";
import Program from "./components/Program";
import Sequence from "./components/Sequence";
import MajorNews from "./components/MajorNews";
import NewsBreak from "./components/NewsBreak";
import Profile from "./components/Profile";
import ReactLoading from "react-loading";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // Mock API request to demonstrate loading state
    handleStart();
    setTimeout(handleComplete, 2000); // Simulates network delay

    return () => {
      setLoading(false); // Cleanup in case of unmounting
    };
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        {loading ? (
          <div className="loading-overlay">
            <div className="text-center">
              <ReactLoading type="spinningBubbles" color="red" height={50} width={50} />

            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/approval" element={<Approval />} />
            <Route path="/news" element={<News />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/program" element={<Program />} />
            <Route path="/sequence" element={<Sequence />} />
            <Route path="/majornews" element={<MajorNews />} />
            <Route path="/newsbreak" element={<NewsBreak />} />
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
