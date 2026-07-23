"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";

export default function BrandfortVra() {
  const [lang, setLang] = useState("af");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answerForms, setAnswerForms] = useState({});
  const [similar, setSimilar] = useState([]);
  const [highlighted, setHighlighted] = useState(null);

  const text = {
    af: {
      title1: "Brandfort",
      title2: "Vra",
      tagline: "Vra iets, kry hulp van die gemeenskap.",
      namePlaceholder: "Jou naam",
      questionPlaceholder: "Jou vraag...",
      similarTitle: "Dalk het iemand al hieroor gevra:",
      similarHint: "Klik op 'n vraag hierbo om dit te sien.",
      submit: "Vra",
      submitting: "Stuur...",
      answer: "Antwoord",
      answerPlaceholder: "Jou antwoord...",
      send: "Stuur",
      cancel: "Kanselleer",
      flag: "Flag",
    },
    en: {
      title1: "Brandfort",
      title2: "Ask",
      tagline: "Ask something, get help from the community.",
      namePlaceholder: "Your name",
      questionPlaceholder: "Your question...",
      similarTitle: "Someone may have already asked this:",
      similarHint: "Click a question above to view it.",
      submit: "Ask",
      submitting: "Sending...",
      answer: "Answer",
      answerPlaceholder: "Your answer...",
      send: "Send",
      cancel: "Cancel",
      flag: "Flag",
    },
  };
  const t = text[lang];

  const loadQuestions = async () => {
    const { data } = await supabase
      .from("questions")
      .select("*")
      .lt("flag_count", 3)
      .order("created_at", { ascending: false });
    setQuestions(data || []);

    const { data: answerData } = await supabase
      .from("answers")
      .select("*")
      .lt("flag_count", 3)
      .order("created_at", { ascending: true });

    const grouped = {};
    (answerData || []).forEach((a) => {
      if (!grouped[a.question_id]) grouped[a.question_id] = [];
      grouped[a.question_id].push(a);
    });
    setAnswers(grouped);
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const normalize = (s) =>
    s.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean);

  const findSimilar = (text, existingQuestions) => {
    const inputWords = new Set(normalize(text));
    if (inputWords.size === 0) return [];

    return existingQuestions
      .map((q) => {
        const qWords = new Set(normalize(q.question));
        const overlap = [...inputWords].filter((w) => qWords.has(w)).length;
        const score = overlap / Math.max(inputWords.size, qWords.size);
        return { ...q, score };
      })
      .filter((q) => q.score > 0.4)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  useEffect(() => {
    if (question.trim().length < 5) {
      setSimilar([]);
      return;
    }
    const timeout = setTimeout(() => {
      setSimilar(findSimilar(question, questions));
    }, 400);
    return () => clearTimeout(timeout);
  }, [question, questions]);

  const jumpToQuestion = (id) => {
    const el = document.getElementById(`q-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlighted(id);
      setTimeout(() => setHighlighted(null), 2000);
    }
  };

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!name.trim() || !question.trim()) return;
    setLoading(true);
    await supabase.from("questions").insert({ name, question });
    setName("");
    setQuestion("");
    setSimilar([]);
    setLoading(false);
    loadQuestions();
  };

  const submitAnswer = async (questionId) => {
    const form = answerForms[questionId];
    if (!form?.name?.trim() || !form?.answer?.trim()) return;
    await supabase.from("answers").insert({
      question_id: questionId,
      name: form.name,
      answer: form.answer,
    });
    setAnswerForms({
      ...answerForms,
      [questionId]: { name: "", answer: "", open: false },
    });
    loadQuestions();
  };

  const updateAnswerForm = (questionId, field, value) => {
    setAnswerForms({
      ...answerForms,
      [questionId]: { ...answerForms[questionId], [field]: value },
    });
  };

  const toggleAnswerForm = (questionId) => {
    setAnswerForms({
      ...answerForms,
      [questionId]: {
        ...answerForms[questionId],
        open: !answerForms[questionId]?.open,
      },
    });
  };

  const flagQuestion = async (id, currentCount) => {
    await supabase
      .from("questions")
      .update({ flag_count: currentCount + 1 })
      .eq("id", id);
    loadQuestions();
  };

  const flagAnswer = async (id, currentCount) => {
    await supabase
      .from("answers")
      .update({ flag_count: currentCount + 1 })
      .eq("id", id);
    loadQuestions();
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />
      <header className="border-b border-neutral-800 px-6 py-8 text-center">
        <div className="flex justify-end mb-4 max-w-2xl mx-auto">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <h1 className="text-3xl font-bold">
          {t.title1} <span className="text-orange-500">{t.title2}</span>
        </h1>
        <p className="text-neutral-400 mt-2">{t.tagline}</p>
      </header>

      <section className="px-6 py-8 max-w-2xl mx-auto">
        <form
          onSubmit={submitQuestion}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-8 space-y-3"
        >
          <input
            type="text"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            required
          />
          <textarea
            placeholder={t.questionPlaceholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white"
            rows={3}
            required
          />

          {similar.length > 0 && (
            <div className="bg-neutral-800 border border-orange-500/40 rounded-lg p-3 space-y-2">
              <p className="text-sm text-orange-400 font-medium">
                {t.similarTitle}
              </p>
              {similar.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => jumpToQuestion(s.id)}
                  className="block text-left text-sm text-neutral-300 hover:text-orange-400 underline decoration-neutral-600 hover:decoration-orange-400 transition"
                >
                  • {s.question}
                </button>
              ))}
              <p className="text-xs text-neutral-500">{t.similarHint}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-2"
          >
            {loading ? t.submitting : t.submit}
          </button>
        </form>

        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              id={`q-${q.id}`}
              className={`bg-neutral-900 border rounded-xl p-5 transition-colors duration-500 ${
                highlighted === q.id
                  ? "border-orange-500"
                  : "border-neutral-800"
              }`}
            >
              <p className="text-neutral-300">{q.question}</p>
              <div className="flex justify-between items-center mt-3">
                <p className="text-sm text-neutral-500">— {q.name}</p>
                <button
                  onClick={() => flagQuestion(q.id, q.flag_count)}
                  className="text-xs text-neutral-500 hover:text-orange-400"
                >
                  {t.flag}
                </button>
              </div>

              {answers[q.id]?.length > 0 && (
                <div className="mt-4 pl-4 border-l border-neutral-800 space-y-3">
                  {answers[q.id].map((a) => (
                    <div key={a.id}>
                      <p className="text-neutral-300 text-sm">{a.answer}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-neutral-500">— {a.name}</p>
                        <button
                          onClick={() => flagAnswer(a.id, a.flag_count)}
                          className="text-xs text-neutral-500 hover:text-orange-400"
                        >
                          {t.flag}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                {!answerForms[q.id]?.open ? (
                  <button
                    onClick={() => toggleAnswerForm(q.id)}
                    className="text-sm text-orange-400 hover:text-orange-300"
                  >
                    {t.answer}
                  </button>
                ) : (
                  <div className="space-y-2 mt-2">
                    <input
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={answerForms[q.id]?.name || ""}
                      onChange={(e) =>
                        updateAnswerForm(q.id, "name", e.target.value)
                      }
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <textarea
                      placeholder={t.answerPlaceholder}
                      value={answerForms[q.id]?.answer || ""}
                      onChange={(e) =>
                        updateAnswerForm(q.id, "answer", e.target.value)
                      }
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => submitAnswer(q.id)}
                        className="bg-orange-500 hover:bg-orange-600 transition text-white text-sm font-semibold rounded-lg px-3 py-1.5"
                      >
                        {t.send}
                      </button>
                      <button
                        onClick={() => toggleAnswerForm(q.id)}
                        className="text-neutral-500 text-sm hover:text-neutral-300"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}