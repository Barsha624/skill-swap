import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { Avatar, Empty, PageHead, Tags } from "../components/Ui";
import { api, getUser } from "../lib/api";

export default function Match() {
  const me = getUser();
  const nav = useNavigate();
  const [skill, setSkill] = useState("");
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);

  const find = async (s) => {
    const term = s.trim();
    setSkill(term);
    if (!term) return setResults(null);
    setBusy(true);
    try { setResults((await api.match(term)).filter((u) => u.name !== me.name)); }
    catch { setResults([]); }
    finally { setBusy(false); }
  };
  useEffect(() => { if (me?.skillsWanted?.[0]) find(me.skillsWanted[0]); /* eslint-disable-next-line */ }, []);

  const mutual = (u) => (u.skillsWanted || []).filter((s) => (me.skillsOffered || []).some((m) => m.toLowerCase() === s.toLowerCase()));

  return (
    <div className="container">
      <PageHead title="Find a match" sub="Search a skill to see who teaches it. A ⇄ badge means they want something you offer." />
      <form className="toolbar" onSubmit={(e) => { e.preventDefault(); find(skill); }}>
        <div className="search"><Icon name="search" size={16} /><input className="input" placeholder="Skill, e.g. Guitar" value={skill} onChange={(e) => setSkill(e.target.value)} aria-label="Skill" /></div>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Searching…" : "Search"}</button>
      </form>
      {me?.skillsWanted?.length > 0 && (
        <div className="chips" style={{ marginBottom: 24 }}>
          <span className="muted" style={{ alignSelf: "center", fontSize: 13 }}>Your wishlist:</span>
          {me.skillsWanted.map((s) => <button key={s} className={"chip" + (skill.toLowerCase() === s.toLowerCase() ? " on" : "")} onClick={() => find(s)}>{s}</button>)}
        </div>
      )}

      {results === null ? (
        <Empty icon="search" title="Pick a skill to get started" text="Choose from your wishlist or type anything." />
      ) : results.length === 0 ? (
        <Empty title={`No one teaches “${skill}” yet`} text="Try a related skill." />
      ) : (
        <div className="grid">
          {results.map((u) => {
            const swap = mutual(u);
            return (
              <div className="card card-hover user-card" key={u._id}>
                <div className="user-top">
                  <Avatar name={u.name} size={48} />
                  <div><h3>{u.name}</h3>{swap.length > 0 && <span className="tag tag-success">⇄ Mutual swap</span>}</div>
                </div>
                <div><div className="label">Teaches</div><Tags items={u.skillsOffered} /></div>
                {swap.length > 0 && <p className="muted" style={{ fontSize: 14 }}>Wants to learn <b style={{ color: "var(--text)" }}>{swap.join(", ")}</b> — you can teach that.</p>}
                <div className="user-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => nav("/chat", { state: { with: u.name } })}>Message</button>
                  <button className="btn btn-primary btn-sm" onClick={() => nav("/booking", { state: { mentor: u.name, skill } })}>Request session</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
