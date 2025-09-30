// src/components/MessagesList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function MessagesList() {
  const [conversations, setConversations] = useState([]);

  // ✅ Only use Vite-style env variables
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          setConversations(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };

    if (token) {
      fetchConversations();
    }
  }, [token, BACKEND_URL]);

  return (
    <div className="p-4 h-screen bg-black text-white">
      <h2 className="text-xl font-bold mb-4">Inbox</h2>
      {conversations.length === 0 ? (
        <p className="text-gray-400">No conversations yet.</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((conv) => (
            <li
              key={conv.user._id}
              className="p-3 bg-gray-800 rounded hover:bg-gray-700 transition"
            >
              <Link to={`/messages/${conv.user._id}`}>
                <div className="font-semibold">{conv.user.name}</div>
                <div className="text-sm text-gray-400 truncate">
                  {conv.lastMessage?.content || "No messages"}
                </div>
                <div className="text-xs text-gray-500">
                  {conv.lastMessage
                    ? new Date(conv.lastMessage.timestamp).toLocaleString()
                    : ""}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
