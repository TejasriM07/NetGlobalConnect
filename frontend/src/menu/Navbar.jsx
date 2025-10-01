// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false); // for mobile
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "";
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, [token]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate("/search-results", { state: { query: searchQuery } });
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left - App Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="font-bold text-xl">
              Connect
            </Link>
          </div>

{/* Center - Search */}
{isLoggedIn && (
  <div className="flex-1 flex justify-center mx-4">
    <form
      onSubmit={handleSearch}
      className="flex w-full max-w-lg sm:max-w-md md:max-w-lg lg:max-w-xl"
    >
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 px-4 py-1 rounded-l bg-gray-200 text-black focus:outline-none w-full"
      />
      <button
        type="submit"
        className="ml-2 bg-cyan-500 hover:bg-cyan-600 px-3 sm:px-4 py-1 rounded-r text-white whitespace-nowrap"
      >
        Search
      </button>
    </form>
  </div>
)}


          {/* Right - Menu */}
          <div className="hidden md:flex items-center gap-4">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="hover:text-cyan-400">
                  Login
                </Link>
                <Link to="/signup" className="hover:text-cyan-400">
                  Signup
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile" className="hover:text-cyan-400">
                  Profile
                </Link>

                {userRole === "JobSeeker" ? (
                  <Link to="/jobs" className="hover:text-green-400">
                    Apply Jobs
                  </Link>
                ) : (
                  <>
                    <Link to="/jobs" className="hover:text-yellow-400">
                      View Jobs
                    </Link>
                  </>
                )}

                <Link to="/messages" className="hover:text-yellow-400">
                  Inbox
                </Link>

                <button onClick={handleLogout} className="hover:text-red-400">
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
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 px-2 pt-2 pb-3 space-y-1">
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

              {userRole === "JobSeeker" ? (
                <Link to="/jobs" className="block px-3 py-2 rounded hover:bg-gray-700">
                  Apply Jobs
                </Link>
              ) : (
                <>
                  <Link to="/jobs" className="block px-3 py-2 rounded hover:bg-gray-700">
                    View Jobs
                  </Link>
                </>
              )}

              <Link to="/messages" className="block px-3 py-2 rounded hover:bg-gray-700">
                Inbox
              </Link>

              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}