// src/pages/CreateJob.jsx
import React, { useState } from "react";
import { createJob } from "../api"; // <-- use API module

export default function CreateJob() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        skills: "",
        company: "",
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
                });
            }
        } catch (err) {
            setMessage("❌ Failed to create job. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-black/60 backdrop-blur-md border border-purple-600 rounded-2xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    Create Job Post
                </h2>

                {message && (
                    <p
                        className={`mb-4 text-center ${message.startsWith("✅") ? "text-green-400" : "text-red-400"
                            }`}
                    >
                        {message}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Job Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-xl bg-black/50 border border-purple-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <input
                        type="text"
                        name="company"
                        placeholder="Company Name"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-xl bg-black/50 border border-purple-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <textarea
                        name="description"
                        placeholder="Job Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full px-4 py-2 rounded-xl bg-black/50 border border-purple-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <input
                        type="text"
                        name="skills"
                        placeholder="Required Skills (comma separated)"
                        value={formData.skills}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 rounded-xl bg-black/50 border border-purple-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />

                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg transition"
                    >
                        Create Job
                    </button>
                </form>
            </div>
        </div>
    );
}
