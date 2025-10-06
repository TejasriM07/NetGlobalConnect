import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import defaultAvatar from "../assets/default.jpeg"

export default function MessagesList() {
  const [conversations, setConversations] = useState([]);

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "https://netglobalconnect.onrender.com";

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
        console.error(err);
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
              <Link to={`/messages/${conv.user._id}`} className="flex items-center gap-3">
                <img
                  src={conv.user.profilePic?.url || defaultAvatar}
                  alt={conv.user.name || "User"}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="font-semibold">{conv.user.name || "Unknown User"}</div>
                  <div className="text-sm text-gray-400 truncate">
                    {conv.lastMessage?.content || "No messages"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {conv.lastMessage
                      ? new Date(conv.lastMessage.timestamp).toLocaleString()
                      : ""}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
