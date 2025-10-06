import React, { useState, useEffect } from "react";
import { SiGoogle } from "react-icons/si";
import { loginUser, getProfile, setAuthToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // --- Handle token from Google redirect ---
    useEffect(() => {
        console.log("Login page loaded");
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        console.log("URL token:", token);

        if (token) {
            console.log("Google login token detected, setting auth...");
            setLoading(true);
            setAuthToken(token);

            getProfile()
                .then((res) => {
                    const meData = res.data?.data || res.data;
                    if (meData) {
                        localStorage.setItem("userRole", meData.role || "");
                        localStorage.setItem("userId", meData._id || meData.id || "");
                    }
                    navigate("/profile");
                })
                .catch((err) => {
                    navigate("/profile");
                })
                .finally(() => setLoading(false));
        }
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await loginUser(form);
            const token = res.data.token;
            setAuthToken(token);

            try {
                const me = await getProfile();
                const meData = me.data?.data || me.data;
                if (meData) {
                    localStorage.setItem("userRole", meData.role || "");
                    localStorage.setItem("userId", meData._id || meData.id || "");
                }
            } catch (err) {
                console.warn("Failed to fetch profile after login", err);
            }

            navigate("/profile");
        } catch (err) {
            console.error("Login error:", err);
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log("Redirecting to Google OAuth...");
        window.location.href = "https://netglobalconnect.onrender.com/api/auth/google";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow-xl overflow-hidden">
                {/* Left: Form */}
                <div className="p-8">
                    <h1 className="text-slate-900 text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-slate-600 mb-8">Sign in to your account</p>

                    {error && (
                        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-700 font-medium mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-700 font-medium mb-2">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-slate-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            className="mt-4 w-full py-3 rounded-lg font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex justify-center items-center gap-2 shadow-sm"
                        >
                            <SiGoogle className="w-5 h-5 text-red-500" />
                            Sign in with Google
                        </button>
                    </div>

                    <p className="mt-8 text-center text-sm text-slate-600">
                        Don't have an account?{" "}
                        <a href="/signup" className="text-blue-600 font-medium hover:text-blue-700">
                            Sign up
                        </a>
                    </p>
                </div>

                {/* Right panel */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex flex-col justify-center items-center text-center text-white">
                    <div className="mb-6">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Connect & Grow</h2>
                    <p className="text-blue-100 leading-relaxed">
                        Join thousands of professionals who are building their careers and expanding their networks on GlobalConnect.
                    </p>
                </div>
            </div>
        </div>
    );
}
