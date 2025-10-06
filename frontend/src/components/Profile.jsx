import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  getConnectionRequests,
  getConnections,
  respondToConnectionRequest
} from "../api";
import { User, Briefcase, Star, Users, Mail, Edit3, X, FileText } from "lucide-react";
import defaultAvatar from "../assets/default.jpeg";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [message, setMessage] = useState("");
  const [showConnections, setShowConnections] = useState(false);
  const [showResume, setShowResume] = useState(false); 
  const navigate = useNavigate();
  const isAdmin = (profile?.role === "Admin") || (localStorage.getItem("userRole") === "Admin");

  // Fetch profile info
  const fetchProfileData = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data?.data || null);
    } catch (err) {
      setMessage("Failed to load profile.");
    }
  };

  // Fetch incoming connection requests & current connections
  const fetchRequestsAndConnections = async () => {
    try {
      const [reqRes, connRes] = await Promise.all([
        getConnectionRequests(),
        getConnections()
      ]);
      setConnectionRequests(reqRes.data.requests || []);
      setConnections(connRes.data.connections || connRes.data.data || []);
    } catch (err) {
      setMessage("Failed to load requests/connections.");
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchRequestsAndConnections();
  }, []);

  // Accept or reject connection requests
  const handleRequest = async (userId, action) => {
    try {
      await respondToConnectionRequest(userId, action);
      setMessage(`Request ${action}ed successfully`);
      fetchRequestsAndConnections(); // Refresh data
    } catch (err) {
      setMessage(`Failed to ${action} request`);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#0d0d17] to-[#12121f] p-10 text-white flex justify-center">
        <div className="max-w-6xl w-full grid md:grid-cols-3 gap-8 animate-pulse">
          <div className="md:col-span-1 bg-[#11121f]/80 rounded-3xl p-6 border border-[#06b6d4]/20">
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full border-4 border-cyan-400/30 bg-[#1a1a2f]" />
              <div className="mt-4 h-6 w-32 bg-[#1a1a2f] rounded" />
              <div className="mt-2 h-4 w-20 bg-[#1a1a2f] rounded" />
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-10 bg-[#1a1a2f] rounded-xl" />
              <div className="h-10 bg-[#1a1a2f] rounded-xl" />
              <div className="h-10 bg-[#1a1a2f] rounded-xl" />
            </div>
            <div className="mt-6 h-10 bg-[#1a1a2f] rounded-xl" />
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#7c3aed]/20">
              <div className="h-5 w-24 bg-[#1a1a2f] rounded mb-3" />
              <div className="h-4 w-4/5 bg-[#1a1a2f] rounded mb-2" />
              <div className="h-4 w-2/3 bg-[#1a1a2f] rounded" />
            </div>
            <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#06b6d4]/20">
              <div className="h-5 w-24 bg-[#1a1a2f] rounded mb-3" />
              <div className="flex gap-2 flex-wrap">
                <div className="h-6 w-16 bg-[#1a1a2f] rounded-full" />
                <div className="h-6 w-20 bg-[#1a1a2f] rounded-full" />
                <div className="h-6 w-14 bg-[#1a1a2f] rounded-full" />
              </div>
            </div>
            <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-pink-400/20">
              <div className="h-5 w-28 bg-[#1a1a2f] rounded mb-3" />
              <div className="space-y-2">
                <div className="h-12 bg-[#1a1a2f] rounded-xl" />
                <div className="h-12 bg-[#1a1a2f] rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#0d0d17] to-[#12121f] p-10 text-white flex justify-center">
      <div className="max-w-6xl w-full grid md:grid-cols-3 gap-8">
        {/* Left column: Profile info */}
        <div className="md:col-span-1 bg-[#11121f]/80 rounded-3xl p-6 shadow-lg border border-[#06b6d4]/40">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-400 shadow-lg overflow-hidden">
              <img
                src={profile.profilePic?.url || defaultAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold">{profile.name}</h2>
            <p className="text-cyan-400">{profile.role}</p>
          </div>

          {/* Stats */}
          <div className="mt-6 space-y-3">
            <div
              className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2f]/70 cursor-pointer hover:bg-[#1a1a2f]"
              onClick={() => setShowConnections(true)}
            >
              <Users className="text-purple-400" size={20} />
              <span className="flex-1">Connections</span>
              <span className="font-bold">{connections.length}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2f]/70">
              <Star className="text-cyan-400" size={20} />
              <span className="flex-1">Skills</span>
              <span className="font-bold">{(profile.skills || []).length}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2f]/70">
              <Briefcase className="text-pink-400" size={20} />
              <span className="flex-1">Saved Jobs</span>
              <span className="font-bold">{profile.savedJobs?.length || 0}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/edit-profile")}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-semibold flex items-center justify-center gap-2 hover:brightness-110"
          >
            <Edit3 size={18} /> Edit Profile
          </button>

          {/* View Resume Button */}
          {profile.resume?.url && (
            <button
              onClick={() => setShowResume(true)}
              className="mt-4 w-full py-3 rounded-xl bg-cyan-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-cyan-500"
            >
              <FileText size={18} /> View Resume
            </button>
          )}

          {/* My Posts Button */}
          <button
            onClick={() => navigate("/my-posts")}
            className="mt-4 w-full py-3 rounded-xl bg-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-purple-500"
          >
            <FileText size={18} /> My Posts
          </button>

          <button
            onClick={() => {
              if (profile.role === "JobSeeker") {
                navigate("/applied-jobs");
              } else if (profile.role === "Employee") {
                navigate("/posted-jobs");
              }
            }}
            className="mt-4 w-full py-3 rounded-xl bg-purple-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-purple-600"
          >
            {profile.role === "JobSeeker" ? "Applied Jobs" : "My Posted Jobs"}
          </button>
        </div>

        {/* Right column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#7c3aed]/30 shadow-inner">
            <h3 className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
              <User size={18} /> Bio
            </h3>
            <p className="text-slate-300">{profile.bio || "No bio added"}</p>
          </div>

          {/* Skills */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#06b6d4]/30 shadow-inner">
            <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
              <Star size={18} /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-sm bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/40 transition"
                >
                  {skill}
                </span>
              ))}
              {(profile.skills || []).length === 0 && (
                <p className="text-slate-400 text-sm">No skills added</p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-pink-400/30 shadow-inner">
            <h3 className="text-pink-400 font-bold mb-3 flex items-center gap-2">
              <Briefcase size={18} /> Experience
            </h3>
            {profile.experience && profile.experience.length > 0 ? (
              <ul className="space-y-2">
                {profile.experience.map((exp, idx) => (
                  <li key={idx} className="p-3 bg-[#1a1a2f]/70 rounded-xl">
                    <p className="font-semibold">{exp.role || "Role"}</p>
                    <p className="text-sm text-slate-400">{exp.company || "Company"}</p>
                    <p className="text-sm text-slate-400">
                      {exp.from ? new Date(exp.from).toLocaleDateString() : "From"} -{" "}
                      {exp.to ? new Date(exp.to).toLocaleDateString() : "To"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm">No experience added</p>
            )}
          </div>

          {/* Education */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-blue-400/30 shadow-inner">
            <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
              <Briefcase size={18} /> Education
            </h3>
            {profile.education && profile.education.length > 0 ? (
              <ul className="space-y-2">
                {profile.education.map((edu, idx) => (
                  <li key={idx} className="p-3 bg-[#1a1a2f]/70 rounded-xl">
                    <p className="font-semibold">{edu.degree || "Degree"}</p>
                    <p className="text-sm text-slate-400">{edu.school || "School"}</p>
                    <p className="text-sm text-slate-400">
                      {edu.from ? new Date(edu.from).toLocaleDateString() : "From"} -{" "}
                      {edu.to ? new Date(edu.to).toLocaleDateString() : "To"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400 text-sm">No education added</p>
            )}
          </div>

          {/* Incoming Connection Requests */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-yellow-400/30 shadow-inner">
            <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
              <Mail size={18} /> Incoming Connection Requests
            </h3>
            {connectionRequests.length > 0 ? (
              connectionRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex justify-between items-center p-3 bg-[#1a1a2f]/70 rounded-xl mb-2"
                >
                  <p>{req.name || req.email || "Unknown User"}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequest(req._id, "accept")}
                      className="px-3 py-1 bg-green-500/80 rounded text-black font-semibold hover:bg-green-500"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequest(req._id, "reject")}
                      className="px-3 py-1 bg-red-500/80 rounded text-black font-semibold hover:bg-red-500"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No incoming requests</p>
            )}
          </div>

          {/* Connections */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-green-400/30 shadow-inner">
            <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
              <Users size={18} /> Connections
            </h3>
            {connections.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {connections.map((conn) => (
                  <span
                    key={conn._id}
                    className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 text-sm hover:bg-green-500/40 transition cursor-pointer"
                    onClick={() => setShowConnections(true)}
                  >
                    {conn.name || conn.email || "Unknown User"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No connections yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#7c3aed]/30 shadow-inner">
            <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
              Quick Actions
            </h3>
            <div className="flex gap-2 flex-wrap">
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => navigate("/reported-posts")}
                  className="px-3 py-2 rounded-lg text-sm border border-rose-600 text-rose-300 hover:bg-rose-600/10"
                >
                  Reported Posts
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/my-reported-posts")}
                  className="px-3 py-2 rounded-lg text-sm border border-amber-600 text-amber-300 hover:bg-amber-600/10"
                >
                  My Reported Posts
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Connections Modal */}
      {showConnections && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#11121f] p-6 rounded-2xl w-[90%] max-w-lg border border-green-400/40 shadow-xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setShowConnections(false)}
            >
              <X size={22} />
            </button>
            <h2 className="text-green-400 text-xl font-bold mb-4 flex items-center gap-2">
              <Users size={20} /> Your Connections
            </h2>
            {connections.length > 0 ? (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {connections.map((conn) => (
                  <div
                    key={conn._id}
                    className="flex items-center gap-3 p-3 bg-[#1a1a2f]/70 rounded-xl"
                  >
                    <img
                      src={conn.profilePic?.url || defaultAvatar}
                      alt={conn.name}
                      className="w-10 h-10 rounded-full object-cover border border-green-400/40"
                    />
                    <p className="text-slate-200 font-semibold">
                      {conn.name || conn.email || "Unknown User"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No connections yet</p>
            )}
          </div>
        </div>
      )}

      {/* Resume Modal */}
      {showResume && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#11121f] p-4 rounded-2xl w-[90%] max-w-3xl border border-cyan-400/40 shadow-xl relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setShowResume(false)}
            >
              <X size={22} />
            </button>
      
            <h2 className="text-cyan-400 text-xl font-bold mb-4 flex items-center gap-2">
              <FileText size={20} /> Resume
            </h2>
      
            <div className="flex justify-end mb-2">
              <a
                href={profile.resume.url} 
                download={profile.name + "_Resume.pdf"} 
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 font-semibold"
              >
                Download Resume
              </a>
            </div>
      
            <div className="w-full h-[70vh]">
              <iframe
                src={profile.resume.url}
                className="w-full h-full rounded-xl border border-cyan-400"
                title="Resume"
              />
            </div>
          </div>
        </div>
      )}

      {message && (
        <p className="text-cyan-400 mt-6 text-center absolute bottom-4 w-full">
          {message}
        </p>
      )}
    </div>
  );
}
