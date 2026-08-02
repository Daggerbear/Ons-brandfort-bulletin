"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminFeed() {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [openComments, setOpenComments] = useState({});

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("flag_count", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error) {
      setPosts(data);
      fetchComments(data.map((p) => p.id));
    }
    setLoading(false);
  }

  async function fetchComments(postIds) {
    if (!postIds || postIds.length === 0) return;
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    if (!error) {
      const grouped = {};
      data.forEach((c) => {
        if (!grouped[c.post_id]) grouped[c.post_id] = [];
        grouped[c.post_id].push(c);
      });
      setComments(grouped);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleUnhide(id) {
    const { error } = await supabase
      .from("posts")
      .update({ is_hidden: false, flag_count: 0 })
      .eq("id", id);
    if (!error) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, is_hidden: false, flag_count: 0 } : p
        )
      );
    }
  }

  async function handleDeleteComment(commentId, postId) {
    if (!confirm("Delete this comment?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (!error) {
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
      }));
    }
  }

  function toggleComments(postId) {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Gemeenskap Feed</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>

        {loading && <p className="text-neutral-400">Loading...</p>}
        {!loading && posts.length === 0 && (
          <p className="text-neutral-400">No posts yet.</p>
        )}

        <div className="space-y-3">
          {posts.map((post) => {
            const postComments = comments[post.id] || [];
            return (
              <div
                key={post.id}
                className={`bg-neutral-900 border rounded-xl p-4 ${
                  post.is_hidden ? "border-red-700" : "border-neutral-800"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-black font-semibold">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span>🚩 {post.flag_count}</span>
                    <span>❤️ {post.likes}</span>
                    {post.is_hidden && (
                      <span className="text-red-400 font-semibold">HIDDEN</span>
                    )}
                  </div>
                </div>

                <p className="font-semibold mb-1">{post.name}</p>
                <p className="text-sm text-neutral-300 mb-3">{post.content}</p>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt=""
                    className="rounded-lg mb-3 w-full max-h-48 object-cover"
                  />
                )}

                <div className="flex gap-3 mb-3">
                  {post.is_hidden && (
                    <button
                      onClick={() => handleUnhide(post.id)}
                      className="text-sm text-green-400 hover:text-green-300"
                    >
                      Unhide
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete Post
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="text-sm text-neutral-400 hover:text-orange-400"
                  >
                    💬 {postComments.length} comments
                  </button>
                </div>

                {openComments[post.id] && (
                  <div className="border-t border-neutral-800 pt-3 flex flex-col gap-2">
                    {postComments.length === 0 && (
                      <p className="text-xs text-neutral-500">No comments.</p>
                    )}
                    {postComments.map((c) => (
                      <div
                        key={c.id}
                        className="flex justify-between items-start gap-3 text-sm"
                      >
                        <div>
                          <span className="font-semibold text-orange-400">
                            {c.name}
                          </span>{" "}
                          <span className="text-neutral-300">{c.content}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(c.id, post.id)}
                          className="text-xs text-red-400 hover:text-red-300 flex-shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}