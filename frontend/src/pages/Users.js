import { useEffect, useState } from "react";
import axios from "axios";

<div style={{ position: "relative", zIndex: 1 }}>
  {/* your entire page content */}
</div>

export default function Users() {
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);

  const [review, setReview] = useState({
    learner: "",
    mentor: "",
    rating: "",
    comment: ""
  });

  // 🔍 Search + Filter
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");

  // 🤖 AI States (YOU WERE MISSING THIS)
  const [aiSkill, setAiSkill] = useState("");
  const [aiResults, setAiResults] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/users")
      .then(res => setUsers(res.data))
      .catch(err => console.log(err));

    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/review/all");
      setReviews(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const openReviewSection = (mentorName) => {
    setSelectedMentor(mentorName);
    setReview({
      learner: "",
      mentor: mentorName,
      rating: "",
      comment: ""
    });
  };

  const handleChange = (e) => {
    setReview({
      ...review,
      [e.target.name]: e.target.value
    });
  };

  const submitReview = async () => {
    try {
      await axios.post("http://localhost:5000/api/review/add", review);

      alert("Review Submitted ⭐");

      setReview({
        learner: "",
        mentor: selectedMentor,
        rating: "",
        comment: ""
      });

      fetchReviews();
    } catch (err) {
      console.log(err);
    }
  };

  // 🤖 AI FUNCTION
  const getAIRecommendations = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/recommend/${aiSkill}`
      );
      setAiResults(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>All Users</h2>

      {/* 🤖 AI RECOMMENDATION */}
      <h3>AI Recommend Mentors 🤖</h3>

      <input
        placeholder="Enter skill (e.g. python)"
        value={aiSkill}
        onChange={(e) => setAiSkill(e.target.value)}
      />

      <button onClick={getAIRecommendations}>
        Find Mentors
      </button>

      <br /><br />

      {aiResults.length > 0 && (
        <div>
          <h4>Recommended Mentors:</h4>

          {aiResults.map((u, i) => (
            <div key={i} style={{
              border: "1px solid purple",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "8px"
            }}>
              <h4>{u.name}</h4>
              <p>{u.email}</p>
              <p>{u.skillsOffered.join(", ")}</p>
            </div>
          ))}
        </div>
      )}

      {/* 🔍 Search + Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", marginTop: "20px" }}>
        <input
          placeholder="🔍 Search by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          placeholder="🎯 Filter by skill"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
        />
      </div>

      {/* 👇 Users List */}
      {users
        .filter((u) =>
          u.name.toLowerCase().includes(search.toLowerCase())
        )
        .filter((u) =>
          u.skillsOffered
            .join(" ")
            .toLowerCase()
            .includes(skillFilter.toLowerCase())
        )
        .map((u, index) => (
          <div key={index} className="card">
            <h3>{u.name}</h3>
            <p><b>Email:</b> {u.email}</p>
            <p><b>Skills Offered:</b> {u.skillsOffered.join(", ")}</p>
            <p><b>Skills Wanted:</b> {u.skillsWanted.join(", ")}</p>

            <button onClick={() => openReviewSection(u.name)}>
              View/Add Reviews
            </button>

            {/* ⭐ Reviews */}
            {selectedMentor === u.name && (
              <div style={{ marginTop: "15px" }}>
                <h4>Reviews for {u.name}</h4>

                {reviews
                  .filter(r => r.mentor === u.name)
                  .map((r, i) => (
                    <div key={i} style={{
                      border: "1px solid gray",
                      padding: "10px",
                      margin: "10px 0",
                      borderRadius: "8px"
                    }}>
                      <p><b>{r.learner}</b></p>
                      <p>{r.rating} ⭐</p>
                      <p>{r.comment}</p>
                    </div>
                  ))}

                <input
                  name="learner"
                  placeholder="Your Name"
                  value={review.learner}
                  onChange={handleChange}
                />
                <br /><br />

                <input
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  placeholder="Rating (1-5)"
                  value={review.rating}
                  onChange={handleChange}
                />
                <br /><br />

                <textarea
                  name="comment"
                  placeholder="Write review..."
                  value={review.comment}
                  onChange={handleChange}
                />
                <br /><br />

                <button onClick={submitReview}>
                  Submit Review
                </button>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}