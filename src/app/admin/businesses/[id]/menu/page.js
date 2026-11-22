// src/app/admin/businesses/[id]/menu/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MenuEditor from "@/components/MenuEditor";

export default function AdminBusinessMenu() {
  const { id } = useParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem("adminAuth") === "true");
    setChecked(true);
  }, []);

  if (!checked) return null;
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <p>
          Please{" "}
          <Link href="/admin" className="text-orange-400">
            log in
          </Link>{" "}
          first.
        </p>
      </main>
    );
  }

  return (
    <MenuEditor
      businessId={id}
      backHref="/admin/businesses"
      backLabel="← Back to Businesses"
    />
  );
}
