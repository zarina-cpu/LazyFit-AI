"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw } from "lucide-react";

export default function GeneratePlanButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function regenerate() {
    setLoading(true);
    await fetch("/api/ai/plan", { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={regenerate}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-fill px-4 py-3 text-sm font-medium text-white"
    >
      {loading ? <LoaderCircle className="animate-spin" size={16} /> : <RefreshCw size={16} />}
      Перемешать неделю
    </button>
  );
}
