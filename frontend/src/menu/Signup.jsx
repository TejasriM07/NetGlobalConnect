// src/pages/Signup.jsx
import React, { useState } from "react";
import { SiGoogle } from "react-icons/si";
import { registerUser, googleLogin, getProfile } from "../api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "JobSeeker",
    profilePic: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm((s) => ({ ...s, profilePic: files[0] }));
    else setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", form.role);
      if (form.profilePic) formData.append("profileImage", form.profilePic);

      const res = await registerUser(formData);
      setSuccess("Account created successfully!");
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
        console.warn("Failed to fetch profile after signup", err);
      }

      // redirect to profile
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
          <h1 className="text-white text-2xl font-bold mb-6">Create Account</h1>

          {error && (
            <div className="mb-4 text-sm text-rose-400 bg-[rgba(255,0,50,0.05)] border border-rose-500/30 rounded-md p-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm text-emerald-300 bg-[rgba(0,255,170,0.05)] border border-emerald-300/30 rounded-md p-2">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 rounded-lg bg-[#01020a] border-2 border-cyan-600/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-slate-400"
            />

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
            <p className="text-xs text-slate-400">Min 8 chars · upper/lower · number · special</p>

            <div className="relative">
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-[#01020a] border-2 border-white/20 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option className="bg-[#01020a] text-white" value="JobSeeker">
                  Job Seeker
                </option>
                <option className="bg-[#01020a] text-white" value="Employee">
                  Employer
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  className="w-4 h-4 text-white/60"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer bg-gradient-to-br from-[#06202a]/40 to-[#3a0b35]/30 border-2 border-cyan-500 text-white hover:border-cyan-400 transition">
                Choose file
                <input
                  name="profilePic"
                  onChange={handleChange}
                  accept="image/*"
                  type="file"
                  className="hidden"
                />
              </label>
              {form.profilePic && (
                <span className="text-sm text-cyan-300 truncate max-w-xs">
                  {form.profilePic.name} selected
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-black bg-gradient-to-r from-[#7c3aed] via-[#06b6d4] to-[#ef4444] hover:brightness-105 transition shadow-[0_8px_30px_rgba(124,58,237,0.18)] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
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
            Already have an account?{" "}
            <a href="/login" className="text-cyan-400 underline hover:text-cyan-300">
              Sign in
            </a>
          </p>
        </div>

        {/* Right panel */}
        <div className="rounded-2xl p-6 bg-gradient-to-b from-[#00111a]/60 to-[#0b0222]/40 border-2 border-cyan-600 flex flex-col justify-center items-center text-center text-slate-400">
          <h2 className="text-lg font-semibold text-white mb-2">Welcome!</h2>
          <p>Sign up to access your dashboard and manage your profile.</p>
        </div>
      </div>
    </div>
  );
}
