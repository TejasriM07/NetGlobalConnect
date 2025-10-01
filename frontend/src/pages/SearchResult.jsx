// src/pages/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import defaultAvatar from "../assets/default.jpeg"

export default function SearchResults() {
  const location = useLocation();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://netglobalconnect.onrender.com";
  const token = localStorage.getItem("token");

  const initialQuery = location.state?.query || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState(""); // users | posts | jobs
  const [sortBy, setSortBy] = useState("");
  const [roleFilter, setRoleFilter] = useState(""); // for users
  const [results, setResults] = useState({});

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

  useEffect(() => {
    fetchResults();
  }, [query, searchType, sortBy, roleFilter]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Search Results</h2>

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
              <li key={job._id} className="p-3 bg-gray-100 rounded">
                <div className="font-bold">{job.title}</div>
                <div>{job.description}</div>
                <div className="text-sm text-gray-600">{job.company}</div>
                <div className="text-xs text-gray-400">{new Date(job.createdAt).toLocaleString()}</div>
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
              <li key={user._id} className="p-3 bg-gray-100 rounded flex items-center gap-3">
                <img src={user.profilePic || defaultAvatar} alt={user.name} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="font-bold">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-400">{user.role}</div>
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
