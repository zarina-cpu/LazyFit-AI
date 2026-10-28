"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GOALS } from "@/lib/constants";

export default function ProfileForm({ user }) {
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [goal, setGoal] = useState(user?.targetGoal || "MAINTAIN");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, targetGoal: goal }),
    });
    setLoading(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-5 rounded-4xl p-5 sm:p-7">
      <label className="block text-sm">
        Как к вам обращаться
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 outline-none ring-sage focus:ring-2"
        />
      </label>
      <fieldset className="space-y-2">
        <legend className="text-sm">Глобальная цель</legend>
        {GOALS.map((item) => (
          <label
            key={item.id}
            className={`flex cursor-pointer items-start gap-3 rounded-3xl border px-4 py-3 ${
              goal === item.id ? "border-sage bg-sage/10" : "border-line"
            }`}
          >
            <input
              type="radio"
              name="goal"
              value={item.id}
              checked={goal === item.id}
              onChange={() => setGoal(item.id)}
              className="mt-1"
            />
            <span>
              <span className="block font-medium">
                {item.emoji} {item.label}
              </span>
              <span className="text-sm text-muted">{item.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="text-xs text-muted">Смена цели пересоберёт акценты при следующем «Перемешать неделю».</p>
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-fill py-3 font-medium text-white">
        Сохранить
      </button>
      {saved ? <p className="text-sm text-sage">Готово. Можно вернуться к сериалу.</p> : null}
    </form>
  );
}
