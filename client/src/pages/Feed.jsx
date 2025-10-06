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
  const [posts, setPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [connections, setConnections] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // "all" or "connections"

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

  // Fetch posts & store all posts, then filter based on selection
  const fetchFeedPosts = async () => {
    try {
      console.log("Fetching posts...");
      const res = await getAllPosts();
      console.log("API response:", res.data);
      
      const allPostsData = res.data?.posts || [];
      console.log("Posts data:", allPostsData);
      
      setAllPosts(allPostsData.reverse());
      
      // Apply current filter
      if (filter === "all") {
        setPosts(allPostsData);
        console.log("Showing all posts:", allPostsData.length);
      } else {
        const filtered = allPostsData.filter((post) => {
          if (!post.userId) return false;
          const isConnected =
            Array.isArray(connections) &&
            (connections.includes(post.userId._id) ||
              connections.some((c) => c._id === post.userId._id));
          const isSelf = post.userId._id === userId;
          return isConnected || isSelf;
        });
        setPosts(filtered);
        console.log("Showing filtered posts:", filtered.length);
      }
    } catch (err) {
      console.error("❌ Error fetching posts:", err);
    }
  };

  // Filter posts based on selection
  const applyFilter = (newFilter) => {
    setFilter(newFilter);
    if (newFilter === "all") {
      setPosts(allPosts);
    } else {
      const filtered = allPosts.filter((post) => {
        if (!post.userId) return false;
        const isConnected =
          Array.isArray(connections) &&
          (connections.includes(post.userId._id) ||
            connections.some((c) => c._id === post.userId._id));
        const isSelf = post.userId._id === userId;
        return isConnected || isSelf;
      });
      setPosts(filtered);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userId !== null) {
      fetchFeedPosts();
    }
  }, [userId, filter]);

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
  console.log("🔹 Reporting post:", postId);
  try {
    const res = await reportPost(postId);
    console.log("✅ Report response:", res.data);
    
    // Show success message
    alert("Post has been reported successfully. Our team will review it.");
    
    // Refresh feed to reflect any changes
    fetchFeedPosts();
  } catch (err) {
    console.error("❌ Error reporting post:", err);
    alert("Failed to report post. Please try again.");
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
    <div className="min-h-screen w-full bg-slate-50 text-slate-800">
      <div className="max-w-2xl mx-auto p-4">
        {/* Create Post */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-lg">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              placeholder="What's on your mind?"
              rows="3"
            />
            <div className="flex items-center justify-between">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post"}
              </button>
            </div>
          </form>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => applyFilter("all")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => applyFilter("connections")}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              filter === "connections"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            My Network
          </button>
        </div>

        {/* Feed */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-slate-500 text-lg">No posts yet</p>
            <p className="text-slate-400 text-sm mt-1">Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Author */}
              <div className="flex items-center mb-4">
                <img
                  src={post.userId?.profilePic?.url || defaultAvatar}
                  alt="User"
                  className="w-12 h-12 rounded-full mr-3 border-2 border-slate-200 object-cover"
                />
                <div>
                  <p className="font-semibold text-slate-900">
                    {post.userId?.name}
                  </p>
                  <span className="text-sm text-slate-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <p className="mb-4 text-slate-700 leading-relaxed">
                {post.content}
              </p>
              {post.image?.url && (
                <img
                  src={post.image.url}
                  alt="Post"
                  className="w-full rounded-lg mb-4 border border-slate-200"
                />
              )}

              {/* Actions */}
              <div className="flex gap-6 text-sm mb-4 pb-4 border-b border-slate-200">
                <button
                  onClick={() => handleLike(post._id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 8v12m-6-4h.01M5 16a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2h2z" />
                  </svg>
                  {post.likes?.length || 0} Likes
                </button>
                <button
                  onClick={() => handleReport(post._id)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report
                </button>
              </div>

              {/* Comments */}
              <div className="space-y-3">
                {post.comments?.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <img
                      src={c.userId?.profilePic?.url || defaultAvatar}
                      alt="Commenter"
                      className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                    />
                    <div className="flex-1 bg-slate-50 rounded-lg p-3">
                      <p className="font-medium text-slate-900 text-sm">
                        {c.userId?.name || "User"}
                      </p>
                      <p className="text-slate-700 text-sm mt-1">{c.text}</p>
                    </div>
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
                  className="flex gap-3 mt-4"
                >
                  <img
                    src={defaultAvatar}
                    alt="You"
                    className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                  />
                  <div className="flex-1 flex gap-2">
                    <input
                      name="comment"
                      placeholder="Write a comment..."
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Post
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
