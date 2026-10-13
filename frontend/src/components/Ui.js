import { useEffect } from "react";
import Icon from "./Icon";

const COLORS = ["#6b5ff5", "#0f8a5f", "#d9534f", "#c27a00", "#1f7fc4", "#a23fa0", "#0e8c8c", "#5b6b7f"];
export const initials = (name = "?") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const hue = (name = "") => COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % COLORS.length];

export function Avatar({ name, size = 40 }) {
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, background: hue(name), fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}

export function Tags({ items = [], tone = "accent", max = 4 }) {
  const shown = items.slice(0, max);
  return (
    <span className="tags">
      {shown.map((t) => (
        <span key={t} className={"tag tag-" + tone}>{t}</span>
      ))}
      {items.length > max && <span className="tag tag-muted">+{items.length - max}</span>}
    </span>
  );
}

export function Stars({ value = 0, onChange, size = 16 }) {
  return (
    <span className={"stars" + (onChange ? " stars-input" : "")} role={onChange ? "radiogroup" : "img"} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={n <= Math.round(value) ? "on" : ""}
          onClick={onChange ? () => onChange(n) : undefined}
          tabIndex={onChange ? 0 : -1}
          disabled={!onChange}
          aria-label={`${n} star`}
        >
          <Icon name="star" size={size} fill={n <= Math.round(value)} />
        </button>
      ))}
    </span>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Empty({ icon = "search", title, text, children }) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icon name={icon} size={22} /></span>
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

export const Skeleton = ({ h = 120, n = 3 }) => (
  <div className="grid">
    {Array.from({ length: n }).map((_, i) => <div key={i} className="skeleton" style={{ height: h }} />)}
  </div>
);

export function PageHead({ title, sub, children }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <p className="muted">{sub}</p>}
      </div>
      {children && <div className="page-head-actions">{children}</div>}
    </div>
  );
}

export const ratingMap = (reviews) => {
  const m = {};
  reviews.forEach((r) => {
    const x = (m[r.mentor] ||= { sum: 0, n: 0 });
    x.sum += Number(r.rating) || 0;
    x.n += 1;
  });
  return m;
};

export const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d.length <= 10 ? d + "T00:00:00" : d);
  return isNaN(dt) ? d : dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
};
export const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  if (isNaN(h)) return t;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
export const timeAgo = (iso) => {
  const s = (Date.now() - new Date(iso)) / 1000;
  if (isNaN(s)) return "";
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + "m ago";
  if (s < 86400) return Math.round(s / 3600) + "h ago";
  return Math.round(s / 86400) + "d ago";
};
