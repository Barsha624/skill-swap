import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/Toast";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Match from "./pages/Match";
import Booking from "./pages/Booking";
import Chat from "./pages/Chat";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

const guard = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

// HashRouter keeps deep links working on GitHub Pages (no server-side rewrites).
export default function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={guard(<Dashboard />)} />
            <Route path="/users" element={guard(<Users />)} />
            <Route path="/match" element={guard(<Match />)} />
            <Route path="/booking" element={guard(<Booking />)} />
            <Route path="/chat" element={guard(<Chat />)} />
            <Route path="/leaderboard" element={guard(<Leaderboard />)} />
            <Route path="/profile" element={guard(<Profile />)} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ToastProvider>
    </ErrorBoundary>
  );
}
