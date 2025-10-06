// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { setAuthToken, getProfile } from "../api";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const updateAuthState = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole") || "";
    setIsLoggedIn(!!token);
    setUserRole(role);
    if (token) setAuthToken(token);
  };

  useEffect(() => {
    // Initial check
    updateAuthState();

    // If token exists but role is missing, try to fetch profile once to fill role/id
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole") || "";
    if (token && !role) {
      (async () => {
        try {
          const res = await getProfile();
          const meData = res.data?.data || res.data;
          if (meData) {
            localStorage.setItem("userRole", meData.role || "");
            localStorage.setItem("userId", meData._id || meData.id || "");
            setUserRole(meData.role || "");
            try { window.dispatchEvent(new Event("authchange")); } catch {}
          }
        } catch (err) {
          // ignore
        }
      })();
    }

    // Listen to global authchange events
    const onAuthChange = () => updateAuthState();
    const onStorage = (e) => {
      if (e.key === "token" || e.key === "userRole") updateAuthState();
    };

    window.addEventListener("authchange", onAuthChange);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("authchange", onAuthChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    try { window.dispatchEvent(new Event("authchange")); } catch {}
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate("/search-results", { state: { query: searchQuery } });
    setMenuOpen(false);
  };

  const baseLink = "px-3 py-2 rounded-md text-sm font-medium";
  const active = "bg-gray-700 text-white";
  const inactive = "text-gray-300 hover:bg-gray-700 hover:text-white";

  return (
    <nav className="sticky top-0 z-40 bg-gray-900 text-white border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 flex h-14 items-center justify-between">
        <NavLink to={isLoggedIn ? "/feed" : "/"} className="font-bold text-xl tracking-tight">
          NetGlobalConnect
        </NavLink>

        {/* Desktop Search */}
        {isLoggedIn && (
          <div className="hidden md:flex flex-1 justify-center mx-4">
            <form onSubmit={handleSearch} className="flex w-full max-w-xl">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-1 rounded-l bg-gray-200 text-black focus:outline-none w-full"
              />
              <button type="submit" className="ml-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-1 rounded-r text-white">
                Search
              </button>
            </form>
          </div>
        )}

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              <NavLink to="/" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>Home</NavLink>
              <NavLink to="/login" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>Login</NavLink>
              <NavLink to="/signup" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>Signup</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/feed" end className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>Feed</NavLink>
              <NavLink to="/profile" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>Profile</NavLink>
              <NavLink to="/jobs" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>Jobs</NavLink>
              {(userRole === "Employee" || userRole === "Admin") && (
                <NavLink to="/create-job" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>Create Job</NavLink>
              )}
              <NavLink to="/messages" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>Inbox</NavLink>
              <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-300 hover:text-white">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 px-2 pt-2 pb-3 space-y-1">
          {isLoggedIn && (
            <form onSubmit={handleSearch} className="flex w-full px-2 pb-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-l bg-gray-200 text-black focus:outline-none"
              />
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-r text-white">
                Search
              </button>
            </form>
          )}

          {!isLoggedIn ? (
            <>
              <Link to="/login" className="block px-3 py-2 rounded hover:bg-gray-700">Login</Link>
              <Link to="/signup" className="block px-3 py-2 rounded hover:bg-gray-700">Signup</Link>
            </>
          ) : (
            <>
              <Link to="/feed" className="block px-3 py-2 rounded hover:bg-gray-700">Feed</Link>
              <Link to="/profile" className="block px-3 py-2 rounded hover:bg-gray-700">Profile</Link>
              <Link to="/jobs" className="block px-3 py-2 rounded hover:bg-gray-700">Jobs</Link>
              {(userRole === "Employee" || userRole === "Admin") && (
                <Link to="/create-job" className="block px-3 py-2 rounded hover:bg-gray-700">Create Job</Link>
              )}
              <Link to="/messages" className="block px-3 py-2 rounded hover:bg-gray-700">Inbox</Link>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded hover:bg-red-600">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
