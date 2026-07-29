import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


<div style={{ position: "relative", zIndex: 1 }}>
  {/* your entire page content */}
</div>

export default function Login() {
  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  

  const navigate = useNavigate();
  const handleLogin = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/login",
      data
    );

    localStorage.setItem("token", res.data.token);

    alert("Login Successful 🎉");

    navigate("/dashboard");
    
    console.log("JWT Token:", res.data.token);

  } catch (err) {
    alert("Invalid Credentials ❌");
  }
  };
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Login</h2>

      <input name="email" placeholder="Email" onChange={handleChange} /><br/><br/>
      <input name="password" type="password" placeholder="Password" onChange={handleChange} /><br/><br/>

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}