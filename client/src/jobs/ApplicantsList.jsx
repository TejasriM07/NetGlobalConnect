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
            console.error(err);
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
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
                    Applicants for: <span className="text-blue-600">{jobTitle}</span>
                </h2>

                {applicants.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-lg">No applicants yet.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {applicants.map((a) => (
                            <div
                                key={a._id}
                                onClick={() => navigate(`/users/${a._id}`)}
                                className="bg-white border border-slate-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer hover:border-blue-300"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                            {a.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-slate-900">{a.name}</h3>
                                            <p className="text-blue-600 font-medium">
                                                {a.role || "Job Seeker"}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 text-sm">{a.email}</p>
                                    {a.bio && (
                                        <p className="text-slate-600 text-sm mb-2">{a.bio}</p>
                                    )}
                                    {a.experience && a.experience.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-blue-600 text-sm font-semibold">Experience:</p>
                                            {a.experience.map((exp, idx) => (
                                                <p key={idx} className="text-slate-600 text-xs">
                                                    {exp.role} at {exp.company}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    {a.education && a.education.length > 0 && (
                                        <div className="mb-2">
                                            <p className="text-blue-600 text-sm font-semibold">Education:</p>
                                            {a.education.map((edu, idx) => (
                                                <p key={idx} className="text-slate-600 text-xs">
                                                    {edu.degree} from {edu.school}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                    {a.skills && a.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {a.skills.map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
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
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-blue-600 hover:text-blue-700 text-sm mt-2 underline"
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
        </div>
    );
}
