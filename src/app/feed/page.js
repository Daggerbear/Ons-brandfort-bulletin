"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Image from "next/image";

const categories = [
  { value: "all", af: "Alles", en: "All" },
  { value: "question", af: "Vra", en: "Question" },
  { value: "lost", af: "Verlore", en: "Lost" },
  { value: "found", af: "Gevind", en: "Found" },
  { value: "announcement", af: "Aankondiging", en: "Announcement" },
  { value: "birthday", af: "Verjaarsdag", en: "Birthday" },
  { value: "thank_you", af: "Dankie", en: "Thank You" },
  { value: "recommendation", af: "Aanbeveling", en: "Recommendation" },
  { value: "warning", af: "Waarskuwing", en: "Warning" },
  { value: "community", af: "Gemeenskap", en: "Community" },
];

export default function Feed() {
  const [lang, setLang] = useState("af");
  const [posts, setPosts] = useState([]);
  const [ads, setAds] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [likedIds, setLikedIds] = useState([]);
  const [flaggedIds, setFlaggedIds] = useState([]);

  const [comments, setComments] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentName, setCommentName] = useState({});
  const [commentText, setCommentText] = useState({});
  const [commentSubmitting, setCommentSubmitting] = useState({});

  useEffect(() => {
    const storedLikes = JSON.parse(localStorage.getItem("likedPosts") || "[]");
    const storedFlags = JSON.parse(localStorage.getItem("flaggedPosts") || "[]");
    setLikedIds(storedLikes);
    setFlaggedIds(storedFlags);
    fetchPosts();
    fetchAds();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("is_hidden", false)
      .gte("created_at", cutoff.toISOString())
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

  async function fetchAds() {
    const { data, error } = await supabase
      .from("sponsored_ads")
      .select("*")
      .eq("active", true);

    if (!error) setAds(data);
  }

  async function handleLike(postId, currentLikes) {
    if (likedIds.includes(postId)) return;

    const { error } = await supabase
      .from("posts")
      .update({ likes: currentLikes + 1 })
      .eq("id", postId);

    if (!error) {
      const updated = [...likedIds, postId];
      setLikedIds(updated);
      localStorage.setItem("likedPosts", JSON.stringify(updated));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likes: currentLikes + 1 } : p
        )
      );
    }
  }

  async function handleFlag(postId, currentFlags) {
    if (flaggedIds.includes(postId)) return;

    const newFlagCount = currentFlags + 1;
    const shouldHide = newFlagCount >= 3;

    const { error } = await supabase
      .from("posts")
      .update({
        flag_count: newFlagCount,
        is_hidden: shouldHide,
      })
      .eq("id", postId);

    if (!error) {
      const updated = [...flaggedIds, postId];
      setFlaggedIds(updated);
      localStorage.setItem("flaggedPosts", JSON.stringify(updated));

      if (shouldHide) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, flag_count: newFlagCount } : p
          )
        );
      }
    }
  }

  function toggleComments(postId) {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  async function handleCommentSubmit(postId) {
    const name = (commentName[postId] || "").trim();
    const content = (commentText[postId] || "").trim();
    if (!name || !content) return;

    setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));

    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: postId, name, content })
      .select()
      .single();

    setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));

    if (!error && data) {
      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data],
      }));
      setCommentName((prev) => ({ ...prev, [postId]: "" }));
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
    }
  }

  const filteredPosts =
    filter === "all" ? posts : posts.filter((p) => p.category === filter);

  function buildFeedWithAds() {
    if (filter !== "all" || ads.length === 0) {
      return filteredPosts.map((p) => ({ type: "post", data: p }));
    }

    const result = [];
    filteredPosts.forEach((post, index) => {
      result.push({ type: "post", data: post });
      if ((index + 1) % 5 === 0) {
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        result.push({ type: "ad", data: randomAd });
      }
    });
    return result;
  }

  const feedItems = buildFeedWithAds();

  return (
    <div className="min-h-screen bg-black text-white relative">
      <Nav lang={lang} setLang={setLang} />

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            {lang === "af" ? "Gemeenskap Feed" : "Community Feed"}
          </h1>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap border ${
                filter === cat.value
                  ? "bg-orange-500 border-orange-500 text-black font-semibold"
                  : "border-gray-600 text-gray-300"
              }`}
            >
              {lang === "af" ? cat.af : cat.en}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-400">Laai...</p>}

        {!loading && filteredPosts.length === 0 && (
          <p className="text-gray-400">
            {lang === "af" ? "Nog geen plasings nie." : "No posts yet."}
          </p>
        )}

        <div className="flex flex-col gap-4">
          {feedItems.map((item, idx) =>
            item.type === "ad" ? (
              <Link
                key={`ad-${idx}`}
                href={item.data.business_id ? `/business/${item.data.business_id}` : "#"}
                className="block bg-gray-900 rounded-xl p-4 border border-orange-800 hover:opacity-90 transition"
              >
                <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-black font-semibold mb-2 inline-block">
                  {lang === "af" ? "Geborg" : "Sponsored"}
                </span>
                <p className="font-semibold mb-2">{item.data.business_name}</p>
                <Image
                  src={item.data.image_url}
                  alt={item.data.business_name}
                  width={800}
                  height={400}
                  className="rounded-lg w-full object-cover"
                />
              </Link>
            ) : (
              <div
                key={item.data.id}
                className="bg-gray-900 rounded-xl p-4 border border-gray-800"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-black font-semibold">
                    {categories.find((c) => c.value === item.data.category)?.[lang] ||
                      item.data.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(item.data.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="font-semibold mb-1">{item.data.name}</p>
                <p className="text-gray-200 mb-3">{item.data.content}</p>

                {item.data.image_url && (
                  <Image
                    src={item.data.image_url}
                    alt=""
                    width={800}
                    height={400}
                    className="rounded-lg mb-3 w-full object-cover"
                  />
                )}

                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => handleLike(item.data.id, item.data.likes)}
                    disabled={likedIds.includes(item.data.id)}
                    className={`flex items-center gap-1 text-sm ${
                      likedIds.includes(item.data.id)
                        ? "text-orange-500"
                        : "text-gray-400"
                    }`}
                  >
                    ❤️ {item.data.likes}
                  </button>

                  <button
                    onClick={() => toggleComments(item.data.id)}
                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-orange-400"
                  >
                    💬 {(comments[item.data.id] || []).length}{" "}
                    {lang === "af" ? "kommentare" : "comments"}
                  </button>

                  <button
                    onClick={() => handleFlag(item.data.id, item.data.flag_count)}
                    disabled={flaggedIds.includes(item.data.id)}
                    className={`flex items-center gap-1 text-xs ${
                      flaggedIds.includes(item.data.id)
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    🚩 {lang === "af" ? "Rapporteer" : "Report"}
                  </button>
                </div>

                {openComments[item.data.id] && (
                  <div className="mt-3 border-t border-gray-800 pt-3 flex flex-col gap-3">
                    {(comments[item.data.id] || []).length === 0 && (
                      <p className="text-xs text-gray-500">
                        {lang === "af"
                          ? "Nog geen kommentare nie."
                          : "No comments yet."}
                      </p>
                    )}

                    {(comments[item.data.id] || []).map((c) => (
                      <div key={c.id} className="text-sm">
                        <span className="font-semibold text-orange-400">
                          {c.name}
                        </span>{" "}
                        <span className="text-gray-300">{c.content}</span>
                      </div>
                    ))}

                    <div className="flex flex-col gap-2 mt-1">
                      <input
                        type="text"
                        placeholder={lang === "af" ? "Jou naam" : "Your name"}
                        value={commentName[item.data.id] || ""}
                        onChange={(e) =>
                          setCommentName((prev) => ({
                            ...prev,
                            [item.data.id]: e.target.value,
                          }))
                        }
                        className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                      <textarea
                        placeholder={
                          lang === "af" ? "Skryf 'n kommentaar..." : "Write a comment..."
                        }
                        value={commentText[item.data.id] || ""}
                        onChange={(e) =>
                          setCommentText((prev) => ({
                            ...prev,
                            [item.data.id]: e.target.value.slice(0, 300),
                          }))
                        }
                        maxLength={300}
                        rows={2}
                        className="bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
                      />
                      <p className="text-xs text-gray-500 text-right">
                        {(commentText[item.data.id] || "").length}/300
                      </p>
                      <button
                        onClick={() => handleCommentSubmit(item.data.id)}
                        disabled={commentSubmitting[item.data.id]}
                        className="self-end bg-orange-500 text-black text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50"
                      >
                        {commentSubmitting[item.data.id]
                          ? lang === "af"
                            ? "Stuur..."
                            : "Posting..."
                          : lang === "af"
                          ? "Plaas"
                          : "Post"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      <Link
        href="/feed/new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-500 text-black text-3xl font-bold flex items-center justify-center shadow-lg z-50"
      >
        +
      </Link>
    </div>
  );
}