// src/pages/SearchResults.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { sendConnectionRequest, applyToJob } from "../api";
import defaultAvatar from "../assets/default.jpeg";
import axios from "axios";

export default function SearchResults() {
  const location = useLocation();
  const BACKEND_HOST =
    import.meta.env.VITE_BACKEND_URL || "https://netglobalconnect.onrender.com";
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

  // modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

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
    } catch (err) {}
  };

  useEffect(() => {
    fetchResults();
  }, [query, searchType, sortBy, roleFilter]);

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
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-900"
        >
          <option value="">All</option>
          <option value="users">Users</option>
          <option value="posts">Posts</option>
          <option value="jobs">Jobs</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-900"
        >
          <option value="">Sort By</option>
          <option value="date">Date</option>
          <option value="likes">Likes</option>
          <option value="comments">Comments</option>
        </select>
        {searchType === "users" && (
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-900"
          >
            <option value="">Role</option>
            <option value="JobSeeker">JobSeeker</option>
            <option value="Employee">Employer</option>
          </select>
        )}
      </div>

      {/* Jobs */}
      {results.jobs?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Jobs</h3>
          <ul className="space-y-2">
            {results.jobs.map((job) => (
              <li
                key={job._id}
                className="p-3 bg-gray-100 rounded flex items-start justify-between gap-3"
              >
                <div className="font-bold">{job.title}</div>
                <div className="flex-1">
                  <div>{job.description}</div>
                  <div className="text-sm text-gray-600">{job.company}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded bg-cyan-600 text-white"
                    onClick={() => setSelectedJob(job)}
                  >
                    View
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-60"
                    disabled={applyingJobId === job._id || appliedJobsSet.has(job._id)}
                    onClick={async () => {
                      try {
                        setApplyingJobId(job._id);
                        await applyToJob(job._id);
                        setAppliedJobsSet((prev) => new Set([...Array.from(prev), job._id]));
                        localStorage.setItem(
                          "appliedJobs",
                          JSON.stringify(Array.from(new Set([...appliedJobsSet, job._id])))
                        );
                      } finally {
                        setApplyingJobId("");
                      }
                    }}
                  >
                    {appliedJobsSet.has(job._id)
                      ? "Applied"
                      : applyingJobId === job._id
                      ? "Applying..."
                      : "Apply"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Users */}
      {results.users?.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Users</h3>
          <ul className="space-y-2">
            {results.users.map((user) => (
              <li
                key={user._id}
                className="p-3 bg-gray-100 rounded flex items-center gap-3 justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.profilePic || defaultAvatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-400">{user.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 rounded bg-blue-600 text-white"
                    onClick={() => setSelectedUser(user)}
                  >
                    View Profile
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-60"
                    disabled={
                      connectingUserId === user._id || sentRequests.has(user._id)
                    }
                    onClick={async () => {
                      try {
                        setConnectingUserId(user._id);
                        await sendConnectionRequest(user._id);
                        setSentRequests(
                          (prev) => new Set([...Array.from(prev), user._id])
                        );
                        setConnectingUserId("");
                      } catch {
                        setConnectingUserId("");
                      }
                    }}
                  >
                    {sentRequests.has(user._id)
                      ? "Request Sent"
                      : connectingUserId === user._id
                      ? "Connecting..."
                      : "Connect"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No Results */}
      {!results.jobs?.length &&
        !results.posts?.length &&
        !results.users?.length && (
          <p className="text-gray-500">No results found.</p>
        )}

      {/* User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <img
              src={selectedUser.profilePic || defaultAvatar}
              alt={selectedUser.name}
              className="w-20 h-20 rounded-full object-cover mx-auto"
            />
            <p className="mt-2"><strong>Name:</strong> {selectedUser.name}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.role}</p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => setSelectedUser(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Job Details</h2>
            <p><strong>Title:</strong> {selectedJob.title}</p>
            <p><strong>Company:</strong> {selectedJob.company}</p>
            <p><strong>Description:</strong> {selectedJob.description}</p>
            <p><strong>Location:</strong> {selectedJob.location || "N/A"}</p>
            <p className="text-xs text-gray-500 mt-2">
              Posted: {new Date(selectedJob.createdAt).toLocaleString()}
            </p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
              onClick={() => setSelectedJob(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
