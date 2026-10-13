import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, saveSession } from "../lib/api";
import { useToast } from "../components/Toast";
import { SkillInput } from "../components/SkillInput";

export default function Register() {
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [offered, setOffered] = useState([]);
  const [wanted, setWanted] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const toast = useToast();
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!offered.length || !wanted.length) return setErr("Add at least one skill you offer and one you want.");
    setErr(""); setBusy(true);
    try {
      const body = { ...f, email: f.email.trim(), skillsOffered: offered, skillsWanted: wanted };
      await api.register(body);
      saveSession(await api.login(body.email, body.password));
      toast("Account created — welcome to Exora");
      nav("/dashboard");
    } catch (x) { setErr(x.response?.data?.message || "Registration failed. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth" style={{ maxWidth: 480 }}>
      <h1>Create your account</h1>
      <p className="sub">Tell us what you can teach and what you want to learn.</p>
      <form className="card" onSubmit={submit}>
        {err && <div className="form-error" role="alert">{err}</div>}
        <div className="field"><label htmlFor="n">Name</label><input id="n" className="input" required value={f.name} onChange={set("name")} /></div>
        <div className="field"><label htmlFor="e">Email</label><input id="e" className="input" type="email" required value={f.email} onChange={set("email")} /></div>
        <div className="field"><label htmlFor="p">Password (8+ characters)</label><input id="p" className="input" type="password" required minLength={8} value={f.password} onChange={set("password")} /></div>
        <div className="field"><label>I can teach</label><SkillInput value={offered} onChange={setOffered} placeholder="e.g. Python — press Enter" /></div>
        <div className="field"><label>I want to learn</label><SkillInput value={wanted} onChange={setWanted} placeholder="e.g. Guitar — press Enter" /></div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
      </form>
      <p className="muted" style={{ textAlign: "center", marginTop: 18 }}>Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
