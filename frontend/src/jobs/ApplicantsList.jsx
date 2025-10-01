// src/components/ApplicantsList.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobApplicants } from "../api";

export default function ApplicantsList() {
    const { jobId } = useParams();
    const [applicants, setApplicants] = useState([]);
    const [jobTitle, setJobTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchApplicants = async () => {
        try {
            const res = await getJobApplicants(jobId);
            setApplicants(res.data.job.applicants || []);
            setJobTitle(res.data.job.title);
        } catch (err) {
            setError("Failed to fetch applicants");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, [jobId]);

    if (loading)
        return (
            <p className="text-center mt-6 text-white text-lg">
                Loading applicants...
            </p>
        );
    if (error)
        return (
            <p className="text-center text-red-500 mt-6 text-lg font-semibold">
                {error}
            </p>
        );

    return (
        <div className="min-h-screen bg-black p-6">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Applicants for: {jobTitle}
            </h2>

            {applicants.length === 0 ? (
                <p className="text-gray-400 text-center text-lg">No applicants yet.</p>
            ) : (
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {applicants.map((a) => (
                        <div
                            key={a._id}
                            onClick={() => navigate(`/users/${a._id}`)} // 👈 Navigate to applicant profile
                            className="bg-black/60 backdrop-blur-md border border-purple-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer"
                        >
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xl font-semibold text-white">{a.name}</h3>
                                <p className="text-purple-300 font-medium">
                                    {a.role || "Applicant"}
                                </p>
                                <p className="text-gray-400 text-sm">{a.email}</p>
                                {a.phone && (
                                    <p className="text-gray-400 text-sm">Phone: {a.phone}</p>
                                )}
                                {a.location && (
                                    <p className="text-gray-400 text-sm">Location: {a.location}</p>
                                )}
                                {a.experience && (
                                    <p className="text-gray-400 text-sm">
                                        Experience: {a.experience} years
                                    </p>
                                )}
                                {a.skills && a.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {a.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-800/30 text-purple-200 backdrop-blur-sm"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {a.resume && (
                                    <a
                                        href={a.resume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()} // 👈 prevent navigating to profile if resume clicked
                                        className="text-cyan-400 hover:text-cyan-300 text-sm mt-2 underline"
                                    >
                                        View Resume
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
