"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentBox({ contextType, contextId, comments }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contextType, contextId, text }),
    });
    setText("");
    setLoading(false);
    router.refresh();
  }

  return (
    <section className="space-y-3">
      <h3 className="display text-xl">Заметки для ИИ</h3>
      <p className="text-sm text-muted">Напишите «болело колено» или «сегодня было легко» — учтём в следующем плане.</p>
      <form onSubmit={submit} className="space-y-3">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          placeholder="Коротко, как есть"
          className="w-full rounded-3xl border border-line bg-card px-4 py-3 outline-none ring-sage focus:ring-2"
        />
        <button type="submit" disabled={loading} className="rounded-2xl bg-fill px-4 py-2.5 text-sm text-white">
          Сохранить заметку
        </button>
      </form>
      <ul className="space-y-2">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-2xl border border-line bg-bg px-4 py-3 text-sm">
            <p>{comment.text}</p>
            <p className="mt-1 text-xs text-muted">{new Date(comment.createdAt).toLocaleString("ru-RU")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
