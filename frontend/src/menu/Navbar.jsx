// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    // Check if user is logged in on mount
    useEffect(() => {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token"); // remove JWT
        localStorage.removeItem("user");  // optional if storing user info
        setIsLoggedIn(false);
        navigate("/login"); // redirect to login
    };

    return (
        <nav className="bg-gray-900 text-white flex justify-between items-center p-4">
            <div>
                <Link to="/" className="font-bold text-xl">MyApp</Link>
            </div>
            <div className="flex gap-4">
                {!isLoggedIn ? (
                    <>
                        <Link to="/login" className="hover:text-cyan-400">Login</Link>
                        <Link to="/signup" className="hover:text-cyan-400">Signup</Link>
                    </>
                ) : (
                    <>
                        <Link to="/profile" className="hover:text-cyan-400">Profile</Link>
                        <Link to="/messages" className="hover:text-yellow-400">Inbox</Link>
                        <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}
