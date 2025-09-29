// src/pages/Login.jsx
import React, { useState } from "react";
import { SiGoogle } from "react-icons/si";
import { loginUser, googleLogin, getProfile } from "../api";
import { useNavigate } from "react-router-dom";
export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
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
            localStorage.setItem("token", res.data.token);

            // fetch profile to store role and id locally so other pages can rely on it
            try {
                const me = await getProfile();
                const meData = me.data?.data || me.data;
                if (meData) {
                    localStorage.setItem("userRole", meData.role || "");
                    localStorage.setItem("userId", meData._id || meData.id || "");
                }
            } catch (err) {
                // non-fatal — still redirect to profile
                console.warn("Failed to fetch profile after login", err);
            }

            // Redirect to profile after successful login
            navigate("/profile");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#05060a] p-6">
            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Form */}
                <div className="relative rounded-2xl p-8 bg-gradient-to-b from-[#0b0c1a]/50 to-[#01020a]/80 border-2 border-[#0a0a0f] backdrop-blur-md shadow-lg">
                    <h1 className="text-white text-2xl font-bold mb-6">Sign In</h1>

                    {error && (
                        <div className="mb-4 text-sm text-rose-400 bg-[rgba(255,0,50,0.05)] border border-rose-500/30 rounded-md p-2">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded-lg bg-[#01020a] border-2 border-purple-600/40 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder:text-slate-400"
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 rounded-lg bg-[#01020a] border-2 border-red-600/40 focus:outline-none focus:ring-2 focus:ring-red-500 text-white placeholder:text-slate-400"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-lg font-semibold text-black bg-gradient-to-r from-[#7c3aed] via-[#06b6d4] to-[#ef4444] hover:brightness-105 transition shadow-[0_8px_30px_rgba(124,58,237,0.18)] disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <button
                        onClick={googleLogin}
                        className="mt-3 w-full py-3 rounded-lg font-semibold text-black bg-white hover:bg-gray-200 transition flex justify-center items-center gap-2"
                    >
                        <SiGoogle className="w-5 h-5" />
                        Sign in with Google
                    </button>

                    <p className="mt-4 text-center text-sm text-slate-400">
                        Don't have an account?{" "}
                        <a href="/signup" className="text-cyan-400 underline hover:text-cyan-300">
                            Sign up
                        </a>
                    </p>
                </div>

                {/* Right panel */}
                <div className="rounded-2xl p-6 bg-gradient-to-b from-[#00111a]/60 to-[#0b0222]/40 border-2 border-cyan-600 flex flex-col justify-center items-center text-center text-slate-400">
                    <h2 className="text-lg font-semibold text-white mb-2">Welcome Back!</h2>
                    <p>Sign in to access your dashboard and manage your profile.</p>
                </div>
            </div>
        </div>
    );
}
