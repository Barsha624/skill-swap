import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"]
});

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const sender = "User1";
  const receiver = "User2";

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/chat/${sender}/${receiver}`
      );
      setMessages(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMsg = {
      sender,
      receiver,
      message
    };

    try {
      await axios.post(
        "http://localhost:5000/api/chat/send",
        newMsg
      );

      socket.emit("sendMessage", newMsg);

      setMessage("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchMessages();

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);
  <div style={{ position: "relative", zIndex: 1 }}>
  {/* your entire page content */}
</div>

  return (
    <div style={{ padding: "20px" }}>
      <h2>Real-Time Chat ⚡💬</h2>

      <div>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.sender}:</b> {m.message}
          </p>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
  