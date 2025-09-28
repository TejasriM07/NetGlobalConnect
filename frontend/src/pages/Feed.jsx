// src/components/Feed.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getProfile, getFeed, createPost } from "../api";

export default function Feed({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newPost, setNewPost] = useState("");
  const [posting, setPosting] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch feed
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);

        // Determine which userId to use: prop or current logged-in user
        let idToUse = userId;
        if (!idToUse) {
          // fetch current profile
          try {
            const me = await getProfile();
            idToUse = me.data?.data?._id || me.data?.data?.id;
            setCurrentUser(me.data?.data || null);
          } catch (meErr) {
            console.warn("Failed to fetch current user for feed:", meErr);
          }
        }

        if (!idToUse) {
          setError("No user id available for feed");
          setLoading(false);
          return;
        }

        // Use API helper which already attaches token via interceptor
        const { data } = await getFeed(idToUse);
        // server returns { count, posts }
        setPosts(Array.isArray(data.posts) ? data.posts : []);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch feed");
        setLoading(false);
      }
    };
    fetchFeed();
  }, [userId, BACKEND_URL]);

  // Create new post
  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);

    try {
      // Use API helper; axios interceptor will include token
      const { data } = await createPost(newPost);
      const created = data?.post || data?.data || data;
      if (created) {
        setPosts((prev) => [created, ...prev]);
        setNewPost("");
        setPosting(false);
        return;
      }
    } catch (err) {
      console.warn("Post backend error - falling back to optimistic add:", err?.response?.status || err);

      // Fallback: optimistic client-only add. Use getProfile to populate author info when possible.
      try {
        let me = currentUser;
        if (!me) {
          const meRes = await getProfile();
          me = meRes.data?.data;
          setCurrentUser(me || null);
        }

        const tempPost = {
          _id: `temp-${Date.now()}`,
          author: me || { name: "You", profilePic: "/default-avatar.png" },
          content: newPost,
          createdAt: new Date().toISOString(),
          score: 0,
        };
        setPosts((prev) => [tempPost, ...prev]);
        setNewPost("");
      } catch (fallbackErr) {
        console.error("Fallback post failed:", fallbackErr);
        setError(err.response?.data?.message || "Failed to post");
      }
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <p>Loading feed...</p>;
  if (error) return <p>{error}</p>;
  if (!posts || posts.length === 0) return <p>No posts to show.</p>;

  return (
    <div className="feed space-y-6">
      {/* Post input */}
      <div className="mb-6 p-4 border rounded bg-white">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full border p-2 rounded mb-2"
          rows={3}
        />
        <button
          onClick={handlePost}
          disabled={posting}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
        >
          {posting ? "Posting..." : "Post"}
        </button>
      </div>

      {/* Posts */}
      {posts.map((post) => {
        const author = post.author || {};
        const skills = Array.isArray(author.skills) ? author.skills : [];
        const education = Array.isArray(author.education) ? author.education : [];
        const experience = Array.isArray(author.experience) ? author.experience : [];

        return (
          <div key={post._id} className="post border rounded-lg p-4 shadow-sm bg-white">
            {/* Author Info */}
            <div className="author flex items-center mb-2">
              <img
                src={author.profilePic || "/default-avatar.png"}
                alt={author.name || "Unknown"}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{author.name || "Unknown"}</p>
                <p className="text-sm text-gray-500">{author.role || "Unknown role"}</p>
              </div>
            </div>

            {/* Post Content */}
            <div className="content mb-2">
              <p>{post.content || "No content available"}</p>
            </div>

            {/* Skills */}
            {skills.length > 0 && (
              <div className="skills flex flex-wrap gap-2 mb-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className={`text-sm px-2 py-1 rounded ${post.score > 0 ? "bg-blue-100 text-blue-800" : "bg-gray-100"
                      }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Education */}
            {education.length > 0 &&
              education.map((edu, i) => (
                <p key={i} className="text-sm text-gray-600">
                  🎓 {edu.degree || ""} {edu.school ? `- ${edu.school}` : ""}
                </p>
              ))}

            {/* Experience */}
            {experience.length > 0 &&
              experience.map((exp, i) => (
                <p key={i} className="text-sm text-gray-600">
                  💼 {exp.role || ""} {exp.company ? `@ ${exp.company}` : ""}
                </p>
              ))}

            {/* Post Meta */}
            <div className="meta mt-2 text-sm text-gray-500 flex justify-between">
              <span>Score: {post.score || 0}</span>
              <span>{post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}</span>
            </div>

            {/* Actions */}
            <div className="actions mt-2 flex gap-4 text-sm text-gray-600">
              <button className="hover:text-blue-600">Like</button>
              <button className="hover:text-blue-600">Comment</button>
              <button className="hover:text-blue-600">Share</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
