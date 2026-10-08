// src/lib/businessSearch.js
// Grounded business search: only ever returns businesses that exist in the
// list it is given (your approved Supabase rows). Nothing is invented.
import { expandQuery, tokenize, stem } from "@/lib/searchSynonyms";

// Normalise text for name matching: lowercase, strip accents (ê -> e),
// drop apostrophes, turn & into "and", turn other punctuation into spaces.
export function norm(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019`]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Direct business-name match (full name, part of a name, start of a word).
export function matchesName(business, query) {
  const q = norm(query);
  if (!q) return false;
  const n = norm(business.name);
  if (!n) return false;
  if (n.includes(q)) return true;
  if (n.replace(/ /g, "").includes(q.replace(/ /g, ""))) return true;
  const nameWords = n.split(" ");
  return q.split(" ").every((w) => nameWords.some((nw) => nw.startsWith(w)));
}

function matchesStructured(business, rawTerm) {
  const term = String(rawTerm).toLowerCase();
  const structuredText = [business.name, business.category, ...(business.services || [])]
    .join(" ")
    .toLowerCase();

  if (term.includes(" ")) return structuredText.includes(term);

  const words = new Set(tokenize(structuredText).map(stem));
  return words.has(stem(term));
}

function matchesDescription(business, rawTerm) {
  const term = String(rawTerm).toLowerCase();
  const desc = (business.description || "").toLowerCase();
  if (term.includes(" ")) return desc.includes(term);

  const words = new Set(tokenize(desc).map(stem));
  return words.has(stem(term));
}

// Filler words that carry no meaning when someone types a whole sentence.
const STOP_WORDS = new Set([
  // English
  "i", "im", "m", "s", "t", "d", "ll", "ve", "need", "needs", "want", "wanna", "looking", "look",
  "for", "a", "an", "the", "where", "can", "could", "would", "should", "do", "does", "did",
  "get", "got", "my", "me", "to", "of", "in", "at", "on", "near", "nearby", "around", "some",
  "someone", "somebody", "anyone", "anybody", "who", "what", "which", "is", "are", "there", "any",
  "find", "have", "has", "with", "and", "or", "please", "pls", "help", "work", "service",
  "services", "place", "places", "shop", "guy", "person", "people", "buy", "best", "good",
  "how", "about", "it", "that", "this", "you", "your", "we", "us", "our", "here", "local",
  "one", "maybe", "also", "just", "too", "very", "something", "anything", "town", "brandfort",
  // Afrikaans
  "ek", "het", "n", "nodig", "soek", "wil", "graag", "waar", "kan", "kry", "koop", "om", "te",
  "vir", "die", "iemand", "wat", "daar", "enige", "en", "of", "by", "op", "na", "naby", "hier",
  "plaaslik", "dit", "jy", "jou", "ons", "julle", "hulle", "asseblief", "hulp", "diens",
  "dienste", "plek", "plekke", "werk", "moet", "sal", "sou", "hoe", "dalk", "ook", "net",
  "baie", "goeie", "beste", "iets", "een", "aan", "met", "uit", "van", "tot", "as", "maar",
]);

export function extractKeywords(query) {
  const words = (query || "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const keywords = words.filter((w) => !STOP_WORDS.has(w));
  return keywords.length > 0 ? keywords : words;
}

// Returns the matching businesses, best match first.
export function searchBusinesses(businesses, query) {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return [];

  const phrase = keywords.join(" ");
  const phraseTerms = keywords.length > 1 ? expandQuery(phrase) : [];
  const groups = keywords.map((k) => ({
    k,
    terms: Array.from(new Set([k, ...expandQuery(k)])),
  }));

  const scored = businesses
    .map((b) => {
      let score = 0;

      if (keywords.length > 1 && matchesName(b, phrase)) score += 3;

      for (const g of groups) {
        if (g.k.length >= 4 && matchesName(b, g.k)) score += 3;
        else if (g.terms.some((term) => matchesStructured(b, term))) score += 2;
      }

      // multi-word synonyms such as "hair salon"
      if (score === 0 && phraseTerms.some((term) => matchesStructured(b, term))) score += 2;

      return { b, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score) // stable: keeps newest-first within a score
    .map((x) => x.b);

  if (scored.length > 0) return scored;

  // Last resort: look inside descriptions
  const allTerms = Array.from(new Set([...groups.flatMap((g) => g.terms), ...phraseTerms]));
  return businesses.filter((b) => allTerms.some((term) => matchesDescription(b, term)));
}