import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getConnectionRequests } from "../api";
import { io } from "socket.io-client";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // for mobile
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://netglobalconnect-1pu4.onrender.com";
  const socketRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setIsLoggedIn(!!token);
    setUserRole(role);
    
    // Fetch pending connection requests
    if (token) {
  fetchPendingRequests();
  fetchUnreadMessages();
      // Initialize socket for real-time notifications
      try {
        socketRef.current = io(BACKEND_URL, { auth: { token } });
        socketRef.current.on("connect", () => {
          const userId = localStorage.getItem("userId");
          if (userId) socketRef.current.emit("join", userId);
        });

        // Listen for incoming messages notifications to show unread ping
        socketRef.current.on("private_message", (msg) => {
          // If the message was sent to the logged-in user and not from the current chat,
          // increment the unread messages ping. We don't have the active chat context here,
          // so we conservatively increment and allow the chat page to clear when opened.
          const myId = localStorage.getItem("userId");
          if (msg.receiverId === myId && msg.senderId !== myId) {
            setUnreadMessages((prev) => prev + 1);
          }
        });
      } catch (socketErr) {
        console.log("Socket init failed:", socketErr.message);
      }
      // Set up periodic check for new requests and notifications
      const interval = setInterval(() => {
        fetchPendingRequests();
  fetchUnreadMessages();
      }, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
    return () => {
      // Cleanup socket on unmount or when token changes
      if (socketRef.current) {
        socketRef.current.off();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  const fetchPendingRequests = async () => {
    try {
      const res = await getConnectionRequests();
      setPendingRequests(res.data.requests?.length || 0);
    } catch (err) {
      console.log("Backend may be sleeping, will retry on next interval:", err.message);
      // Don't log full error to avoid console spam when backend sleeps
    }
  };
  const fetchUnreadMessages = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/messages/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadMessages(data.count || 0);
      } else {
        console.log('Failed to fetch unread messages:', response.status);
      }
    } catch (err) {
      console.log("Backend may be sleeping, will retry on next interval:", err.message);
      // Don't log full error to avoid console spam when backend sleeps
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate("/search-results", { state: { query: searchQuery } });
  };

  return (
    <nav className="bg-white text-slate-800 shadow-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left - App Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="font-bold text-xl text-blue-600">
              GlobalConnect
            </Link>
          </div>

{/* Center - Search */}
{isLoggedIn && (
  <div className="flex-1 flex justify-center mx-4">
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-lg sm:max-w-md md:max-w-lg lg:max-w-xl"
    >
      <input
        type="text"
        placeholder="Search users, posts, jobs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 px-4 py-2 rounded-l-lg bg-slate-100 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-300 w-full"
      />
      <button
        type="submit"
        className="ml-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg text-white whitespace-nowrap transition-colors"
      >
        Search
      </button>
    </form>
  </div>
)}


          {/* Right - Menu */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  Profile
                  {pendingRequests > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {pendingRequests}
                    </span>
                  )}
                </Link>

                <Link to="/feed" className="hover:text-blue-600 transition-colors">
                  Posts
                </Link>

                {userRole === "JobSeeker" ? (
                  <Link to="/jobs" className="hover:text-green-600 transition-colors">
                    Find Jobs
                  </Link>
                ) : (
                  <>
                    <Link to="/jobs" className="hover:text-blue-600 transition-colors">
                      Manage Jobs
                    </Link>
                  </>
                )}

                <Link to="/messages" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  Inbox
                  {unreadMessages > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                <button onClick={handleLogout} className="hover:text-red-600 transition-colors">
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-2 pt-2 pb-3 space-y-1">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="block px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                Login
              </Link>
              <Link to="/signup" className="block px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="block px-3 py-2 rounded text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                Profile
                {pendingRequests > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingRequests}
                  </span>
                )}
              </Link>

              <Link to="/feed" className="block px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                Posts
              </Link>

              {userRole === "JobSeeker" ? (
                <Link to="/jobs" className="block px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                  Apply Jobs
                </Link>
              ) : (
                <>
                  <Link to="/jobs" className="block px-3 py-2 rounded text-slate-700 hover:bg-slate-100">
                    View Jobs
                  </Link>
                </>
              )}

              <Link to="/messages" className="block px-3 py-2 rounded text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                Inbox
                {unreadMessages > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded text-slate-700 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}