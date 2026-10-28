"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, LoaderCircle, Sparkles, Upload } from "lucide-react";

export default function ImportPage() {
  const router = useRouter();
  const [sourceUrl, setSourceUrl] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const body = new FormData();
    body.append("sourceUrl", sourceUrl);
    body.append("text", text);
    if (file) body.append("file", file);

    const response = await fetch("/api/ai/parse", { method: "POST", body });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Не получилось разобрать контент");
      return;
    }
    setResult(data.exercise);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="text-sm text-muted">AI-импорт</p>
        <h1 className="display text-4xl">Пришлите ссылку — мы сделаем упражнение.</h1>
        <p className="mt-2 text-sm text-muted">
          YouTube, TikTok, статья или просто «хочу мостик на диване». Если ключа Gemini нет, сработает демо-парсер.
        </p>
      </header>

      <form onSubmit={submit} className="card space-y-4 rounded-4xl p-5 sm:p-7">
        <label className="block text-sm">
          Ссылка
          <div className="mt-1 flex items-center gap-2 rounded-2xl border border-line bg-bg px-3">
            <Link2 size={16} className="text-muted" />
            <input
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://..."
              className="w-full bg-transparent py-3 outline-none"
            />
          </div>
        </label>
        <label className="block text-sm">
          Или опишите своими словами
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={4}
            placeholder="Упражнение для спины без упора на колени, можно лёжа"
            className="mt-1 w-full rounded-2xl border border-line bg-bg px-4 py-3 outline-none ring-sage focus:ring-2"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-line px-4 py-4 text-sm">
          <span className="flex items-center gap-2">
            <Upload size={16} />
            {file ? file.name : "Видео, фото или GIF"}
          </span>
          <input
            type="file"
            accept="image/*,video/*,.gif"
            className="hidden"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
        </label>
        <button
          type="submit"
          disabled={loading || (!sourceUrl && !text && !file)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-fill py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? <LoaderCircle className="animate-spin" size={18} /> : <Sparkles size={18} />}
          Разобрать и сохранить
        </button>
        {error ? <p className="text-sm text-terra">{error}</p> : null}
      </form>

      {result ? (
        <section className="card space-y-3 rounded-4xl p-5">
          <p className="text-sm text-sage">Добавлено в ваш каталог</p>
          <h2 className="display text-3xl">{result.title}</h2>
          <p className="text-sm text-muted">{result.description}</p>
          <div className="flex flex-wrap gap-2">
            {result.categories.map((name) => (
              <span key={name} className="chip rounded-full px-3 py-1 text-xs">
                {name}
              </span>
            ))}
          </div>
          <button type="button" onClick={() => router.push(`/exercises/${result.id}`)} className="text-sm text-sage">
            Открыть карточку
          </button>
        </section>
      ) : null}
    </div>
  );
}
