import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { Avatar, Empty, Modal, PageHead, Skeleton, fmtDate, fmtTime } from "../components/Ui";
import { api, getUser } from "../lib/api";
import { useToast } from "../components/Toast";

const TONE = { Pending: "tag-warn", Accepted: "tag-success", Rejected: "tag-danger" };
const today = () => new Date().toISOString().slice(0, 10);

function BookModal({ users, me, preset, onClose, onDone }) {
  const toast = useToast();
  const mentors = users.filter((u) => u.name !== me.name);
  const first = mentors.find((u) => u.name === preset?.mentor) || mentors[0];
  const [f, setF] = useState({ mentor: first?.name || "", skill: preset?.skill || first?.skillsOffered?.[0] || "", date: "", time: "" });
  const [busy, setBusy] = useState(false);
  const mentor = mentors.find((u) => u.name === f.mentor);

  const pickMentor = (name) => {
    const m = mentors.find((u) => u.name === name);
    setF({ ...f, mentor: name, skill: m?.skillsOffered?.[0] || "" });
  };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.book({ learner: me.name, ...f });
      toast(`Request sent to ${f.mentor}`);
      onDone();
    } catch { toast("Couldn't book that session", "error"); }
    finally { setBusy(false); }
  };
  return (
    <Modal title="Request a session" onClose={onClose}>
      {mentors.length === 0 ? <p className="muted">There's nobody to book yet. Once another person signs up, you can request a session with them.</p> : (
      <form onSubmit={submit}>
        <div className="field"><label htmlFor="m">Mentor</label>
          <select id="m" className="select" value={f.mentor} onChange={(e) => pickMentor(e.target.value)}>
            {mentors.map((u) => <option key={u._id}>{u.name}</option>)}
          </select></div>
        <div className="field"><label htmlFor="s">Skill</label>
          <select id="s" className="select" value={f.skill} onChange={(e) => setF({ ...f, skill: e.target.value })}>
            {(mentor?.skillsOffered || []).map((s) => <option key={s}>{s}</option>)}
          </select></div>
        <div className="row">
          <div className="field"><label htmlFor="d">Date</label><input id="d" className="input" type="date" min={today()} required value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
          <div className="field"><label htmlFor="t">Time</label><input id="t" className="input" type="time" required value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></div>
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Sending…" : "Send request"}</button>
      </form>)}
    </Modal>
  );
}

export default function Booking() {
  const me = getUser();
  const loc = useLocation();
  const nav = useNavigate();
  const toast = useToast();
  const [bookings, setBookings] = useState(null);
  const [users, setUsers] = useState(null); // null until loaded, so the form starts with real defaults
  const [tab, setTab] = useState("all");
  const [modal, setModal] = useState(loc.state?.mentor ? loc.state : null);

  const load = () => api.bookings().then(setBookings).catch(() => setBookings([]));
  useEffect(() => { load(); api.users().then(setUsers).catch(() => setUsers([])); if (loc.state?.mentor) nav(loc.pathname, { replace: true, state: null }); /* eslint-disable-next-line */ }, []);

  const respond = async (id, status) => {
    try {
      await api.setBookingStatus(id, status);
      toast(status === "Accepted" ? "Session accepted" : "Request declined");
      load();
    } catch { toast("Couldn't update that session", "error"); }
  };

  const mine = (bookings || []).filter((b) => b.learner === me.name || b.mentor === me.name)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const shown = mine.filter((b) => tab === "all" || (tab === "learning" ? b.learner === me.name : b.mentor === me.name));

  return (
    <div className="container">
      <PageHead title="Sessions" sub="Everything you're learning and teaching.">
        <button className="btn btn-primary" onClick={() => setModal({})}><Icon name="plus" size={16} /> New session</button>
      </PageHead>
      <div className="tabs" role="tablist">
        {[["all", "All"], ["learning", "I'm learning"], ["teaching", "I'm teaching"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {!bookings ? <Skeleton h={90} n={3} /> : shown.length === 0 ? (
        <Empty icon="calendar" title="No sessions here yet" text="Request one from a mentor you like."><button className="btn btn-primary btn-sm" onClick={() => setModal({})}>Book a session</button></Empty>
      ) : (
        <div className="card" style={{ padding: "6px 20px" }}>
          {shown.map((b) => {
            const teaching = b.mentor === me.name;
            const other = teaching ? b.learner : b.mentor;
            return (
              <div className="list-item" key={b._id}>
                <Avatar name={other} size={42} />
                <div className="grow">
                  <b>{b.skill} <span className="muted" style={{ fontWeight: 400 }}>· {teaching ? "teaching" : "learning from"} {other}</span></b>
                  <small>{fmtDate(b.date)} · {fmtTime(b.time)}</small>
                </div>
                <span className={"tag " + (TONE[b.status] || "tag-muted")}>{b.status}</span>
                {teaching && b.status === "Pending" && (
                  <div className="actions">
                    <button className="btn btn-success btn-sm" onClick={() => respond(b._id, "Accepted")}>Accept</button>
                    <button className="btn btn-danger btn-sm" onClick={() => respond(b._id, "Rejected")}>Decline</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {modal && users && <BookModal users={users} me={me} preset={modal} onClose={() => setModal(null)} onDone={() => { setModal(null); load(); }} />}
    </div>
  );
}
