// src/pages/JobList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getJobs, applyToJob } from "../api";

export default function JobList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [appliedJobs, setAppliedJobs] = useState({});
    const navigate = useNavigate();

    const currentUserRole = localStorage.getItem("userRole") || "";
    const currentUserId = (localStorage.getItem("userId") || "").toString();

    // Fetch jobs and mark already applied jobs
    const fetchJobs = async () => {
        try {
            const res = await getJobs();
            const jobsData = Array.isArray(res.data.jobs) ? res.data.jobs : [];

            // Map applied jobs
            const appliedMap = {};
            jobsData.forEach((job) => {
                const applicants = Array.isArray(job.applicants) ? job.applicants : [];
                // Check if current user has applied
                if (applicants.some((a) => a?._id?.toString() === currentUserId)) {
                    appliedMap[job._id] = true;
                }
            });
            setAppliedJobs(appliedMap);
            setJobs(jobsData);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch jobs");
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId) => {
        try {
            // Optimistically mark as applied
            setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));

            await applyToJob(jobId);

            // Persist applied hint in localStorage (optional)
            try {
                const appliedSet = new Set(JSON.parse(localStorage.getItem("appliedJobs") || "[]"));
                appliedSet.add(jobId);
                localStorage.setItem("appliedJobs", JSON.stringify(Array.from(appliedSet)));
            } catch {}

            // Refresh jobs to update applicants count
            await fetchJobs();
        } catch (err) {
            setAppliedJobs((prev) => ({ ...prev, [jobId]: false }));
            alert(err.response?.data?.message || "Failed to apply");
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    if (loading)
        return <p className="text-center mt-6 text-white text-lg">Loading jobs...</p>;
    if (error)
        return (
            <p className="text-center text-red-500 mt-6 text-lg font-semibold">{error}</p>
        );

    return (
        <div className="min-h-screen bg-black p-8">
            <h2 className="text-4xl font-bold text-white mb-12 text-center tracking-wide">
                Job Listings
            </h2>

            {jobs.length === 0 ? (
                <p className="text-gray-400 text-center text-lg">No jobs posted yet.</p>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job) => {
                        const applicants = Array.isArray(job.applicants) ? job.applicants : [];
                        const applicantsCount = applicants.length;
                        const isApplied = appliedJobs[job._id];

                        return (
                            <div
                                key={job._id}
                                className="relative bg-black/60 backdrop-blur-md border rounded-2xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 border-purple-600"
                            >
                                <div className="flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-white mb-2">{job.title}</h3>
                                        <p className="text-purple-300 mb-2">{job.company || "Confidential"}</p>
                                        <p className="text-gray-300 text-sm mb-4 line-clamp-4">{job.description}</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {job.skills?.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-800/30 text-purple-200 backdrop-blur-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <p className="text-gray-400 text-sm mb-4">
                                            Applicants: <span className="font-medium text-white">{applicantsCount}</span>
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-2 flex-wrap">
                                        {currentUserRole === "JobSeeker" ? (
                                            <button
                                                disabled={isApplied}
                                                onClick={() => !isApplied && handleApply(job._id)}
                                                className={`px-6 py-2 rounded-xl font-semibold text-white transition-all duration-300 shadow-md ${isApplied
                                                        ? "bg-gray-500 opacity-70 cursor-not-allowed"
                                                        : "bg-purple-600 hover:bg-purple-500 hover:shadow-lg"
                                                    }`}
                                            >
                                                {isApplied ? "Applied" : "Apply"}
                                            </button>
                                        ) : (
                                            <Link
                                                to={`/jobs/${job._id}/applicants`}
                                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                            >
                                                View Applications
                                            </Link>
                                        )}

                                        {/* Optional: Show small list of applicant names */}
                                        {currentUserRole !== "JobSeeker" && applicants.length > 0 && (
                                            <div className="text-gray-300 text-sm mt-2">
                                                {applicants.map(a => a.name || a.email).join(", ")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
