// src/components/ChatPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { getProfile, getUserById } from "../api";

export default function ChatPage() {
    const { id: otherUserId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [myId, setMyId] = useState(null);
    const [myName, setMyName] = useState("");
    const [otherUserName, setOtherUserName] = useState("");
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://netglobalconnect-1pu4.onrender.com";
    const token = localStorage.getItem("token");

    // Debug log to track user changes
    console.log("ChatPage rendered with otherUserId:", otherUserId);

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
                setOtherUserName(otherRes.data?.data?.name || "Unknown User");
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        };
        
        // Clear previous state when switching users
        setMessages([]);
        setNewMessage("");
        setMyId(null);
        setMyName("");
        setOtherUserName("");
        
        fetchUsers();
    }, [otherUserId]);

    // Fetch initial messages
    useEffect(() => {
        const fetchMessages = async () => {
            if (!myId || !otherUserId) return;
            
            console.log("Fetching messages between:", myId, "and", otherUserId);
            
            // Clear messages when switching to different user
            setMessages([]);
            
            try {
                const res = await axios.get(`${BACKEND_URL}/api/messages/${otherUserId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data?.success) {
                    const newMsgs = res.data.data || [];
                    console.log("Received messages:", newMsgs.length);
                    setMessages(newMsgs);
                }
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            }
        };
        fetchMessages();
    }, [myId, otherUserId, token, BACKEND_URL]);

    // Initialize Socket.IO
    useEffect(() => {
        if (!myId || !otherUserId) return;
        
        // Clean up existing socket if any
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        
        const socket = io(BACKEND_URL, { 
            auth: { token },
            forceNew: true // Force new connection to prevent reuse
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join", myId);
        });

        socket.on("private_message", (message) => {
            console.log("Received socket message:", message);
            // Only accept messages that are:
            // 1. Not from myself (avoid echo)
            // 2. Either from the other user TO me, or from me TO the other user
            if (!message?._id || message.senderId === myId) return;
            
            // Only show messages in this conversation
            if (message.senderId === otherUserId || message.receiverId === otherUserId) {
                setMessages((prev) => {
                    // Prevent duplicates by checking message ID
                    if (prev.some((m) => m._id === message._id)) {
                        console.log("Duplicate message prevented:", message._id);
                        return prev;
                    }
                    console.log("Adding new message:", message._id);
                    return [...prev, message];
                });
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [myId, otherUserId, BACKEND_URL, token]);

    // Send message
    const handleSendMessage = async () => {
        if (!newMessage.trim() || isSending) return;
        
        const content = newMessage;
        setNewMessage("");
        setIsSending(true);

        // Optimistic local message
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
                // Replace temp message with actual message from backend
                setMessages((prev) =>
                    prev.map((m) => (m._id === tempMessage._id ? res.data.data : m))
                );
                
                // Don't manually emit - let the backend handle socket broadcasting
                console.log("Message sent successfully:", res.data.data._id);
            }
        } catch (err) {
            console.error("Send failed:", err);
            // Remove temp message on error
            setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 text-slate-800">
            <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.172-.274c-.47-.117-.888-.436-1.337-.568-.404-.12-.844-.046-1.298.064C7.34 19.58 6.7 19.5 6.14 19.14c-.56-.36-1.14-.9-1.14-1.64 0-.74.58-1.28 1.14-1.64.56-.36 1.2-.44 1.86-.18.654.26 1.294.196 1.898-.064A8.955 8.955 0 0112 4c4.418 0 8 3.582 8 8z" />
                    </svg>
                    Chat with {otherUserName}
                </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.172-.274c-.47-.117-.888-.436-1.337-.568-.404-.12-.844-.046-1.298.064C7.34 19.58 6.7 19.5 6.14 19.14c-.56-.36-1.14-.9-1.14-1.64 0-.74.58-1.28 1.14-1.64.56-.36 1.2-.44 1.86-.18.654.26 1.294.196 1.898-.064A8.955 8.955 0 0112 4c4.418 0 8 3.582 8 8z" />
                        </svg>
                        <p className="text-slate-500 text-lg">No messages yet.</p>
                        <p className="text-slate-400 text-sm mt-2">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === myId;
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-xs px-4 py-2 rounded-lg break-words ${isMe
                                            ? "bg-blue-600 text-white"
                                            : "bg-white text-slate-800 border border-slate-200"
                                        }`}
                                >
                                    <p className="font-medium text-xs mb-1 opacity-75">
                                        {isMe ? myName : otherUserName}
                                    </p>
                                    <p>{msg.content}</p>
                                    <div className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-slate-500'}`}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-slate-200 p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isSending || !newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        {isSending ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
}
