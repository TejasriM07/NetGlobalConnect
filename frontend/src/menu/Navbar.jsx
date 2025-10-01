// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole") || "";
    setIsLoggedIn(!!token);
    setUserRole(role);
    const updateFromStorage = () => {
      const t = localStorage.getItem("token");
      const r = localStorage.getItem("userRole") || "";
      setIsLoggedIn(!!t);
      setUserRole(r);
    };
    const onAuthChange = () => updateFromStorage();
    const onStorage = (e) => {
      if (e.key === "token" || e.key === "userRole") updateFromStorage();
    };
    const onFocus = () => updateFromStorage();
    window.addEventListener("authchange", onAuthChange);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("authchange", onAuthChange);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/login");
    try { window.dispatchEvent(new Event("authchange")); } catch {}
  };

  const baseLink = "px-3 py-2 rounded-md transition-colors";
  const active = "text-cyan-400";
  const inactive = "text-gray-300 hover:text-white";

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-40 bg-gray-900 text-white border-b border-gray-800 ${hasScrolled ? "shadow-[0_2px_12px_rgba(0,0,0,0.35)]" : ""}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="font-bold text-xl tracking-tight">
              NetGlobalConnect
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <NavLink to="/" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                  Home
                </NavLink>
                <NavLink to="/login" className={({ isActive }) => `${baseLink} relative ${isActive ? active : inactive} ${isActive ? "after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:bg-cyan-400 after:rounded-full" : ""}`}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={({ isActive }) => `${baseLink} relative ${isActive ? active : inactive} ${isActive ? "after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:bg-cyan-400 after:rounded-full" : ""}`}>
                  Signup
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/feed" end className={({ isActive }) => `${baseLink} relative ${isActive ? active : inactive} ${isActive ? "after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:bg-cyan-400 after:rounded-full" : ""}`}>
                  Feed
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `${baseLink} relative ${isActive ? active : inactive} ${isActive ? "after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:bg-cyan-400 after:rounded-full" : ""}`}>
                  Profile
                </NavLink>
                {userRole === "JobSeeker" ? (
                  <NavLink to="/jobs" className={({ isActive }) => `${baseLink} relative ${isActive ? active : inactive} ${isActive ? "after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:bg-cyan-400 after:rounded-full" : ""}`}>
                    Jobs
                  </NavLink>
                ) : (
                  <>
                    <NavLink to="/create-job" className={({ isActive }) => `${baseLink} relative ${isActive ? active : inactive} ${isActive ? "after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:bg-cyan-400 after:rounded-full" : ""}`}>
                      Create Job
                    </NavLink>
                    <NavLink to="/jobs" className={({ isActive }) => `${baseLink} relative ${isActive ? active : inactive} ${isActive ? "after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:bg-cyan-400 after:rounded-full" : ""}`}>
                      View Jobs
                    </NavLink>
                  </>
                )}
                <NavLink to="/messages" className={({ isActive }) => `${baseLink} relative ${isActive ? active : inactive} ${isActive ? "after:absolute after:left-3 after:right-3 after:-bottom-1 after:h-0.5 after:bg-cyan-400 after:rounded-full" : ""}`}>
                  Inbox
                </NavLink>
                <button onClick={handleLogout} className="ml-2 px-3 py-2 rounded-md text-red-300 hover:text-white hover:bg-red-600/20">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
