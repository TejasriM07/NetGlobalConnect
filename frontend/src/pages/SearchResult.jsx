// src/pages/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendConnectionRequest, applyToJob } from "../api";
import defaultAvatar from "../assets/default.jpeg";
import axios from "axios";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const BACKEND_HOST = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const API_BASE = `${BACKEND_HOST.replace(/\/$/, "")}/api`;

  const initialQuery = location.state?.query || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState(""); // users | posts | jobs
  const [sortBy, setSortBy] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // for users
  const [results, setResults] = useState({});
  const [connectingUserId, setConnectingUserId] = useState("");
  const [sentRequests, setSentRequests] = useState(new Set());
  const [applyingJobId, setApplyingJobId] = useState("");
  const [appliedJobsSet, setAppliedJobsSet] = useState(new Set());

  const fetchResults = async () => {
    if (!query.trim()) return;
    try {
      const params = new URLSearchParams();
      params.append("q", query);
      if (searchType) params.append("type", searchType);
      if (sortBy) params.append("sortBy", sortBy);
      if (roleFilter && searchType === "users") params.append("role", roleFilter);

      const res = await axios.get(`${API_BASE}/search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      setResults(res.data);
    } catch (err) {
    }
  };

  useEffect(() => {
    fetchResults();
  }, [query, searchType, sortBy, roleFilter]);

  //           without requiring a manual refresh
  useEffect(() => {
    if (location.state && typeof location.state.query === "string") {
      setQuery(location.state.query);
    }
  }, [location.state]);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("appliedJobs") || "[]");
      setAppliedJobsSet(new Set(arr));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-4">
      <h2 className="text-2xl font-bold mb-4">Search Results</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-900"
        />
        <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-900">
          <option value="">All</option>
          <option value="users">Users</option>
          <option value="posts">Posts</option>
          <option value="jobs">Jobs</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-900">
          <option value="">Sort By</option>
          <option value="date">Date</option>
          <option value="likes">Likes</option>
          <option value="comments">Comments</option>
        </select>
        {searchType === "users" && (
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-900">
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
              <li key={job._id} className="p-3 bg-gray-100 rounded flex items-start justify-between gap-3">
                <div className="font-bold">{job.title}</div>
                <div className="flex-1">
                  <div>{job.description}</div>
                  <div className="text-sm text-gray-600">{job.company}</div>
                  <div className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 rounded bg-cyan-600 text-white" onClick={() => navigate("/jobs")}>
                    View Jobs
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-60"
                    disabled={applyingJobId === job._id || appliedJobsSet.has(job._id)}
                    onClick={async () => {
                      try {
                        setApplyingJobId(job._id);
                        await applyToJob(job._id);
                        setAppliedJobsSet((prev) => new Set([...Array.from(prev), job._id]));
                        try {
                          const appliedSet = new Set(JSON.parse(localStorage.getItem("appliedJobs") || "[]"));
                          appliedSet.add(job._id);
                          localStorage.setItem("appliedJobs", JSON.stringify(Array.from(appliedSet)));
                        } catch {}
                      } finally {
                        setApplyingJobId("");
                      }
                    }}
                  >
                    {appliedJobsSet.has(job._id) ? "Applied" : (applyingJobId === job._id ? "Applying..." : "Apply")}
                  </button>
                </div>
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
              <li key={post._id} className="p-3 bg-gray-100 rounded">
                <div className="font-bold">{post.author?.name || "Unknown"}</div>
                <div>{post.content}</div>
                <div className="text-sm text-gray-600">
                  Likes: {post.likesCount} | Comments: {post.commentsCount}
                </div>
                <div className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.users?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Users</h3>
          <ul className="space-y-2">
            {results.users.map((user) => (
              <li key={user._id} className="p-3 bg-gray-100 rounded flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <img src={user.profilePic || defaultAvatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-400">{user.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                    onClick={() => navigate(`/users/${user._id}`)}
                  >
                    View Profile
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-60"
                    disabled={connectingUserId === user._id || sentRequests.has(user._id)}
                    onClick={async () => {
                      try {
                        setConnectingUserId(user._id);
                        await sendConnectionRequest(user._id);
                        setSentRequests((prev) => new Set([...Array.from(prev), user._id]));
                        setConnectingUserId("");
                      } catch (e) {
                        setConnectingUserId("");
                      }
                    }}
                  >
                    {sentRequests.has(user._id) ? "Request Sent" : (connectingUserId === user._id ? "Connecting..." : "Connect")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!results.jobs?.length && !results.posts?.length && !results.users?.length && (
        <p className="text-gray-500">No results found.</p>
      )}
    </div>
  );
}
