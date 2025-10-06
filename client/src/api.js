// src/api/index.js
import axios from "axios";

// Get backend URL from environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://netglobalconnect.onrender.com";

// --- Axios instance ---
const API = axios.create({
    baseURL: `${BACKEND_URL}/api`,
});

// Automatically attach token if exists
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Helper to set/remove token programmatically
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem("token", token);
        API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        localStorage.removeItem("token");
        delete API.defaults.headers.common["Authorization"];
    }
};

// --- Auth ---
export const registerUser = (formData) =>
    API.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const loginUser = (data) => API.post("/auth/login", data);

export const googleLogin = () => {
    window.open(`${BACKEND_URL}/api/auth/google`, "_self");
};

// --- Profile ---
export const getProfile = () => API.get("/users/me");
// Update profile (including profile image)
export const updateProfile = (data) => API.put("/users/me", data, { headers: { "Content-Type": "application/json" } });
export const getUserById = (userId) => API.get(`/users/${userId}`);


// --- Connections ---
export const rejectConnectionRequest = (userId) =>
    API.post(`/users/connections/reject/${userId}`);
// Send connection request to a user
export const sendConnectionRequest = (userId) =>
    API.post(`/users/connections/connect/${userId}`, {});
export const getConnectionRequests = () => API.get("/users/connections/requests");
// Connections list
export const getConnections = () => API.get("/users/connections/connections");
// Accept/reject request
export const respondToConnectionRequest = (userId, action) =>
  API.post(`/users/connections/${action}/${userId}`);
// Disconnect from user
export const disconnectUser = (userId) => 
  API.delete(`/users/connections/disconnect/${userId}`);



// --- Messages / Conversations ---
export const getConversations = () => API.get("/messages/conversations");

export const getMessages = (conversationId) =>
    API.get(`/messages/${conversationId}`);

export const sendMessage = (conversationId, content) =>
    API.post(`/messages/${conversationId}`, { content });

// --- Feed / Posts ---
export const getFeed = (userId) => API.get(`/feed/`);
export const getAllPosts = () => API.get("/posts");
export const createPost = (formData) => API.post(`/posts`, formData, { headers: { "Content-Type": "multipart/form-data" } });
export const likePost = (postId) => API.post(`/posts/${postId}/like`);
export const reportPost = (postId) => API.post(`/posts/${postId}/report`);
export const getReportedPosts = () => API.get("/posts/reported");
export const commentPost = (postId, text) => API.post(`/posts/${postId}/comment`, { text });

// --- Jobs / Applicants ---
// Fetch all applicants for a specific job
export const getJobApplicants = (jobId) => API.get(`/jobs/${jobId}/applicants`);
export const createJob = (jobData) => API.post("/jobs", jobData, { headers: { "Content-Type": "application/json" } });
export const getJobs = () => API.get("/jobs");
export const applyToJob = (jobId) => API.post(`/jobs/apply/${jobId}`);

// --- Logout ---
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    window.location.href = "/login";
};
