// src/pages/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { sendConnectionRequest } from "../api";

export default function SearchResults() {
  const location = useLocation();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://netglobalconnect-1pu4.onrender.com";
  const token = localStorage.getItem("token");

  const initialQuery = location.state?.query || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState(""); // users | posts | jobs
  const [sortBy, setSortBy] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // for users
  const [results, setResults] = useState({});
  const [connectingUsers, setConnectingUsers] = useState(new Set());
  const [connectedUsers, setConnectedUsers] = useState(new Set()); // Track connected users
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // "success" or "error"

  // Fetch current connections
  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/users/connections/connections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const connections = res.data.connections || res.data.data || [];
      const connectedUserIds = new Set(connections.map(conn => conn._id));
      setConnectedUsers(connectedUserIds);
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  const fetchResults = async () => {
    if (!query.trim()) return;
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      if (searchType) params.append("type", searchType);
      if (sortBy) params.append("sortBy", sortBy);
      if (roleFilter && searchType === "users") params.append("role", roleFilter);

      const res = await axios.get(`${BACKEND_URL}/api/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setResults(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleConnect = async (userId) => {
    try {
      setConnectingUsers(prev => new Set([...prev, userId]));
      await sendConnectionRequest(userId);
      setMessage("Connection request sent successfully!");
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Connection error:", err);
      const errorMessage = err.response?.data?.message || "Failed to send connection request";
      setMessage(errorMessage);
      setMessageType("error");
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchConnections(); // Fetch connections when component mounts
  }, []);

  useEffect(() => {
    fetchResults();
  }, [query, searchType, sortBy, roleFilter]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Search Results</h2>

      {message && (
        <div className={`mb-4 p-3 rounded-lg border ${
          messageType === "success" 
            ? "bg-green-50 border-green-200 text-green-700" 
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="px-3 py-1 rounded border"
        />
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="px-3 py-1 rounded border">
          <option value="">All</option>
          <option value="users">Users</option>
          <option value="posts">Posts</option>
          <option value="jobs">Jobs</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1 rounded border">
          <option value="">Sort By</option>
          <option value="date">Date</option>
          <option value="likes">Likes</option>
          <option value="comments">Comments</option>
        </select>
        {searchType === "users" && (
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-1 rounded border">
            <option value="">Role</option>
            <option value="JobSeeker">JobSeeker</option>
            <option value="Employer">Employer</option>
          </select>
        )}
      </div>

      {/* Results */}
      {results.jobs?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Jobs</h3>
          <ul className="space-y-2">
            {results.jobs.map((job) => (
              <li key={job._id} className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="font-bold text-slate-900">{job.title}</div>
                <div className="text-slate-700">{job.description}</div>
                <div className="text-sm text-slate-600">{job.company}</div>
                <div className="text-xs text-slate-500">{new Date(job.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.posts?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Posts</h3>
          <ul className="space-y-2">
            {results.posts.map((post) => (
              <li key={post._id} className="p-3 bg-slate-50 border border-slate-200 rounded">
                <div className="font-bold text-slate-900">{post.author?.name || "Unknown"}</div>
                <div className="text-slate-700">{post.content}</div>
                <div className="text-sm text-slate-600">
                  Likes: {post.likesCount} | Comments: {post.commentsCount}
                </div>
                <div className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.users?.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Users
          </h3>
          <div className="space-y-3">
            {results.users.map((user) => (
              <div key={user._id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img 
                    src={user.profilePic?.url || "/default-avatar.png"} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-200" 
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{user.name}</div>
                    <div className="text-sm text-slate-600">{user.email}</div>
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mt-1">
                      {user.role}
                    </div>
                  </div>
                </div>
                {connectedUsers.has(user._id) ? (
                  <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Connected
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(user._id)}
                    disabled={connectingUsers.has(user._id)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {connectingUsers.has(user._id) ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!results.jobs?.length && !results.posts?.length && !results.users?.length && (
        <p className="text-gray-500">No results found.</p>
      )}
    </div>
  );
}
