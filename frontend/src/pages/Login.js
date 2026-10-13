import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, saveSession } from "../lib/api";
import { useToast } from "../components/Toast";

export default function Login() {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();

  const done = (res) => {
    saveSession(res);
    toast("Welcome back");
    nav(loc.state?.from || "/dashboard");
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try { done(await api.login(f.email.trim(), f.password)); }
    catch (x) { setErr(x.response?.data?.message || "Couldn't sign you in. Check your details."); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <h1>Welcome back</h1>
      <p className="sub">Log in to continue swapping skills.</p>
      <form className="card" onSubmit={submit}>
        {err && <div className="form-error" role="alert">{err}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" className="input" type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input id="pw" className="input" type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? "Signing in…" : "Log in"}</button>
      </form>
      <p className="muted" style={{ textAlign: "center", marginTop: 18 }}>New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}
