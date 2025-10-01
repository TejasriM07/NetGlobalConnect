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

    async function finalizeLogin() {
      if (!token) {
        setMessage("Missing token. Redirecting to login…");
        setTimeout(() => navigate("/login"), 1200);
        return;
      }

      try {
        // persist token and prime axios
        setAuthToken(token);

        // fetch profile and persist basic fields for downstream pages
        try {
          const me = await getProfile();
          const meData = me.data?.data || me.data;
          if (meData) {
            localStorage.setItem("userRole", meData.role || "");
            localStorage.setItem("userId", meData._id || meData.id || "");
          }
        } catch (e) {
          // profile fetch failure shouldn't block login
          // proceed to app regardless
        }

        // let the app know auth state changed
        try { window.dispatchEvent(new Event("authchange")); } catch {}

        navigate("/profile", { replace: true });
      } catch (err) {
        setMessage("Sign-in failed. Redirecting to login…");
        setTimeout(() => navigate("/login"), 1200);
      }
    }

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


