// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("userRole") || "";
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white flex justify-between items-center p-4">
      <div>
        <Link to="/" className="font-bold text-xl">
          MyApp
        </Link>
      </div>

      <div className="flex gap-4">
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
              <>
                <Link to="/jobs" className="hover:text-green-400">
                  Apply Jobs
                </Link>
              </>
            ) : (
              <>
                <Link to="/create-job" className="hover:text-purple-400">
                  Create Job
                </Link>
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
    </nav>
  );
}
