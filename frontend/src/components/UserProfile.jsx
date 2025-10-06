import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, getProfile, sendConnectionRequest } from "../api";
import defaultAvatar from "../assets/default.jpeg";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [showResume, setShowResume] = useState(false); // Resume modal

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, meRes] = await Promise.all([getUserById(id), getProfile()]);

        if (userRes.data?.data) setProfile(userRes.data.data);
        else setMessage("User not found.");

        setCurrentUser(meRes.data.data);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load profile.");
      }
    };
    fetchData();
  }, [id]);

  if (!profile || !currentUser) return <p className="text-white p-6">Loading profile...</p>;

  const isConnected = profile.connections?.includes(currentUser._id);
  const isRequestSent = profile.connectionRequests?.includes(currentUser._id);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await sendConnectionRequest(profile._id);
      setProfile((prev) => ({
        ...prev,
        connectionRequests: [...(prev.connectionRequests || []), currentUser._id],
      }));
      setMessage("Connection request sent!");
    } catch (err) {
      setMessage("Failed to send request");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center p-8">
      <div className="w-full max-w-6xl grid md:grid-cols-3 gap-8 text-white">
        {/* Left column: Profile + Stats */}
        <div className="md:col-span-1 flex flex-col items-center bg-[#11121f]/80 rounded-3xl p-6 shadow-lg border border-[#06b6d4]/40">
          <div className="w-40 h-40 rounded-full border-4 border-cyan-400 shadow-lg overflow-hidden">
            <img
              src={
                typeof profile.profilePic === "string"
                  ? profile.profilePic.trim()
                  : profile.profilePic?.url || defaultAvatar
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold">{profile.name}</h2>
          <p className="text-cyan-400">{profile.role}</p>

          <div className="mt-6 space-y-3 w-full">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2f]/70">
              <span className="flex-1">Connections</span>
              <span className="font-bold">{profile.connections?.length || 0}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2f]/70">
              <span className="flex-1">Skills</span>
              <span className="font-bold">{(profile.skills || []).length}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2f]/70">
              <span className="flex-1">Saved Jobs</span>
              <span className="font-bold">{profile.savedJobs?.length || 0}</span>
            </div>
          </div>

          {/* Connect, Message & Resume Buttons */}
          <div className="mt-8 flex flex-col items-center gap-4 w-full">
            {!isConnected && !isRequestSent && profile._id !== currentUser._id && (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="w-full py-3 rounded-full text-white bg-green-600 font-semibold hover:bg-green-500 transition shadow-lg"
              >
                {connecting ? "Sending..." : "Connect"}
              </button>
            )}
            {isConnected && <p className="text-green-400">Connected</p>}
            {isRequestSent && <p className="text-yellow-400">Request Sent</p>}

            <button
              onClick={() => navigate(`/messages/${profile._id}`)}
              className="w-full py-3 rounded-full text-white bg-cyan-600 font-semibold hover:bg-cyan-500 transition shadow-lg"
            >
              Message
            </button>

            {/* View Resume Button */}
            {profile.resume?.url && (
              <button
                onClick={() => setShowResume(true)}
                className="w-full py-3 rounded-full text-white bg-purple-600 font-semibold hover:bg-purple-500 transition shadow-lg"
              >
                View Resume
              </button>
            )}
          </div>
        </div>

        {/* Right column: Bio, Skills, Experience, Education */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Bio */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#7c3aed]/30 shadow-inner">
            <h3 className="text-cyan-400 font-bold mb-2 text-lg">Bio</h3>
            <p className="text-white">{profile.bio || "No bio added"}</p>
          </div>

          {/* Skills */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#06b6d4]/30 shadow-inner">
            <h3 className="text-cyan-400 font-bold mb-3 text-lg">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).length > 0 ? (
                profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/40 transition"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No skills added</p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#f43f5e]/30 shadow-inner">
            <h3 className="text-cyan-400 font-bold mb-3 text-lg">Experience</h3>
            {(profile.experience || []).length > 0 ? (
              profile.experience.map((exp, idx) => (
                <div
                  key={idx}
                  className="mb-3 p-4 bg-[#1a1a2f]/60 rounded-xl border border-[#7c3aed]/20"
                >
                  <p className="font-semibold">{exp.role || "-"}</p>
                  <p className="text-slate-300 text-sm">{exp.company || "-"}</p>
                  <p className="text-slate-500 text-xs">
                    {exp.from ? new Date(exp.from).toLocaleDateString() : "-"} →{" "}
                    {exp.to ? new Date(exp.to).toLocaleDateString() : "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No experience added</p>
            )}
          </div>

          {/* Education */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#3b82f6]/30 shadow-inner">
            <h3 className="text-cyan-400 font-bold mb-3 text-lg">Education</h3>
            {(profile.education || []).length > 0 ? (
              profile.education.map((edu, idx) => (
                <div
                  key={idx}
                  className="mb-3 p-4 bg-[#1a1a2f]/60 rounded-xl border border-[#3b82f6]/20"
                >
                  <p className="font-semibold">{edu.degree || "-"}</p>
                  <p className="text-slate-300 text-sm">{edu.school || "-"}</p>
                  <p className="text-slate-500 text-xs">
                    {edu.from ? new Date(edu.from).toLocaleDateString() : "-"} →{" "}
                    {edu.to ? new Date(edu.to).toLocaleDateString() : "-"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No education added</p>
            )}
          </div>
        </div>

        {message && (
          <p className="text-cyan-400 mt-6 text-center col-span-full">{message}</p>
        )}
      </div>

      {/* Resume Modal */}
      {showResume && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#11121f] p-4 rounded-2xl w-[90%] max-w-3xl border border-purple-400/40 shadow-xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold"
              onClick={() => setShowResume(false)}
            >
              ✕
            </button>
            <h2 className="text-purple-400 text-xl font-bold mb-4">Resume</h2>

            {/* Download Button */}
            <div className="mb-4 text-right">
              <a
                href={profile.resume.url}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-500 transition shadow"
              >
                Download Resume
              </a>
            </div>

            <div className="w-full h-[70vh]">
              <iframe
                src={profile.resume?.url}
                className="w-full h-full rounded-xl border border-purple-400"
                title="Resume"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
