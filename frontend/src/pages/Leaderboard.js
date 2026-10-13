import { useEffect, useMemo, useState } from "react";
import { Avatar, Empty, PageHead, Skeleton, Stars, ratingMap } from "../components/Ui";
import { api, getUser } from "../lib/api";

// Score = 10 pts per skill shared + 20 pts per review star-point of average rating + 5 per review
export default function Leaderboard() {
  const me = getUser();
  const [d, setD] = useState(null);
  useEffect(() => { Promise.all([api.users(), api.reviews()]).then(([users, reviews]) => setD({ users, reviews })).catch(() => setD({ users: [], reviews: [] })); }, []);

  const rows = useMemo(() => {
    if (!d) return [];
    const rm = ratingMap(d.reviews);
    return d.users.map((u) => {
      const r = rm[u.name];
      const avg = r ? r.sum / r.n : 0;
      return { u, avg, n: r?.n || 0, score: Math.round(u.skillsOffered.length * 10 + avg * 20 + (r?.n || 0) * 5) };
    }).sort((a, b) => b.score - a.score);
  }, [d]);

  if (!d) return <div className="container"><Skeleton h={160} n={3} /></div>;
  if (rows.length === 0) return <div className="container"><PageHead title="Leaderboard" sub="Ranked by skills shared and ratings earned." /><Empty icon="trophy" title="No one on the board yet" text="Create accounts and add skills to see rankings." /></div>;
  const max = rows[0]?.score || 1;
  const top = [rows[1], rows[0], rows[2]].filter(Boolean);

  return (
    <div className="container">
      <PageHead title="Leaderboard" sub="Ranked by skills shared and ratings earned." />
      <div className="podium">
        {top.map((r) => {
          const rank = rows.indexOf(r) + 1;
          return (
            <div key={r.u._id} className={"card card-hover" + (rank === 1 ? " p1" : "")}>
              <span className={"medal m" + rank}>{rank}</span>
              <Avatar name={r.u.name} size={rank === 1 ? 64 : 52} />
              <h3>{r.u.name}</h3>
              <Stars value={r.avg} size={14} />
              <span className="score">{r.score}</span>
              <span className="muted" style={{ fontSize: 12 }}>points</span>
            </div>
          );
        })}
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {rows.map((r, i) => (
          <div key={r.u._id} className={"rank-row" + (r.u.name === me.name ? " me" : "")}>
            <span className="n">{i + 1}</span>
            <Avatar name={r.u.name} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}><b>{r.u.name}</b>{r.u.name === me.name && " (you)"}<div className="muted" style={{ fontSize: 13 }}>{r.u.skillsOffered.length} skills · {r.n} reviews</div></div>
            <div className="bar"><i style={{ width: `${(r.score / max) * 100}%` }} /></div>
            <b style={{ width: 44, textAlign: "right" }}>{r.score}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
