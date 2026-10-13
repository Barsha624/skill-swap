import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHead, Modal } from "../components/Ui";
import Icon from "../components/Icon";
import { SkillInput } from "../components/SkillInput";
import { api, clearSession, getUser, saveSession, getToken } from "../lib/api";
import { useToast } from "../components/Toast";

export default function Profile() {
  const me = getUser();
  const toast = useToast();
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [offered, setOffered] = useState(me.skillsOffered || []);
  const [wanted, setWanted] = useState(me.skillsWanted || []);
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);
  const [pw, setPw] = useState("");
  const [delErr, setDelErr] = useState("");
  const nav = useNavigate();

  const removeAccount = async (e) => {
    e.preventDefault();
    setBusy(true); setDelErr("");
    try {
      await api.deleteAccount(pw);
      clearSession();
      toast("Your account was deleted");
      nav("/");
    } catch (x) { setDelErr(x.response?.data?.message || "Couldn't delete your account. Try again."); }
    finally { setBusy(false); }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { email: email.trim(), skillsOffered: offered, skillsWanted: wanted };
      const updated = await api.updateUser(me._id, body);
      saveSession({ token: getToken(), user: { ...me, ...body, ...(updated && updated._id ? updated : {}) } });
      toast("Profile saved");
    } catch { toast("Couldn't save your profile", "error"); }
    finally { setBusy(false); }
  };

  return (
    <div className="container" style={{ maxWidth: 640 }}>
      <PageHead title="Your profile" sub="This is what other people see in Explore." />
      <form className="card" onSubmit={save}>
        <div className="user-top" style={{ marginBottom: 22 }}><span className="avatar" style={{ width: 64, height: 64, background: "var(--accent)" }}><Icon name="user" size={30} /></span><div><h3>{name || "Your name"}</h3><small className="muted">{email}</small></div></div>
        <div className="row">
          <div className="field"><label htmlFor="pn">Name</label><input id="pn" className="input" disabled value={name} /></div>
          <div className="field"><label htmlFor="pe">Email</label><input id="pe" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <div className="field"><label>I can teach</label><SkillInput value={offered} onChange={setOffered} placeholder="Add a skill — press Enter" /></div>
        <div className="field"><label>I want to learn</label><SkillInput value={wanted} onChange={setWanted} placeholder="Add a skill — press Enter" /></div>
        <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      </form>

      <div className="card danger-zone">
        <h3>Delete account</h3>
        <p className="muted">Permanently removes your profile, sessions, messages and reviews. This can't be undone.</p>
        <button className="btn btn-danger" onClick={() => { setPw(""); setDelErr(""); setDel(true); }}>Delete my account</button>
      </div>

      {del && (
        <Modal title="Delete your account?" onClose={() => setDel(false)}>
          <form onSubmit={removeAccount}>
            <p className="muted" style={{ marginBottom: 16 }}>Enter your password to confirm. Everything tied to your account will be erased.</p>
            {delErr && <div className="form-error" role="alert">{delErr}</div>}
            <div className="field"><label htmlFor="dp">Password</label><input id="dp" className="input" type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <div className="actions">
              <button type="button" className="btn btn-outline" onClick={() => setDel(false)}>Cancel</button>
              <button className="btn btn-danger" disabled={busy}>{busy ? "Deleting…" : "Delete permanently"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
