// src/lib/useHunter.js
"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { HUNTERS_ENABLED } from "@/lib/features";

// The signed-in person's Hunter record from the database (not from the browser).
// hunter is null when they haven't joined, or when Hunters are switched off.
export function useHunter() {
  const { user } = useAuth();
  const userId = user?.id;
  const [hunter, setHunter] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!HUNTERS_ENABLED || !userId) {
      setHunter(null);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.rpc("my_hunter");
    setHunter(!error && Array.isArray(data) && data.length > 0 ? data[0] : null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { hunter, loading, refresh };
}

export default useHunter;
