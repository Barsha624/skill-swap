import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import Icon from "../components/Icon";
import { Avatar, Empty, PageHead, timeAgo } from "../components/Ui";
import { io } from "socket.io-client";
import { api, apiUrl, getToken, getUser, isDemo } from "../lib/api";

const REPLIES = [
  "That works for me! Looking forward to it.",
  "Great — I'll prepare a few exercises.",
  "Sounds good. Want to start with the basics?",
  "Perfect, thanks for setting that up 🙌",
];

export default function Chat() {
  const me = getUser();
  const loc = useLocation();
  const [people, setPeople] = useState([]);
  const [active, setActive] = useState(loc.state?.with || null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const end = useRef(null);
  const timers = useRef([]);

  useEffect(() => {
    const pending = timers.current;
    api.users().then((u) => {
      const others = u.filter((x) => x.name !== me.name);
      setPeople(others);
      setActive((a) => a || others[0]?.name);
    }).catch(() => {});
    return () => pending.forEach(clearTimeout);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!active) return;
    let live = true;
    const pull = () => api.messages(me.name, active).then((m) => live && setMsgs(m)).catch(() => {});
    pull();
    // Live backend: receive messages over Socket.IO. Demo mode needs no socket.
    let socket;
    if (!isDemo()) {
      socket = io(apiUrl, { auth: { token: getToken() } });
      socket.on("receiveMessage", (m) => {
        const other = m.sender === me.name ? m.receiver : m.sender;
        if (live && other === active) setMsgs((x) => (x.some((y) => y._id === m._id) ? x : [...x, m]));
      });
    }
    return () => { live = false; socket?.disconnect(); };
    // eslint-disable-next-line
  }, [active]);

  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, typing]);

  const send = async (e) => {
    e.preventDefault();
    const message = text.trim();
    if (!message) return;
    setText("");
    const to = active;
    let sent;
    try { sent = await api.sendMessage({ sender: me.name, receiver: to, message }); }
    catch { setText(message); return; }
    setMsgs((m) => (m.some((y) => y._id === sent._id) ? m : [...m, sent]));
    if (isDemo()) {
      setTyping(true);
      timers.current.push(setTimeout(async () => {
        setTyping(false);
        try {
          const r = await api.sendMessage({ sender: to, receiver: me.name, message: REPLIES[Math.floor(Math.random() * REPLIES.length)] });
          setMsgs((m) => (active === to ? [...m, r] : m));
        } catch {}
      }, 1400));
    }
  };

  return (
    <div className="container">
      <PageHead title="Messages" sub="Coordinate sessions with your matches." />
      {people.length === 0 ? <Empty icon="chat" title="No conversations yet" text="Once other people join Exora, you can message them here." /> : (
      <div className="card chat">
        <div className="chat-list">
          {people.map((p) => (
            <button key={p._id} className={"chat-person" + (p.name === active ? " on" : "")} onClick={() => { setActive(p.name); setTyping(false); }}>
              <Avatar name={p.name} size={38} />
              <div><b>{p.name}</b><small>{p.skillsOffered.join(", ")}</small></div>
            </button>
          ))}
        </div>
        <div className="chat-pane">
          <div className="chat-head">{active && <><Avatar name={active} size={36} /><b>{active}</b></>}</div>
          <div className="chat-body" aria-live="polite">
            {msgs.length === 0 && <p className="muted" style={{ margin: "auto" }}>No messages yet — say hello 👋</p>}
            {msgs.map((m, i) => (
              <div key={m._id || i} className={"bubble" + (m.sender === me.name ? " me" : "")}>
                {m.message}
                {m.createdAt && <small>{timeAgo(m.createdAt)}</small>}
              </div>
            ))}
            {typing && <div className="bubble"><span className="typing"><i /><i /><i /></span></div>}
            <div ref={end} />
          </div>
          <form className="chat-form" onSubmit={send}>
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${active || ""}`} aria-label="Message" />
            <button className="btn btn-primary" aria-label="Send"><Icon name="send" size={16} /> Send</button>
          </form>
        </div>
      </div>)}
    </div>
  );
}
