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
    education: [],
    profilePic: "", // URL input
    // Inline inputs
    newSkill: "",
    newCompany: "",
    newRole: "",
    newFrom: "",
    newTo: "",
    newSchool: "",
    newDegree: "",
    newEduFrom: "",
    newEduTo: "",
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [validPic, setValidPic] = useState(true);
  const navigate = useNavigate();

  // Fetch current profile
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
            education: user.education || [],
            profilePic: user.profilePic?.url || "",
          }));
        } else {
          setMessage("Profile not found.");
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to load profile. Make sure you are logged in.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    if (name === "profilePic") {
      const isValid = /\.(jpg|jpeg|png|gif|webp)$/i.test(value.trim());
      setValidPic(isValid || value.trim() === "");
    }
  };

  // Remove skill
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

  // Remove education
  const handleRemoveEducation = (id) => {
    setForm((f) => ({
      ...f,
      education: (f.education || []).filter((edu) => edu.id !== id),
    }));
  };

  // Save profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validPic) {
      setMessage("Profile picture URL is invalid.");
      return;
    }

    try {
      const payload = {
        ...form,
        experience: form.experience.map(({ id, ...rest }) => rest),
        education: form.education.map(({ id, ...rest }) => rest),
        profilePic: form.profilePic
          ? { url: form.profilePic, publicId: "" }
          : null,
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-slate-900">Edit Profile</h2>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture URL */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Profile Picture URL</label>
              <input
                type="text"
                name="profilePic"
                value={form.profilePic}
                onChange={handleChange}
                placeholder="https://res.cloudinary.com/.../image.png"
                className={`w-full px-4 py-3 rounded-lg bg-slate-50 border ${validPic ? "border-slate-300" : "border-red-300"
                  } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-500`}
              />
              {form.profilePic && (
                <img
                  src={form.profilePic}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mt-4 object-cover border-4 border-blue-200 shadow-lg"
                />
              )}
              {!validPic && (
                <p className="text-red-600 text-sm mt-2">Please enter a valid image URL.</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
                required
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 resize-vertical"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Skills */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="text-slate-900 font-semibold mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {(form.skills || []).length > 0 ? (
                  form.skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm font-medium"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(idx)}
                        className="text-red-600 hover:text-red-800 font-bold ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No skills added</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter a new skill"
                  name="newSkill"
                  value={form.newSkill}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
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
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="text-slate-900 font-semibold mb-4">Experience</h3>
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
          <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <input
              type="text"
              placeholder="Company"
              name="newCompany"
              value={form.newCompany}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Role"
              name="newRole"
              value={form.newRole}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="newFrom"
                value={form.newFrom}
                onChange={handleChange}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="newTo"
                value={form.newTo}
                onChange={handleChange}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Experience
            </button>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <h3 className="text-slate-900 font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
            Education
          </h3>
          <div className="space-y-2 mb-3">
            {(form.education || []).length > 0 ? (
              form.education.map((edu, idx) => (
                <div
                  key={edu.id || edu._id || idx}
                  className="bg-[#11121f] p-3 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-white">{edu.degree}</p>
                    <p className="text-slate-400 text-sm">{edu.school}</p>
                    <p className="text-slate-500 text-xs">
                      {edu.from || "-"} → {edu.to || "-"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(edu.id || edu._id)}
                    className="text-red-400 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No education added</p>
            )}
          </div>
          <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <input
              type="text"
              placeholder="School"
              name="newSchool"
              value={form.newSchool}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Degree"
              name="newDegree"
              value={form.newDegree}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="newEduFrom"
                value={form.newEduFrom}
                onChange={handleChange}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                name="newEduTo"
                value={form.newEduTo}
                onChange={handleChange}
                className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (form.newSchool && form.newDegree) {
                  setForm((f) => ({
                    ...f,
                    education: [
                      ...(f.education || []),
                      {
                        id: Date.now(),
                        school: f.newSchool,
                        degree: f.newDegree,
                        from: f.newEduFrom || "",
                        to: f.newEduTo || "",
                      },
                    ],
                    newSchool: "",
                    newDegree: "",
                    newEduFrom: "",
                    newEduTo: "",
                  }));
                }
              }}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Education
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
        >
          Save Changes
        </button>

        {/* Cancel */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="w-full py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors duration-200"
        >
          Cancel
        </button>

            {message && <p className="text-blue-600 mt-4 text-center font-medium">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
