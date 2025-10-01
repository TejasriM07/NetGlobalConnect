// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

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

          {/* Right - Menu (Desktop) */}
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
                <NavLink
                  to="/feed"
                  end
                  className={({ isActive }) =>
                    `relative ${isActive ? "text-cyan-400" : "hover:text-cyan-300"}`
                  }
                >
                  Feed
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive ? "text-cyan-400" : "hover:text-cyan-300"
                  }
                >
                  Profile
                </NavLink>

                {userRole === "JobSeeker" ? (
                  <NavLink
                    to="/jobs"
                    className={({ isActive }) =>
                      isActive ? "text-green-400" : "hover:text-green-300"
                    }
                  >
                    Apply Jobs
                  </NavLink>
                ) : (
                  <NavLink
                    to="/jobs"
                    className={({ isActive }) =>
                      isActive ? "text-yellow-400" : "hover:text-yellow-300"
                    }
                  >
                    View Jobs
                  </NavLink>
                )}

                <NavLink
                  to="/messages"
                  className={({ isActive }) =>
                    isActive ? "text-yellow-400" : "hover:text-yellow-300"
                  }
                >
                  Inbox
                </NavLink>

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
              <Link
                to="/login"
                className="block px-3 py-2 rounded hover:bg-gray-700"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded hover:bg-gray-700"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded ${
                    isActive ? "bg-gray-700 text-cyan-400" : "hover:bg-gray-700"
                  }`
                }
              >
                Profile
              </NavLink>

              {userRole === "JobSeeker" ? (
                <NavLink
                  to="/jobs"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded ${
                      isActive ? "bg-gray-700 text-green-400" : "hover:bg-gray-700"
                    }`
                  }
                >
                  Apply Jobs
                </NavLink>
              ) : (
                <NavLink
                  to="/jobs"
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded ${
                      isActive ? "bg-gray-700 text-yellow-400" : "hover:bg-gray-700"
                    }`
                  }
                >
                  View Jobs
                </NavLink>
              )}

              <NavLink
                to="/messages"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded ${
                    isActive ? "bg-gray-700 text-yellow-400" : "hover:bg-gray-700"
                  }`
                }
              >
                Inbox
              </NavLink>

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
