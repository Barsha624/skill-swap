import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Icon, { Logo } from "./Icon";
import { timeAgo } from "./Ui";
import { api, clearSession, useDemo, useSession } from "../lib/api";
import { useToast } from "./Toast";

const LINKS = [
  ["/dashboard", "Dashboard"],
  ["/users", "Explore"],
  ["/match", "Match"],
  ["/booking", "Sessions"],
  ["/chat", "Chat"],
  ["/leaderboard", "Leaderboard"],
];

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("theme") || "light"; } catch { return "light"; }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);
  return [theme, () => setTheme((t) => (t === "light" ? "dark" : "light"))];
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [seen, setSeen] = useState(false);
  const ref = useRef(null);

  useEffect(() => { api.notifications().then(setItems).catch(() => {}); }, []);
  useEffect(() => {
    if (!open) return;
    const close = (e) => (e.type === "keydown" ? e.key === "Escape" && setOpen(false) : !ref.current?.contains(e.target) && setOpen(false));
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [open]);

  return (
    <div className="pop-wrap" ref={ref}>
      <button className="icon-btn" aria-label="Notifications" onClick={() => { setOpen(!open); setSeen(true); }}>
        <Icon name="bell" />
        {items.length > 0 && !seen && <span className="dot" />}
      </button>
      {open && (
        <div className="popover">
          <div className="popover-head">Notifications</div>
          {items.length === 0 ? (
            <p className="muted pad">You're all caught up.</p>
          ) : (
            items.slice(0, 6).map((n, i) => (
              <div className="notif" key={n._id || i}>
                <span className="notif-dot" />
                <div>
                  <div>{n.message}</div>
                  {n.createdAt && <small className="muted">{timeAgo(n.createdAt)}</small>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [theme, toggleTheme] = useTheme();
  const token = useSession();
  const demo = useDemo();
  const nav = useNavigate();
  const toast = useToast();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);

  useEffect(() => { setMenu(false); window.scrollTo(0, 0); }, [loc.pathname]);

  const logout = () => { clearSession(); toast("Signed out"); nav("/"); };

  return (
    <div className="app">
      <header className="nav-bar">
        <div className="container nav-inner">
          <Link to="/" className="brand"><Logo /> <span>Exora</span></Link>

          {token && (
            <nav className={"nav-links" + (menu ? " open" : "")}>
              {LINKS.map(([to, label]) => (
                <NavLink key={to} to={to} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>{label}</NavLink>
              ))}
            </nav>
          )}

          <div className="nav-actions">
            {demo && <span className="pill" title="No backend detected — data is stored in this browser only">Demo mode</span>}
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <Icon name={theme === "light" ? "moon" : "sun"} />
            </button>
            {token ? (
              <>
                <Notifications />
                <Link to="/profile" className="icon-btn" title="Your profile" aria-label="Your profile">
                  <Icon name="user" />
                </Link>
                <button className="icon-btn" onClick={logout} aria-label="Sign out"><Icon name="logout" /></button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Log in</Link>
                <Link to="/register" className="btn btn-primary hide-sm">Get started</Link>
              </>
            )}
            {token && (
              <button className="icon-btn show-sm" onClick={() => setMenu(!menu)} aria-label="Menu">
                <Icon name={menu ? "x" : "menu"} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main"><Outlet /></main>

      <footer className="footer">
        <div className="container footer-inner">
          <span><strong>Exora</strong> · A skill-exchange platform</span>
          <span className="muted">React · Node.js · Express · MongoDB · Socket.IO</span>
        </div>
      </footer>
    </div>
  );
}
