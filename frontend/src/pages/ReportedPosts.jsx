import React, { useEffect, useState } from "react";
import { getReportedPosts } from "../api";
import axios from "axios";

export default function ReportedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReported = async () => {
    try {
      setLoading(true);
      const res = await getReportedPosts();
      setPosts(res.data?.reportedPosts || res.data?.posts || []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load reported posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReported(); }, []);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  if (loading) return <div className="p-4 text-white">Loading...</div>;
  if (error) return <div className="p-4 text-rose-400">{error}</div>;

  return (
    <div className="p-4 text-white max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Reported Posts</h2>
      {posts.length === 0 ? (
        <p className="text-gray-400">No reported posts.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post._id} className="bg-black border border-gray-800 rounded-2xl p-4">
              <div className="mb-2 text-sm text-gray-300">
                <span className="font-semibold">{post.userId?.name}</span>
                <span className="ml-2 text-gray-500">{new Date(post.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-100 mb-2">{post.content}</p>
              {post.image?.url && <img src={post.image.url} alt="Post" className="rounded-lg border border-gray-800 mb-2" />}
              <div className="text-xs text-gray-400 mb-2">Reports: {post.reportedBy?.length || 0}</div>
              <button onClick={() => handleDelete(post._id)} className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white">
                Delete Post
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


