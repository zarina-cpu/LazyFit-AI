"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export default function CompleteButton({ exerciseId, date, initialDone = false }) {
  const router = useRouter();
  const [done, setDone] = useState(initialDone);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const next = !done;
    const response = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId, date, done: next }),
    });
    setLoading(false);
    if (response.ok) {
      setDone(next);
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${
        done ? "bg-fill text-white" : "border border-line bg-card"
      }`}
    >
      <Check size={16} />
      {done ? "Сделано, можно лежать" : "Отметить подход"}
    </button>
  );
}
