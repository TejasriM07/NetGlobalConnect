// src/pages/JobList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getJobs, applyToJob } from "../api"; // <-- use API module

export default function JobList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [appliedJobs, setAppliedJobs] = useState({});
    const navigate = useNavigate();

    const currentUserRole = localStorage.getItem("userRole") || "";
    const currentUserId = localStorage.getItem("userId") || "";

    // Fetch jobs and mark already applied jobs immediately
    const fetchJobs = async () => {
        try {
            const res = await getJobs();
            const jobsData = Array.isArray(res.data.jobs) ? res.data.jobs : [];

            // mark applied jobs immediately
            const appliedMap = {};
            jobsData.forEach((job) => {
                if (job.applicants?.some((a) => a?._id?.toString() === currentUserId)) {
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
            // optimistically mark as applied
            setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));

            await applyToJob(jobId); // <-- API function

            // refresh jobs for accurate applicant count
            await fetchJobs();
        } catch (err) {
            console.error(err);
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
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-wide">
                        {currentUserRole === "Employee" ? "Manage Jobs" : "Job Opportunities"}
                    </h2>
                    {currentUserRole === "Employee" && (
                        <button
                            onClick={() => navigate("/create-job")}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create New Job
                        </button>
                    )}
                </div>

                {jobs.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-slate-500 text-lg">No jobs posted yet.</p>
                        {currentUserRole === "Employee" && (
                            <p className="text-slate-400 text-sm mt-2">Start by creating your first job posting!</p>
                        )}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map((job) => {
                        const applicantsCount = job.applicants?.length || 0;
                        const isApplied = appliedJobs[job._id];

                        return (
                            <div
                                key={job._id}
                                className="relative bg-white backdrop-blur-md border border-slate-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 hover:border-blue-300"
                            >
                                <div className="flex flex-col justify-between h-full">
                                    <div>
                                        <h3 className="text-2xl font-semibold text-slate-900 mb-2">{job.title}</h3>
                                        <p className="text-blue-600 mb-2 font-medium">{job.company || "—"}</p>
                                        <p className="text-slate-600 text-sm mb-4 line-clamp-4">{job.description}</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {job.skills?.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <p className="text-slate-500 text-sm mb-4">
                                            Applicants: <span className="font-medium text-slate-700">{applicantsCount}</span>
                                        </p>
                                    </div>

                                    <div className="flex justify-center">
                                        {currentUserRole === "JobSeeker" ? (
                                            <button
                                                disabled={isApplied}
                                                onClick={() => !isApplied && handleApply(job._id)}
                                                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md ${isApplied
                                                        ? "bg-slate-400 text-white opacity-70 cursor-not-allowed"
                                                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                                                    }`}
                                            >
                                                {isApplied ? "Applied" : "Apply Now"}
                                            </button>
                                        ) : (
                                            <Link
                                                to={`/jobs/${job._id}/applicants`}
                                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                                            >
                                                View Applications
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            </div>
        </div>
    );
}
