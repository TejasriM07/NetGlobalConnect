import React, { useState, useEffect } from "react";
import { getAllPosts } from "../api";

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [updatedContent, setUpdatedContent] = useState("");
  const [updatedImage, setUpdatedImage] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getAllPosts();
        const allPosts = res.data?.posts || [];
        setPosts(allPosts.filter((p) => p.userId._id === userId));
      } catch (err) {
        setMessage("Failed to fetch posts");
        console.error(err);
      }
    };
    fetchPosts();
  }, [userId]);

  const handleDelete = async (postId) => {
    const confirmed = window.confirm("Are you sure you want to delete this post?");
    if (!confirmed) return;
    try {
      await fetch(`https://netglobalconnect.onrender.com/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setMessage("Post deleted successfully");
    } catch {
      setMessage("Failed to delete post");
    }
  };

  const handleUpdateClick = (post) => {
    setCurrentPost(post);
    setUpdatedContent(post.content);
    setUpdatedImage(post.image?.url || null);
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!currentPost) return;
    const formData = new FormData();
    formData.append("content", updatedContent);
    if (updatedImage instanceof File) formData.append("image", updatedImage);

    try {
      const res = await fetch(
        `https://netglobalconnect.onrender.com/api/posts/${currentPost._id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === currentPost._id ? data.post : p))
        );
        setMessage("Post updated successfully");
        setShowUpdateModal(false);
      } else {
        setMessage("Failed to update post");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to update post");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      hour12: true,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-black p-6 text-white flex justify-center">
      <div className="w-full max-w-5xl">
        <h2 className="text-2xl font-bold mb-6 text-cyan-400">My Posts</h2>

        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="p-4 bg-[#11121f]/80 rounded-xl border border-[#7c3aed]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
                  {post.image && (
                    <img
                      src={post.image.url}
                      alt="post"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1 flex flex-col gap-1">
                    <p className="font-semibold text-lg">{post.content || "Untitled Post"}</p>
                    <div className="flex flex-wrap gap-4 text-gray-400 text-sm mt-1">
                      <span>👍 {post.likes.length}</span>
                      {post.comments.length > 0 && (
                        <span
                          className="cursor-pointer underline"
                          onClick={() => {
                            setCurrentPost(post);
                            setShowCommentsModal(true);
                          }}
                        >
                          💬 {post.comments.length} Comments
                        </span>
                      )}
                      <span>Created: {formatDate(post.createdAt)}</span>
                      <span>Updated: {formatDate(post.updatedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-2 md:mt-0">
                  <button
                    onClick={() => handleUpdateClick(post)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">You have not created any posts yet.</p>
        )}

        {message && <p className="text-cyan-400 mt-4">{message}</p>}

        {/* Update Modal */}
        {showUpdateModal && currentPost && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#11121f] p-6 rounded-2xl w-[90%] max-w-md border border-cyan-400/40 shadow-xl relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setShowUpdateModal(false)}
              >
                ✕
              </button>
              <h3 className="text-cyan-400 text-xl font-bold mb-4">Update Post</h3>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <textarea
                  className="w-full p-2 rounded-lg bg-[#1a1a2f] text-white"
                  value={updatedContent}
                  onChange={(e) => setUpdatedContent(e.target.value)}
                  rows={4}
                  placeholder="Post content"
                />
                <div className="flex flex-col gap-2">
                  {updatedImage && typeof updatedImage === "string" && (
                    <img
                      src={updatedImage}
                      alt="current"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <input
                    type="file"
                    onChange={(e) => setUpdatedImage(e.target.files[0])}
                    className="text-sm text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold"
                >
                  Update Post
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Comments Modal */}
        {showCommentsModal && currentPost && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-[#11121f] p-6 rounded-2xl w-[90%] max-w-md border border-cyan-400/40 shadow-xl relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                onClick={() => setShowCommentsModal(false)}
              >
                ✕
              </button>
              <h3 className="text-cyan-400 text-xl font-bold mb-4">Comments</h3>
              {currentPost.comments.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                  {currentPost.comments.map((c, index) => (
                    <div key={index} className="p-2 bg-[#1a1a2f]/80 rounded-lg">
                      <p className="text-sm">
                        <span className="font-semibold">{c.userId?.name || "User"}:</span>{" "}
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No comments yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
