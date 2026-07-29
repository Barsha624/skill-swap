import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Users from "./pages/Users";
import Match from "./pages/Match";
import Login from "./pages/Login";
import Leaderboard from "./pages/Leaderboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./pages/Chat";
import Booking from "./pages/Booking";
import Profile from "./pages/Profile";
import Runes from "./components/Runes";
import SparkleCursor from "./components/SparkleCursor";
import Dashboard from "./pages/Dashboard";

function App() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={darkMode ? "dark" : "light"}>
      <BrowserRouter>
        <button className="magic-btn"
      onClick={() => {
        setDarkMode(!darkMode);
        document.body.className = darkMode ? "light" : "dark";
      }}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 999
      }}
    >
      Theme
    </button>
        <SparkleCursor />
        <Runes />

        <Routes>
          <Route path="/" element={<Home />} />
<Route path="/register" element={<Register />} />
<Route path="/login" element={<Login />} />
<Route path="/chat" element={<Chat />} />
<Route path="/booking" element={<Booking />} />
<Route path="/profile" element={<Profile />} />
<Route path="/dashboard" element={<Dashboard />} />

<Route
  path="/users"
  element={
    <ProtectedRoute>
      <Users />
    </ProtectedRoute>
  }
/>

<Route
  path="/match"
  element={
    <ProtectedRoute>
      <Match />
    </ProtectedRoute>
  }
/>

<Route
  path="/leaderboard"
  element={
    <ProtectedRoute>
      <Leaderboard />
    </ProtectedRoute>
  }
/>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;