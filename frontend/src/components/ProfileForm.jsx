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
  const [localPreview, setLocalPreview] = useState("");
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

  // Resize/compress image to keep payload small !!!
  const downscaleImageToDataURL = (file, maxSide = 256, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = () => {
        img.onload = () => {
          let { width, height } = img;
          const scale = Math.min(1, maxSide / Math.max(width, height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported"));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          try {
            const dataUrl = canvas.toDataURL("image/jpeg", quality);
            resolve(dataUrl);
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = reject;
        img.src = String(reader.result || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload -> compress and store Data URL 
  const handleFile = async (file) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      setMessage("Please select an image file.");
      return;
    }
    try {
      // Downscale to keep JSON body small (<= ~200KB target) !!!
      const dataUrl = await downscaleImageToDataURL(file, 300, 0.7);
      const approxBytes = Math.ceil((dataUrl.length * 3) / 4); // base64 size estimate
      if (approxBytes > 220 * 1024) {
        setMessage("Image too large after compression. Try a smaller image or paste a URL.");
        return;
      }
      setForm((f) => ({ ...f, profilePic: String(dataUrl || "") }));
      setLocalPreview(String(dataUrl || ""));
      setValidPic(true);
    } catch (e) {
      setMessage("Failed to process image. Please try a different file.");
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
      setMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (loading) return <p className="text-slate-400 p-6">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#12121b] p-8 text-white">
      <h2 className="text-3xl font-bold text-center mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
        {/* Profile Picture: Upload or URL */}
        <div>
          <label className="block text-cyan-400 font-bold mb-1">Profile Picture</label>
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <span className="px-4 py-2 rounded-xl bg-[#11121f] border border-cyan-500 text-cyan-300 hover:bg-[#0d0e1a]">Upload Image (auto-compress)</span>
            </label>
            <span className="text-slate-400 text-sm">or</span>
            <input
              type="text"
              name="profilePic"
              value={form.profilePic}
              onChange={handleChange}
              placeholder="Paste image URL"
              className={`flex-1 px-4 py-2 rounded-xl bg-[#11121f] border ${validPic ? "border-cyan-500" : "border-red-500"} focus:ring-2 focus:ring-cyan-400 text-white`}
            />
          </div>
          {(localPreview || form.profilePic) && (
            <img
              src={localPreview || form.profilePic}
              alt="Profile"
              className="w-32 h-32 rounded-full mt-3 object-cover border border-cyan-500"
            />
          )}
          {!validPic && (
            <p className="text-red-400 text-sm mt-1">Please enter a valid image URL.</p>
          )}
        </div>

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

        {/* Education */}
        <div className="bg-[#1a1a25]/80 rounded-3xl p-4">
          <h3 className="text-cyan-400 font-bold mb-3">Education</h3>
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
          <div className="space-y-2 bg-[#11121f] p-3 rounded-lg">
            <input
              type="text"
              placeholder="School"
              name="newSchool"
              value={form.newSchool}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a25] border border-cyan-500 text-white"
            />
            <input
              type="text"
              placeholder="Degree"
              name="newDegree"
              value={form.newDegree}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-[#1a1a25] border border-cyan-500 text-white"
            />
            <div className="flex gap-2">
              <input
                type="date"
                name="newEduFrom"
                value={form.newEduFrom}
                onChange={handleChange}
                className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a25] border border-cyan-500 text-white"
              />
              <input
                type="date"
                name="newEduTo"
                value={form.newEduTo}
                onChange={handleChange}
                className="flex-1 px-3 py-2 rounded-lg bg-[#1a1a25] border border-cyan-500 text-white"
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
              className="w-full py-2 bg-cyan-500 text-black font-bold rounded-lg hover:brightness-110"
            >
              Add Education
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
