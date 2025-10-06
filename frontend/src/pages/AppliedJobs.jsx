import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AppliedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplied = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://netglobalconnect.onrender.com/api/jobs",
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        const userId = localStorage.getItem("userId");
        const applied = res.data.jobs.filter(job => job.applicants.includes(userId));
        setJobs(applied);
      } catch (err) {
        setError("Failed to load applied jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchApplied();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto text-white">
      <h2 className="text-xl font-bold mb-4">Jobs You Applied</h2>
      {jobs.length === 0 ? (
        <p>No applied jobs found.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div key={job._id} className="bg-gray-900 p-4 rounded-xl border border-gray-700">
              <h3 className="font-bold text-lg">{job.title}</h3>
              <p className="text-gray-300">{job.description}</p>
              <p className="text-sm text-gray-400">Skills: {job.skills.join(", ")}</p>
              <p className="text-sm text-gray-400">Posted by: {job.postedBy?.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
