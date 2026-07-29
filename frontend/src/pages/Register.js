import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

<div style={{ position: "relative", zIndex: 1 }}>
  {/* your entire page content */}
</div>

export default function Register() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    skillsOffered: "",
    skillsWanted: ""
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };



 const navigate = useNavigate();
  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/register", {
        ...user,
        skillsOffered: user.skillsOffered.split(",").map(s => s.trim()),
        skillsWanted: user.skillsWanted.split(",").map(s => s.trim())
      });

      console.log(res.data); // ✅ see response
      alert("Registration Sucessful ✅");

      navigate("/dashboard");

    } catch (err) {
      console.log(err.response?.data || err.message); // ✅ VERY IMPORTANT
      alert("Error ❌");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Register</h2>

      <input name="name" placeholder="Name" onChange={handleChange} /><br/><br/>
      <input name="email" placeholder="Email" onChange={handleChange} /><br/><br/>
      <input name="password" type="password" placeholder="Password" onChange={handleChange} /><br/><br/>
      <input name="skillsOffered" placeholder="Skills Offered (comma separated)" onChange={handleChange} /><br/><br/>
      <input name="skillsWanted" placeholder="Skills Wanted (comma separated)" onChange={handleChange} /><br/><br/>

      <button onClick={handleSubmit}>Register</button>
    </div>
  );
}