// src/app/auth/callback/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { RETURN_KEY, safeReturnPath } from "@/components/AuthProvider";

export default function AuthCallback() {
  const router = useRouter();
  const [failed, setFailed] = useState(null); // { af, en } or null

  useEffect(() => {
    let active = true;

    const run = async () => {
      const query = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const providerError = query.get("error") || hash.get("error");
      const hasCode = query.has("code");

      // Google/Supabase sent the person back with an error (e.g. they pressed Cancel)
      if (providerError) {
        const denied = providerError === "access_denied";
        if (active) {
          setFailed(
            denied
              ? {
                  af: "Aanmelding is gekanselleer. Jy kan steeds die Bulletin gebruik sonder om aan te meld.",
                  en: "Sign-in was cancelled. You can still use the Bulletin without signing in.",
                }
              : {
                  af: "Google-aanmelding het misluk. Probeer asseblief weer.",
                  en: "Google sign-in failed. Please try again.",
                }
          );
        }
        return;
      }

      // getSession waits for the client to finish exchanging the code from the URL.
      // We don't exchange it ourselves: doing it twice makes the second attempt fail.
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (data?.session) {
        let target = "/";
        try {
          target = safeReturnPath(sessionStorage.getItem(RETURN_KEY));
          sessionStorage.removeItem(RETURN_KEY);
        } catch {}
        router.replace(target);
        return;
      }

      if (error || hasCode) {
        setFailed({
          af: "Kon nie jou aanmelding voltooi nie. Probeer asseblief weer.",
          en: "Couldn't complete your sign-in. Please try again.",
        });
        return;
      }

      // Opened directly with nothing to finish: just go home
      router.replace("/");
    };

    run();
    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="min-h-[60vh] bg-carbon text-white flex items-center justify-center px-6">
      {failed ? (
        <div className="max-w-sm text-center space-y-4">
          <p className="text-red-300 text-sm" role="alert">
            {failed.af}
          </p>
          <p className="text-neutral-400 text-xs">{failed.en}</p>
          <Link
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-full px-5 py-2 text-sm"
          >
            Terug na die Bulletin / Back to the Bulletin
          </Link>
        </div>
      ) : (
        <p className="text-neutral-300 text-sm animate-pulse">
          Teken in... / Signing you in...
        </p>
      )}
    </main>
  );
}
