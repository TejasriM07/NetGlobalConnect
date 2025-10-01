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
import defaultAvatar from "../assets/default.jpeg";

export default function Feed() {
  const [allPosts, setAllPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [composerError, setComposerError] = useState("");
  const [showAllPosts, setShowAllPosts] = useState(false);

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
      setPostsLoading(true);
      const res = await getAllPosts();
      const fetched = (res.data?.posts || []).slice().reverse();
      setAllPosts(fetched);
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    } finally {
      setPostsLoading(false);
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
    setComposerError("");
    if (!content.trim() && !image) {
      setComposerError("Write something or add an image.");
      return;
    }
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("userId", userId);
      if (image) formData.append("image", image);

      await createPost(formData);

      setContent("");
      setImage(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      fetchFeedPosts();
    } catch (err) {
      console.error("❌ Error creating post:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    setComposerError("");
    const isImage = file.type.startsWith("image/");
    const isLt3mb = file.size <= 3 * 1024 * 1024;
    if (!isImage) {
      setComposerError("Please select an image file.");
      return;
    }
    if (!isLt3mb) {
      setComposerError("Image must be under 3 MB.");
      return;
    }
    setImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const removeSelectedImage = () => {
    setImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const SkeletonCard = () => (
    <div className="bg-black border border-gray-800 rounded-2xl p-5 mb-6 shadow-lg animate-pulse">
      <div className="flex items-center mb-3">
        <div className="w-11 h-11 rounded-full mr-3 bg-neutral-800" />
        <div className="flex-1">
          <div className="h-3 w-32 bg-neutral-800 rounded mb-2" />
          <div className="h-2 w-24 bg-neutral-900 rounded" />
        </div>
      </div>
      <div className="h-3 w-5/6 bg-neutral-800 rounded mb-2" />
      <div className="h-3 w-2/3 bg-neutral-800 rounded mb-4" />
      <div className="h-48 w-full bg-neutral-900 rounded-xl" />
    </div>
  );

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
  console.log("🔹 Reporting post:", postId);
  try {
    const res = await reportPost(postId); // assign to res
    console.log("✅ Report response:", res.data); // now res is defined
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
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-cyan-400 hover:text-cyan-300">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e.target.files?.[0])}
                  className="hidden"
                />
                <span className="px-3 py-1 rounded-lg bg-neutral-900 border border-gray-800">Add Image</span>
              </label>
              {composerError && (
                <span className="text-xs text-rose-400">{composerError}</span>
              )}
            </div>
            {previewUrl && (
              <div className="relative">
                <img src={previewUrl} alt="Preview" className="w-full rounded-xl mb-2 border border-gray-800" />
                <button type="button" onClick={removeSelectedImage} className="absolute top-2 right-2 px-2 py-1 text-xs rounded-md bg-neutral-900/80 border border-gray-700 hover:bg-neutral-800">
                  Remove
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-xl text-white font-medium"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </form>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            type="button"
            onClick={() => setShowAllPosts(false)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${!showAllPosts ? "border-cyan-500 text-cyan-300 bg-cyan-500/10" : "border-gray-700 text-gray-300 hover:bg-neutral-900"}`}
          >
            Connections
          </button>
          <button
            type="button"
            onClick={() => setShowAllPosts(true)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${showAllPosts ? "border-cyan-500 text-cyan-300 bg-cyan-500/10" : "border-gray-700 text-gray-300 hover:bg-neutral-900"}`}
          >
            All Posts
          </button>
        </div>

        {/* Feed */}
        {postsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (() => {
          const visible = showAllPosts
            ? allPosts
            : allPosts.filter((post) => {
                if (!post.userId) return false;
                const isConnected =
                  Array.isArray(connections) &&
                  (connections.includes(post.userId._id) ||
                    connections.some((c) => c._id === post.userId._id));
                const isSelf = post.userId._id === userId;
                return isConnected || isSelf;
              });
          return visible.length === 0 ? (
          <p className="text-center text-gray-500">No posts yet</p>
          ) : (
          visible.map((post) => (
            <div
              key={post._id}
              className="bg-black border border-gray-800 rounded-2xl p-5 mb-6 shadow-lg hover:border-gray-700 transition"
            >
              {/* Author */}
              <div className="flex items-center mb-3">
                <img
                  src={post.userId?.profilePic?.url || "/default-avatar.svg"}
                  src={post.userId?.profilePic?.url || defaultAvatar}
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
        ); })()}
      </div>
    </div>
  );
}
