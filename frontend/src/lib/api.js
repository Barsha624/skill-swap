import axios from "axios";
import { useSyncExternalStore } from "react";
import { seed } from "./demoData";

/**
 * Data layer. Talks to the Express/Mongo API when it is reachable and falls
 * back to a local in-browser demo store when it is not, so the deployed
 * GitHub Pages build is fully clickable without a server.
 */
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const host = typeof window !== "undefined" ? window.location.hostname : "";
const isLocal = host === "localhost" || host === "127.0.0.1";

let demo =
  process.env.REACT_APP_DEMO === "true" ||
  (!process.env.REACT_APP_API_URL && !isLocal);

const listeners = new Set();
const setDemo = (v) => {
  if (demo !== v) {
    demo = v;
    listeners.forEach((l) => l());
  }
};
export const isDemo = () => demo;
export const useDemo = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => demo
  );

export const apiUrl = API;
const http = axios.create({ baseURL: API, timeout: 3000 });
// Send the JWT with every request so protected routes know who is calling.
http.interceptors.request.use((cfg) => {
  try {
    const t = localStorage.getItem("token");
    if (t) cfg.headers.Authorization = `Bearer ${t}`;
  } catch {}
  return cfg;
});

// On localhost, probe the server once so the UI knows which mode it is in.
if (!demo) {
  http.get("/").catch((e) => {
    if (!e.response) setDemo(true);
  });
}

/* ---------- demo store (persisted in localStorage) ---------- */
const KEY = "exora-demo-v2";
const load = () => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.users) return s;
  } catch {}
  return seed();
};
let db = load();

// Demo-store passwords are salted SHA-256 hashes, never stored in clear text.
const hashPw = async (email, pw) => {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`exora:${String(email).toLowerCase()}:${pw}`));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
};
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {}
};
let counter = Date.now();
const nid = () => "d" + counter++;
const wait = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const clean = ({ password, ...rest }) => rest;

async function call(real, fake) {
  if (!demo) {
    try {
      return await real();
    } catch (e) {
      if (e.response?.status === 401) clearSession(); // expired / invalid token -> back to login
      if (e.response) throw e; // real server answered with an error
      setDemo(true); // server unreachable -> switch to demo store
    }
  }
  await wait();
  return fake();
}

const get = (url) => async () => (await http.get(url)).data;
const send = (method, url, body) => async () =>
  (await http[method](url, body)).data;

export const api = {
  users: () => call(get("/api/users"), () => db.users.map(clean)),

  match: (skill) =>
    call(get(`/api/match/${encodeURIComponent(skill)}`), () =>
      db.users
        .filter((x) =>
          x.skillsOffered.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
        )
        .map(clean)
    ),

  register: (body) =>
    call(send("post", "/api/register", body), async () => {
      const fail = (m) => { throw Object.assign(new Error(m), { response: { data: { message: m } } }); };
      if (db.users.some((x) => x.email.toLowerCase() === body.email.toLowerCase())) fail("An account with that email already exists");
      if (db.users.some((x) => x.name.toLowerCase() === body.name.trim().toLowerCase())) fail("That name is already taken — pick another");
      db.users.push({ _id: nid(), ...body, email: body.email.toLowerCase(), password: await hashPw(body.email, body.password) });
      save();
      return { message: "User registered" };
    }),

  login: (email, password) =>
    call(send("post", "/api/login", { email, password }), async () => {
      const h = await hashPw(email, password);
      const found = db.users.find((x) => x.email === String(email).toLowerCase() && x.password === h);
      if (!found)
        throw Object.assign(new Error("bad"), { response: { data: { message: "Invalid credentials" } } });
      return { token: "demo-token", user: clean(found) };
    }),

  updateUser: (id, body) =>
    call(send("put", `/api/update/${id}`, body), () => {
      const i = db.users.findIndex((x) => x._id === id);
      if (i < 0) throw Object.assign(new Error("nf"), { response: { data: { message: "User not found" } } });
      db.users[i] = { ...db.users[i], ...body };
      save();
      return clean(db.users[i]);
    }),

  deleteAccount: (password) =>
    call(async () => (await http.delete("/api/account", { data: { password } })).data, async () => {
      const me = getUser();
      const i = db.users.findIndex((x) => x._id === me?._id);
      if (i < 0 || db.users[i].password !== (await hashPw(db.users[i].email, password)))
        throw Object.assign(new Error("bad"), { response: { data: { message: "Incorrect password" } } });
      const name = db.users[i].name;
      db.users.splice(i, 1);
      db.bookings = db.bookings.filter((b) => b.learner !== name && b.mentor !== name);
      db.messages = db.messages.filter((m) => m.sender !== name && m.receiver !== name);
      db.reviews = db.reviews.filter((r) => r.learner !== name && r.mentor !== name);
      save();
      return { message: "Account deleted" };
    }),

  reviews: () => call(get("/api/review/all"), () => [...db.reviews]),
  addReview: (r) =>
    call(send("post", "/api/review/add", r), () => {
      db.reviews.push({ _id: nid(), ...r });
      save();
      return r;
    }),

  bookings: () => call(get("/api/booking/all"), () => [...db.bookings]),
  book: (b) =>
    call(send("post", "/api/booking/book", b), () => {
      const nb = { _id: nid(), status: "Pending", ...b };
      db.bookings.push(nb);
      db.notifications.unshift({
        _id: nid(),
        message: `Session request sent to ${b.mentor} for ${b.skill}`,
        createdAt: new Date().toISOString(),
      });
      save();
      return nb;
    }),
  setBookingStatus: (id, status) =>
    call(send("put", `/api/booking/status/${id}`, { status }), () => {
      const b = db.bookings.find((x) => x._id === id);
      if (b) b.status = status;
      save();
      return b;
    }),

  notifications: () => call(get("/api/notifications/all"), () => [...db.notifications]),

  messages: (a, b) =>
    call(get(`/api/chat/${encodeURIComponent(a)}/${encodeURIComponent(b)}`), () =>
      db.messages.filter(
        (m) => (m.sender === a && m.receiver === b) || (m.sender === b && m.receiver === a)
      )
    ),
  sendMessage: (m) =>
    call(send("post", "/api/chat/send", m), () => {
      const nm = { _id: nid(), createdAt: new Date().toISOString(), ...m };
      db.messages.push(nm);
      save();
      return nm;
    }),

  resetDemo: () => {
    db = seed();
    save();
  },
};

/* ---------- session ---------- */
// A stored session is only trusted if it has a token AND a user that still exists.
export const sessionValid = () => {
  const u = getUser();
  if (!getToken() || !u || !u._id || !u.name) return false;
  return demo ? db.users.some((x) => x._id === u._id) : true;
};
export const getToken = () => {
  try { return localStorage.getItem("token"); } catch { return null; }
};
export const getUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};
export const saveSession = ({ token, user }) => {
  try {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  } catch {}
  window.dispatchEvent(new Event("exora-session"));
};
export const clearSession = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {}
  window.dispatchEvent(new Event("exora-session"));
};
export const useSession = () =>
  useSyncExternalStore(
    (cb) => {
      window.addEventListener("exora-session", cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener("exora-session", cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => getToken() || ""
  );
