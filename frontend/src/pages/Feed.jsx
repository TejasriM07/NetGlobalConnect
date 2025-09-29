// src/components/Feed.jsx
import React, { useEffect, useState } from "react";
import {
  getProfile,
  createPost,
  likePost,
  reportPost,
  commentPost,
  getAllPosts,
} from "../api";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch profile (userId + connections)
  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      if (res.data?.data) {
        setUserId(res.data.data._id);
        setConnections(res.data.data.connections || []);
      }
    } catch (err) {
      console.error("❌ Error fetching profile:", err);
    }
  };

  // Fetch posts & filter only self + connections
  const fetchFeedPosts = async () => {
    try {
      const res = await getAllPosts();
      const allPosts = res.data?.posts || [];

      const filtered = allPosts.filter((post) => {
        if (!post.userId) return false;
        const isConnected =
          Array.isArray(connections) &&
          (connections.includes(post.userId._id) ||
            connections.some((c) => c._id === post.userId._id));
        const isSelf = post.userId._id === userId;
        return isConnected || isSelf;
      });

      setPosts(filtered.reverse());
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchFeedPosts();
    }
  }, [userId, connections]);

  // Create new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("userId", userId);
      if (image) formData.append("image", image);

      await createPost(formData);

      setContent("");
      setImage(null);
      fetchFeedPosts();
    } catch (err) {
      console.error("❌ Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  // Like / Unlike
  const handleLike = async (postId) => {
    try {
      await likePost(postId);
      fetchFeedPosts();
    } catch (err) {
      console.error("❌ Error liking post:", err);
    }
  };

  // Report
  const handleReport = async (postId) => {
    try {
      await reportPost(postId);
      fetchFeedPosts();
    } catch (err) {
      console.error("❌ Error reporting post:", err);
    }
  };

  // Comment
  const handleComment = async (postId, text) => {
    try {
      await commentPost(postId, text);
      fetchFeedPosts();
    } catch (err) {
      console.error("❌ Error commenting:", err);
    }
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-gray-100">
      <div className="max-w-2xl mx-auto p-4">
        {/* Create Post */}
        <div className="bg-black border border-gray-800 rounded-2xl p-4 mb-6 shadow-lg">
          <form onSubmit={handleCreatePost} className="space-y-3">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-neutral-900 border border-gray-800 rounded-xl px-3 py-2 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="What's on your mind?"
            />
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              className="block text-sm text-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-xl text-white font-medium"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>

        {/* Feed */}
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet</p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-black border border-gray-800 rounded-2xl p-5 mb-6 shadow-lg hover:border-gray-700 transition"
            >
              {/* Author */}
              <div className="flex items-center mb-3">
                <img
                  src={post.userId?.profilePic?.url || "/default-avatar.png"}
                  alt="User"
                  className="w-11 h-11 rounded-full mr-3 border border-gray-700 object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-100">
                    {post.userId?.name}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <p className="mb-3 text-gray-200 leading-relaxed">
                {post.content}
              </p>
              {post.image?.url && (
                <img
                  src={post.image.url}
                  alt="Post"
                  className="w-full rounded-xl mb-3 border border-gray-800"
                />
              )}

              {/* Actions */}
              <div className="flex gap-6 text-sm mb-3">
                <button
                  onClick={() => handleLike(post._id)}
                  className="text-blue-400 hover:underline"
                >
                  👍 {post.likes?.length || 0}
                </button>
                <button
                  onClick={() => handleReport(post._id)}
                  className="text-red-400 hover:underline"
                >
                  🚩 Report
                </button>
              </div>

              {/* Comments */}
              <div className="mt-2">
                {post.comments?.map((c) => (
                  <div key={c._id} className="text-sm mb-2 text-gray-300">
                    <span className="font-medium">
                      {c.userId?.name || "User"}:
                    </span>{" "}
                    {c.text}
                  </div>
                ))}

                {/* Add comment */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const text = e.target.comment.value;
                    if (text.trim()) handleComment(post._id, text);
                    e.target.reset();
                  }}
                  className="flex gap-2 mt-2"
                >
                  <input
                    name="comment"
                    placeholder="Write a comment..."
                    className="flex-1 bg-neutral-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button className="bg-neutral-800 border border-gray-700 px-4 py-2 rounded-lg text-sm text-gray-200 hover:bg-neutral-700 transition">
                    Reply
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
