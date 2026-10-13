import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";

const PAIRS = [
  ["Python", "Spanish"],
  ["Guitar", "Photography"],
  ["UI Design", "Public Speaking"],
  ["Cooking", "Web Development"],
];

const FEATURES = [
  ["users", "Smart matching", "Find people who teach what you want to learn — and want what you can teach."],
  ["chat", "Built-in chat", "Message your match and agree on a time without leaving the app."],
  ["calendar", "Session booking", "Request, accept or decline sessions and track every status."],
  ["star", "Reviews & ratings", "Build a reputation with feedback from real learners."],
  ["trophy", "Leaderboard", "Top contributors rise by skills shared and ratings earned."],
  ["shield", "Zero cost", "No payments. Time and knowledge are the only currency."],
];

export default function Home() {
  const [i, setI] = useState(0);
  const [give, get] = PAIRS[i];

  return (
    <div className="container">
      <section className="hero">
        <div className="hero-grid">
          <div>
            <span className="eyebrow"><Icon name="zap" size={14} /> Peer-to-peer skill exchange</span>
            <h1>Teach what you know.<br /><span className="grad">Learn what you don't.</span></h1>
            <p className="lead">Exora matches people who want to swap skills — no money, no courses, just real conversations and sessions with someone who's been there.</p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-lg">Get started <Icon name="arrow" size={16} /></Link>
              <Link to="/login" className="btn btn-outline btn-lg">Log in</Link>
            </div>
            <div className="stats">
              <div className="stat"><strong>6</strong><span>core features</span></div>
              <div className="stat"><strong>Full-stack</strong><span>React · Node · MongoDB</span></div>
              <div className="stat"><strong>Real-time</strong><span>Socket.IO chat</span></div>
            </div>
          </div>

          <div className="swap-demo" aria-label="How a swap works">
            <h4>How a swap works</h4>
            <div className="chips">
              {PAIRS.map(([a], n) => (
                <button key={a} className={"chip" + (n === i ? " on" : "")} onClick={() => setI(n)}>I teach {a}</button>
              ))}
            </div>
            <div className="swap-result" key={i}>
              <div className="label">A perfect match</div>
              <div className="swap-people">
                <span className="avatar" style={{ width: 46, height: 46, background: "var(--accent)" }}><Icon name="user" size={22} /></span>
                <div><b>You</b><small>teach {give}</small></div>
                <span className="arrow"><Icon name="swap" size={16} /></span>
                <div><b>Your match</b><small>teaches {get}</small></div>
              </div>
              <p className="muted" style={{ marginTop: 12, fontSize: 14 }}>
                You help them with <b style={{ color: "var(--text)" }}>{give}</b>, they help you with <b style={{ color: "var(--text)" }}>{get}</b>. Both of you learn for free.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Everything you need to swap skills</h2>
          <p>A complete loop from discovery to feedback.</p>
        </div>
        <div className="features">
          {FEATURES.map(([ic, t, d]) => (
            <div className="card feature card-hover" key={t}>
              <div className="ico"><Icon name={ic} size={20} /></div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>How it works</h2></div>
        <div className="steps">
          <div className="card step"><h3>List your skills</h3><p>Add what you can teach and what you'd like to learn.</p></div>
          <div className="card step"><h3>Get matched</h3><p>Browse people, or search a skill to see who teaches it.</p></div>
          <div className="card step"><h3>Book & learn</h3><p>Chat, schedule a session, then leave a review.</p></div>
        </div>
      </section>

      <section className="cta-band">
        <h2>Ready to trade skills?</h2>
        <p>Create your free account in under a minute.</p>
        <Link to="/register" className="btn btn-primary btn-lg">Create account <Icon name="arrow" size={16} /></Link>
      </section>
    </div>
  );
}
