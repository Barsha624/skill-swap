import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/notifications/all"
      );
      setNotifications(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px", position: "relative", zIndex: 1 }}>

      {/* 👤 Avatar + 🔔 Bell */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "30px",
          display: "flex",
          gap: "15px",
          alignItems: "center"
        }}
      >

        {/* 👤 Avatar */}
        <div
          onClick={() => navigate("/profile")}
          style={{
            width: "35px",
            height: "35px",
            borderRadius: "50%",
            background: "#555",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          👤
        </div>

        {/* 🔔 Bell */}
        <div
          style={{
            cursor: "pointer",
            fontSize: "26px"
          }}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          🔔
        </div>
      </div>

      {/* 🔔 Notification Dropdown */}
      {showNotifications && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "20px",
            width: "300px",
            background: "white",
            border: "1px solid gray",
            borderRadius: "10px",
            padding: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            zIndex: 100
          }}
        >
          <h4>Notifications</h4>

          {notifications.length === 0 ? (
            <p>No notifications yet</p>
          ) : (
            notifications.map((n, index) => (
              <div
                key={index}
                style={{
                  borderBottom: "1px solid #ddd",
                  padding: "8px 0"
                }}
              >
                {n.message}
              </div>
            ))
          )}
        </div>
      )}

      {/* 🚀 HERO SECTION */}
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        <h1 className="glow">Exora 🚀</h1>

        <p style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "auto" }}>
          Learn, teach, and grow together.<br></br>
          Exchange skills with people around the world. <br></br> Build real connections.<br></br>
        </p>

        <div className="nav" style={{ marginTop: "20px" }}>
          <Link to="/register">
            <button className="magic-btn"> <u>Get Started</u></button> 
            </Link>  
        </div>

        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#f7f0fc" }}>
            Login now
          </Link>
        </p>
      </div>

      {/* 💡 ABOUT */}
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h2 className="glow">What is Exora?</h2>

        <p style={{ maxWidth: "700px", margin: "auto" }}>
          Want to learn new skills!! but you ain't tryna pay no money...🤔<br></br>
          Like Pay!? In this <i>economy!!!</i> <br></br>
          Well we understand and don't worry. We got you 😉 <br></br>
          Introducing Exora...<br></br>
          Exora is a skill exchange platform where you can learn whatever you want 
          and in exchange teach what you got — all through meaningful collaborations. <br></br>
          No money involved, just knowledge sharing.<br></br>
          Sounds too good to be true right? But it is what it is.😌
        </p>
      </div>

      {/* ⚡ FEATURES */}
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h2 className="glow">Features</h2>

        <div className="nav">
          <div className="card">
            <h3>🤝 Skill Matching</h3>
            <p>Find people who match your learning and teaching goals.</p>
          </div>

          <div className="card">
            <h3>💬 Real-Time Chat</h3>
            <p>Connect instantly and start learning together.</p>
          </div>

          <div className="card">
            <h3>📅 Book Sessions</h3>
            <p>Schedule sessions and manage your learning easily.</p>
          </div>

          <div className="card">
            <h3>⭐ Reviews & Ratings</h3>
            <p>Build trust with feedback from real learners.</p>
          </div>
        </div>
      </div>

      {/* 🚀 CTA */}
      <div style={{ textAlign: "center", marginTop: "60px" }}>
        <h2 className="glow">Start Your Journey ✨</h2>
        <p>Join Exora today and unlock limitless learning.</p>

        <Link to="/auth">
          <button className="magic-btn">Join Now</button>
        </Link>
      </div>

      <div style={{ textAlign: "center", marginTop: "60px" }}>
        
        
        
      </div>

    </div>
  );
}