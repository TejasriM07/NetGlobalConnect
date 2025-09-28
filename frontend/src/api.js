// src/api/index.js
import axios from "axios";

// --- Axios instance ---
const API = axios.create({
    baseURL: "http://localhost:5000/api",
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
    window.open("http://localhost:5000/api/auth/google", "_self");
};

// --- Profile ---
export const getProfile = () => API.get("/users/me");

export const updateProfile = (data) =>
    API.put("/users/me", data, { headers: { "Content-Type": "application/json" } });

export const getUserById = (userId) => API.get(`/users/${userId}`);

// --- Connections ---
export const sendConnectionRequest = (userId) =>
    API.post(`/users/${userId}/connect`);

export const respondToConnectionRequest = (userId, action) =>
    API.post(`/users/connections/accept/${userId}`, { action });

export const rejectConnectionRequest = (userId) =>
    API.post(`/users/connections/reject/${userId}`);

// --- Posts / Feed ---
export const getFeed = (userId) => API.get(`/posts/feed/${userId}`);

export const createPost = (content) => API.post("/posts", { content });

// --- Messages / Conversations ---
export const getConversations = () => API.get("/messages/conversations");

export const getMessages = (conversationId) =>
    API.get(`/messages/${conversationId}`);

export const sendMessage = (conversationId, content) =>
    API.post(`/messages/${conversationId}`, { content });

// --- Logout ---
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
};
