// src/components/PostCard.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import SafeImage from "@/components/SafeImage";
import { categories, CATEGORY_STYLES, avatarColor, timeAgo } from "@/lib/feedUi";

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

export default function PostCard({ post, lang = "af", comments = [], onComment }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);
  const [flagged, setFlagged] = useState(false);
  const [flags, setFlags] = useState(post.flag_count || 0);
  const [gone, setGone] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const style = CATEGORY_STYLES[post.category];
  const author = post.name || "?";
  const body = post.content || "";
  // Long posts fold to a few lines so one person can't fill the whole feed
  const isLong = body.length > 220 || body.split("\n").length > 5;

  useEffect(() => {
    setLiked(readList("likedPosts").includes(post.id));
    setFlagged(readList("flaggedPosts").includes(post.id));
  }, [post.id]);

  // Suggest the signed-in person's first name for comments
  const given = user?.user_metadata?.given_name || "";
  useEffect(() => {
    if (given) setName((current) => current || given);
  }, [given]);

  async function handleLike() {
    if (liked) return;
    const { error } = await supabase
      .from("posts")
      .update({ likes: likes + 1 })
      .eq("id", post.id);
    if (!error) {
      setLikes(likes + 1);
      setLiked(true);
      localStorage.setItem("likedPosts", JSON.stringify([...readList("likedPosts"), post.id]));
    }
  }

  async function handleFlag() {
    if (flagged) return;
    const next = flags + 1;
    const hide = next >= 3;
    const { error } = await supabase
      .from("posts")
      .update({ flag_count: next, is_hidden: hide })
      .eq("id", post.id);
    if (!error) {
      setFlags(next);
      setFlagged(true);
      localStorage.setItem("flaggedPosts", JSON.stringify([...readList("flaggedPosts"), post.id]));
      if (hide) setGone(true);
    }
  }

  function handleShare() {
    const content = post.content || "";
    const snippet = content.length > 120 ? content.slice(0, 120) + "…" : content;
    const msg = `${author}: ${snippet}\n\n${window.location.origin}/?focus=post-${post.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  }

  async function handleComment() {
    const cleanName = name.trim();
    const content = text.trim();
    if (!cleanName || !content) return;
    setSending(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({ post_id: post.id, name: cleanName, content })
      .select()
      .single();
    setSending(false);
    if (!error && data) {
      onComment?.(post.id, data);
      setText("");
    }
  }

  if (gone) return null;

  return (
    <article
      className={`rounded-2xl border border-l-4 border-neutral-800 bg-neutral-900 p-4 ${
        style?.border || "border-l-green-400"
      }`}
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-base font-bold text-black ${avatarColor(author)}`}
        >
          {author.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{author}</p>
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${style?.dot || "bg-green-400"}`} />
            <span className={`text-xs ${style?.text || "text-green-400"}`}>
              {categories.find((c) => c.value === post.category)?.[lang] || post.category}
            </span>
            <span className="text-xs text-neutral-600">·</span>
            <span className="text-xs text-neutral-500">{timeAgo(post.created_at, lang)}</span>
          </div>
        </div>
        <button
          onClick={handleFlag}
          disabled={flagged}
          className={`flex-shrink-0 text-[11px] transition ${
            flagged ? "text-red-500" : "text-neutral-600 hover:text-red-400"
          }`}
        >
          🚩 {lang === "af" ? "Rapporteer" : "Report"}
        </button>
      </div>

      <p
        className={`whitespace-pre-line break-words leading-relaxed text-gray-200 ${
          isLong ? "mb-1" : "mb-3"
        } ${isLong && !expanded ? "line-clamp-5" : ""}`}
      >
        {body}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mb-3 text-xs font-semibold text-orange-400 hover:text-orange-300"
        >
          {expanded
            ? lang === "af" ? "Wys minder" : "Show less"
            : lang === "af" ? "Lees meer" : "Read more"}
        </button>
      )}

      {post.image_url && (
        <SafeImage
          src={post.image_url}
          alt=""
          width={800}
          height={400}
          className="mb-3 max-h-96 w-full rounded-xl object-cover"
        />
      )}

      {post.youtube_id && (
        <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${post.youtube_id}`}
            title={author}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      )}

      <div className="grid grid-cols-3 gap-1 border-t border-neutral-800 pt-2">
        <button
          onClick={handleLike}
          disabled={liked}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm transition ${
            liked
              ? "bg-red-500/10 text-red-400"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
          }`}
        >
          {liked ? "❤️" : "🤍"} {likes}
        </button>
        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm transition ${
            open
              ? "bg-green-500/10 text-green-400"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-green-400"
          }`}
        >
          💬 {comments.length}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm text-neutral-400 transition hover:bg-neutral-800 hover:text-green-400"
        >
          📲 {lang === "af" ? "Deel" : "Share"}
        </button>
      </div>

      {open && (
        <div className="mt-3 flex flex-col gap-3 border-t border-neutral-800 pt-3">
          {comments.length === 0 && (
            <p className="text-xs text-neutral-500">
              {lang === "af" ? "Nog geen kommentare nie." : "No comments yet."}
            </p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <div
                className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-black ${avatarColor(c.name || "")}`}
              >
                {(c.name || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 rounded-2xl bg-neutral-800 px-3 py-2">
                <p className="text-xs font-semibold text-green-400">{c.name}</p>
                <p className="break-words text-sm text-gray-200">{c.content}</p>
              </div>
            </div>
          ))}

          <div className="mt-1 flex flex-col gap-2">
            <input
              type="text"
              placeholder={lang === "af" ? "Jou naam" : "Your name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-green-500"
            />
            <textarea
              placeholder={lang === "af" ? "Skryf 'n kommentaar..." : "Write a comment..."}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 300))}
              maxLength={300}
              rows={2}
              className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white outline-none focus:border-green-500"
            />
            <p className="text-right text-xs text-neutral-500">{text.length}/300</p>
            <button
              onClick={handleComment}
              disabled={sending}
              className="self-end rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-green-600 disabled:opacity-50"
            >
              {sending
                ? lang === "af" ? "Stuur..." : "Posting..."
                : lang === "af" ? "Plaas" : "Post"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}