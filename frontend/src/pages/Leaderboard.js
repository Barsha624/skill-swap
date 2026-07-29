import { useEffect, useState } from "react";
import axios from "axios";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users")
      .then(res => {
        const sortedUsers = res.data.sort(
          (a, b) => b.skillsOffered.length - a.skillsOffered.length
        );
        setUsers(sortedUsers);
      })
      .catch(err => console.log(err));
  }, []);
  <div style={{ position: "relative", zIndex: 1 }}>
  {/* your entire page content */}
</div>

  return (
    <div style={{ padding: "20px" }}>
      <h2>🏆 Leaderboard</h2>

      {users.map((u, index) => (
        <div key={index} className="card">
          <h3>
            {index === 0 && "🥇 "}
            {index === 1 && "🥈 "}
            {index === 2 && "🥉 "}
            {u.name}
          </h3>

          <p><b>Skills Offered:</b> {u.skillsOffered.length}</p>
        </div>
      ))}
    </div>
  );
}