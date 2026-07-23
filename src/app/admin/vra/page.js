"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminVra() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") setAuthenticated(true);
    setChecked(true);
  }, []);

  const loadData = async () => {
    const { data: q } = await supabase.from("questions").select("*").order("flag_count", { ascending: false });
    const { data: a } = await supabase.from("answers").select("*").order("flag_count", { ascending: false });
    setQuestions(q || []);
    setAnswers(a || []);
  };

  useEffect(() => { if (authenticated) loadData(); }, [authenticated]);

  const deleteQuestion = async (id) => {
    await supabase.from("questions").delete().eq("id", id);
    loadData();
  };
  const deleteAnswer = async (id) => {
    await supabase.from("answers").delete().eq("id", id);
    loadData();
  };

  if (!checked) return null;
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <p className="text-neutral-400">Please <Link href="/admin" className="text-orange-400">log in</Link> first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-sm text-orange-400 hover:text-orange-300">← Terug na Admin Panel</Link>
        <h1 className="text-3xl font-bold mb-8 mt-4">Brandfort Vra</h1>

        <h2 className="text-lg font-bold text-orange-400 mb-3">Questions</h2>
        <div className="space-y-3 mb-10">
          {questions.map((q) => (
            <div key={q.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <p className="text-white">{q.question}</p>
              <p className="text-sm text-neutral-500 mt-1">— {q.name} · flags: {q.flag_count}</p>
              <button onClick={() => deleteQuestion(q.id)} className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Delete</button>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-bold text-orange-400 mb-3">Answers</h2>
        <div className="space-y-3">
          {answers.map((a) => (
            <div key={a.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <p className="text-white">{a.answer}</p>
              <p className="text-sm text-neutral-500 mt-1">— {a.name} · flags: {a.flag_count}</p>
              <button onClick={() => deleteAnswer(a.id)} className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}