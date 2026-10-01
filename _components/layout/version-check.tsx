"use client";

import { useEffect } from "react";

export default function VersionCheck() {
  useEffect(() => {
    if (!process.env.BUILD_ID) return;

    const check = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        const { id } = await res.json();
        if (id && id !== process.env.BUILD_ID) location.reload();
      } catch {}
    };

    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, []);

  return null;
}
