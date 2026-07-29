import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div style={{ padding: "20px", textAlign: "center", position: "relative", zIndex: 1 }}>
      
      <h1 className="glow">Welcome to Exora ✨</h1>
      <p>Start exploring and exchanging skills</p>

      <div className="nav">
        <Link to="/users"><button className="magic-btn">Users</button></Link>
        <Link to="/match"><button className="magic-btn">Match</button></Link>
        <Link to="/booking"><button className="magic-btn">Book Session</button></Link>
        <Link to="/chat"><button className="magic-btn">Chat</button></Link>
        <Link to="/leaderboard"><button className="magic-btn">Leaderboard</button></Link>
      </div>

    </div>
  );
}