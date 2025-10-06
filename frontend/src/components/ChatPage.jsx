// src/components/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { getProfile, getUserById } from "../api";
import defaultAvatar from "../assets/default.jpeg";

export default function ChatPage() {
    const { id: otherUserId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [myId, setMyId] = useState(null);
    const [myName, setMyName] = useState("");
    const [otherUser, setOtherUser] = useState({ name: "Unknown User", profilePic: null });
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://netglobalconnect.onrender.com";
    const token = localStorage.getItem("token");

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch current user and other user info
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const meRes = await getProfile();
                setMyId(meRes.data?.data?._id);
                setMyName(meRes.data?.data?.name || "You");

                const otherRes = await getUserById(otherUserId);
                setOtherUser({
                    name: otherRes.data?.data?.name || "Unknown User",
                    profilePic: otherRes.data?.data?.profilePic || null,
                });
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        };
        fetchUsers();
    }, [otherUserId]);

    // Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!myId) return;
            try {
                const res = await axios.get(`${BACKEND_URL}/api/messages/${otherUserId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data?.success) {
                    const newMsgs = res.data.data || [];
                    setMessages((prev) => {
                        const map = new Map();
                        [...prev, ...newMsgs].forEach((m) => map.set(m._id, m));
                        return Array.from(map.values());
                    });
                }
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            }
        };
        fetchMessages();
    }, [myId, otherUserId, token]);

    // Initialize Socket.IO
    useEffect(() => {
        if (!myId) return;
        const socket = io(BACKEND_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join", myId);
        });

        socket.on("private_message", (message) => {
            if (!message?._id || message.senderId === myId) return;
            setMessages((prev) => {
                if (prev.some((m) => m._id === message._id)) return prev;
                return [...prev, message];
            });
        });

        return () => socket.disconnect();
    }, [myId, BACKEND_URL, token]);

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        const content = newMessage;
        setNewMessage("");

        const tempMessage = {
            _id: "temp-" + Date.now(),
            senderId: myId,
            receiverId: otherUserId,
            content,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, tempMessage]);

        try {
            const res = await axios.post(
                `${BACKEND_URL}/api/messages`,
                { receiverId: otherUserId, content },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data?.success) {
                setMessages((prev) =>
                    prev.map((m) => (m._id === tempMessage._id ? res.data.data : m))
                );

                socketRef.current.emit("private_message", {
                    ...res.data.data,
                    to: otherUserId,
                });
            }
        } catch (err) {
            console.error("Send failed:", err);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-50px)] bg-black text-white p-4">
            {/* Header with profile pic */}
            <div className="flex items-center mb-4 border-b border-gray-700 pb-2 gap-3">
                <img
                    src={otherUser.profilePic?.url || defaultAvatar}
                    alt={otherUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                />
                <h2 className="text-xl font-bold">Chatting with {otherUser.name}</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 px-2 py-2 rounded bg-gray-900 flex flex-col">
                {messages.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center mt-4">No messages yet.</p>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === myId;
                        return (
                            <div
                                key={msg._id}
                                className={`my-1 p-2 rounded max-w-xs break-words ${isMe
                                        ? "bg-blue-500 self-end text-right ml-auto"
                                        : "bg-gray-700 self-start text-left mr-auto"
                                    }`}
                            >
                                <p className="font-semibold text-sm mb-1">
                                    {isMe ? myName : otherUser.name}
                                </p>
                                {msg.content}
                                <div className="text-xs text-gray-300 mt-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-3 py-2 rounded bg-gray-800 border border-gray-600 focus:outline-none"
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
