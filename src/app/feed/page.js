// src/app/feed/page.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import SafeImage from "@/components/SafeImage";
import { SkeletonList, SkeletonPostCard } from "@/components/Skeleton";

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

// Each category gets its own identity — text/dot colour plus a coloured left edge on the card
const CATEGORY_STYLES = {
  question: { text: "text-sky-400", dot: "bg-sky-400", border: "border-l-sky-400" },
  lost: { text: "text-red-400", dot: "bg-red-400", border: "border-l-red-400" },
  found: { text: "text-emerald-400", dot: "bg-emerald-400", border: "border-l-emerald-400" },
  announcement: { text: "text-orange-400", dot: "bg-orange-400", border: "border-l-orange-400" },
  birthday: { text: "text-pink-400", dot: "bg-pink-400", border: "border-l-pink-400" },
  thank_you: { text: "text-purple-400", dot: "bg-purple-400", border: "border-l-purple-400" },
  recommendation: { text: "text-teal-400", dot: "bg-teal-400", border: "border-l-teal-400" },
  warning: { text: "text-amber-400", dot: "bg-amber-400", border: "border-l-amber-400" },
  community: { text: "text-green-400", dot: "bg-green-400", border: "border-l-green-400" },
};

// Deterministic avatar color from the poster's name — same person always gets the same color
const AVATAR_COLORS = [
  "bg-orange-500", "bg-sky-500", "bg-emerald-500", "bg-pink-500",
  "bg-purple-500", "bg-amber-500", "bg-teal-500", "bg-red-500",
];

function avatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function timeAgo(dateStr, lang) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  const units = [
    { s: 31536000, af: "j", en: "y" },
    { s: 2592000, af: "m", en: "mo" },
    { s: 86400, af: "d", en: "d" },
    { s: 3600, af: "u", en: "h" },
    { s: 60, af: "min", en: "m" },
  ];
  for (const u of units) {
    const val = Math.floor(seconds / u.s);
    if (val >= 1) return `${val}${lang === "af" ? u.af : u.en}`;
  }
  return lang === "af" ? "nou" : "now";
}

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

  function handleShare(post) {
    const snippet =
      post.content.length > 120 ? post.content.slice(0, 120) + "…" : post.content;
    const msg = `${post.name}: ${snippet}\n\n${window.location.origin}/feed`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
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

      {/* Header */}
      <header
        className="border-b border-green-900/60 px-4 pt-6 pb-5"
        style={{
          background: "radial-gradient(circle at 20% 0%, #14532d, #0a0a0a 75%)",
        }}
      >
        <div className="max-w-2xl mx-auto flex justify-between items-start gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
              💬 <span className="text-green-400">{lang === "af" ? "Gemeenskap Feed" : "Community Feed"}</span>
            </h1>
            <p className="text-sm text-neutral-300 mt-1">
              {lang === "af"
                ? "Vrae, nuus, shoutouts en video's van jou bure."
                : "Questions, news, shoutouts and videos from your neighbours."}
            </p>
          </div>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-green-400 hover:text-green-400 transition flex-shrink-0"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 pb-24">
        {/* Composer */}
        <Link
          href="/feed/new"
          className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 hover:border-green-500 transition rounded-2xl p-3 mb-4"
        >
          <div className="w-10 h-10 rounded-full bg-green-500 text-black flex items-center justify-center text-lg flex-shrink-0">
            ✏️
          </div>
          <span className="text-neutral-400 text-sm flex-1 min-w-0 truncate">
            {lang === "af"
              ? "Deel iets met Brandfort..."
              : "Share something with Brandfort..."}
          </span>
          <span className="text-xs font-bold uppercase tracking-wide bg-green-500 text-black rounded-full px-3 py-1.5 flex-shrink-0">
            {lang === "af" ? "Plaas" : "Post"}
          </span>
        </Link>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
                filter === cat.value
                  ? "bg-green-500 border-green-500 text-black font-semibold"
                  : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
              }`}
            >
              {lang === "af" ? cat.af : cat.en}
            </button>
          ))}
        </div>

        {loading && <SkeletonList Component={SkeletonPostCard} count={4} />}

        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="text-5xl mb-3">🌱</div>
            <p className="text-neutral-400 text-sm mb-4">
              {lang === "af"
                ? "Nog geen plasings nie. Wees die eerste een!"
                : "No posts yet. Be the first!"}
            </p>
            <Link
              href="/feed/new"
              className="inline-block bg-green-500 hover:bg-green-600 transition text-black font-bold rounded-xl px-5 py-3 text-sm"
            >
              ✏️ {lang === "af" ? "Maak 'n Plasing" : "Make a Post"}
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {feedItems.map((item, idx) =>
            item.type === "ad" ? (
              <Link
                key={`ad-${idx}`}
                href={item.data.business_id ? `/business/${item.data.business_id}` : "#"}
                className="block bg-neutral-900 rounded-2xl p-4 border border-orange-500/30 hover:border-orange-500/60 transition"
              >
                <span className="text-xs px-2 py-1 rounded-full bg-orange-500 text-black font-semibold mb-2 inline-block">
                  {lang === "af" ? "Geborg" : "Sponsored"}
                </span>
                <p className="font-semibold mb-2">{item.data.business_name}</p>
                <SafeImage
                  src={item.data.image_url}
                  alt={item.data.business_name}
                  width={800}
                  height={400}
                  className="rounded-xl w-full object-cover"
                />
              </Link>
            ) : (
              <article
                key={item.data.id}
                className={`bg-neutral-900 rounded-2xl p-4 border border-neutral-800 border-l-4 ${
                  CATEGORY_STYLES[item.data.category]?.border || "border-l-green-400"
                }`}
              >
                {/* Post header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-black flex-shrink-0 ${avatarColor(
                      item.data.name
                    )}`}
                  >
                    {item.data.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.data.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          CATEGORY_STYLES[item.data.category]?.dot || "bg-green-400"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          CATEGORY_STYLES[item.data.category]?.text || "text-green-400"
                        }`}
                      >
                        {categories.find((c) => c.value === item.data.category)?.[lang] ||
                          item.data.category}
                      </span>
                      <span className="text-xs text-neutral-600">·</span>
                      <span className="text-xs text-neutral-500">
                        {timeAgo(item.data.created_at, lang)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFlag(item.data.id, item.data.flag_count)}
                    disabled={flaggedIds.includes(item.data.id)}
                    className={`text-[11px] flex-shrink-0 transition ${
                      flaggedIds.includes(item.data.id)
                        ? "text-red-500"
                        : "text-neutral-600 hover:text-red-400"
                    }`}
                  >
                    🚩 {lang === "af" ? "Rapporteer" : "Report"}
                  </button>
                </div>

                {/* Content */}
                <p className="text-gray-200 mb-3 leading-relaxed whitespace-pre-line break-words">
                  {item.data.content}
                </p>

                {item.data.image_url && (
                  <SafeImage
                    src={item.data.image_url}
                    alt=""
                    width={800}
                    height={400}
                    className="rounded-xl mb-3 w-full max-h-96 object-cover"
                  />
                )}

                {item.data.youtube_id && (
                  <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-3">
                    <iframe
                      src={`https://www.youtube.com/embed/${item.data.youtube_id}`}
                      title={item.data.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  </div>
                )}

                {/* Action bar */}
                <div className="grid grid-cols-3 gap-1 border-t border-neutral-800 pt-2">
                  <button
                    onClick={() => handleLike(item.data.id, item.data.likes)}
                    disabled={likedIds.includes(item.data.id)}
                    className={`flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg transition ${
                      likedIds.includes(item.data.id)
                        ? "text-red-400 bg-red-500/10"
                        : "text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
                    }`}
                  >
                    {likedIds.includes(item.data.id) ? "❤️" : "🤍"} {item.data.likes}
                  </button>

                  <button
                    onClick={() => toggleComments(item.data.id)}
                    className={`flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg transition ${
                      openComments[item.data.id]
                        ? "text-green-400 bg-green-500/10"
                        : "text-neutral-400 hover:bg-neutral-800 hover:text-green-400"
                    }`}
                  >
                    💬 {(comments[item.data.id] || []).length}
                  </button>

                  <button
                    onClick={() => handleShare(item.data)}
                    className="flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-green-400 transition"
                  >
                    📲 {lang === "af" ? "Deel" : "Share"}
                  </button>
                </div>

                {/* Comments */}
                {openComments[item.data.id] && (
                  <div className="mt-3 border-t border-neutral-800 pt-3 flex flex-col gap-3">
                    {(comments[item.data.id] || []).length === 0 && (
                      <p className="text-xs text-neutral-500">
                        {lang === "af"
                          ? "Nog geen kommentare nie."
                          : "No comments yet."}
                      </p>
                    )}

                    {(comments[item.data.id] || []).map((c) => (
                      <div key={c.id} className="flex items-start gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0 mt-0.5 ${avatarColor(
                            c.name
                          )}`}
                        >
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="bg-neutral-800 rounded-2xl px-3 py-2 min-w-0">
                          <p className="text-xs font-semibold text-green-400">{c.name}</p>
                          <p className="text-sm text-gray-200 break-words">{c.content}</p>
                        </div>
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
                        className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none"
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
                        className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none"
                      />
                      <p className="text-xs text-neutral-500 text-right">
                        {(commentText[item.data.id] || "").length}/300
                      </p>
                      <button
                        onClick={() => handleCommentSubmit(item.data.id)}
                        disabled={commentSubmitting[item.data.id]}
                        className="self-end bg-green-500 hover:bg-green-600 text-black text-sm font-semibold rounded-lg px-4 py-2 disabled:opacity-50 transition"
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
              </article>
            )
          )}
        </div>
      </div>

      <Link
        href="/feed/new"
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 transition text-black text-3xl font-bold flex items-center justify-center shadow-lg shadow-green-500/30 z-50"
      >
        +
      </Link>
    </div>
  );
}