import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  respondToConnectionRequest
} from "../api";
import { User, Briefcase, Star, Users, Mail, Edit3 } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data?.data || null);

      } catch (err) {
        console.error(err);
        setMessage("Failed to load profile.");
      }
    };
    fetchProfileData();
  }, []);

  const handleRequest = async (userId, action) => {
    try {
      await respondToConnectionRequest(userId, action);

      // Refresh requests and connections
      const [reqRes, connRes] = await Promise.all([
        getConnectionRequests(),
        getConnections()
      ]);
      setConnectionRequests(reqRes.data?.data || []);
      setConnections(connRes.data?.data || []);

      setMessage(`Request ${action}ed successfully`);
    } catch (err) {
      console.error(err);
      setMessage(`Failed to ${action} request`);
    }
  };

  if (!profile) return <p className="text-white p-6">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#0d0d17] to-[#12121f] p-10 text-white flex justify-center">
      <div className="max-w-6xl w-full grid md:grid-cols-3 gap-8">
        {/* Left column: Profile info */}
        <div className="md:col-span-1 bg-[#11121f]/80 rounded-3xl p-6 shadow-lg border border-[#06b6d4]/40">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full border-4 border-cyan-400 shadow-lg overflow-hidden">
              <img
                src={profile.profilePic?.url || "/default-avatar.png"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold">{profile.name}</h2>
            <p className="text-cyan-400">{profile.role}</p>
          </div>

          {/* Stats */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1a1a2f]/70">
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

          {/* Connection Requests */}
          <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-yellow-400/30 shadow-inner">
            <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
              <Mail size={18} /> Connection Requests
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
              <p className="text-slate-400 text-sm">No pending requests</p>
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
                    className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/40 text-green-300 text-sm hover:bg-green-500/40 transition"
                  >
                    {conn.name || conn.email || "Unknown User"}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No connections yet</p>
            )}
          </div>
        </div>
      </div>

      {message && (
        <p className="text-cyan-400 mt-6 text-center absolute bottom-4 w-full">
          {message}
        </p>
      )}
    </div>
  );
}
