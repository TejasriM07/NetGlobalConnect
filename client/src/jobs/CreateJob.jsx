// src/pages/CreateJob.jsx
import React, { useState } from "react";
import { createJob } from "../api"; // <-- use API module

export default function CreateJob() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        skills: "",
        company: "",
        applicationDeadline: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                company: formData.company,
                applicationDeadline: formData.applicationDeadline,
                skills: formData.skills
                    .split(",")
                    .map((s) => s.trim())
                    .filter((s) => s !== ""),
            };

            const res = await createJob(payload); // <-- API call

            if (res.status === 201 || res.status === 200) {
                setMessage("✅ Job created successfully!");
                setFormData({
                    title: "",
                    description: "",
                    skills: "",
                    company: "",
                    applicationDeadline: "",
                });
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Failed to create job. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Create New Job</h2>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                    {message && (
                        <div className={`p-4 rounded-lg mb-6 ${
                            message.includes("✅") 
                                ? "bg-green-50 text-green-800 border border-green-200" 
                                : "bg-red-50 text-red-800 border border-red-200"
                        }`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">
                                Job Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g. Senior Frontend Developer"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g. Tech Solutions Inc."
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">
                                Job Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="5"
                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe the role, responsibilities, and requirements..."
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">
                                Required Skills
                            </label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills}
                                onChange={handleChange}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g. React, Node.js, JavaScript (comma-separated)"
                            />
                            <p className="text-slate-500 text-sm mt-1">
                                Enter skills separated by commas
                            </p>
                        </div>

                        <div>
                            <label className="block text-slate-700 font-semibold mb-2">
                                Application Deadline *
                            </label>
                            <input
                                type="date"
                                name="applicationDeadline"
                                value={formData.applicationDeadline}
                                onChange={handleChange}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-slate-500 text-sm mt-1">
                                Job will be automatically deactivated after this date
                            </p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors shadow-lg"
                        >
                            Create Job Posting
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
