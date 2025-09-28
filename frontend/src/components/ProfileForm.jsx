// src/pages/EditProfile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../api";

export default function EditProfile() {
  const [form, setForm] = useState({
    name: "",
    bio: "",
    skills: [],
    experience: [],
    // new fields for inline inputs
    newSkill: "",
    newCompany: "",
    newRole: "",
    newFrom: "",
    newTo: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fetch current logged-in user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        if (res.data?.data) {
          const user = res.data.data;
          setForm((f) => ({
            ...f,
            name: user.name || "",
            bio: user.bio || "",
            skills: user.skills || [],
            experience: user.experience || [],
          }));
        } else {
          setMessage("Profile not found.");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setMessage("Failed to load profile. Make sure you are logged in.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Remove skills
  const handleRemoveSkill = (idx) => {
    const newSkills = [...(form.skills || [])];
    newSkills.splice(idx, 1);
    setForm((f) => ({ ...f, skills: newSkills }));
  };

  // Remove experience
  const handleRemoveExperience = (id) => {
    setForm((f) => ({
      ...f,
      experience: (f.experience || []).filter((exp) => exp.id !== id),
    }));
  };

  // Save updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        experience: form.experience.map(({ id, ...rest }) => rest),
      };

      const res = await updateProfile(payload);
      if (res.data?.data) {
        setMessage("Profile updated successfully!");
        setTimeout(() => navigate("/profile"), 1000);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (loading) return <p className="text-slate-400 p-6">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#12121b] p-8 text-white">
      <h2 className="text-3xl font-bold text-center mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        {/* Name */}
        <div>
          <label className="block text-cyan-400 font-bold mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl bg-[#11121f] border border-cyan-500 focus:ring-2 focus:ring-cyan-400 text-white"
            required
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-cyan-400 font-bold mb-1">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-xl bg-[#11121f] border border-cyan-500 focus:ring-2 focus:ring-cyan-400 text-white"
          />
        </div>

        {/* Skills */}
        <div className="bg-[#1a1a25]/80 rounded-3xl p-4">
          <h3 className="text-cyan-400 font-bold mb-2">Skills</h3>

          <div className="flex flex-wrap gap-2 mb-3">
            {(form.skills || []).length > 0 ? (
              form.skills.map((skill, idx) => (
                <div
                  key={idx}
                  className="bg-cyan-500/20 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-red-400 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No skills added</p>
            )}
          </div>

          {/* Inline Add Skill */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter a new skill"
              name="newSkill"
              value={form.newSkill}
              onChange={handleChange}
              className="flex-1 px-3 py-2 rounded-lg bg-[#11121f] border border-cyan-500 text-white"
            />
            <button
              type="button"
              onClick={() => {
                if (form.newSkill.trim()) {
                  setForm((f) => ({
                    ...f,
                    skills: [...(f.skills || []), f.newSkill.trim()],
                    newSkill: "",
                  }));
                }
              }}
              className="px-4 py-2 bg-cyan-500 text-black font-bold rounded-lg hover:brightness-110"
            >
              Add
            </button>
          </div>
        </div>

        {/* Experience */}
        <div className="bg-[#1a1a25]/80 rounded-3xl p-4">
          <h3 className="text-cyan-400 font-bold mb-3">Experience</h3>

          <div className="space-y-2 mb-3">
            {(form.experience || []).length > 0 ? (
              form.experience.map((exp, idx) => (
                <div
                  key={exp.id || exp._id || idx}
                  className="bg-[#11121f] p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-white">{exp.role}</p>
                    <p className="text-slate-400 text-sm">{exp.company}</p>
                    <p className="text-slate-500 text-xs">
                      {exp.from || "-"} → {exp.to || "-"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(exp.id || exp._id)}
                    className="text-red-400 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No experience added</p>
            )}
          </div>

          {/* Inline Add Experience */}
          <div className="space-y-2 bg-[#11121f] p-3 rounded-lg">
            <input
              type="text"
              placeholder="Company"
              name="newCompany"
              value={form.newCompany}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a25] border border-cyan-500 text-white"
            />
            <input
              type="text"
              placeholder="Role"
              name="newRole"
              value={form.newRole}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a25] border border-cyan-500 text-white"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="newFrom"
                value={form.newFrom}
                onChange={handleChange}
                className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a25] border border-cyan-500 text-white"
              />
              <input
                type="date"
                name="newTo"
                value={form.newTo}
                onChange={handleChange}
                className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a25] border border-cyan-500 text-white"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (form.newCompany && form.newRole) {
                  setForm((f) => ({
                    ...f,
                    experience: [
                      ...(f.experience || []),
                      {
                        id: Date.now(),
                        company: f.newCompany,
                        role: f.newRole,
                        from: f.newFrom || "",
                        to: f.newTo || "",
                      },
                    ],
                    newCompany: "",
                    newRole: "",
                    newFrom: "",
                    newTo: "",
                  }));
                }
              }}
              className="w-full py-2 bg-cyan-500 text-black font-bold rounded-lg hover:brightness-110"
            >
              Add Experience
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-3xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-bold hover:brightness-110 transition"
        >
          Save Changes
        </button>

        {/* Cancel */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="w-full py-2 rounded-full border border-cyan-400 text-cyan-400 font-semibold hover:bg-cyan-500 hover:text-black transition"
        >
          Cancel
        </button>

        {message && <p className="text-cyan-400 mt-4 text-center">{message}</p>}
      </form>
    </div>
  );
}
