import { useState, useEffect } from "react";
import axios from "axios";
<div style={{ position: "relative", zIndex: 1 }}>
  {/* your entire page content */}
</div>

export default function Booking() {
  const [booking, setBooking] = useState({
    learner: "",
    mentor: "",
    skill: "",
    date: "",
    time: ""
  });

  const [bookings, setBookings] = useState([]);

  const handleChange = (e) => {
    setBooking({
      ...booking,
      [e.target.name]: e.target.value
    });
  };

  const fetchBookings = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/booking/all"
      );
      setBookings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id, status) => {
  try {
    await axios.put(
      `http://localhost:5000/api/booking/status/${id}`,
      { status }
    );

    fetchBookings();

  } catch (err) {
    console.log(err);
  }
};

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/booking/book",
        booking
      );

      alert("Booking Successful 📅✅");

      setBooking({
        learner: "",
        mentor: "",
        skill: "",
        date: "",
        time: ""
      });

      fetchBookings();

    } catch (err) {
      alert("Booking Failed ❌");
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Book a Skill Session 📅</h2>

      <input
        name="learner"
        placeholder="Learner Name"
        value={booking.learner}
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="mentor"
        placeholder="Mentor Name"
        value={booking.mentor}
        onChange={handleChange}
      />
      <br /><br />

      <input
        name="skill"
        placeholder="Skill"
        value={booking.skill}
        onChange={handleChange}
      />
      <br /><br />

      <input
        type="date"
        name="date"
        value={booking.date}
        onChange={handleChange}
      />
      <br /><br />

      <input
        type="time"
        name="time"
        value={booking.time}
        onChange={handleChange}
      />
      <br /><br />

      <button onClick={handleSubmit}>Book Session</button>

      <hr />

      <h2>All Bookings 📋</h2>

      {bookings.map((b, index) => (
        <div key={index} style={{
  border: "1px solid gray",
  padding: "15px",
  margin: "10px",
  borderRadius: "10px"
}}>
  <h3>{b.skill}</h3>
  <p><b>Learner:</b> {b.learner}</p>
  <p><b>Mentor:</b> {b.mentor}</p>
  <p><b>Date:</b> {b.date}</p>
  <p><b>Time:</b> {b.time}</p>
  <p><b>Status:</b> {b.status}</p>

  <button onClick={() => updateStatus(b._id, "Accepted")}>
    Accept
  </button>

  <button onClick={() => updateStatus(b._id, "Rejected")}>
    Reject
  </button>
</div>
      ))}
    </div>
  );
}