// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // for mobile
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    const t = localStorage.getItem("token");
    setIsLoggedIn(!!t);
    setUserRole(role);

    const updateFromStorage = () => {
      const updatedToken = localStorage.getItem("token");
      const updatedRole = localStorage.getItem("userRole") || "";
      setIsLoggedIn(!!updatedToken);
      setUserRole(updatedRole);
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
    localStorage.clear();
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate("/search-results", { state: { query: searchQuery } });
    setMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-40 bg-gray-900 text-white border-b border-gray-800 ${hasScrolled ? "shadow-[0_2px_12px_rgba(0,0,0,0.35)]" : ""}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="font-bold text-xl tracking-tight">
              NetGlobalConnect
            </NavLink>
          </div>

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

          <div className="hidden md:flex items-center gap-2">
            {!isLoggedIn ? (
              <>
                <NavLink to="/" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                  Home
                </NavLink>
                <NavLink to="/login" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                  Signup
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/feed" end className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                  Feed
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                  Profile
                </NavLink>
                <NavLink to="/jobs" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                  Jobs
                </NavLink>
                <NavLink to="/messages" className={({ isActive }) => `${baseLink} ${isActive ? active : inactive}`}>
                  Inbox
                </NavLink>
                <button onClick={handleLogout} className="ml-2 px-3 py-2 rounded-md text-red-300 hover:text-white hover:bg-red-600/20">
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
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
              <Link to="/login" className="block px-3 py-2 rounded hover:bg-gray-700">
                Login
              </Link>
              <Link to="/signup" className="block px-3 py-2 rounded hover:bg-gray-700">
                Signup
              </Link>
            </>
          ) : (
            <>
              <Link to="/profile" className="block px-3 py-2 rounded hover:bg-gray-700">
                Profile
              </Link>
              <Link to="/jobs" className="block px-3 py-2 rounded hover:bg-gray-700">
                Jobs
              </Link>
              <Link to="/messages" className="block px-3 py-2 rounded hover:bg-gray-700">
                Inbox
              </Link>
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded hover:bg-red-600">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}