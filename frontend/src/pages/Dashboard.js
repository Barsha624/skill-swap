import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { Avatar, Empty, PageHead, Tags, Skeleton, fmtDate, fmtTime, ratingMap } from "../components/Ui";
import { api, getUser } from "../lib/api";
import { useToast } from "../components/Toast";

export default function Dashboard() {
  const me = getUser();
  const nav = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(null);

  const load = () => Promise.all([api.users(), api.bookings(), api.reviews()]).then(([users, bookings, reviews]) => setData({ users, bookings, reviews })).catch(() => setData({ users: [], bookings: [], reviews: [] }));
  useEffect(() => { load(); }, []);

  const view = useMemo(() => {
    if (!data || !me) return null;
    const mine = data.bookings.filter((b) => b.learner === me.name || b.mentor === me.name);
    const upcoming = mine.filter((b) => b.status === "Accepted");
    const incoming = data.bookings.filter((b) => b.mentor === me.name && b.status === "Pending");
    const want = (me.skillsWanted || []).map((s) => s.toLowerCase());
    const matches = data.users
      .filter((u) => u.name !== me.name)
      .map((u) => ({ u, hits: (u.skillsOffered || []).filter((s) => want.includes(s.toLowerCase())) }))
      .filter((x) => x.hits.length)
      .slice(0, 4);
    const r = ratingMap(data.reviews)[me.name];
    return { upcoming, incoming, matches, rating: r ? (r.sum / r.n).toFixed(1) : "—" };
  }, [data, me]);

  const respond = async (id, status) => {
    try {
      await api.setBookingStatus(id, status);
      toast(status === "Accepted" ? "Session accepted" : "Request declined");
      load();
    } catch { toast("Couldn't update that request", "error"); }
  };

  if (!view) return <div className="container"><Skeleton h={110} n={4} /></div>;

  return (
    <div className="container">
      <PageHead title="Welcome to Exora" sub="Here's what's happening with your exchanges.">
        <Link to="/users" className="btn btn-outline"><Icon name="search" size={16} /> Explore people</Link>
        <Link to="/booking" className="btn btn-primary"><Icon name="plus" size={16} /> New session</Link>
      </PageHead>

      <div className="kpis">
        <div className="card kpi"><span className="ico"><Icon name="calendar" size={20} /></span><div><strong>{view.upcoming.length}</strong><span>Upcoming sessions</span></div></div>
        <div className="card kpi"><span className="ico"><Icon name="clock" size={20} /></span><div><strong>{view.incoming.length}</strong><span>Pending requests</span></div></div>
        <div className="card kpi"><span className="ico"><Icon name="users" size={20} /></span><div><strong>{view.matches.length}</strong><span>Skill matches</span></div></div>
        <div className="card kpi"><span className="ico"><Icon name="star" size={20} /></span><div><strong>{view.rating}</strong><span>Your rating</span></div></div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title"><h3>Requests for you</h3><Link to="/booking" className="muted">View all</Link></div>
          {view.incoming.length === 0 ? (
            <Empty icon="check" title="You're all caught up" text="New session requests will show up here." />
          ) : view.incoming.map((b) => (
            <div className="list-item" key={b._id}>
              <Avatar name={b.learner} />
              <div className="grow"><b>{b.learner}</b><small>{b.skill} · {fmtDate(b.date)}, {fmtTime(b.time)}</small></div>
              <div className="actions">
                <button className="btn btn-success btn-sm" onClick={() => respond(b._id, "Accepted")}>Accept</button>
                <button className="btn btn-danger btn-sm" onClick={() => respond(b._id, "Rejected")}>Decline</button>
              </div>
            </div>
          ))}

          <div className="card-title" style={{ marginTop: 26 }}><h3>Upcoming sessions</h3></div>
          {view.upcoming.length === 0 ? (
            <Empty icon="calendar" title="Nothing scheduled" text="Book a session with someone from Explore." />
          ) : view.upcoming.map((b) => {
            const other = b.mentor === me.name ? b.learner : b.mentor;
            return (
              <div className="list-item" key={b._id}>
                <Avatar name={other} />
                <div className="grow"><b>{b.skill} with {other}</b><small>{fmtDate(b.date)} · {fmtTime(b.time)}</small></div>
                <button className="btn btn-outline btn-sm" onClick={() => nav("/chat")}>Message</button>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-title"><h3>Suggested for you</h3><Link to="/match" className="muted">Find more</Link></div>
          {view.matches.length === 0 ? (
            <Empty icon="users" title="No matches yet" text="Add skills you want to learn on your profile." />
          ) : view.matches.map(({ u, hits }) => (
            <div className="list-item" key={u._id}>
              <Avatar name={u.name} />
              <div className="grow"><b>{u.name}</b><small>Teaches <Tags items={hits} tone="success" /></small></div>
              <button className="btn btn-outline btn-sm" onClick={() => nav("/booking", { state: { mentor: u.name, skill: hits[0] } })}>Book</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
