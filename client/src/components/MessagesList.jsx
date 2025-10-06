// src/components/MessagesList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function MessagesList() {
  const [conversations, setConversations] = useState([]);

  // ✅ Only use Vite-style env variables
  const BACKEND_URL =
    "https://netglobalconnect-1pu4.onrender.com";

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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200">
          <div className="border-b border-slate-200 p-6">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m0 0V9a2 2 0 012-2h2m0 0V6a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V9M17 13h-2m-3 3v-3h2" />
              </svg>
              Inbox
            </h2>
          </div>
          
          <div className="p-6">
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.172-.274c-.47-.117-.888-.436-1.337-.568-.404-.12-.844-.046-1.298.064C7.34 19.58 6.7 19.5 6.14 19.14c-.56-.36-1.14-.9-1.14-1.64 0-.74.58-1.28 1.14-1.64.56-.36 1.2-.44 1.86-.18.654.26 1.294.196 1.898-.064A8.955 8.955 0 0112 4c4.418 0 8 3.582 8 8z" />
                </svg>
                <p className="text-slate-500 text-lg">No conversations yet.</p>
                <p className="text-slate-400 text-sm mt-2">Start a conversation by visiting someone's profile and sending them a message.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <Link
                    key={conv.user._id}
                    to={`/messages/${conv.user._id}`}
                    className="block"
                  >
                    <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 hover:border-slate-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                          {conv.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-900">{conv.user.name}</div>
                          <div className="text-sm text-slate-600 truncate">
                            {conv.lastMessage?.content || "No messages"}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {conv.lastMessage
                              ? new Date(conv.lastMessage.timestamp).toLocaleString()
                              : ""}
                          </div>
                        </div>
                        <div className="text-slate-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
