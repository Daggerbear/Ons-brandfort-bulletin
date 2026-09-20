// src/components/SafeImage.js
"use client";
import { useState } from "react";
import Image from "next/image";

export default function SafeImage({ src, alt, fallback = null, ...props }) {
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);

  if (!src || failed) return fallback;

  return (
    <Image
      key={attempt}
      src={src}
      alt={alt}
      onError={() => {
        if (attempt === 0) {
          setTimeout(() => setAttempt(1), 1500);
        } else {
          setFailed(true);
        }
      }}
      {...props}
    />
  );
}