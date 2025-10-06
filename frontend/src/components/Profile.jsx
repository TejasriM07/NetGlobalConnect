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
import axios from "axios";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [signedResumeUrl, setSignedResumeUrl] = useState("");
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [message, setMessage] = useState("");
  const [showConnections, setShowConnections] = useState(false);
  const [showResume, setShowResume] = useState(false); 
  const navigate = useNavigate();
  const isAdmin = (profile?.role === "Admin") || (localStorage.getItem("userRole") === "Admin");

  const fetchProfileData = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data?.data || null);
    } catch (err) {
      setMessage("Failed to load profile.");
    }
  };

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

  const handleRequest = async (userId, action) => {
    try {
      await respondToConnectionRequest(userId, action);
      setMessage(`Request ${action}ed successfully`);
      fetchRequestsAndConnections();
    } catch (err) {
      setMessage(`Failed to ${action} request`);
    }
  };

  // Fetch signed resume URL
  const fetchSignedResume = async () => {
    if (!profile?.resume?.publicId) return;
    try {
      const res = await axios.get(`/api/users/${profile._id}/resume`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.data.success) setSignedResumeUrl(res.data.url);
    } catch (err) {
      setMessage("Failed to load resume");
    }
  };

  if (!profile) return <p className="text-white">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#0d0d17] to-[#12121f] p-10 text-white flex justify-center">
      <div className="max-w-6xl w-full grid md:grid-cols-3 gap-8">
        {/* Left column */}
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

          <button
            onClick={() => navigate("/edit-profile")}
            className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-black font-semibold flex items-center justify-center gap-2 hover:brightness-110"
          >
            <Edit3 size={18} /> Edit Profile
          </button>

          {profile.resume?.publicId && (
            <button
              onClick={() => {
                fetchSignedResume();
                setShowResume(true);
              }}
              className="mt-4 w-full py-3 rounded-xl bg-cyan-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-cyan-500"
            >
              <FileText size={18} /> View Resume
            </button>
          )}
        </div>

        {/* Right column omitted for brevity */}
      </div>

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
              {signedResumeUrl && (
                <a
                  href={signedResumeUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-400 font-semibold"
                >
                  Open in Browser
                </a>
              )}
            </div>

            <div className="w-full h-[70vh]">
              {signedResumeUrl ? (
                <iframe
                  src={signedResumeUrl}
                  className="w-full h-full rounded-xl border border-cyan-400"
                  title="Resume"
                />
              ) : (
                <p className="text-center text-slate-400 mt-6">Loading...</p>
              )}
            </div>
          </div>
        </div>
      )}

      {message && (
        <p className="text-cyan-400 mt-6 text-center absolute bottom-4 w-full">{message}</p>
      )}
    </div>
  );
}
