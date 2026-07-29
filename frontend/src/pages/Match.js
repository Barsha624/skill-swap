import { useState } from "react";
import axios from "axios";

<div style={{ position: "relative", zIndex: 1 }}>
  {/* your entire page content */}
</div>
export default function Match() {
  const [skill, setSkill] = useState("");
  const [users, setUsers] = useState([]);

  const findMatch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/match/${skill}`);
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Find Skill Match</h2>

      <input
        placeholder="Enter skill (e.g. python)"
        onChange={(e) => setSkill(e.target.value)}
      />
      <button onClick={findMatch}>Search</button>

      {users.map((u, i) => (
        <div key={i} className="card">
          <h3>{u.name}</h3>
          <p>{u.skillsOffered.join(", ")}</p>
        </div>
      ))}
    </div>
  );
}