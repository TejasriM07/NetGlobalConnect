// src/pages/OAuthSuccess.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProfile, setAuthToken } from "../api";

export default function OAuthSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    const finalizeLogin = async () => {
      if (!token) {
        setMessage("Missing token. Redirecting to login…");
        setTimeout(() => navigate("/login"), 1200);
        return;
      }

      try {
        // Store token (set header + localStorage via setAuthToken)
        setAuthToken(token);

        // Fetch user profile
        const res = await getProfile();
        const meData = res.data?.data || res.data;
        if (meData) {
          localStorage.setItem("userRole", meData.role || "");
          localStorage.setItem("userId", meData._id || meData.id || "");
        }

        // Notify the app that authentication state changed so Navbar (and others) update immediately
        try { window.dispatchEvent(new Event("authchange")); } catch {}

        // Navigate to feed
        navigate("/feed", { replace: true });
      } catch (err) {
        console.error("OAuth finalize error:", err);
        setMessage("Sign-in failed. Redirecting to login…");
        setTimeout(() => navigate("/login"), 1200);
      }
    };

    finalizeLogin();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05060a] p-6 text-white">
      <div className="text-center">
        <div className="animate-pulse text-slate-300">{message}</div>
      </div>
    </div>
  );
}
