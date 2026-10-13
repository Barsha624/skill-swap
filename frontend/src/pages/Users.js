import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { Avatar, Empty, Modal, PageHead, Skeleton, Stars, Tags, ratingMap } from "../components/Ui";
import { api, getUser } from "../lib/api";
import { useToast } from "../components/Toast";

function ReviewModal({ mentor, reviews, me, onClose, onAdded }) {
  const toast = useToast();
  const list = reviews.filter((r) => r.mentor === mentor.name);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast("Pick a star rating first", "error");
    try {
      await api.addReview({ learner: me.name, mentor: mentor.name, rating, comment: comment.trim() });
      toast("Review posted");
      setRating(0); setComment("");
      onAdded();
    } catch (x) { toast(x.response?.data?.message || "Couldn't post your review", "error"); }
  };
  return (
    <Modal title={`Reviews for ${mentor.name}`} onClose={onClose}>
      {list.length === 0 ? <p className="muted" style={{ marginBottom: 16 }}>No reviews yet — be the first.</p> : list.map((r) => (
        <div className="review" key={r._id}>
          <div className="user-top"><Avatar name={r.learner} size={32} /><b>{r.learner}</b><span style={{ marginLeft: "auto" }}><Stars value={r.rating} /></span></div>
          <p>{r.comment}</p>
        </div>
      ))}
      {mentor.name !== me.name && (
        <form onSubmit={submit} style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--border)" }}>
          <div className="field"><label>Your rating</label><Stars value={rating} onChange={setRating} size={26} /></div>
          <div className="field"><label htmlFor="rc">Comment</label><textarea id="rc" className="textarea" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What was the session like?" /></div>
          <button className="btn btn-primary">Post review</button>
        </form>
      )}
    </Modal>
  );
}

export default function Users() {
  const me = getUser();
  const nav = useNavigate();
  const [users, setUsers] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [q, setQ] = useState("");
  const [skill, setSkill] = useState("");
  const [open, setOpen] = useState(null);

  const loadReviews = () => api.reviews().then(setReviews).catch(() => {});
  useEffect(() => { api.users().then(setUsers).catch(() => setUsers([])); loadReviews(); }, []);

  const allSkills = useMemo(() => [...new Set((users || []).flatMap((u) => u.skillsOffered))].sort(), [users]);
  const ratings = useMemo(() => ratingMap(reviews), [reviews]);
  const shown = (users || []).filter((u) =>
    u.name.toLowerCase().includes(q.toLowerCase()) &&
    (!skill || u.skillsOffered.some((s) => s.toLowerCase() === skill.toLowerCase())));

  return (
    <div className="container">
      <PageHead title="Explore" sub="Find people to learn from — and swap with." />
      <div className="toolbar">
        <div className="search"><Icon name="search" size={16} /><input className="input" placeholder="Search people by name" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search by name" /></div>
      </div>
      <div className="chips" style={{ marginBottom: 22 }}>
        <button className={"chip" + (!skill ? " on" : "")} onClick={() => setSkill("")}>All skills</button>
        {allSkills.map((s) => <button key={s} className={"chip" + (skill === s ? " on" : "")} onClick={() => setSkill(skill === s ? "" : s)}>{s}</button>)}
      </div>

      {!users ? <Skeleton h={230} n={6} /> : shown.length === 0 ? (
        <Empty title="No one matches that" text="Try a different name or clear the skill filter."><button className="btn btn-outline btn-sm" onClick={() => { setQ(""); setSkill(""); }}>Clear filters</button></Empty>
      ) : (
        <div className="grid">
          {shown.map((u) => {
            const r = ratings[u.name];
            const isMe = u.name === me.name;
            return (
              <div className="card card-hover user-card" key={u._id}>
                <div className="user-top">
                  <Avatar name={u.name} size={48} />
                  <div>
                    <h3>{u.name}{isMe && <span className="tag tag-muted" style={{ marginLeft: 8 }}>You</span>}</h3>
                    <small>{r ? <><Stars value={r.sum / r.n} size={13} /> {(r.sum / r.n).toFixed(1)} ({r.n})</> : "No reviews yet"}</small>
                  </div>
                </div>
                <div><div className="label">Teaches</div><Tags items={u.skillsOffered} tone="accent" /></div>
                <div><div className="label">Wants to learn</div><Tags items={u.skillsWanted} tone="muted" /></div>
                <div className="user-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setOpen(u)}>Reviews</button>
                  {!isMe && <button className="btn btn-primary btn-sm" onClick={() => nav("/booking", { state: { mentor: u.name, skill: u.skillsOffered[0] } })}>Request session</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {open && <ReviewModal mentor={open} reviews={reviews} me={me} onClose={() => setOpen(null)} onAdded={loadReviews} />}
    </div>
  );
}
