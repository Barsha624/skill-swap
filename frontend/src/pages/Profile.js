import { useState } from "react";
import axios from "axios";

<div style={{ position: "relative", zIndex: 1 }}>
  {/* your entire page content */}
</div>

export default function Profile() {
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState({
    name: "",
    email: "",
    skillsOffered: "",
    skillsWanted: ""
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/update/${userId}`,
        {
          ...user,
          skillsOffered: user.skillsOffered.split(","),
          skillsWanted: user.skillsWanted.split(",")
        }
      );

      alert("Profile Updated ✅");

    } catch (err) {
      alert("Update Failed ❌");
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Edit Profile ✏️</h2>

      <input
        placeholder="Enter Your User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <br /><br />

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="skillsOffered"
        placeholder="Skills Offered (comma separated)"
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="skillsWanted"
        placeholder="Skills Wanted (comma separated)"
        onChange={handleChange}
      />
      <br /><br />

      <button onClick={handleUpdate}>
        Update Profile
      </button>
    </div>
  );
}