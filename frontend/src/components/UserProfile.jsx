// src/components/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, getProfile, sendConnectionRequest, respondToConnectionRequest } from "../api";


export default function UserProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [message, setMessage] = useState("");
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, meRes] = await Promise.all([
                    getUserById(id),
                    getProfile(),
                ]);

                if (userRes.data?.data) setProfile(userRes.data.data);
                else setMessage("User not found.");

                setCurrentUser(meRes.data.data);
            } catch (err) {
                console.error(err);
                setMessage(err.response?.data?.message || "Failed to load profile.");
            }
        };
        fetchData();
    }, [id]);

    if (!profile || !currentUser)
        return <p className="text-white p-6">Loading profile...</p>;

    const isConnected = profile.connections?.includes(currentUser._id);
    const isRequestSent = profile.connectionRequests?.includes(currentUser._id);

    return (
        <div className="min-h-screen bg-black flex justify-center p-8">
            <div className="w-full max-w-6xl grid md:grid-cols-3 gap-8 text-white">

                {/* Left column: Profile + Stats */}
                <div className="md:col-span-1 flex flex-col items-center bg-[#11121f]/80 rounded-3xl p-6 shadow-lg border border-[#06b6d4]/40">
                    <div className="w-40 h-40 rounded-full border-4 border-cyan-400 shadow-lg overflow-hidden">
                        <img
                            src={profile.profilePic?.url || "/default-avatar.png"}
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

                    {/* Connect & Message Buttons */}
                    <div className="mt-8 flex flex-col items-center gap-4 w-full">
                        {!isConnected && !isRequestSent && profile._id !== currentUser._id && (
                            <button
                                onClick={async () => {
                                    setConnecting(true);
                                    try {
                                        await sendConnectionRequest(profile._id);
                                        setMessage("Connection request sent!");
                                    } catch {
                                        setMessage("Failed to send request");
                                    } finally {
                                        setConnecting(false);
                                    }
                                }}
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
                    </div>
                </div>

                {/* Right column: Bio, Skills, Experience */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    <div className="bg-[#11121f]/80 rounded-3xl p-6 border border-[#7c3aed]/30 shadow-inner">
                        <h3 className="text-cyan-400 font-bold mb-2 text-lg">Bio</h3>
                        <p className="text-white">{profile.bio || "No bio added"}</p>
                    </div>

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
                </div>

                {message && (
                    <p className="text-cyan-400 mt-6 text-center col-span-full">{message}</p>
                )}
            </div>
        </div>
    );
}
