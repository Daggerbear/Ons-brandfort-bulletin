"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const DIFFICULTIES = ["easy", "medium", "hard"];

export default function AdminRiddles() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [riddles, setRiddles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const emptyForm = {
    day_index: "",
    riddle_text: "",
    answer: "",
    alt_answers: "",
    hint: "",
    difficulty: "medium",
    active: true,
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  async function loadData() {
    setLoading(true);
    setLoadError("");
    const { data, error: fetchError, count } = await supabase
      .from("riddles")
      .select("*", { count: "exact" })
      .order("day_index", { ascending: true });

    if (fetchError) {
      setLoadError(`Failed to load: ${fetchError.message}`);
      setRiddles([]);
    } else {
      setRiddles(data || []);
      if ((data || []).length === 0) {
        setLoadError("Query succeeded but returned 0 rows — the table may genuinely be empty, or RLS is blocking read access.");
      }
    }
    setLoading(false);
  }

  function startEdit(r) {
    setEditingId(r.id);
    setShowNewForm(false);
    setForm({
      day_index: r.day_index,
      riddle_text: r.riddle_text,
      answer: r.answer,
      alt_answers: (r.alt_answers || []).join(", "),
      hint: r.hint || "",
      difficulty: r.difficulty || "medium",
      active: r.active !== false,
    });
    setError("");
  }

  function startNew() {
    setEditingId(null);
    setShowNewForm(true);
    const nextDay = riddles.length > 0 ? Math.max(...riddles.map((r) => r.day_index)) + 1 : 1;
    setForm({ ...emptyForm, day_index: nextDay });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setShowNewForm(false);
    setForm(emptyForm);
    setError("");
  }

  function buildPayload() {
    const dayIndex = parseInt(form.day_index, 10);
    if (isNaN(dayIndex) || dayIndex < 1) {
      throw new Error("Day index must be a positive number.");
    }
    if (!form.riddle_text.trim()) throw new Error("Riddle text is required.");
    if (!form.answer.trim()) throw new Error("Answer is required.");

    return {
      day_index: dayIndex,
      riddle_text: form.riddle_text.trim(),
      answer: form.answer.trim(),
      alt_answers: form.alt_answers
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      hint: form.hint.trim() || null,
      difficulty: form.difficulty,
      active: form.active,
    };
  }

  async function handleSave() {
    setError("");
    let payload;
    try {
      payload = buildPayload();
    } catch (e) {
      setError(e.message);
      return;
    }

    setSaving(true);

    if (editingId) {
      const { error: updateError } = await supabase
        .from("riddles")
        .update(payload)
        .eq("id", editingId);
      setSaving(false);
      if (updateError) {
        setError(
          updateError.message.includes("one_active_riddle_per_day")
            ? "Another active riddle already uses this day index. Deactivate it first or pick a different day."
            : `Save failed: ${updateError.message}`
        );
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("riddles").insert(payload);
      setSaving(false);
      if (insertError) {
        setError(
          insertError.message.includes("one_active_riddle_per_day")
            ? "Another active riddle already uses this day index. Deactivate it first or pick a different day."
            : `Save failed: ${insertError.message}`
        );
        return;
      }
    }

    cancelEdit();
    loadData();
  }

  async function toggleActive(r) {
    const { error: updateError } = await supabase
      .from("riddles")
      .update({ active: !r.active })
      .eq("id", r.id);
    if (updateError) {
      alert(
        updateError.message.includes("one_active_riddle_per_day")
          ? "Can't activate — another active riddle already uses this day index."
          : `Failed: ${updateError.message}`
      );
      return;
    }
    loadData();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this riddle permanently?")) return;
    await supabase.from("riddles").delete().eq("id", id);
    loadData();
  }

  const filteredRiddles = useMemo(() => {
    if (!searchTerm.trim()) return riddles;
    const q = searchTerm.toLowerCase();
    return riddles.filter(
      (r) =>
        r.riddle_text?.toLowerCase().includes(q) ||
        r.answer?.toLowerCase().includes(q)
    );
  }, [riddles, searchTerm]);

  if (!checked) return null;

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <p className="text-neutral-400">
          Please{" "}
          <Link href="/admin" className="text-orange-400">
            log in
          </Link>{" "}
          first.
        </p>
      </main>
    );
  }

  const formVisible = editingId !== null || showNewForm;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Riddle Rush — Riddles</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>
        <p className="text-sm text-neutral-500 mb-1">
          Day index sets rotation position — no upper limit, add as many as you like.
        </p>
        <p className="text-sm text-neutral-500 mb-6">
          {riddles.length} riddle{riddles.length !== 1 ? "s" : ""} total.
        </p>

        {loadError && (
          <div className="bg-red-950/40 border border-red-800 rounded-lg p-3 mb-6 text-sm text-red-300">
            {loadError}
          </div>
        )}

        {!formVisible && (
          <button
            onClick={startNew}
            className="w-full bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3 mb-6"
          >
            + New Riddle
          </button>
        )}

        {formVisible && (
          <div className="bg-neutral-900 border border-orange-500/40 rounded-xl p-4 mb-6 space-y-3">
            <h2 className="font-semibold text-orange-400">
              {editingId ? "Edit Riddle" : "New Riddle"}
            </h2>

            <label className="block text-xs text-neutral-500">Day Index</label>
            <input
              type="number"
              min="1"
              value={form.day_index}
              onChange={(e) => setForm({ ...form, day_index: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            />

            <label className="block text-xs text-neutral-500">Riddle Text</label>
            <textarea
              rows={2}
              value={form.riddle_text}
              onChange={(e) => setForm({ ...form, riddle_text: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            />

            <label className="block text-xs text-neutral-500">Correct Answer</label>
            <input
              type="text"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            />

            <label className="block text-xs text-neutral-500">
              Alternative Answers (comma-separated, optional)
            </label>
            <input
              type="text"
              placeholder="e.g. cat, kitty, feline"
              value={form.alt_answers}
              onChange={(e) => setForm({ ...form, alt_answers: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            />

            <label className="block text-xs text-neutral-500">Hint (optional)</label>
            <input
              type="text"
              value={form.hint}
              onChange={(e) => setForm({ ...form, hint: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            />

            <label className="block text-xs text-neutral-500">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Active (counts in the rotation)
            </label>

            {form.riddle_text && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 mt-2">
                <p className="text-xs text-neutral-500 uppercase mb-1">Preview</p>
                <p className="text-sm text-neutral-200">{form.riddle_text}</p>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-2 text-sm disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={cancelEdit}
                className="bg-neutral-800 hover:bg-neutral-700 transition text-white rounded-lg px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!formVisible && riddles.length > 0 && (
          <input
            type="text"
            placeholder="Search existing riddles or answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 mb-4 text-white placeholder-neutral-500 focus:border-orange-500 outline-none"
          />
        )}

        {loading && <p className="text-neutral-400">Loading...</p>}

        <div className="space-y-2">
          {filteredRiddles.map((r) => (
            <div
              key={r.id}
              className={`bg-neutral-900 border rounded-xl p-4 ${
                r.active ? "border-neutral-800" : "border-neutral-800 opacity-50"
              }`}
            >
              <div className="flex justify-between items-start gap-3 mb-2">
                <div className="min-w-0">
                  <span className="text-xs text-neutral-500">Day {r.day_index}</span>
                  <p className="text-sm text-neutral-200 mt-0.5">{r.riddle_text}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                    r.active ? "bg-green-600/20 text-green-400" : "bg-neutral-700 text-neutral-400"
                  }`}
                >
                  {r.active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                Answer: <span className="text-neutral-300">{r.answer}</span>
                {r.alt_answers?.length > 0 && (
                  <> · Alts: {r.alt_answers.join(", ")}</>
                )}
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => startEdit(r)}
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(r)}
                  className="text-sm text-neutral-400 hover:text-white"
                >
                  {r.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}