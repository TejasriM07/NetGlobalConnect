import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getProfile,
  getConnectionRequests,
  getConnections,
  respondToConnectionRequest
} from "../api";
import { User, Briefcase, Star, Users, Mail, Edit3, X } from "lucide-react";
import defaultAvatar from "../assets/default.jpeg";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const [message, setMessage] = useState("");
  const [showConnections, setShowConnections] = useState(false);
  const navigate = useNavigate();

  // Fetch profile info
  const fetchProfileData = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data?.data || null);
    } catch (err) {
      console.error(err);
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

      console.log("Requests from backend:", reqRes.data.requests);
      console.log("Connections from backend:", connRes.data);

      setConnectionRequests(reqRes.data.requests || []);
      setConnections(connRes.data.connections || connRes.data.data || []);
    } catch (err) {
      console.error(err);
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
      console.error(err);
      setMessage(`Failed to ${action} request`);
    }
  };

  if (!profile) return <p className="text-white p-6">Loading profile...</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Left column: Profile info */}
        <div className="md:col-span-1 bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full border-4 border-blue-400 shadow-lg overflow-hidden">
              <img
                src={profile.profilePic?.url || defaultAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-blue-600 font-medium">{profile.role}</p>
          </div>

          {/* Stats */}
          <div className="mt-6 space-y-3">
            <div
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => setShowConnections(true)}
            >
              <Users className="text-blue-600" size={20} />
              <span className="flex-1 text-slate-700">Connections</span>
              <span className="font-bold text-slate-900">{connections.length}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <Star className="text-blue-600" size={20} />
              <span className="flex-1 text-slate-700">Skills</span>
              <span className="font-bold text-slate-900">{(profile.skills || []).length}</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <Briefcase className="text-blue-600" size={20} />
              <span className="flex-1 text-slate-700">Saved Jobs</span>
              <span className="font-bold text-slate-900">{profile.savedJobs?.length || 0}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/edit-profile")}
            className="mt-6 w-full py-3 rounded-lg bg-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>

        {/* Right column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-slate-900 font-bold mb-2 flex items-center gap-2">
              <User className="text-blue-600" size={18} /> Bio
            </h3>
            <p className="text-slate-600">{profile.bio || "No bio added"}</p>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
              <Star className="text-blue-600" size={18} /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(profile.skills || []).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
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
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={18} /> Experience
            </h3>
            {profile.experience && profile.experience.length > 0 ? (
              <ul className="space-y-3">
                {profile.experience.map((exp, idx) => (
                  <li key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900">{exp.role || "Role"}</p>
                    <p className="text-sm text-slate-600">{exp.company || "Company"}</p>
                    <p className="text-sm text-slate-500">
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
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={18} /> Education
            </h3>
            {profile.education && profile.education.length > 0 ? (
              <ul className="space-y-3">
                {profile.education.map((edu, idx) => (
                  <li key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-semibold text-slate-900">{edu.degree || "Degree"}</p>
                    <p className="text-sm text-slate-600">{edu.school || "School"}</p>
                    <p className="text-sm text-slate-500">
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
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
              <Mail className="text-blue-600" size={18} /> Incoming Connection Requests
            </h3>
            {connectionRequests.length > 0 ? (
              connectionRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200 mb-3"
                >
                  <p className="text-slate-900">{req.name || req.email || "Unknown User"}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRequest(req._id, "accept")}
                      className="px-4 py-2 bg-green-600 rounded-lg text-white font-semibold hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequest(req._id, "reject")}
                      className="px-4 py-2 bg-red-600 rounded-lg text-white font-semibold hover:bg-red-700 transition-colors"
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
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-slate-900 font-bold mb-3 flex items-center gap-2">
              <Users className="text-blue-600" size={18} /> Connections
            </h3>
            {connections.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {connections.map((conn) => (
                  <span
                    key={conn._id}
                    className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm hover:bg-blue-100 transition cursor-pointer"
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
        </div>
      </div>

      {/* Connections Modal */}
      {showConnections && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] max-w-lg border border-slate-200 shadow-2xl relative">
            <button
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
              onClick={() => setShowConnections(false)}
            >
              <X size={22} />
            </button>
            <h2 className="text-slate-900 text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-blue-600" size={20} /> Your Connections
            </h2>
            {connections.length > 0 ? (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {connections.map((conn) => (
                  <div
                    key={conn._id}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <img
                      src={conn.profilePic?.url || defaultAvatar}
                      alt={conn.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                    />
                    <p className="text-slate-900 font-semibold">
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

      {message && (
        <p className="text-blue-600 mt-6 text-center absolute bottom-4 w-full bg-white py-2 rounded-lg mx-4">
          {message}
        </p>
      )}
    </div>
  );
}
