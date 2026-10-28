"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CatalogFilters({ categories, active, query }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(query || "");

  function push(nextCategory, nextQuery) {
    const search = new URLSearchParams(params.toString());
    if (nextCategory && nextCategory !== "all") search.set("category", nextCategory);
    else search.delete("category");
    if (nextQuery) search.set("q", nextQuery);
    else search.delete("q");
    router.push(`/exercises${search.toString() ? `?${search}` : ""}`);
  }

  return (
    <div className="space-y-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          push(active, q);
        }}
      >
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Найти: пресс, шея, диван..."
          className="w-full rounded-2xl border border-line bg-card px-4 py-3 outline-none ring-sage focus:ring-2"
        />
      </form>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <button
          type="button"
          onClick={() => push("all", q)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${active === "all" ? "bg-fill text-white" : "chip"}`}
        >
          Все
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => push(category.name, q)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
              active === category.name ? "bg-fill text-white" : "chip"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
