// src/lib/useSuggestedName.js
"use client";
import { useAuth } from "@/components/AuthProvider";

// The signed-in person's first name, or "" when signed out.
// Forms use it to pre-fill the name box; people can still change it.
export function suggestedNameFrom(user) {
  const meta = user?.user_metadata || {};
  const given = String(meta.given_name || "").trim();
  if (given) return given;
  const full = String(meta.full_name || meta.name || "").trim();
  return full ? full.split(/\s+/)[0] : "";
}

export function useSuggestedName() {
  const { user } = useAuth();
  return suggestedNameFrom(user);
}

export default useSuggestedName;
