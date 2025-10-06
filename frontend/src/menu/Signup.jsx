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
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Left: Form */}
        <div className="p-8">
          <h1 className="text-slate-900 text-3xl font-bold mb-2">Join GlobalConnect</h1>
          <p className="text-slate-600 mb-8">Create your professional account</p>

          {error && (
            <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
              />
            </div>

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
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500 mt-1">Min 8 chars · upper/lower · number · special</p>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2">Account Type</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="JobSeeker">Job Seeker</option>
                <option value="Employee">Employer</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2">Profile Picture (Optional)</label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-3 rounded-lg cursor-pointer bg-slate-50 border border-slate-300 text-slate-700 hover:bg-slate-100 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Choose Photo
                  <input
                    name="profilePic"
                    onChange={handleChange}
                    accept="image/*"
                    type="file"
                    className="hidden"
                  />
                </label>
                {form.profilePic && (
                  <span className="text-sm text-slate-600 truncate max-w-xs">
                    {form.profilePic.name}
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
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
              onClick={googleLogin}
              className="mt-4 w-full py-3 rounded-lg font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors flex justify-center items-center gap-2 shadow-sm"
            >
              <SiGoogle className="w-5 h-5 text-red-500" />
              Sign up with Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 font-medium hover:text-blue-700">
              Sign in
            </a>
          </p>
        </div>

        {/* Right panel */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex flex-col justify-center items-center text-center text-white">
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-blue-100 leading-relaxed">
            Connect with professionals, find opportunities, and grow your career in our global network.
          </p>
        </div>
      </div>
    </div>
  );
}
